import { describe, expect, it } from "vitest";
import {
  cellTexts,
  checkExtraction,
  textInCell,
} from "@/agents/list/ai/tasks/check-extraction";
import type { ExtractSuppliersAnswer } from "@/agents/list/ai/tasks/extract-suppliers";
import type { SheetChunk } from "@/agents/list/parsers/sheet-text";
import type { CellRange } from "@/agents/list/parsers/spreadsheet";

/** Cells of a small sheet: context rows 1–2, chunk rows 10–13. */
const cells = new Map([
  ["A1", "Party"],
  ["B1", "Mail"],
  ["A2", "Context Crafts"],
  ["A10", "Example Crafts"],
  ["B10", "sales@example.in, info@example.in"],
  ["C10", "+91 98765\n43210"],
  ["A11", "Rao Weaves"],
  ["A12", "Total"],
  ["B12", "2"],
  ["A13", "Shree Textiles"],
  ["B13", "shree@gmial.com"],
]);

const chunk: SheetChunk = {
  sheetIndex: 0,
  sheetName: "Sheet1",
  sheetHidden: false,
  rows: [10, 11, 12, 13],
  contextRows: [1, 2],
  text: "",
};

type Value = ExtractSuppliersAnswer["suppliers"][number]["values"][number];

/** Values given as parts of cells ({cell, text}). */
function supplier(...values: [Value["field"], string, string][]) {
  return {
    values: values.map(([field, cell, text]) => ({
      field,
      cell,
      text,
      whole: false,
    })),
    multiple_in_cell: false,
    unsure: false,
  };
}

/** A correct answer for the chunk above. */
function goodAnswer(): ExtractSuppliersAnswer {
  return {
    suppliers: [
      supplier(
        ["company_name", "A10", "Example Crafts"],
        ["email", "B10", "sales@example.in"],
        ["email", "B10", "info@example.in"],
        ["phone", "C10", "+91 98765 43210"],
      ),
      supplier(["company_name", "A11", "Rao Weaves"]),
      supplier(
        ["company_name", "A13", "Shree Textiles"],
        ["email", "B13", "shree@gmial.com"],
      ),
    ],
    other_rows: [{ row: 12, kind: "total" }],
  };
}

const check = (answer: ExtractSuppliersAnswer, merges: CellRange[] = []) =>
  checkExtraction(answer, chunk, cells, merges);

/** Values given as whole cells ("A10"), with the text code reads from the cell. */
function wholeSupplier(...values: [Value["field"], string][]) {
  return {
    values: values.map(([field, cell]) => ({
      field,
      cell,
      text: cells.get(cell) ?? "",
      whole: true,
    })),
    multiple_in_cell: false,
    unsure: false,
  };
}

describe("checkExtraction: a correct answer", () => {
  it("passes", () => {
    expect(check(goodAnswer())).toEqual([]);
  });

  it("passes with whole-cell citations", () => {
    const answer = goodAnswer();
    answer.suppliers[1] = wholeSupplier(["company_name", "A11"]);
    answer.suppliers[2] = wholeSupplier(
      ["company_name", "A13"],
      ["email", "B13"],
    );
    expect(check(answer)).toEqual([]);
  });
});

describe("checkExtraction: whole-cell citations", () => {
  it("rejects a whole cell that also gives another field", () => {
    const answer = goodAnswer();
    answer.suppliers[2] = wholeSupplier(
      ["company_name", "A13"],
      ["email", "A13"],
      ["email", "B13"],
    );
    const problems = check(answer);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("Cell A13 is given whole");
  });

  it("rejects a whole cell when part of it is also cited", () => {
    const answer = goodAnswer();
    const first = answer.suppliers[0];
    if (!first) throw new Error("no supplier");
    first.values.push({
      field: "notes",
      cell: "B10",
      text: cells.get("B10") ?? "",
      whole: true,
    });
    expect(check(answer)).toEqual([
      expect.stringContaining('Cell B10 is given whole (as "B10") for notes'),
    ]);
  });

  it("allows one cell cited whole for the same field by several suppliers", () => {
    const merged = new Map([...cells, ["D10", "Jaipur"]]);
    const answer = goodAnswer();
    for (const s of answer.suppliers.slice(0, 2)) {
      s.values.push({
        field: "city",
        cell: "D10",
        text: "Jaipur",
        whole: true,
      });
    }
    expect(checkExtraction(answer, chunk, merged)).toEqual([]);
  });

  it("reports a whole citation of an empty cell", () => {
    const answer = goodAnswer();
    answer.suppliers[1] = wholeSupplier(
      ["company_name", "A11"],
      ["phone", "C11"],
    );
    expect(check(answer)).toEqual([
      expect.stringContaining("cell C11 is empty"),
    ]);
  });
});

describe("checkExtraction: values must really be in their cells", () => {
  it("rejects a corrected typo (the source says gmial.com)", () => {
    const answer = goodAnswer();
    answer.suppliers[2] = supplier(
      ["company_name", "A13", "Shree Textiles"],
      ["email", "B13", "shree@gmail.com"],
    );
    expect(check(answer)).toEqual([
      'Supplier 3, email from B13: cell B13 does not contain "shree@gmail.com". Copy the text exactly as it is in the cell, without correcting or reformatting it.',
    ]);
  });

  it("rejects an invented value from an empty cell", () => {
    const answer = goodAnswer();
    answer.suppliers[1] = supplier(
      ["company_name", "A11", "Rao Weaves"],
      ["email", "B11", "info@raoweaves.example"],
    );
    expect(check(answer)).toEqual([
      "Supplier 2, email from B11: cell B11 is empty.",
    ]);
  });

  it("rejects a reformatted phone and a value from the wrong cell", () => {
    const answer = goodAnswer();
    answer.suppliers[0] = supplier(
      ["company_name", "A10", "Example Crafts"],
      ["phone", "C10", "+919876543210"],
      ["email", "A10", "sales@example.in"],
    );
    const problems = check(answer);
    expect(problems).toHaveLength(3);
    expect(problems[0]).toContain('does not contain "+919876543210"');
    expect(problems[1]).toContain(
      'cell A10 does not contain "sales@example.in"',
    );
    // And the real emails in B10 were never used.
    expect(problems[2]).toContain("Cell B10 contains");
  });

  it("rejects a changed case", () => {
    const answer = goodAnswer();
    answer.suppliers[1] = supplier(["company_name", "A11", "RAO WEAVES"]);
    expect(check(answer)).toHaveLength(1);
  });
});

describe("checkExtraction: every row accounted for exactly once", () => {
  it("lists rows that are missing", () => {
    const answer = goodAnswer();
    answer.suppliers.splice(1, 1); // drop Rao Weaves (row 11)
    answer.other_rows = [];
    expect(check(answer)).toEqual([
      'Rows missing from the answer: 11, 12. Every row in "Rows to account for" must be used by a supplier or listed in other_rows.',
    ]);
  });

  it("rejects a row both used by a supplier and listed in other_rows", () => {
    const answer = goodAnswer();
    answer.other_rows.push({ row: 11, kind: "note" });
    expect(check(answer)).toEqual([
      "other_rows: row 11 is listed in other_rows but also used by a supplier. A row is either used by a supplier or listed in other_rows, not both.",
    ]);
  });

  it("rejects a row listed twice in other_rows", () => {
    const answer = goodAnswer();
    answer.other_rows.push({ row: 12, kind: "note" });
    expect(check(answer)).toEqual([
      "other_rows: row 12 is listed more than once.",
    ]);
  });

  it("allows one row to hold several suppliers", () => {
    const answer = goodAnswer();
    answer.suppliers[0] = {
      ...supplier(
        ["company_name", "A10", "Example Crafts"],
        ["email", "B10", "sales@example.in"],
        ["phone", "C10", "+91 98765 43210"],
      ),
      multiple_in_cell: true,
    };
    answer.suppliers.splice(1, 0, {
      ...supplier(["email", "B10", "info@example.in"]),
      multiple_in_cell: true,
    });
    expect(check(answer)).toEqual([]);
  });
});

describe("checkExtraction: no email or phone left out", () => {
  it("rejects an email in a supplier's row that the AI skipped", () => {
    const answer = goodAnswer();
    answer.suppliers[2] = supplier(["company_name", "A13", "Shree Textiles"]);
    expect(check(answer)).toEqual([
      'Cell B13 contains "shree@gmial.com", which no supplier uses. Give every email as its own value (use notes if it is not the supplier\'s own).',
    ]);
  });

  it("rejects taking only one of two emails in a cell", () => {
    const answer = goodAnswer();
    answer.suppliers[0] = supplier(
      ["company_name", "A10", "Example Crafts"],
      ["email", "B10", "sales@example.in"],
      ["phone", "C10", "+91 98765 43210"],
    );
    expect(check(answer)).toEqual([
      'Cell B10 contains "info@example.in", which no supplier uses. Give every email as its own value (use notes if it is not the supplier\'s own).',
    ]);
  });

  it("rejects a skipped phone number", () => {
    const answer = goodAnswer();
    answer.suppliers[0] = supplier(
      ["company_name", "A10", "Example Crafts"],
      ["email", "B10", "sales@example.in"],
      ["email", "B10", "info@example.in"],
    );
    expect(check(answer)).toEqual([
      "Cell C10 looks like it holds an email or phone number, but no supplier uses it. Give it as a value (use notes if it is not the supplier's own).",
    ]);
  });

  it("accepts an email or phone cited as notes", () => {
    const answer = goodAnswer();
    answer.suppliers[2] = supplier(
      ["company_name", "A13", "Shree Textiles"],
      ["notes", "B13", "shree@gmial.com"],
    );
    expect(check(answer)).toEqual([]);
  });

  it("also catches obfuscated emails and numbers in scientific notation", () => {
    const extra = new Map([
      ...cells,
      ["C11", "rao [at] example [dot] in"],
      ["D11", "9.19877E+11"],
    ]);
    const problems = checkExtraction(goodAnswer(), chunk, extra);
    expect(problems.map((p) => p.slice(0, 8))).toEqual([
      "Cell C11",
      "Cell D11",
    ]);
  });

  it("ignores rows that are not suppliers, and short numbers like totals or dates", () => {
    const extra = new Map([
      ...cells,
      ["B12", "purchase@hotel.example"], // row 12 is labelled "total"
      ["D11", "01/02/2026"],
      ["E11", "1,250,000"],
      ["F11", "08ABCDE1234F1Z0"],
    ]);
    expect(checkExtraction(goodAnswer(), chunk, extra)).toEqual([]);
  });
});

describe("checkExtraction: nothing from outside the chunk", () => {
  it("rejects values and labels from context rows", () => {
    const answer = goodAnswer();
    answer.suppliers.push(supplier(["company_name", "A2", "Context Crafts"]));
    answer.other_rows.push({ row: 1, kind: "heading" });
    expect(check(answer)).toEqual([
      "Supplier 4, company_name from A2: row 2 is a context row. Do not extract from context rows.",
      "other_rows: row 1 is a context row. Do not list context rows.",
    ]);
  });

  it("rejects rows that are not in the chunk", () => {
    const answer = goodAnswer();
    answer.suppliers.push(supplier(["company_name", "A99", "Ghost Ltd"]));
    answer.other_rows.push({ row: 50, kind: "note" });
    expect(check(answer)).toEqual([
      'Supplier 4, company_name from A99: row 99 is not in this part of the sheet. Use only rows from "Rows to account for".',
      "other_rows: row 50 is not in this part of the sheet.",
    ]);
  });

  it("allows the first cell of a merged range that covers chunk rows", () => {
    // City "Jaipur" in D5, merged down D5:D11 (starts before the chunk).
    const merged = new Map([...cells, ["D5", "Jaipur"]]);
    const answer = goodAnswer();
    answer.suppliers[1] = supplier(
      ["company_name", "A11", "Rao Weaves"],
      ["city", "D5", "Jaipur"],
    );
    const merges = [{ startRow: 5, startCol: 4, endRow: 11, endCol: 4 }];
    expect(checkExtraction(answer, chunk, merged, merges)).toEqual([]);
    // Without the merge, D5 is outside the chunk.
    expect(checkExtraction(answer, chunk, merged, [])).toHaveLength(1);
  });

  it("keeps the retry message short when there are many problems", () => {
    const answer = goodAnswer();
    for (let i = 0; i < 30; i++) {
      answer.suppliers.push(
        supplier(["company_name", "A11", `Fake ${String(i)}`]),
      );
    }
    const problems = check(answer);
    expect(problems).toHaveLength(21);
    expect(problems[20]).toBe("…and 10 more problems like these.");
  });
});

describe("textInCell", () => {
  it("matches the whole cell or an exact part of it", () => {
    expect(textInCell("Example Crafts", "Example Crafts")).toBe(true);
    expect(
      textInCell("info@example.in", "sales@example.in, info@example.in"),
    ).toBe(true);
  });

  it("ignores only differences in spacing and line breaks", () => {
    expect(textInCell("1 Main Rd Jaipur", "1 Main Rd\nJaipur")).toBe(true);
    expect(textInCell(" Rao  Weaves ", "Rao Weaves")).toBe(true);
  });

  it("rejects a part that cuts a word or number in half", () => {
    expect(textInCell("Rao Weave", "Rao Weaves")).toBe(false);
    expect(textInCell("ao Weaves", "Rao Weaves")).toBe(false);
    expect(textInCell("9876", "98765 43210")).toBe(false);
    expect(textInCell("example.in", "sales@example.in")).toBe(true);
    expect(textInCell("Weaves", "Rao Weaves")).toBe(true);
    expect(textInCell("Śrī", "Śrī Crafts")).toBe(true);
    expect(textInCell("Śr", "Śrī Crafts")).toBe(false);
  });

  it("finds a later occurrence when an earlier one cuts a word", () => {
    expect(textInCell("Rao", "Raoji, Rao")).toBe(true);
  });

  it("rejects any other difference", () => {
    expect(textInCell("Rao Weavers", "Rao Weaves")).toBe(false);
    expect(textInCell("rao weaves", "Rao Weaves")).toBe(false);
    expect(textInCell("9876543210", "98765 43210")).toBe(false);
    expect(textInCell("", "Rao Weaves")).toBe(false);
    expect(textInCell("   ", "Rao Weaves")).toBe(false);
  });
});

describe("cellTexts", () => {
  it("maps addresses to cell text", () => {
    const map = cellTexts({
      index: 0,
      name: "S",
      hidden: false,
      hiddenRows: [],
      hiddenCols: [],
      merges: [],
      cells: [{ row: 1, col: 2, address: "B1", text: "x", kind: "text" }],
    });
    expect([...map]).toEqual([["B1", "x"]]);
  });
});
