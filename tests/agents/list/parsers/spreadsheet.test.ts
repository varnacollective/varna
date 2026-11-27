import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import {
  decodeText,
  readSpreadsheet,
  SpreadsheetReadError,
  type SheetData,
} from "@/agents/list/parsers/spreadsheet";

const encoder = new TextEncoder();

function workbookBytes(
  sheets: { name: string; sheet: XLSX.WorkSheet; hidden?: boolean }[],
  bookType: XLSX.BookType,
): Uint8Array {
  const wb = XLSX.utils.book_new();
  for (const { name, sheet } of sheets) {
    XLSX.utils.book_append_sheet(wb, sheet, name);
  }
  wb.Workbook = {
    Sheets: sheets.map(({ hidden }) => ({ Hidden: hidden ? 1 : 0 })),
  };
  return XLSX.write(wb, { type: "buffer", bookType }) as Uint8Array;
}

function textOf(sheet: SheetData | undefined, address: string) {
  return sheet?.cells.find((c) => c.address === address)?.text;
}

describe("readSpreadsheet: Excel and OpenDocument", () => {
  const supplierSheet = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Supplier list for 2026"],
      [],
      ["Party", "Mob", "PIN"],
      ["Example Crafts", 919876543210, 987],
    ]);
    ws.C4 = { t: "n", v: 987, z: "0000" };
    return ws;
  };

  for (const bookType of ["xlsx", "biff8", "ods"] as const) {
    it(`reads every non-empty cell with its location (${bookType})`, () => {
      const { sheets } = readSpreadsheet(
        workbookBytes([{ name: "Main", sheet: supplierSheet() }], bookType),
      );
      const sheet = sheets[0];
      expect(sheet?.name).toBe("Main");
      expect(sheet?.cells.map((c) => c.address)).toEqual([
        "A1",
        "A3",
        "B3",
        "C3",
        "A4",
        "B4",
        "C4",
      ]);
      expect(sheet?.cells[0]).toMatchObject({ row: 1, col: 1 });
      expect(textOf(sheet, "A4")).toBe("Example Crafts");
    });

    it(`keeps every digit of long numbers like phones (${bookType})`, () => {
      const { sheets } = readSpreadsheet(
        workbookBytes([{ name: "Main", sheet: supplierSheet() }], bookType),
      );
      expect(textOf(sheets[0], "B4")).toBe("919876543210");
    });
  }

  it("records what Excel displays when it differs from the real value", () => {
    const { sheets } = readSpreadsheet(
      workbookBytes([{ name: "Main", sheet: supplierSheet() }], "xlsx"),
    );
    const phone = sheets[0]?.cells.find((c) => c.address === "B4");
    expect(phone).toMatchObject({
      text: "919876543210",
      kind: "number",
      shown: "9.19877E+11",
    });
  });

  it("keeps leading zeros shown by a custom number format", () => {
    for (const bookType of ["xlsx", "biff8"] as const) {
      const { sheets } = readSpreadsheet(
        workbookBytes([{ name: "Main", sheet: supplierSheet() }], bookType),
      );
      expect(textOf(sheets[0], "C4")).toBe("0987");
    }
  });

  it("keeps numbers stored as text exactly", () => {
    const ws = XLSX.utils.aoa_to_sheet([["09876543210", "+91 98765 43210"]]);
    const { sheets } = readSpreadsheet(
      workbookBytes([{ name: "S", sheet: ws }], "xlsx"),
    );
    expect(sheets[0]?.cells.map((c) => c.text)).toEqual([
      "09876543210",
      "+91 98765 43210",
    ]);
  });

  it("reads dates as displayed and marks them as dates", () => {
    const ws = XLSX.utils.aoa_to_sheet([[45000]]);
    ws.A1 = { t: "n", v: 45000, z: "dd/mm/yyyy" };
    const { sheets } = readSpreadsheet(
      workbookBytes([{ name: "S", sheet: ws }], "xlsx"),
    );
    expect(sheets[0]?.cells[0]).toMatchObject({
      text: "15/03/2023",
      kind: "date",
    });
  });

  it("keeps the saved result of formulas and marks them", () => {
    const ws = XLSX.utils.aoa_to_sheet([["a"]]);
    ws.A1 = { t: "s", v: "Example Crafts", f: 'CONCAT("Example"," Crafts")' };
    const { sheets } = readSpreadsheet(
      workbookBytes([{ name: "S", sheet: ws }], "xlsx"),
    );
    expect(sheets[0]?.cells[0]).toMatchObject({
      text: "Example Crafts",
      formula: true,
    });
  });

  it("reads all sheets, including hidden ones, and marks them hidden", () => {
    const { sheets } = readSpreadsheet(
      workbookBytes(
        [
          { name: "Hotel A", sheet: XLSX.utils.aoa_to_sheet([["one"]]) },
          {
            name: "Old",
            sheet: XLSX.utils.aoa_to_sheet([["two"]]),
            hidden: true,
          },
          { name: "Hotel B", sheet: XLSX.utils.aoa_to_sheet([["three"]]) },
        ],
        "xlsx",
      ),
    );
    expect(sheets.map((s) => [s.index, s.name, s.hidden])).toEqual([
      [0, "Hotel A", false],
      [1, "Old", true],
      [2, "Hotel B", false],
    ]);
    expect(textOf(sheets[1], "A1")).toBe("two");
  });

  it("records hidden rows and columns, and still reads their cells", () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["a", "b"],
      ["c", "d"],
    ]);
    ws["!rows"] = [{}, { hidden: true }];
    ws["!cols"] = [{ hidden: true }];
    const { sheets } = readSpreadsheet(
      workbookBytes([{ name: "S", sheet: ws }], "xlsx"),
    );
    expect(sheets[0]?.hiddenRows).toEqual([2]);
    expect(sheets[0]?.hiddenCols).toEqual([1]);
    expect(sheets[0]?.cells).toHaveLength(4);
  });

  it("records merged cells (1-based)", () => {
    const ws = XLSX.utils.aoa_to_sheet([["Supplier details", ""]]);
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
    const { sheets } = readSpreadsheet(
      workbookBytes([{ name: "S", sheet: ws }], "xlsx"),
    );
    expect(sheets[0]?.merges).toEqual([
      { startRow: 1, startCol: 1, endRow: 1, endCol: 2 },
    ]);
  });

  it("returns an empty sheet as a sheet with no cells", () => {
    const { sheets } = readSpreadsheet(
      workbookBytes(
        [{ name: "Empty", sheet: XLSX.utils.aoa_to_sheet([]) }],
        "xlsx",
      ),
    );
    expect(sheets).toHaveLength(1);
    expect(sheets[0]?.cells).toEqual([]);
  });
});

describe("readSpreadsheet: text files (csv, tsv)", () => {
  const read = (text: string) =>
    readSpreadsheet(encoder.encode(text)).sheets[0]?.cells.map((c) => [
      c.address,
      c.text,
    ]);

  it("reads comma, semicolon and tab separated files", () => {
    const expected = [
      ["A1", "Name"],
      ["B1", "Phone"],
      ["A2", "Example Crafts"],
      ["B2", "09876543210"],
    ];
    expect(read("Name,Phone\nExample Crafts,09876543210\n")).toEqual(expected);
    expect(read("Name;Phone\nExample Crafts;09876543210\n")).toEqual(expected);
    expect(read("Name\tPhone\nExample Crafts\t09876543210\n")).toEqual(
      expected,
    );
  });

  it("never converts values: leading zeros, long numbers and dates stay as written", () => {
    expect(read("a,b,c,d\n0987,919876543210,9.19877E+11,01/02/2026\n")).toEqual(
      [
        ["A1", "a"],
        ["B1", "b"],
        ["C1", "c"],
        ["D1", "d"],
        ["A2", "0987"],
        ["B2", "919876543210"],
        ["C2", "9.19877E+11"],
        ["D2", "01/02/2026"],
      ],
    );
  });

  it("handles quoted cells with commas and line breaks", () => {
    expect(
      read('Name,Address\n"Rao & Sons, Ltd","1 Main Rd\nJaipur"\n'),
    ).toEqual([
      ["A1", "Name"],
      ["B1", "Address"],
      ["A2", "Rao & Sons, Ltd"],
      ["B2", "1 Main Rd\nJaipur"],
    ]);
  });

  it("skips blank cells and rows but keeps real row numbers", () => {
    expect(read("Name\n\n\nExample Crafts\n")).toEqual([
      ["A1", "Name"],
      ["A4", "Example Crafts"],
    ]);
  });
});

describe("decodeText", () => {
  it("reads UTF-8 with and without a BOM", () => {
    const bytes = encoder.encode("Śrī Crafts");
    expect(decodeText(bytes)).toBe("Śrī Crafts");
    expect(decodeText(new Uint8Array([0xef, 0xbb, 0xbf, ...bytes]))).toBe(
      "Śrī Crafts",
    );
  });

  it("falls back to Windows-1252 for older Excel exports", () => {
    // "Café" in Windows-1252: é is the single byte 0xE9 (invalid UTF-8).
    expect(decodeText(new Uint8Array([0x43, 0x61, 0x66, 0xe9]))).toBe("Café");
  });

  it("reads UTF-16 with a BOM (Excel 'Unicode text')", () => {
    const le = new Uint8Array([0xff, 0xfe, 0x41, 0x00, 0x09, 0x00, 0x42, 0x00]);
    expect(decodeText(le)).toBe("A\tB");
    const be = new Uint8Array([0xfe, 0xff, 0x00, 0x41]);
    expect(decodeText(be)).toBe("A");
  });

  it("reads a UTF-16 tab-separated file end to end", () => {
    const text = "Name\tPhone\r\nExample Crafts\t09876543210\r\n";
    const body = new Uint8Array(text.length * 2);
    for (let i = 0; i < text.length; i++) body[i * 2] = text.charCodeAt(i);
    const { sheets } = readSpreadsheet(new Uint8Array([0xff, 0xfe, ...body]));
    expect(sheets[0]?.cells.map((c) => c.text)).toEqual([
      "Name",
      "Phone",
      "Example Crafts",
      "09876543210",
    ]);
  });
});

describe("readSpreadsheet: errors", () => {
  it("rejects a broken Excel file with a clear error", () => {
    // Starts like a ZIP (xlsx) but is not a real one.
    const broken = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4, 5]);
    expect(() => readSpreadsheet(broken)).toThrow(SpreadsheetReadError);
    try {
      readSpreadsheet(broken);
    } catch (error) {
      expect((error as SpreadsheetReadError).code).toBe("unreadable");
    }
  });
});
