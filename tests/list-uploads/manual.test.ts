import { describe, expect, it } from "vitest";
import { ADDED_BY_HAND, ManualSupplier, manualRow } from "@/lib/list-uploads/manual";

// Synthetic data only.
const where = { id: "11111111-1111-4111-8111-111111111111", uploadId: "22222222-2222-4222-8222-222222222222" };
const parse = (extra: Record<string, unknown>) => ManualSupplier.parse({ clientId: "CLT-001", company_name: "Example Handloom", ...extra });
const codes = (row: { issues: { code: string }[] }) => row.issues.map((i) => i.code);

describe("adding a supplier by hand", () => {
  it("needs the hotel chosen (No hotel is null) and a company name", () => {
    expect(ManualSupplier.safeParse({ company_name: "Example" }).success).toBe(false);
    expect(ManualSupplier.safeParse({ clientId: "", company_name: "Example" }).success).toBe(false);
    expect(ManualSupplier.safeParse({ clientId: null, company_name: "   " }).success).toBe(false);
    expect(ManualSupplier.safeParse({ clientId: null, company_name: "Example" }).success).toBe(true);
    expect(ManualSupplier.safeParse({ clientId: null, company_name: "Example", extra: "x" }).success).toBe(false);
  });

  it("tidies whitespace and treats blank fields as empty", () => {
    const input = parse({ company_name: "  Example   Handloom ", contact_name: " ", city: " Jaipur " });
    expect(input).toMatchObject({ company_name: "Example Handloom", contact_name: null, city: "Jaipur", email: null });
  });

  it("is Ready with a company name and a valid email, like a supplier from a list", () => {
    const row = manualRow(parse({ contact_name: "Asha Rao", email: " Asha@Example.com ", phone: "90000 00001", category: "Stationery" }), where);
    expect(row).toMatchObject({
      check_status: "ready",
      email: "asha@example.com",
      phone: "+919000000001",
      category: "Stationery",
      file_id: null,
      upload_id: where.uploadId,
    });
    expect(row.issues).toEqual([]);
  });

  it("is Missing email without one, and says the email will greet the team", () => {
    const row = manualRow(parse({}), where);
    expect(row.check_status).toBe("missing_contact");
    expect(codes(row)).toEqual(["no_contact_name"]);
  });

  it("keeps a mistyped email as typed and flags it", () => {
    const row = manualRow(parse({ contact_name: "Asha", email: "asha@example" }), where);
    expect(row).toMatchObject({ email: "asha@example", check_status: "missing_contact" });
    expect(codes(row)).toContain("invalid_email");
  });

  it("suggests a likely email typo but never changes it", () => {
    const row = manualRow(parse({ contact_name: "Asha", email: "asha@gmial.com" }), where);
    expect(row.email).toBe("asha@gmial.com");
    expect(row.check_status).toBe("needs_attention");
    expect(row.issues.find((i) => i.code === "email_suggestion")?.message).toContain("asha@gmail.com");
  });

  it("notes a general inbox and an unreadable phone without holding the supplier back", () => {
    const row = manualRow(parse({ contact_name: "Asha", email: "info@example.com", phone: "12" }), where);
    expect(codes(row)).toEqual(expect.arrayContaining(["generic_email", "invalid_phone"]));
    expect(row.phone).toBe("12");
    expect(row.check_status).toBe("ready");
  });

  it("keeps what was typed as the evidence", () => {
    const row = manualRow(parse({ email: "asha@example.com", state: "Rajasthan" }), where);
    expect(row.extracted.evidence).toEqual({
      fileName: ADDED_BY_HAND,
      readFromImage: false,
      cells: [
        { cell: "Company", text: "Example Handloom" },
        { cell: "Email", text: "asha@example.com" },
        { cell: "State", text: "Rajasthan" },
      ],
    });
  });
});
