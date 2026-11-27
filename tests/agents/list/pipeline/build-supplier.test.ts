import { describe, expect, it } from "vitest";
import type { ExtractedSupplier } from "@/agents/list/ai/tasks/extract-suppliers";
import {
  AI_UNSURE_CONFIDENCE,
  AI_VERIFIED_CONFIDENCE,
  buildSupplierFields,
  type BuildContext,
} from "@/agents/list/pipeline/build-supplier";

const cells = new Map([
  ["A4", "M/s. Example Crafts Pvt. Ltd."],
  ["B4", "sales@example.in, Info@Example.in"],
  ["C4", "09876543210"],
  ["D4", "08ABCDE1234F1Z0"],
  ["E4", "Jaipur"],
  ["F4", "Call after 11am"],
  ["G4", "1"],
  ["A5", "Rao Weaves"],
  ["B5", "rao@gmial.com"],
  ["C5", "9.19877E+11"],
  ["D5", "U12345MH2020PTC123456"],
]);

const context: BuildContext = {
  file_id: "00000000-0000-4000-8000-000000000001",
  file_name: "vendors.xlsx",
  sheet: "Vendors",
  cells,
};

function found(
  values: [string, string, string][],
  extra: Partial<ExtractedSupplier> = {},
): ExtractedSupplier {
  return {
    values: values.map(([field, cell, text]) => ({
      field: field as ExtractedSupplier["values"][number]["field"],
      cell,
      text,
      whole: false,
    })),
    multiple_in_cell: false,
    unsure: false,
    ...extra,
  };
}

describe("buildSupplierFields", () => {
  it("builds a clean supplier with the M1 rules", () => {
    const fields = buildSupplierFields(
      found([
        ["company_name", "A4", "M/s. Example Crafts Pvt. Ltd."],
        ["email", "B4", "sales@example.in"],
        ["email", "B4", "Info@Example.in"],
        ["phone", "C4", "09876543210"],
        ["gstin", "D4", "08ABCDE1234F1Z0"],
        ["city", "E4", "Jaipur"],
        ["notes", "F4", "Call after 11am"],
      ]),
      context,
    );
    expect(fields).toMatchObject({
      company_name: "M/s. Example Crafts Pvt. Ltd.",
      company_name_normalised: "example crafts pvt ltd",
      emails: ["sales@example.in", "info@example.in"],
      phones: ["+919876543210"],
      gstin: "08ABCDE1234F1Z0",
      city: "Jaipur",
      notes: "Call after 11am",
      // sales@ and info@ are shared inboxes (informational flag from M1).
      flags: ["generic_email"],
      suggestions: [],
      source: {
        file_id: context.file_id,
        file_name: "vendors.xlsx",
        sheet: "Vendors",
        row: 4,
      },
    });
    expect(fields.field_confidence).toEqual({
      company_name: AI_VERIFIED_CONFIDENCE,
      emails: AI_VERIFIED_CONFIDENCE,
      phones: AI_VERIFIED_CONFIDENCE,
      gstin: AI_VERIFIED_CONFIDENCE,
      city: AI_VERIFIED_CONFIDENCE,
      notes: AI_VERIFIED_CONFIDENCE,
    });
  });

  it("keeps every cell of the supplier's row, including ones the AI didn't use", () => {
    const fields = buildSupplierFields(
      found([
        ["company_name", "A4", "M/s. Example Crafts Pvt. Ltd."],
        ["email", "B4", "sales@example.in"],
      ]),
      context,
    );
    expect(fields.raw_values).toEqual({
      A4: "M/s. Example Crafts Pvt. Ltd.",
      B4: "sales@example.in, Info@Example.in",
      C4: "09876543210",
      D4: "08ABCDE1234F1Z0",
      E4: "Jaipur",
      F4: "Call after 11am",
      G4: "1",
    });
  });

  it("flags problems and suggests fixes, never changing the source", () => {
    const fields = buildSupplierFields(
      found([
        ["company_name", "A5", "Rao Weaves"],
        ["email", "B5", "rao@gmial.com"],
        ["phone", "C5", "9.19877E+11"],
        ["gstin", "D5", "U12345MH2020PTC123456"],
      ]),
      context,
    );
    expect(fields.emails).toEqual(["rao@gmial.com"]);
    expect(fields.phones).toEqual([]);
    expect(fields.gstin).toBeUndefined();
    expect(fields.flags).toEqual(
      expect.arrayContaining(["corrupted_value", "id_in_wrong_field"]),
    );
    expect(fields.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "emails",
          suggested_value: "rao@gmail.com",
        }),
        expect.objectContaining({ field: "gstin" }),
      ]),
    );
    expect(fields.raw_values.C5).toBe("9.19877E+11");
  });

  it("keeps a supplier without a name, flagged missing_name", () => {
    const fields = buildSupplierFields(
      found([["email", "B4", "sales@example.in"]]),
      context,
    );
    expect(fields.company_name).toBeUndefined();
    expect(fields.flags).toContain("missing_name");
    expect(fields.emails).toEqual(["sales@example.in"]);
  });

  it("flags a supplier without an email as missing_email", () => {
    const fields = buildSupplierFields(
      found([["company_name", "A5", "Rao Weaves"]]),
      context,
    );
    expect(fields.flags).toContain("missing_email");
  });

  it("marks unsure suppliers low confidence, with the AI's reason", () => {
    const fields = buildSupplierFields(
      found([["company_name", "A5", "Rao Weaves"]], {
        unsure: true,
        reason: "might be a person, not a business",
      }),
      context,
    );
    expect(fields.flags).toContain("low_confidence");
    expect(fields.field_confidence.company_name).toBe(AI_UNSURE_CONFIDENCE);
    expect(fields.suggestions).toContainEqual({
      field: "supplier",
      issue: "AI was unsure: might be a person, not a business",
    });
  });

  it("flags several suppliers in one cell", () => {
    const fields = buildSupplierFields(
      found([["company_name", "A5", "Rao Weaves"]], {
        multiple_in_cell: true,
      }),
      context,
    );
    expect(fields.flags).toContain("multiple_suppliers_in_cell");
  });

  it("keeps other IDs and notes, and uses the first of several names", () => {
    const fields = buildSupplierFields(
      found([
        ["company_name", "A5", "Rao Weaves"],
        ["company_name", "A4", "Example Crafts"],
        ["cin", "D5", "U12345MH2020PTC123456"],
      ]),
      context,
    );
    expect(fields.company_name).toBe("Rao Weaves");
    expect(fields.other_ids).toEqual({ cin: "U12345MH2020PTC123456" });
    expect(fields.suggestions[0]?.field).toBe("company_name");
    expect(fields.source.row).toBe(4);
  });
});
