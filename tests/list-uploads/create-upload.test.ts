import { beforeEach, describe, expect, it, vi } from "vitest";

/** A fake database: answers reads from `answers` and records inserts. */
const inserts: { table: string; values: unknown }[] = [];
const answers: Record<string, { data: unknown; error: { message: string } | null }> = {};

function query(table: string) {
  const result = () => Promise.resolve(answers[table] ?? { data: null, error: null });
  const builder = {
    select: () => builder,
    eq: () => builder,
    maybeSingle: result,
    single: result,
    insert: (values: unknown) => {
      inserts.push({ table, values });
      return builder;
    },
    then: (resolve: (value: unknown) => unknown) => result().then(resolve),
  };
  return builder;
}

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: () => ({
    from: query,
    storage: { from: () => ({ createSignedUploadUrl: () => Promise.resolve({ data: { path: "p", token: "t" }, error: null }) }) },
  }),
}));
vi.mock("@/lib/list-uploads/auth", async (original) => ({
  ...(await original<typeof import("@/lib/list-uploads/auth")>()),
  superadminId: () => Promise.resolve("admin-1"),
}));

const { POST } = await import("@/app/api/superadmin/list-uploads/route");

const files = [{ name: "vendors.xlsx", size: 1000, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }];
const post = (body: unknown) => POST(new Request("https://app.example.com/api", { method: "POST", body: JSON.stringify(body) }));

beforeEach(() => {
  inserts.length = 0;
  for (const key of Object.keys(answers)) Reflect.deleteProperty(answers, key);
  answers.client_master = { data: { client_id: "CLT-001" }, error: null };
  answers.list_uploads = { data: { id: "upload-1" }, error: null };
});

describe("starting an upload", () => {
  it("needs a hotel", async () => {
    for (const clientId of [undefined, null, "", "   "]) {
      const response = await post({ clientId, files });
      expect(response.status).toBe(400);
      expect(((await response.json()) as { error: string }).error).toBe("Choose the hotel this list is for.");
    }
    expect(inserts).toEqual([]);
  });

  it("refuses a hotel that does not exist", async () => {
    answers.client_master = { data: null, error: null };
    const response = await post({ clientId: "CLT-404", files });
    expect(response.status).toBe(400);
    expect(inserts).toEqual([]);
  });

  it("records the upload for the chosen hotel", async () => {
    const response = await post({ clientId: " CLT-001 ", files });
    expect(response.status).toBe(200);
    expect(inserts[0]).toEqual({ table: "list_uploads", values: { client_id: "CLT-001", created_by: "admin-1" } });
  });
});
