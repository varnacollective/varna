import type { SheetCell, SheetData } from "./spreadsheet";

/**
 * Finds tables in a sheet that was read by `readSpreadsheet`. No layout is
 * assumed: a table can start on any row, have one heading row, two, or none,
 * and a sheet can hold several tables.
 *
 * Rules:
 * - Rows are never dropped. Every row under a heading is a data row (it may be
 *   a supplier with missing details; later steps decide). Rows outside tables
 *   (titles, notes) are kept in `otherRows`.
 * - When code is not sure (heading or supplier? is this a table at all?), it
 *   records an issue instead of guessing. Anything with issues goes to AI or
 *   a person.
 */

export type TableIssue =
  /** The first row might be a heading or a supplier; code can't tell. */
  | "unsure_header"
  /** Rows without headings that don't line up into clear columns. */
  | "no_clear_table"
  /** A heading row with nothing under it. */
  | "header_without_rows"
  /**
   * A row partway down looks like a new heading, but it could also be a
   * supplier. Kept as a data row (see `possibleHeaderRows`), never guessed.
   */
  | "possible_header_inside";

export interface TableColumn {
  /** 1-based column number. */
  col: number;
  /** Heading text (two heading rows are joined with a space). */
  header?: string;
}

export interface FoundTable {
  /** 1-based heading rows; empty when the table has no heading. */
  headerRows: number[];
  columns: TableColumn[];
  /** 1-based data rows, in order. Every non-empty row under the heading. */
  rows: number[];
  /** Rows that repeat the heading (e.g. on every printed page); skipped. */
  repeatedHeaderRows: number[];
  /** Data rows that might be a new heading; a person or AI decides. */
  possibleHeaderRows: number[];
  issues: TableIssue[];
}

export interface SheetLayout {
  sheetIndex: number;
  sheetName: string;
  tables: FoundTable[];
  /** Non-empty rows outside any table: titles, notes, signatures. */
  otherRows: number[];
}

interface Row {
  row: number;
  cells: SheetCell[];
}

/** Two or more blank rows in a row separate blocks. */
const BLOCK_GAP = 2;
/** A table without a heading needs at least this many rows to be trusted. */
const MIN_HEADERLESS_ROWS = 3;
/** Heading cells longer than this are probably data or notes. */
const MAX_HEADER_LENGTH = 60;
/** How many rows under a heading candidate are compared with it. */
const LOOKAHEAD = 5;

/**
 * Common heading words. Only used to recognise a heading row; which field a
 * column holds is decided later, and its contents must confirm it.
 */
const HEADING_WORDS = new Set([
  "name",
  "names",
  "company",
  "supplier",
  "suppliers",
  "vendor",
  "vendors",
  "party",
  "firm",
  "business",
  "brand",
  "email",
  "e",
  "mail",
  "phone",
  "mobile",
  "mob",
  "contact",
  "tel",
  "telephone",
  "whatsapp",
  "number",
  "no",
  "address",
  "city",
  "district",
  "state",
  "pin",
  "pincode",
  "gst",
  "gstin",
  "udyam",
  "category",
  "product",
  "products",
  "person",
  "website",
  "remarks",
  "sr",
  "sno",
  "s",
  "serial",
  "id",
]);

export function findTables(sheet: SheetData): SheetLayout {
  const headerText = mergedHeaderText(sheet);
  const tables: FoundTable[] = [];
  const otherRows: number[] = [];
  for (const block of blocks(sheet)) {
    scanBlock(block, headerText, tables, otherRows);
  }
  return {
    sheetIndex: sheet.index,
    sheetName: sheet.name,
    tables,
    otherRows,
  };
}

/** Group cells into rows, then rows into blocks separated by blank rows. */
function blocks(sheet: SheetData): Row[][] {
  const byRow = new Map<number, SheetCell[]>();
  for (const cell of sheet.cells) {
    const list = byRow.get(cell.row);
    if (list) list.push(cell);
    else byRow.set(cell.row, [cell]);
  }
  const rows = [...byRow.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, cells]) => ({
      row,
      cells: cells.sort((a, b) => a.col - b.col),
    }));

  const result: Row[][] = [];
  let current: Row[] = [];
  for (const row of rows) {
    const previous = current[current.length - 1];
    if (previous && row.row - previous.row - 1 >= BLOCK_GAP) {
      result.push(current);
      current = [];
    }
    current.push(row);
  }
  if (current.length > 0) result.push(current);
  return result;
}

function scanBlock(
  block: Row[],
  headerText: HeaderText,
  tables: FoundTable[],
  otherRows: number[],
): void {
  let i = 0;
  while (i < block.length) {
    // Single-cell rows before a table are titles or notes.
    while (i < block.length && (block[i]?.cells.length ?? 0) <= 1) {
      otherRows.push(block[i]?.row ?? 0);
      i++;
    }
    if (i >= block.length) return;

    const header = detectHeader(block, i);
    const headerRows = block.slice(i, i + header.count);
    const headers = headerTexts(headerRows, headerText);
    const table: FoundTable = {
      headerRows: headerRows.map((r) => r.row),
      columns: [],
      rows: [],
      repeatedHeaderRows: [],
      possibleHeaderRows: [],
      issues: header.unsure ? ["unsure_header"] : [],
    };

    let j = i + header.count;
    for (; j < block.length; j++) {
      const row = block[j];
      if (!row) break;
      if (headers.size > 0 && repeatsHeader(row, headers)) {
        table.repeatedHeaderRows.push(row.row);
        continue;
      }
      // A row partway down that looks like a new heading could also be a
      // supplier with no email or phone. Code can't tell, so it is kept as
      // data and flagged. (Tables separated by blank rows split cleanly.)
      if (table.rows.length > 0 && detectHeader(block, j).strong) {
        table.possibleHeaderRows.push(row.row);
      }
      table.rows.push(row.row);
    }

    const tableRows = block.slice(i, j);
    table.columns = columnsOf(tableRows, headers);
    if (header.count > 0 && table.rows.length === 0) {
      table.issues.push("header_without_rows");
    }
    if (table.possibleHeaderRows.length > 0) {
      table.issues.push("possible_header_inside");
    }
    if (header.count === 0 && !looksLikeHeaderlessTable(tableRows)) {
      table.issues.push("no_clear_table");
    }
    tables.push(table);
    i = j;
  }
}

interface HeaderResult {
  /** Number of heading rows found (0, 1 or 2). */
  count: number;
  /**
   * Unmistakable: heading words AND values underneath. Needed to start a new
   * table partway down, where a mistake would turn a supplier into a heading.
   */
  strong: boolean;
  /** The row looks like a heading but code can't be sure. */
  unsure: boolean;
}

const NO_HEADER: HeaderResult = { count: 0, strong: false, unsure: false };

function detectHeader(block: Row[], i: number): HeaderResult {
  const first = block[i];
  if (!first || first.cells.length < 2 || !headerLike(first)) return NO_HEADER;

  const second = block[i + 1];
  const twoRows =
    second !== undefined &&
    second.cells.length >= 1 &&
    headerLike(second) &&
    headingWordShare(second) >= 0.5 &&
    block[i + 2] !== undefined;
  const count = twoRows ? 2 : 1;
  const below = block.slice(i + count, i + count + LOOKAHEAD);
  if (below.length === 0) {
    // Nothing underneath: a heading only if it reads like one.
    return headingWordShare(first) >= 0.5
      ? { count, strong: false, unsure: false }
      : NO_HEADER;
  }

  const headingRows = block.slice(i, i + count);
  const contrast = contrastsWithRowsBelow(headingRows, below);
  const words = headingRows.every((r) => headingWordShare(r) >= 0.5);
  if (contrast || words) {
    return { count, strong: contrast && words, unsure: false };
  }
  // Looks like a heading (short text labels) but so could a supplier row:
  // don't guess.
  return { count: 0, strong: false, unsure: true };
}

/** Every cell is short text that doesn't look like a value (email, number…). */
function headerLike(row: Row): boolean {
  return row.cells.every(
    (cell) =>
      cell.kind === "text" &&
      cell.text.trim().length <= MAX_HEADER_LENGTH &&
      !looksLikeValue(cell),
  );
}

/** Emails, long digit runs, numbers, dates and links are values, not headings. */
function looksLikeValue(cell: SheetCell): boolean {
  if (cell.kind !== "text") return true;
  const text = cell.text;
  return (
    text.includes("@") ||
    /\d{5,}/.test(text.replace(/[\s\-().+]/g, "")) ||
    /https?:\/\/|www\./i.test(text)
  );
}

/** Share of a row's cells containing a common heading word. */
function headingWordShare(row: Row): number {
  if (row.cells.length === 0) return 0;
  const hits = row.cells.filter((cell) =>
    cell.text
      .toLowerCase()
      .split(/[^a-z]+/)
      .some((word) => HEADING_WORDS.has(word)),
  ).length;
  return hits / row.cells.length;
}

/**
 * A column where the candidate heading is a label and most cells below are
 * values (emails, phone numbers…): then the candidate is a heading.
 */
function contrastsWithRowsBelow(heading: Row[], below: Row[]): boolean {
  const headingCols = new Set(
    heading.flatMap((r) => r.cells.map((c) => c.col)),
  );
  for (const col of headingCols) {
    const values = below
      .map((r) => r.cells.find((c) => c.col === col))
      .filter((c) => c !== undefined);
    if (values.length === 0) continue;
    const valueCount = values.filter(looksLikeValue).length;
    if (valueCount / values.length >= 0.5) return true;
  }
  return false;
}

/** Without a heading, trust a table only if most rows fill 2+ columns. */
function looksLikeHeaderlessTable(rows: Row[]): boolean {
  if (rows.length < MIN_HEADERLESS_ROWS) return false;
  const wide = rows.filter((r) => r.cells.length >= 2).length;
  return wide / rows.length >= 0.8;
}

/** Map of "row:col" → text, where merged heading cells cover all their columns. */
type HeaderText = Map<string, string>;

function mergedHeaderText(sheet: SheetData): HeaderText {
  const map: HeaderText = new Map();
  for (const cell of sheet.cells)
    map.set(`${String(cell.row)}:${String(cell.col)}`, cell.text);
  for (const merge of sheet.merges) {
    const text = map.get(`${String(merge.startRow)}:${String(merge.startCol)}`);
    if (text === undefined) continue;
    for (let r = merge.startRow; r <= merge.endRow; r++) {
      for (let c = merge.startCol; c <= merge.endCol; c++) {
        map.set(`${String(r)}:${String(c)}`, text);
      }
    }
  }
  return map;
}

/** Column → heading text, joining two heading rows ("Contact" + "Email"). */
function headerTexts(rows: Row[], headerText: HeaderText): Map<number, string> {
  const result = new Map<number, string>();
  if (rows.length === 0) return result;
  const cols = new Set<number>();
  for (const row of rows) {
    for (const [key] of headerText) {
      const [r, c] = key.split(":").map(Number);
      if (r === row.row && c !== undefined) cols.add(c);
    }
  }
  for (const col of cols) {
    const parts: string[] = [];
    for (const row of rows) {
      const text = headerText.get(`${String(row.row)}:${String(col)}`)?.trim();
      if (text && !parts.includes(text)) parts.push(text);
    }
    if (parts.length > 0) result.set(col, parts.join(" "));
  }
  return result;
}

function repeatsHeader(row: Row, headers: Map<number, string>): boolean {
  if (row.cells.length < 2) return false;
  return row.cells.every(
    (cell) =>
      headers.get(cell.col)?.trim().toLowerCase() ===
      cell.text.trim().toLowerCase(),
  );
}

function columnsOf(rows: Row[], headers: Map<number, string>): TableColumn[] {
  const cols = new Set<number>(headers.keys());
  for (const row of rows) for (const cell of row.cells) cols.add(cell.col);
  return [...cols]
    .sort((a, b) => a - b)
    .map((col) => {
      const header = headers.get(col);
      return header === undefined ? { col } : { col, header };
    });
}
