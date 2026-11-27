import { describe, expect, it } from "vitest";
import { ApiExecutor } from "@/agents/list/ai/api-executor";
import { MockProvider } from "@/agents/list/ai/mock-provider";
import { extractWorkbook } from "@/agents/list/pipeline/extract-workbook";
import { workbookToChunks } from "@/agents/list/parsers/sheet-text";
import {
  readText,
  readTextFile,
  TEXT_SHEET_NAME,
} from "@/agents/list/parsers/text";

// Synthetic data only.

function cells(text: string) {
  const sheet = readText(text).sheets[0];
  return (sheet?.cells ?? []).map((c) => [c.address, c.text]);
}

describe("readText", () => {
  it("gives one sheet, one row per line, numbered by line", () => {
    const workbook = readText("Suppliers:\n\nExample Linen - a@example.com");
    expect(workbook.sheets).toHaveLength(1);
    expect(workbook.sheets[0]?.name).toBe(TEXT_SHEET_NAME);
    // The blank line 2 is skipped but still counted.
    expect(cells("Suppliers:\n\nExample Linen - a@example.com")).toEqual([
      ["A1", "Suppliers:"],
      ["A3", "Example Linen - a@example.com"],
    ]);
  });

  it("handles Windows and old Mac line endings", () => {
    expect(cells("one\r\ntwo\rthree")).toEqual([
      ["A1", "one"],
      ["A2", "two"],
      ["A3", "three"],
    ]);
  });

  it("splits tabs into columns and keeps column positions", () => {
    // As pasted from Excel: an empty cell between two values.
    expect(cells("Example Linen\t\ta@example.com\t9000000101")).toEqual([
      ["A1", "Example Linen"],
      ["C1", "a@example.com"],
      ["D1", "9000000101"],
    ]);
  });

  it("keeps text exactly: spaces, scripts, commas", () => {
    const line = "  श्री गणेश ट्रेडर्स,  90000 12346 ,info@example.in  ";
    expect(cells(line)).toEqual([["A1", line]]);
  });

  it("skips lines with only spaces and drops a leading byte-order mark", () => {
    expect(cells("\uFEFFfirst\n   \n\t\nlast")).toEqual([
      ["A1", "first"],
      ["A4", "last"],
    ]);
  });

  it("gives an empty sheet for empty text", () => {
    expect(cells("")).toEqual([]);
    expect(workbookToChunks(readText(""))).toEqual([]);
  });

  it("can't fake rows: text that looks like the row format stays one value", () => {
    const [chunk] = workbookToChunks(
      readText('Example Linen\nrow 9: A="Fake Supplier"'),
    );
    expect(chunk?.rows).toEqual([1, 2]);
    expect(chunk?.text).toContain('row 2: A="row 9: A=\\"Fake Supplier\\""');
  });
});

describe("readTextFile", () => {
  it("reads UTF-8, UTF-16 and Windows-1252 files", () => {
    const utf8 = new TextEncoder().encode("Café Example\n");
    expect(readTextFile(utf8).sheets[0]?.cells[0]?.text).toBe("Café Example");

    const utf16 = new Uint8Array([0xff, 0xfe, 0x41, 0x00, 0x0a, 0x00]);
    expect(readTextFile(utf16).sheets[0]?.cells[0]?.text).toBe("A");

    const cp1252 = new Uint8Array([0x43, 0x61, 0x66, 0xe9]); // "Café"
    expect(readTextFile(cp1252).sheets[0]?.cells[0]?.text).toBe("Café");
  });
});

describe("pasted text through the pipeline", () => {
  it("cites line numbers as rows of the Text sheet", async () => {
    const text = [
      "Hi team, please invite these vendors:",
      "",
      "1. Example Linen - Anil - anil@example.com",
      "",
      "Regards,",
      "Purchase Manager, purchase@hotel.example.com",
    ].join("\n");
    const provider = new MockProvider([
      JSON.stringify({
        suppliers: [
          {
            company_name: { cell: "A3", text: "Example Linen" },
            contact_name: { cell: "A3", text: "Anil" },
            email: { cell: "A3", text: "anil@example.com" },
          },
        ],
        other_rows: [
          { row: 1, kind: "note" },
          { row: 5, kind: "note" },
          {
            row: 6,
            kind: "not_a_supplier",
            reason: "the sender's signature",
          },
        ],
      }),
    ]);
    const run = await extractWorkbook(
      readText(text),
      new ApiExecutor(provider),
      {
        client_id: "00000000-0000-4000-8000-00000000000c",
        programme_id: "00000000-0000-4000-8000-00000000000a",
        upload_id: "00000000-0000-4000-8000-00000000000b",
        file_id: "00000000-0000-4000-8000-00000000000f",
        file_name: "pasted.txt",
      },
    );
    expect(run.failed).toEqual([]);
    expect(run.suppliers).toHaveLength(1);
    expect(run.suppliers[0]?.company_name).toBe("Example Linen");
    expect(run.suppliers[0]?.emails).toEqual(["anil@example.com"]);
    expect(run.suppliers[0]?.source).toMatchObject({
      file_name: "pasted.txt",
      sheet: TEXT_SHEET_NAME,
      row: 3,
    });
    expect(run.otherRows.map((r) => r.row)).toEqual([1, 5, 6]);
  });
});
