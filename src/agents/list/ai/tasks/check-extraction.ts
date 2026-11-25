import { columnLetter, type SheetChunk } from "../../parsers/sheet-text";
import type { CellRange, SheetData } from "../../parsers/spreadsheet";
import type { ExtractSuppliersAnswer } from "./extract-suppliers";

/**
 * Checks an extraction answer against the source. Our guarantees come from
 * here, never from the model:
 *
 * - Every value is really in the cell it cites (no invented or altered values).
 * - Every row of the chunk is accounted for exactly once: used by a supplier
 *   or labelled in other_rows (nothing skipped).
 * - Nothing comes from outside the chunk or from context rows.
 * - No email or phone number in a supplier's row is left out (otherwise a
 *   supplier could look "missing contact" when the file has its email).
 * - A cell cited whole holds just that one value: if the same cell also
 *   gives another field or a part, the model must give each part's text.
 *
 * Problems are written in plain words, because they are sent back to the
 * model for a retry.
 */

/** Most problems listed in one retry message, to keep it short. */
const MAX_PROBLEMS = 20;

/** Every cell's text in a sheet, by address ("B7"). */
export function cellTexts(sheet: SheetData): Map<string, string> {
  return new Map(sheet.cells.map((cell) => [cell.address, cell.text]));
}

export function checkExtraction(
  answer: ExtractSuppliersAnswer,
  chunk: SheetChunk,
  cells: ReadonlyMap<string, string>,
  merges: readonly CellRange[] = [],
): string[] {
  const problems: string[] = [];
  const chunkRows = new Set(chunk.rows);
  const contextRows = new Set(chunk.contextRows);
  const mergeStarts = mergeStartsTouching(merges, chunk.rows);

  // Rows used by supplier values, and the texts cited from each cell.
  const usedRows = new Set<number>();
  const cited = new Map<string, string[]>();
  // Cells with a wrong citation already have a problem reported.
  const badCells = new Set<string>();
  answer.suppliers.forEach((supplier, i) => {
    for (const value of supplier.values) {
      const row = rowOf(value.cell);
      const where = `Supplier ${String(i + 1)}, ${value.field} from ${value.cell}`;
      if (contextRows.has(row) && !mergeStarts.has(value.cell)) {
        problems.push(
          `${where}: row ${String(row)} is a context row. Do not extract from context rows.`,
        );
        continue;
      }
      if (!chunkRows.has(row) && !mergeStarts.has(value.cell)) {
        problems.push(
          `${where}: row ${String(row)} is not in this part of the sheet. Use only rows from "Rows to account for".`,
        );
        continue;
      }
      if (chunkRows.has(row)) usedRows.add(row);
      cited.set(value.cell, [...(cited.get(value.cell) ?? []), value.text]);
      const cellText = cells.get(value.cell);
      if (cellText === undefined) {
        problems.push(`${where}: cell ${value.cell} is empty.`);
      } else if (!textInCell(value.text, cellText)) {
        badCells.add(value.cell);
        problems.push(
          `${where}: cell ${value.cell} does not contain ${JSON.stringify(value.text)}. Copy the text exactly as it is in the cell, without correcting or reformatting it.`,
        );
      }
    }
  });

  problems.push(...mixedWholeCells(answer));
  problems.push(...unusedContacts(cells, usedRows, cited, badCells));

  // Rows labelled in other_rows.
  const listed = new Set<number>();
  for (const other of answer.other_rows) {
    const row = other.row;
    if (contextRows.has(row)) {
      problems.push(
        `other_rows: row ${String(row)} is a context row. Do not list context rows.`,
      );
    } else if (!chunkRows.has(row)) {
      problems.push(
        `other_rows: row ${String(row)} is not in this part of the sheet.`,
      );
    } else if (listed.has(row)) {
      problems.push(`other_rows: row ${String(row)} is listed more than once.`);
    } else if (usedRows.has(row)) {
      problems.push(
        `other_rows: row ${String(row)} is listed in other_rows but also used by a supplier. A row is either used by a supplier or listed in other_rows, not both.`,
      );
    }
    listed.add(row);
  }

  // Every row accounted for.
  const missing = chunk.rows.filter((r) => !usedRows.has(r) && !listed.has(r));
  if (missing.length > 0) {
    problems.push(
      `Rows missing from the answer: ${missing.join(", ")}. Every row in "Rows to account for" must be used by a supplier or listed in other_rows.`,
    );
  }

  if (problems.length > MAX_PROBLEMS) {
    const more = problems.length - MAX_PROBLEMS;
    return [
      ...problems.slice(0, MAX_PROBLEMS),
      `…and ${String(more)} more problems like these.`,
    ];
  }
  return problems;
}

/**
 * True if `text` appears in the cell. Only whitespace may differ (spaces,
 * line breaks, Unicode form), since the model may put a multi-line cell on
 * one line. Everything else (digits, spelling, case, symbols) must match.
 *
 * A part of the cell is allowed (one cell can hold two emails), but it must
 * not cut a word or number in half: "Rao Weave" is not in "Rao Weaves".
 */
export function textInCell(text: string, cellText: string): boolean {
  const needle = squashSpace(text);
  const haystack = squashSpace(cellText);
  if (needle.length === 0) return false;
  for (
    let at = haystack.indexOf(needle);
    at !== -1;
    at = haystack.indexOf(needle, at + 1)
  ) {
    const before = haystack[at - 1];
    const after = haystack[at + needle.length];
    const cutsStart = isWordChar(before) && isWordChar(needle[0]);
    const cutsEnd = isWordChar(after) && isWordChar(needle[needle.length - 1]);
    if (!cutsStart && !cutsEnd) return true;
  }
  return false;
}

function isWordChar(char: string | undefined): boolean {
  return char !== undefined && /[\p{L}\p{N}]/u.test(char);
}

function squashSpace(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

/** An email address as written (before any cleaning). */
const EMAIL_TOKEN = /[^\s,;|/<>()[\]"']+@[^\s,;|/<>()[\]"']+/g;
/** Obfuscated email, e.g. "name [at] domain [dot] com". */
const OBFUSCATED_EMAIL = /[[({]\s*at\s*[\])}]/i;
/** 8+ digits, optionally with single spaces, dashes, dots or brackets between. */
const PHONE_LIKE = /\d(?:[\s\-.()]?\d){7,}/;
/** A long number Excel turned into scientific notation, e.g. 9.19877E+11. */
const SCIENTIFIC = /\d(?:\.\d+)?e\+?\d+/i;

/**
 * In rows used by suppliers: every email must be cited (each one, even when
 * a cell holds several), and every cell that looks like it holds an email or
 * phone number must be used. The AI may cite such a value as notes if it is
 * not the supplier's own, but it may not skip it.
 */
function unusedContacts(
  cells: ReadonlyMap<string, string>,
  usedRows: ReadonlySet<number>,
  cited: ReadonlyMap<string, readonly string[]>,
  badCells: ReadonlySet<string>,
): string[] {
  const problems: string[] = [];
  for (const [address, text] of cells) {
    if (!usedRows.has(rowOf(address)) || badCells.has(address)) continue;
    const texts = cited.get(address) ?? [];
    const missingEmails = [...text.matchAll(EMAIL_TOKEN)]
      .map((m) => m[0].replace(/[.,:;]+$/, ""))
      .filter((email) => !texts.some((t) => textInCell(email, t)));
    if (missingEmails.length > 0) {
      problems.push(
        `Cell ${address} contains ${missingEmails.map((e) => JSON.stringify(e)).join(", ")}, which no supplier uses. Give every email as its own value (use notes if it is not the supplier's own).`,
      );
    } else if (
      texts.length === 0 &&
      (OBFUSCATED_EMAIL.test(text) ||
        PHONE_LIKE.test(text) ||
        SCIENTIFIC.test(text))
    ) {
      problems.push(
        `Cell ${address} looks like it holds an email or phone number, but no supplier uses it. Give it as a value (use notes if it is not the supplier's own).`,
      );
    }
  }
  return problems;
}

/**
 * A whole-cell citation says "this cell is the value". That is wrong when
 * the same cell also gives a different field, or a part of it is cited: the
 * cell holds several things, so each needs its exact part. (The same field
 * citing one cell whole from several suppliers is fine: a merged city.)
 */
function mixedWholeCells(answer: ExtractSuppliersAnswer): string[] {
  const byCell = new Map<string, { wholeFields: Set<string>; parts: number }>();
  for (const supplier of answer.suppliers) {
    for (const value of supplier.values) {
      const entry = byCell.get(value.cell) ?? {
        wholeFields: new Set<string>(),
        parts: 0,
      };
      if (value.whole) entry.wholeFields.add(value.field);
      else entry.parts++;
      byCell.set(value.cell, entry);
    }
  }
  const problems: string[] = [];
  for (const [cell, { wholeFields, parts }] of byCell) {
    if (wholeFields.size === 0 || (wholeFields.size === 1 && parts === 0)) {
      continue;
    }
    problems.push(
      `Cell ${cell} is given whole (as "${cell}") for ${[...wholeFields].join(", ")}, but it is also used for other values. When a cell holds several values, give each one as {"cell": "${cell}", "text": "<the exact part>"}.`,
    );
  }
  return problems;
}

/** "B7" → 7. Addresses are already validated by the answer schema. */
function rowOf(address: string): number {
  return Number(/\d+$/.exec(address)?.[0] ?? 0);
}

/**
 * First cells of merged ranges that cover a chunk row: a merged value (e.g.
 * a city merged down a column) may live in a row before the chunk.
 */
function mergeStartsTouching(
  merges: readonly CellRange[],
  rows: readonly number[],
): Set<string> {
  const result = new Set<string>();
  for (const m of merges) {
    if (rows.some((r) => r >= m.startRow && r <= m.endRow)) {
      result.add(`${columnLetter(m.startCol)}${String(m.startRow)}`);
    }
  }
  return result;
}
