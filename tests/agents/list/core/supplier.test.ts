import { describe, expect, it } from "vitest";
import { Supplier } from "@/agents/list/core/supplier";

// Synthetic data only.
function validSupplier(): Record<string, unknown> {
  return {
    id: "6f1c2d3e-4a5b-4c6d-8e7f-0a1b2c3d4e5f",
    client_id: "11111111-1111-4111-8111-111111111111",
    programme_id: "22222222-2222-4222-8222-222222222222",
    upload_id: "33333333-3333-4333-8333-333333333333",
    company_name: "Example Handloom Private Limited",
    company_name_normalised: "example handloom pvt ltd",
    brand_name: "Example Handloom",
    emails: ["contact@example.com"],
    phones: ["+919000000001"],
    city: "Jaipur",
    district: "Jaipur",
    state: "Rajasthan",
    country: "India",
    gstin: "08ABCDE1234F1Z0",
    udyam_number: "UDYAM-RJ-17-0000001",
    raw_values: {
      "Vendor Name": "Example Handloom Private Limited",
      "E-mail ID": "Contact@Example.com",
      Mobile: "90000 00001",
    },
    suggestions: [],
    source: {
      file_id: "44444444-4444-4444-8444-444444444444",
      file_name: "suppliers.xlsx",
      sheet: "Sheet1",
      row: 2,
    },
    field_confidence: { company_name: 1, emails: 1 },
    flags: [],
    status: "READY",
    extraction_method: "deterministic",
    created_at: "2026-11-21T10:00:00Z",
  };
}

function without(
  input: Record<string, unknown>,
  ...keys: string[]
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([key]) => !keys.includes(key)),
  );
}

function errorPaths(input: unknown): string[] {
  const result = Supplier.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join("."));
}

describe("Supplier schema", () => {
  it("accepts a valid supplier", () => {
    expect(Supplier.safeParse(validSupplier()).success).toBe(true);
  });

  it("takes the dashboard's hotel code as client_id and rejects a blank one", () => {
    expect(Supplier.safeParse({ ...validSupplier(), client_id: "CLT-001" }).success).toBe(true);
    expect(errorPaths({ ...validSupplier(), client_id: "  " })).toContain("client_id");
  });

  it("accepts a minimal supplier with only required fields", () => {
    const minimal = without(
      validSupplier(),
      "brand_name",
      "city",
      "district",
      "state",
      "country",
      "gstin",
      "udyam_number",
    );
    expect(Supplier.safeParse(minimal).success).toBe(true);
  });

  it("accepts a suggestion for a human to confirm", () => {
    const supplier = {
      ...without(validSupplier(), "gstin"),
      flags: ["id_in_wrong_field"],
      status: "NEEDS_ATTENTION",
      suggestions: [
        {
          field: "gstin",
          issue: "looks like a CIN, not a GSTIN",
          suggested_field: "other_ids.cin",
        },
      ],
    };
    expect(Supplier.safeParse(supplier).success).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(errorPaths({ ...validSupplier(), status: "DONE" })).toContain(
      "status",
    );
  });

  it("rejects an unknown flag", () => {
    expect(errorPaths({ ...validSupplier(), flags: ["looks_fine"] })).toContain(
      "flags.0",
    );
  });

  it("rejects repeated flags", () => {
    const supplier = {
      ...validSupplier(),
      flags: ["generic_email", "generic_email"],
    };
    expect(errorPaths(supplier)).toContain("flags");
  });

  it("rejects a missing source", () => {
    expect(errorPaths(without(validSupplier(), "source"))).toContain("source");
  });

  it("rejects an empty company name", () => {
    expect(errorPaths({ ...validSupplier(), company_name: "  " })).toContain(
      "company_name",
    );
  });

  it("keeps a row without a company name when flagged missing_name", () => {
    const supplier = {
      ...without(validSupplier(), "company_name", "company_name_normalised"),
      flags: ["missing_name"],
      status: "NEEDS_ATTENTION",
    };
    expect(Supplier.safeParse(supplier).success).toBe(true);
  });

  it("rejects a nameless row that is not flagged missing_name", () => {
    const supplier = {
      ...without(validSupplier(), "company_name", "company_name_normalised"),
      status: "NEEDS_ATTENTION",
    };
    expect(errorPaths(supplier)).toContain("flags");
  });

  it("rejects a nameless row marked READY", () => {
    const supplier = {
      ...without(validSupplier(), "company_name", "company_name_normalised"),
      flags: ["missing_name"],
    };
    expect(errorPaths(supplier)).toContain("status");
  });

  it("rejects a name without its matching key", () => {
    expect(
      errorPaths(without(validSupplier(), "company_name_normalised")),
    ).toContain("company_name_normalised");
  });

  it("rejects READY without a valid email", () => {
    expect(errorPaths({ ...validSupplier(), emails: [] })).toContain("status");
  });

  it("accepts a supplier with no phone", () => {
    expect(Supplier.safeParse({ ...validSupplier(), phones: [] }).success).toBe(
      true,
    );
  });

  it("rejects an invalid email in emails", () => {
    expect(
      errorPaths({ ...validSupplier(), emails: ["not-an-email"] }),
    ).toContain("emails.0");
  });

  it("rejects a phone that is not E.164", () => {
    expect(
      errorPaths({ ...validSupplier(), phones: ["98765 43210"] }),
    ).toContain("phones.0");
  });

  it("rejects a phone damaged by scientific notation", () => {
    expect(
      errorPaths({ ...validSupplier(), phones: ["8.29957277E8"] }),
    ).toContain("phones.0");
  });

  it("rejects a CIN in the gstin field", () => {
    expect(
      errorPaths({ ...validSupplier(), gstin: "U74999RJ2019PTC000001" }),
    ).toContain("gstin");
  });

  it("rejects a malformed Udyam number", () => {
    expect(
      errorPaths({ ...validSupplier(), udyam_number: "UDYAM-RJ-17-123" }),
    ).toContain("udyam_number");
  });

  it("rejects confidence outside 0 to 1", () => {
    expect(
      errorPaths({ ...validSupplier(), field_confidence: { emails: 1.2 } }),
    ).toContain("field_confidence.emails");
  });

  it("rejects DUPLICATE status without a duplicate group", () => {
    expect(errorPaths({ ...validSupplier(), status: "DUPLICATE" })).toContain(
      "duplicate_group_id",
    );
  });

  it("rejects a possible_duplicate flag without a duplicate group", () => {
    const supplier = {
      ...validSupplier(),
      flags: ["possible_duplicate"],
      status: "NEEDS_ATTENTION",
    };
    expect(errorPaths(supplier)).toContain("duplicate_group_id");
  });

  it("accepts a possible duplicate with a group id", () => {
    const supplier = {
      ...validSupplier(),
      flags: ["possible_duplicate"],
      status: "NEEDS_ATTENTION",
      duplicate_group_id: "55555555-5555-4555-8555-555555555555",
    };
    expect(Supplier.safeParse(supplier).success).toBe(true);
  });

  it("rejects unknown fields (e.g. invented by an AI)", () => {
    expect(
      errorPaths({ ...validSupplier(), favourite_colour: "green" }),
    ).toContain("");
  });

  it("rejects a text span that ends before it starts", () => {
    const supplier = {
      ...validSupplier(),
      source: {
        file_id: "44444444-4444-4444-8444-444444444444",
        file_name: "email.txt",
        text_span: { start: 50, end: 10 },
      },
    };
    expect(errorPaths(supplier)).toContain("source.text_span");
  });
});
