import { describe, expect, it } from "vitest";
import type {
  CellRange,
  SheetCell,
  SheetData,
} from "@/agents/list/parsers/spreadsheet";
import { findTables } from "@/agents/list/parsers/tables";

type Value = string | number | null | undefined;

/** Build a sheet from rows of values (null/undefined = empty cell). */
function sheet(rows: Value[][], merges: CellRange[] = []): SheetData {
  const cells: SheetCell[] = [];
  rows.forEach((values, r) => {
    values.forEach((value, c) => {
      if (value === null || value === undefined || value === "") return;
      cells.push({
        row: r + 1,
        col: c + 1,
        address: `${String.fromCharCode(65 + c)}${String(r + 1)}`,
        text: String(value),
        kind: typeof value === "number" ? "number" : "text",
      });
    });
  });
  return {
    index: 0,
    name: "Sheet1",
    hidden: false,
    hiddenRows: [],
    hiddenCols: [],
    merges,
    cells,
  };
}

describe("findTables: headings", () => {
  it("finds a simple table with a heading in row 1", () => {
    const layout = findTables(
      sheet([
        ["Company Name", "Email", "Phone"],
        ["Example Crafts", "a@example.in", "9876543210"],
        ["Rao Weaves", "b@example.in", "9876543211"],
      ]),
    );
    expect(layout.tables).toEqual([
      {
        headerRows: [1],
        columns: [
          { col: 1, header: "Company Name" },
          { col: 2, header: "Email" },
          { col: 3, header: "Phone" },
        ],
        rows: [2, 3],
        repeatedHeaderRows: [],
        possibleHeaderRows: [],
        issues: [],
      },
    ]);
    expect(layout.otherRows).toEqual([]);
  });

  it("finds the heading lower down, below titles, and keeps the titles aside", () => {
    const layout = findTables(
      sheet([
        ["Hotel Example: supplier list"],
        ["Prepared March 2026"],
        [],
        ["Party", "Mail ID", "Mob"],
        ["Example Crafts", "a@example.in", "9876543210"],
      ]),
    );
    expect(layout.otherRows).toEqual([1, 2]);
    expect(layout.tables[0]?.headerRows).toEqual([4]);
    expect(layout.tables[0]?.rows).toEqual([5]);
    expect(layout.tables[0]?.issues).toEqual([]);
  });

  it("finds a heading in any columns, not just from column A", () => {
    const layout = findTables(
      sheet([
        [],
        [null, null, "Vendor", "E-mail"],
        [null, null, "Example Crafts", "a@example.in"],
      ]),
    );
    expect(layout.tables[0]?.columns).toEqual([
      { col: 3, header: "Vendor" },
      { col: 4, header: "E-mail" },
    ]);
  });

  it("recognises unusual headings when the values below are clearly data", () => {
    const layout = findTables(
      sheet([
        ["Kaarigar", "Sampark"],
        ["Example Crafts", "a@example.in"],
        ["Rao Weaves", "b@example.in"],
      ]),
    );
    expect(layout.tables[0]?.headerRows).toEqual([1]);
    expect(layout.tables[0]?.issues).toEqual([]);
  });

  it("joins two heading rows, spreading a merged heading over its columns", () => {
    const layout = findTables(
      sheet(
        [
          ["Supplier", "Contact", null],
          [null, "Email", "Phone"],
          ["Example Crafts", "a@example.in", "9876543210"],
        ],
        [{ startRow: 1, startCol: 2, endRow: 1, endCol: 3 }],
      ),
    );
    expect(layout.tables[0]?.headerRows).toEqual([1, 2]);
    expect(layout.tables[0]?.columns).toEqual([
      { col: 1, header: "Supplier" },
      { col: 2, header: "Contact Email" },
      { col: 3, header: "Contact Phone" },
    ]);
    expect(layout.tables[0]?.rows).toEqual([3]);
  });

  it("skips headings repeated further down (e.g. on each printed page)", () => {
    const layout = findTables(
      sheet([
        ["Name", "Email"],
        ["Example Crafts", "a@example.in"],
        ["Name", "Email"],
        ["Rao Weaves", "b@example.in"],
      ]),
    );
    expect(layout.tables).toHaveLength(1);
    expect(layout.tables[0]?.rows).toEqual([2, 4]);
    expect(layout.tables[0]?.repeatedHeaderRows).toEqual([3]);
  });

  it("flags a heading with nothing under it", () => {
    const layout = findTables(sheet([["Company Name", "Email", "Phone"]]));
    expect(layout.tables[0]?.issues).toEqual(["header_without_rows"]);
  });
});

describe("findTables: never drops rows", () => {
  it("keeps half-empty rows, blank-row gaps of one, and total rows as data", () => {
    const layout = findTables(
      sheet([
        ["Name", "Email", "Phone"],
        ["Example Crafts", "a@example.in", "9876543210"],
        ["Only A Name"],
        [],
        [null, "c@example.in"],
        ["Total", 3],
      ]),
    );
    expect(layout.tables).toHaveLength(1);
    expect(layout.tables[0]?.rows).toEqual([2, 3, 5, 6]);
  });

  it("never mistakes a text-only supplier row partway down for a new heading", () => {
    // No email/phone, and words like "Name" or "City" in it.
    const layout = findTables(
      sheet([
        ["Name", "Email"],
        ["Example Crafts", "a@example.in"],
        ["Name Plate Works", "City Traders"],
        ["Rao Weaves", "b@example.in"],
        ["Business Name Co", "City Store"],
      ]),
    );
    expect(layout.tables).toHaveLength(1);
    expect(layout.tables[0]?.rows).toEqual([2, 3, 4, 5]);
    // Row 3 reads like a heading; it stays a supplier row, flagged for review.
    expect(layout.tables[0]?.possibleHeaderRows).toEqual([3]);
  });

  it("keeps cells outside the heading columns as unnamed columns", () => {
    const layout = findTables(
      sheet([
        ["Name", "Email"],
        ["Example Crafts", "a@example.in", "note: call first"],
      ]),
    );
    expect(layout.tables[0]?.columns).toEqual([
      { col: 1, header: "Name" },
      { col: 2, header: "Email" },
      { col: 3 },
    ]);
  });
});

describe("findTables: several tables", () => {
  it("splits tables separated by two or more blank rows", () => {
    const layout = findTables(
      sheet([
        ["Name", "Email"],
        ["Example Crafts", "a@example.in"],
        [],
        [],
        ["Jaipur suppliers"],
        ["Vendor", "Mobile"],
        ["Rao Weaves", "9876543210"],
      ]),
    );
    expect(layout.tables.map((t) => [t.headerRows, t.rows])).toEqual([
      [[1], [2]],
      [[6], [7]],
    ]);
    expect(layout.otherRows).toEqual([5]);
  });

  it("flags (never guesses) a different heading partway down, without a gap", () => {
    const layout = findTables(
      sheet([
        ["Name", "Email"],
        ["Example Crafts", "a@example.in"],
        ["Vendor", "Mobile"],
        ["Rao Weaves", "9876543210"],
      ]),
    );
    expect(layout.tables).toHaveLength(1);
    expect(layout.tables[0]).toMatchObject({
      rows: [2, 3, 4],
      possibleHeaderRows: [3],
      issues: ["possible_header_inside"],
    });
  });
});

describe("findTables: no heading, or unsure", () => {
  it("accepts a table without a heading when rows line up in columns", () => {
    const layout = findTables(
      sheet([
        ["Example Crafts", "a@example.in", "9876543210"],
        ["Rao Weaves", "b@example.in", "9876543211"],
        ["Shree Textiles", "c@example.in", "9876543212"],
      ]),
    );
    expect(layout.tables[0]).toMatchObject({
      headerRows: [],
      rows: [1, 2, 3],
      issues: [],
    });
  });

  it("does not guess when the first row could be a heading or a supplier", () => {
    // Text-only rows: "Example Crafts | Jaipur" could be a heading too.
    const layout = findTables(
      sheet([
        ["Example Crafts", "Jaipur"],
        ["Rao Weaves", "Jodhpur"],
        ["Shree Textiles", "Udaipur"],
      ]),
    );
    expect(layout.tables[0]).toMatchObject({
      headerRows: [],
      rows: [1, 2, 3],
      issues: ["unsure_header"],
    });
  });

  it("flags one column of mixed text as not a clear table", () => {
    const layout = findTables(
      sheet([
        ["Example Crafts - a@example.in - 9876543210"],
        ["Rao Weaves, b@example.in"],
      ]),
    );
    // Single-cell rows with no table around them stay aside, never dropped.
    expect(layout.tables).toEqual([]);
    expect(layout.otherRows).toEqual([1, 2]);
  });

  it("flags short headerless fragments as not a clear table", () => {
    const layout = findTables(
      sheet([["Example Crafts", "a@example.in"], ["Rao Weaves"]]),
    );
    expect(layout.tables[0]?.issues).toContain("no_clear_table");
    expect(layout.tables[0]?.rows).toEqual([1, 2]);
  });

  it("returns nothing for an empty sheet", () => {
    expect(findTables(sheet([]))).toEqual({
      sheetIndex: 0,
      sheetName: "Sheet1",
      tables: [],
      otherRows: [],
    });
  });
});
