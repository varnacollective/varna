import { describe, expect, it } from "vitest";
import {
  formatSummary,
  summarise,
  suppliersToCsv,
} from "@/agents/list/cli/report";
import { Supplier } from "@/agents/list/core/supplier";
import type { ExtractionRun } from "@/agents/list/pipeline/extract-workbook";

// Synthetic data only.
function supplier(extra: Record<string, unknown> = {}): Supplier {
  return Supplier.parse({
    id: "6f1c2d3e-4a5b-4c6d-8e7f-0a1b2c3d4e5f",
    client_id: "11111111-1111-4111-8111-111111111111",
    programme_id: "22222222-2222-4222-8222-222222222222",
    upload_id: "33333333-3333-4333-8333-333333333333",
    company_name: "Example Handloom",
    company_name_normalised: "example handloom",
    emails: ["contact@example.com", "sales@example.com"],
    phones: ["+919000000001"],
    raw_values: {},
    suggestions: [],
    source: {
      file_id: "44444444-4444-4444-8444-444444444444",
      file_name: "suppliers.xlsx",
      sheet: "Vendors",
      row: 7,
    },
    field_confidence: {},
    flags: [],
    status: "READY",
    extraction_method: "ai_text",
    created_at: "2026-11-25T10:00:00Z",
    ...extra,
  });
}

function rows(csv: string): string[] {
  return csv
    .replace(/^\uFEFF/, "")
    .trimEnd()
    .split("\r\n");
}

describe("suppliersToCsv", () => {
  it("starts with a byte-order mark so Excel reads UTF-8", () => {
    expect(suppliersToCsv([]).startsWith("\uFEFF")).toBe(true);
  });

  it("writes a heading row and one row per supplier", () => {
    const lines = rows(suppliersToCsv([supplier()]));
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^status,flags,company_name,/);
    expect(lines[1]).toContain("READY,,Example Handloom,");
    expect(lines[1]).toContain("contact@example.com; sales@example.com");
    expect(lines[1]).toMatch(/,Vendors,,7$/);
  });

  it("quotes commas, quotes and line breaks", () => {
    const csv = suppliersToCsv([
      supplier({ notes: 'Says "call first",\nthen email' }),
    ]);
    expect(csv).toContain('"Says ""call first"",\nthen email"');
  });

  it("keeps formula-like text from running in Excel", () => {
    const csv = suppliersToCsv([
      supplier({ notes: '=HYPERLINK("http://x")', city: "-Pune" }),
    ]);
    expect(csv).toContain(`"'=HYPERLINK(""http://x"")"`);
    expect(csv).toContain("'-Pune");
    // Phones start with "+", so they are guarded too (shown as text).
    expect(csv).toContain("'+919000000001");
  });

  it("writes suggestions in plain words", () => {
    const csv = suppliersToCsv([
      supplier({
        status: "NEEDS_ATTENTION",
        suggestions: [
          {
            field: "gstin",
            issue: "looks like a CIN",
            suggested_field: "other_ids.cin",
          },
          { field: "emails", issue: "typo", suggested_value: "a@gmail.com" },
        ],
      }),
    ]);
    expect(csv).toContain(
      "gstin: looks like a CIN; emails: typo (suggested: a@gmail.com)",
    );
  });
});

describe("summarise", () => {
  const attempt = (model: string, input: number, output: number) => ({
    rawResponse: "{}",
    model,
    inputTokens: input,
    outputTokens: output,
    latencyMs: 1,
    problems: [],
  });

  const run: ExtractionRun = {
    suppliers: [
      supplier(),
      supplier({
        emails: [],
        flags: ["missing_email"],
        status: "MISSING_CONTACT",
      }),
    ],
    otherRows: [{ sheet: "Vendors", row: 1, kind: "heading" }],
    failed: [
      {
        sheet: "Vendors",
        rows: [40, 41, 42],
        error: "invalid_answer",
        message: "no valid answer after 3 attempts",
      },
    ],
    aiCalls: [
      {
        sheet: "Vendors",
        rows: [1, 2],
        ok: true,
        taskType: "extract_suppliers",
        promptVersion: "extract_suppliers@4",
        executor: "api",
        provider: "gemini",
        attempts: [attempt("m-1", 100, 20), attempt("m-1", 150, 30)],
      },
    ],
  };

  it("counts suppliers, rows, calls and tokens", () => {
    expect(summarise(run)).toEqual({
      suppliers: 2,
      byStatus: { READY: 1, MISSING_CONTACT: 1 },
      byFlag: { missing_email: 1 },
      otherRows: 1,
      failedRows: 3,
      failedPages: 0,
      aiCalls: 1,
      aiAttempts: 2,
      inputTokens: 250,
      outputTokens: 50,
      thinkingTokens: 0,
      models: ["m-1"],
    });
  });

  it("formats a readable summary", () => {
    const text = formatSummary(summarise(run));
    expect(text).toContain("Suppliers found: 2");
    expect(text).toContain("    READY: 1");
    expect(text).toContain("Rows that failed (need a person): 3");
    expect(text).toContain("AI calls: 1 (2 attempts incl. retries)");
  });
});
