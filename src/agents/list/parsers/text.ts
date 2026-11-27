import { columnLetter } from "./sheet-text";
import {
  decodeText,
  type SheetCell,
  type WorkbookData,
} from "./spreadsheet";

/**
 * Reads plain text (a list pasted from an email, a chat message, a Word
 * document, or a .txt file) into the same shape as a spreadsheet, so it goes
 * through exactly the same AI step and source checks.
 *
 * - One line = one row; the row number is the line number (blank lines are
 *   skipped but still counted, so "row 12" is line 12 of what was pasted).
 * - Tabs split a line into columns (A, B, C…): a range copied from Excel or a
 *   table copied from an email pastes as tab-separated text. Nothing else is
 *   split: commas, dashes and pipes are left for the AI to read.
 * - Text is kept exactly as written (spaces, scripts, odd characters); only
 *   line endings and a leading byte-order mark are dropped.
 */

/** Sheet name used for text, shown as the source "sheet" of each supplier. */
export const TEXT_SHEET_NAME = "Text";

export function readText(text: string): WorkbookData {
  const cells: SheetCell[] = [];
  const lines = text.replace(/^\uFEFF/, "").split(/\r\n|\r|\n/);
  lines.forEach((line, i) => {
    const row = i + 1;
    line.split("\t").forEach((value, c) => {
      if (value.trim() === "") return;
      const col = c + 1;
      cells.push({
        row,
        col,
        address: `${columnLetter(col)}${String(row)}`,
        text: value,
        kind: "text",
      });
    });
  });
  return {
    sheets: [
      {
        index: 0,
        name: TEXT_SHEET_NAME,
        hidden: false,
        hiddenRows: [],
        hiddenCols: [],
        merges: [],
        cells,
      },
    ],
  };
}

/** Read a text file's bytes (UTF-8, UTF-16 with a byte-order mark, or Windows-1252). */
export function readTextFile(data: Uint8Array): WorkbookData {
  return readText(decodeText(data));
}
