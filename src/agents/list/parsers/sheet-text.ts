import type { SheetCell, SheetData, WorkbookData } from "./spreadsheet";

/**
 * Turns spreadsheet sheets into numbered text, cut into chunks, ready for the
 * AI to read. One line per row, every value kept exactly:
 *
 *   row 7: A="Example Crafts" | B="a@example.in" | C="919876543210"
 *
 * - Row numbers and column letters let us check every AI answer against the
 *   source ("this supplier is from row 7": is that email really in row 7?).
 * - Values are JSON-quoted, so content can't break the format: a cell with a
 *   line break or `"` can never fake another row. File content is untrusted.
 * - Chunks stay small (models drop rows or change digits in long answers),
 *   and even: rows are shared equally, so no chunk is a small leftover that
 *   costs a whole AI call (103 rows → 52 + 51, not 50 + 50 + 3).
 *   Each chunk after the first repeats the sheet's first rows as context, so
 *   the AI still sees the headings. Context rows are listed separately and
 *   are never to be extracted from that chunk.
 * - A row is never split across chunks. Hidden rows, columns and sheets are
 *   included and marked "hidden"; what to do with them is decided later.
 */

export interface ChunkOptions {
  /** Target most rows to extract per chunk. */
  maxRows: number;
  /** Target size limit per chunk, in characters (wide or long rows). */
  maxChars: number;
  /**
   * How far a chunk may go past both targets (0.1 = 10%: up to 55 rows),
   * used only when that saves a whole chunk.
   */
  stretch: number;
  /** How many of the sheet's first rows to repeat as context in later chunks. */
  contextRows: number;
}

export const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  maxRows: 50,
  maxChars: 10_000,
  stretch: 0.1,
  contextRows: 5,
};

export interface SheetChunk {
  sheetIndex: number;
  sheetName: string;
  sheetHidden: boolean;
  /** 1-based rows to extract from this chunk, in order. */
  rows: number[];
  /** 1-based rows repeated for reference only (headings); not to extract. */
  contextRows: number[];
  /** The text sent to the AI. */
  text: string;
}

/** Chunks for every sheet of a workbook, in sheet order. Empty sheets give none. */
export function workbookToChunks(
  workbook: WorkbookData,
  options: ChunkOptions = DEFAULT_CHUNK_OPTIONS,
): SheetChunk[] {
  return workbook.sheets.flatMap((sheet) => sheetToChunks(sheet, options));
}

export function sheetToChunks(
  sheet: SheetData,
  options: ChunkOptions = DEFAULT_CHUNK_OPTIONS,
): SheetChunk[] {
  const lines = rowLines(sheet);
  if (lines.length === 0) return [];
  const context = lines.slice(0, options.contextRows);
  return evenGroups(lines, options).map((group) =>
    makeChunk(sheet, group, context),
  );
}

/**
 * Share rows equally over the fewest chunks that fit the stretched limits.
 * Rows of very different lengths can still push one chunk over the
 * character limit; then one more chunk is used. A single row too long for
 * any chunk gets a chunk of its own.
 */
function evenGroups(
  lines: readonly RowLine[],
  options: ChunkOptions,
): RowLine[][] {
  const rowCap = Math.max(
    1,
    Math.floor(options.maxRows * (1 + options.stretch)),
  );
  const charCap = options.maxChars * (1 + options.stretch);
  const chars = lines.reduce((total, l) => total + l.text.length + 1, 0);
  let count = Math.min(
    lines.length,
    Math.max(Math.ceil(lines.length / rowCap), Math.ceil(chars / charCap)),
  );
  for (;;) {
    const groups = Array.from({ length: count }, (_, i) =>
      lines.slice(
        Math.round((i * lines.length) / count),
        Math.round(((i + 1) * lines.length) / count),
      ),
    );
    const fits = groups.every(
      (g) =>
        g.length <= 1 ||
        g.reduce((total, l) => total + l.text.length + 1, 0) <= charCap,
    );
    if (fits || count >= lines.length) return groups;
    count += 1;
  }
}

/**
 * Split a chunk into two halves (used when the AI keeps failing on a chunk:
 * smaller pieces fix most stubborn failures). Each half gets the sheet's
 * first rows as context, like any chunk. A one-row chunk can't be split.
 */
export function splitChunk(
  sheet: SheetData,
  chunk: SheetChunk,
  options: ChunkOptions = DEFAULT_CHUNK_OPTIONS,
): [SheetChunk, SheetChunk] | undefined {
  if (chunk.rows.length < 2) return undefined;
  const lines = rowLines(sheet);
  const wanted = new Set(chunk.rows);
  const own = lines.filter((l) => wanted.has(l.row));
  const middle = Math.ceil(own.length / 2);
  const context = lines.slice(0, options.contextRows);
  return [
    makeChunk(sheet, own.slice(0, middle), context),
    makeChunk(sheet, own.slice(middle), context),
  ];
}

/** Context = the sheet's first rows that come before this group. */
function makeChunk(
  sheet: SheetData,
  group: readonly RowLine[],
  context: readonly RowLine[],
): SheetChunk {
  const first = group[0]?.row ?? 0;
  const contextLines = context.filter((l) => l.row < first);
  return {
    sheetIndex: sheet.index,
    sheetName: sheet.name,
    sheetHidden: sheet.hidden,
    rows: group.map((l) => l.row),
    contextRows: contextLines.map((l) => l.row),
    text: chunkText(sheet, contextLines, group),
  };
}

interface RowLine {
  row: number;
  text: string;
}

/** One line per non-empty row, in row order. */
function rowLines(sheet: SheetData): RowLine[] {
  const byRow = new Map<number, SheetCell[]>();
  for (const cell of sheet.cells) {
    const list = byRow.get(cell.row);
    if (list) list.push(cell);
    else byRow.set(cell.row, [cell]);
  }
  const hiddenRows = new Set(sheet.hiddenRows);
  const hiddenCols = new Set(sheet.hiddenCols);
  return [...byRow.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, cells]) => ({
      row,
      text: renderRow(row, cells, hiddenRows.has(row), hiddenCols),
    }));
}

/** `row 7: A="…" | B="…"`, with hidden rows/columns marked. */
export function renderRow(
  row: number,
  cells: readonly SheetCell[],
  hidden = false,
  hiddenCols: ReadonlySet<number> = new Set(),
): string {
  const values = [...cells]
    .sort((a, b) => a.col - b.col)
    .map((cell) => {
      const col = columnLetter(cell.col);
      const mark = hiddenCols.has(cell.col) ? "(hidden)" : "";
      return `${col}${mark}=${JSON.stringify(cell.text)}`;
    });
  return `row ${String(row)}${hidden ? " (hidden)" : ""}: ${values.join(" | ")}`;
}

function chunkText(
  sheet: SheetData,
  context: readonly RowLine[],
  rows: readonly RowLine[],
): string {
  const first = rows[0]?.row ?? 0;
  const last = rows[rows.length - 1]?.row ?? 0;
  const parts = [
    `Sheet ${JSON.stringify(sheet.name)}${sheet.hidden ? " (hidden sheet)" : ""}`,
  ];
  const merges = mergesText(sheet, first, last, context);
  if (merges) parts.push(`Merged cells: ${merges}`);
  if (context.length > 0) {
    parts.push(
      "Context (first rows of the sheet, for reference only, do not extract):",
      ...context.map((l) => l.text),
    );
  }
  parts.push(
    `Rows ${String(first)} to ${String(last)}:`,
    ...rows.map((l) => l.text),
  );
  return parts.join("\n");
}

/** Merged ranges touching this chunk's rows or context rows, e.g. "A5:A9". */
function mergesText(
  sheet: SheetData,
  first: number,
  last: number,
  context: readonly RowLine[],
): string {
  const contextRows = new Set(context.map((l) => l.row));
  return sheet.merges
    .filter(
      (m) =>
        (m.startRow <= last && m.endRow >= first) ||
        [...contextRows].some((r) => r >= m.startRow && r <= m.endRow),
    )
    .map(
      (m) =>
        `${columnLetter(m.startCol)}${String(m.startRow)}:${columnLetter(m.endCol)}${String(m.endRow)}`,
    )
    .join(", ");
}

/** 1 → A, 26 → Z, 27 → AA. */
export function columnLetter(col: number): string {
  let n = col;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}
