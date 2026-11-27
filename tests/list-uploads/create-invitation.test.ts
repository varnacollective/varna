import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A fake database that records every write and answers reads from `answers`.
 * Enough of the Supabase query builder for createInvitation.
 */
interface Write {
  table: string;
  op: "insert" | "update";
  values: Record<string, unknown>;
}
const writes: Write[] = [];
const answers: Record<string, { data: unknown; error: { message: string } | null }> = {};

function query(table: string) {
  const result = () => Promise.resolve(answers[table] ?? { data: null, error: null });
  const builder = {
    select: () => builder,
    eq: () => builder,
    maybeSingle: result,
    single: result,
    insert: (values: Record<string, unknown>) => {
      writes.push({ table, op: "insert", values });
      return Object.assign(result(), builder);
    },
    update: (values: Record<string, unknown>) => {
      writes.push({ table, op: "update", values });
      return builder;
    },
  };
  return builder;
}

vi.mock("@/utils/supabase/admin", () => ({ createAdminClient: () => ({ from: query }) }));

const sendInvitationEmail = vi.fn();
vi.mock("@/lib/email/send-email", () => ({ sendInvitationEmail }));

const { createInvitation } = await import("@/lib/invitations/create-invitation");

// Synthetic data only.
const input = {
  enterprise_name: "  Example Handloom  ",
  contact_person: "Asha Rao",
  contact_email: " Asha@Example.com ",
  client_id: "11111111-1111-4111-8111-111111111111",
};
const context = { action: "send" as const, createdBy: "admin-1", origin: "https://app.example.com" };

beforeEach(() => {
  writes.length = 0;
  for (const key of Object.keys(answers)) Reflect.deleteProperty(answers, key);
  answers.partner_clients = { data: { name: "Example Hotel" }, error: null };
  answers.partner_suppliers = { data: { id: "supplier-1" }, error: null };
  answers.partner_invitations = { data: { id: "invitation-1" }, error: null };
  sendInvitationEmail.mockReset().mockResolvedValue({ success: true, messageId: "msg-1" });
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("SITE_URL", "");
});

describe("createInvitation: checks", () => {
  it.each([
    [{ ...input, enterprise_name: " " }, "Enterprise legal name is required."],
    [{ ...input, contact_person: null }, "Contact person is required."],
    [{ ...input, contact_email: "no-at-sign" }, "Valid contact email is required."],
    [{ ...input, contact_email: null }, "Valid contact email is required."],
  ])("refuses missing details before touching the database (%#)", async (bad, error) => {
    const outcome = await createInvitation(bad, context);
    expect(outcome).toEqual({ ok: false, status: 400, body: { error } });
    expect(writes).toEqual([]);
    expect(sendInvitationEmail).not.toHaveBeenCalled();
  });
});

describe("createInvitation: preview", () => {
  it("renders the email with the hotel's name and saves nothing", async () => {
    const outcome = await createInvitation(input, { ...context, action: "preview" });
    expect(outcome.ok && outcome.kind).toBe("preview");
    if (!outcome.ok || outcome.kind !== "preview") return;
    expect(outcome.body.slug).toMatch(/^example-handloom-[a-z0-9]{6}$/);
    expect(outcome.body.invitation_url).toBe(`https://app.example.com/invitation/${outcome.body.slug}`);
    expect(outcome.body.preview_html).toContain("Example Hotel");
    expect(writes).toEqual([]);
  });
});

describe("createInvitation: send", () => {
  it("creates the supplier, link, invitation, pipeline entry and audit record, then emails", async () => {
    const outcome = await createInvitation(input, context);

    expect(outcome).toMatchObject({
      ok: true,
      kind: "created",
      body: { status: "sent", supplier_id: "supplier-1", invitation_id: "invitation-1", email_sent: true, message_id: "msg-1" },
    });
    expect(writes.map((w) => `${w.op} ${w.table}`)).toEqual([
      "insert partner_suppliers",
      "insert partner_client_supplier_links",
      "insert partner_invitations",
      "update partner_invitations",
      "insert assessment_pipeline",
      "insert audit_log",
    ]);
    expect(writes[0]?.values).toMatchObject({
      enterprise_name: "Example Handloom",
      contact_email: "asha@example.com",
      source: "manual",
    });
    expect(writes[2]?.values).toMatchObject({ status: "sent", validity_days: 30, created_by: "admin-1" });
    expect(sendInvitationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "asha@example.com", client_name: "Example Hotel", invitation_id: "invitation-1" }),
    );
  });

  it("saves without emailing, and skips the hotel link when there is no hotel", async () => {
    const outcome = await createInvitation({ ...input, client_id: "none" }, { ...context, action: "save" });
    expect(outcome).toMatchObject({ ok: true, body: { status: "pending", email_sent: false, message_id: null } });
    expect(writes.map((w) => w.table)).not.toContain("partner_client_supplier_links");
    expect(writes.find((w) => w.table === "partner_invitations")?.values).toMatchObject({ client_id: null, sent_at: null });
    expect(sendInvitationEmail).not.toHaveBeenCalled();
  });

  it("reports a failed email and keeps the saved invitation's details", async () => {
    sendInvitationEmail.mockResolvedValue({ success: false, error: "SMTP down" });
    const outcome = await createInvitation(input, context);
    expect(outcome).toMatchObject({
      ok: false,
      status: 500,
      body: { error: "Invitation saved but email failed to send: SMTP down", invitation_id: "invitation-1" },
    });
  });

  it("stops if the supplier can't be created", async () => {
    answers.partner_suppliers = { data: null, error: { message: "duplicate key" } };
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const outcome = await createInvitation(input, context);
    expect(outcome).toEqual({ ok: false, status: 500, body: { error: "Failed to create partner supplier: duplicate key" } });
    expect(writes.map((w) => w.table)).toEqual(["partner_suppliers"]);
    expect(sendInvitationEmail).not.toHaveBeenCalled();
  });
});
