import * as XLSX from "xlsx";

/**
 * Reads a spreadsheet file (xlsx, xls, ods, csv, tsv, …) into plain text cells,
 * each with its exact location. No layout is assumed: this step only reads
 * every non-empty cell of every sheet. Finding tables, headers and suppliers
 * happens later.
 *
 * Cells are read as text so nothing is lost: phone numbers keep every digit
 * (never `9.19877E+11`), and text files are read without converting values.
 */

export type CellKind = "text" | "number" | "date" | "boolean" | "error";

export interface SheetCell {
  /** 1-based row number. */
  row: number;
  /** 1-based column number. */
  col: number;
  /** Spreadsheet address, e.g. "B7". */
  address: string;
  /** The cell's value as text, exactly as written (integers with all digits). */
  text: string;
  kind: CellKind;
  /** What the spreadsheet displays, when it differs from `text` (e.g. "9.19877E+11"). */
  shown?: string;
  /** True when the value was calculated by a formula (we keep the saved result). */
  formula?: true;
}

/** A block of merged cells, 1-based and inclusive. */
export interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface SheetData {
  /** 0-based position of the sheet in the file. */
  index: number;
  name: string;
  /** 1-based page number, when the "sheet" is a page read from a PDF or photo. */
  page?: number;
  /** Hidden or "very hidden" sheet. Kept: what to do with it is decided later. */
  hidden: boolean;
  /** 1-based numbers of hidden rows / columns (where the format records them). */
  hiddenRows: number[];
  hiddenCols: number[];
  merges: CellRange[];
  /** Non-empty cells, in reading order (row by row, left to right). */
  cells: SheetCell[];
}

export interface WorkbookData {
  sheets: SheetData[];
}

export type SpreadsheetErrorCode = "password_protected" | "unreadable";

export class SpreadsheetReadError extends Error {
  readonly code: SpreadsheetErrorCode;

  constructor(code: SpreadsheetErrorCode, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "SpreadsheetReadError";
    this.code = code;
  }
}

/** Read every sheet and every non-empty cell of a spreadsheet file. */
export function readSpreadsheet(data: Uint8Array): WorkbookData {
  let workbook: XLSX.WorkBook;
  try {
    workbook = isBinarySpreadsheet(data)
      ? XLSX.read(data, { type: "buffer", dense: true, cellStyles: true })
      : // Text files: decode ourselves (encodings), and `raw` stops SheetJS
        // from turning text like "0987" into numbers.
        XLSX.read(decodeText(data), { type: "string", dense: true, raw: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Real password-protected Office files. (SheetJS also says "ZIP encryption"
    // for merely broken ZIPs, so that wording is not matched.)
    if (/password-protected|ECMA-376 Encrypted/i.test(message)) {
      throw new SpreadsheetReadError(
        "password_protected",
        "The file is password-protected.",
        error,
      );
    }
    throw new SpreadsheetReadError(
      "unreadable",
      "The file could not be read as a spreadsheet.",
      error,
    );
  }

  const sheetInfo = workbook.Workbook?.Sheets ?? [];
  const sheets = workbook.SheetNames.map((name, index): SheetData => {
    const sheet = workbook.Sheets[name];
    const hidden = (sheetInfo[index]?.Hidden ?? 0) !== 0;
    return sheet
      ? readSheet(sheet, index, name, hidden)
      : {
          index,
          name,
          hidden,
          hiddenRows: [],
          hiddenCols: [],
          merges: [],
          cells: [],
        };
  });
  return { sheets };
}

function readSheet(
  sheet: XLSX.WorkSheet,
  index: number,
  name: string,
  hidden: boolean,
): SheetData {
  const cells: SheetCell[] = [];
  const rows: (XLSX.CellObject | undefined)[][] = sheet["!data"] ?? [];
  rows.forEach((rowCells, r) => {
    rowCells.forEach((cell, c) => {
      if (!cell) return;
      const read = readCell(cell);
      if (!read || read.text.trim() === "") return;
      cells.push({
        row: r + 1,
        col: c + 1,
        address: XLSX.utils.encode_cell({ r, c }),
        ...read,
      });
    });
  });

  return {
    index,
    name,
    hidden,
    hiddenRows: hiddenIndexes(sheet["!rows"]),
    hiddenCols: hiddenIndexes(sheet["!cols"]),
    merges: (sheet["!merges"] ?? []).map((m) => ({
      startRow: m.s.r + 1,
      startCol: m.s.c + 1,
      endRow: m.e.r + 1,
      endCol: m.e.c + 1,
    })),
    cells,
  };
}

type CellValue = Pick<SheetCell, "text" | "kind" | "shown" | "formula">;

function readCell(cell: XLSX.CellObject): CellValue | undefined {
  const shown = cell.w;
  let value: CellValue;
  switch (cell.t) {
    case "s":
      value = { text: String(cell.v ?? shown ?? ""), kind: "text" };
      break;
    case "n":
      value = readNumber(cell);
      break;
    case "d":
      value = { text: shown ?? String(cell.v), kind: "date" };
      break;
    case "b":
      value = { text: shown ?? String(cell.v).toUpperCase(), kind: "boolean" };
      break;
    case "e":
      value = { text: shown ?? "#ERROR", kind: "error" };
      break;
    default:
      return undefined; // "z": empty placeholder cell
  }
  if (shown !== undefined && shown !== value.text) value.shown = shown;
  if (cell.f !== undefined) value.formula = true;
  return value;
}

// SheetJS ships `SSF` untyped; this is the one function we use from it.
const ssf = XLSX.SSF as { is_date(format: string): boolean };
const isDateFormat = (format: string): boolean => ssf.is_date(format);

function readNumber(cell: XLSX.CellObject): CellValue {
  const v = Number(cell.v);
  const format = cell.z;
  if (typeof format === "string" && isDateFormat(format)) {
    return { text: cell.w ?? String(v), kind: "date" };
  }
  // With the default "General" format, Excel displays long numbers like phones
  // as 9.19877E+11. Use the stored value instead, which has every digit.
  const general = format === undefined || format === "General";
  if (general && Number.isInteger(v) && Math.abs(v) < 1e21) {
    return { text: String(v), kind: "number" };
  }
  // Custom formats (e.g. "0000" keeping leading zeros) are part of what the
  // source says, so use the displayed text.
  return { text: cell.w ?? String(v), kind: "number" };
}

function hiddenIndexes(
  items: readonly ({ hidden?: boolean } | undefined)[] | undefined,
): number[] {
  const result: number[] = [];
  (items ?? []).forEach((item, i) => {
    if (item?.hidden) result.push(i + 1);
  });
  return result;
}

/** ZIP (xlsx, ods) or OLE (xls, encrypted xlsx) container. */
function isBinarySpreadsheet(data: Uint8Array): boolean {
  const startsWith = (bytes: number[]) =>
    bytes.every((byte, i) => data[i] === byte);
  return (
    startsWith([0x50, 0x4b, 0x03, 0x04]) ||
    startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
  );
}

/**
 * Decode a text file: UTF-16 (with a BOM, e.g. Excel "Unicode text"), UTF-8
 * (with or without a BOM), otherwise Windows-1252 (older Excel CSV exports).
 */
export function decodeText(data: Uint8Array): string {
  if (data[0] === 0xff && data[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(data.subarray(2));
  }
  if (data[0] === 0xfe && data[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(data.subarray(2));
  }
  const body =
    data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf
      ? data.subarray(3)
      : data;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch {
    return new TextDecoder("windows-1252").decode(body);
  }
}
