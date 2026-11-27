import { randomBytes } from "node:crypto";
import { z } from "zod/v4";
import type { SheetChunk } from "../../parsers/sheet-text";
import type { SheetData } from "../../parsers/spreadsheet";
import {
  EXTRACT_SUPPLIERS_INSTRUCTIONS,
  EXTRACT_SUPPLIERS_PROMPT_VERSION,
} from "../prompts/extract-suppliers";
import type { AiTask } from "../task";
import { cellTexts, checkExtraction } from "./check-extraction";

/**
 * The extraction job: find every supplier in one chunk of a spreadsheet.
 *
 * The AI only copies: for every value it gives the cell it came from, plus
 * the exact text when the value is only part of the cell, so code can check
 * each value against the source. Citing a whole cell by its address alone
 * keeps answers short (output tokens are the main cost and the main wait). It does no
 * cleaning; our own rules do that afterwards. It must also say what every
 * other row is, so code can check that no row was skipped.
 */

export const EXTRACT_FIELDS = [
  "company_name",
  "brand_name",
  "contact_name",
  "email",
  "phone",
  "website",
  "address",
  "city",
  "district",
  "state",
  "country",
  "category",
  "gstin",
  "udyam_number",
  "pan",
  "cin",
  "other_id",
  "notes",
] as const;
export const ExtractField = z.enum(EXTRACT_FIELDS);
export type ExtractField = z.infer<typeof ExtractField>;

/** Cell address like "B7": column letters, then row number. */
export const CELL_ADDRESS = /^[A-Z]{1,3}[1-9]\d*$/;

// ---- the answer as the model writes it (compact, to save output tokens) ----

const CellRef = z.string().regex(CELL_ADDRESS, 'a cell must look like "B7"');

/** Only part of a cell: the exact text of that part. */
const PartRef = z.strictObject({
  cell: CellRef,
  text: z.string().min(1),
});

/** "B7" (the whole cell is the value) or {cell, text} (part of the cell). */
const ValueRef = z.union([CellRef, PartRef]);

/** One value, or several (e.g. two emails). */
const FieldRefs = z.union([ValueRef, z.array(ValueRef).min(1)]);
type FieldRefs = z.infer<typeof FieldRefs>;

const fieldShape = Object.fromEntries(
  EXTRACT_FIELDS.map((field) => [field, FieldRefs.optional()]),
) as Record<ExtractField, z.ZodOptional<typeof FieldRefs>>;

export const ReplySupplier = z
  .strictObject({
    ...fieldShape,
    /** Several suppliers were written in one cell; this is one of them. */
    multiple_in_cell: z.boolean().optional(),
    /** The AI is not sure this is a supplier or that the values are right. */
    unsure: z.boolean().optional(),
    /** Short reason, when unsure. */
    reason: z.string().optional(),
  })
  .refine((s) => EXTRACT_FIELDS.some((f) => s[f] !== undefined), {
    message: "each supplier needs at least one value",
  });
export type ReplySupplier = z.infer<typeof ReplySupplier>;

export const OTHER_ROW_KINDS = [
  "heading",
  "title",
  "total",
  "note",
  "not_a_supplier",
  "other",
] as const;

export const OtherRow = z.strictObject({
  row: z.int().positive(),
  kind: z.enum(OTHER_ROW_KINDS),
  /** Short reason, e.g. "hotel's own purchase manager". */
  reason: z.string().optional(),
});
export type OtherRow = z.infer<typeof OtherRow>;

/** The answer exactly as the model must write it. */
export const ExtractSuppliersReply = z.strictObject({
  suppliers: z.array(ReplySupplier),
  other_rows: z.array(OtherRow),
});
export type ExtractSuppliersReply = z.infer<typeof ExtractSuppliersReply>;

// ---- the same answer, expanded for checks and records ----------------------

export interface ExtractedValue {
  field: ExtractField;
  /** Cell the value comes from, e.g. "B7". */
  cell: string;
  /** Exact text: the whole cell, or the part the model copied. */
  text: string;
  /** The model cited the whole cell (no text copied). */
  whole: boolean;
}

export interface ExtractedSupplier {
  values: ExtractedValue[];
  multiple_in_cell: boolean;
  unsure: boolean;
  reason?: string;
}

export interface ExtractSuppliersAnswer {
  suppliers: ExtractedSupplier[];
  other_rows: OtherRow[];
}

/**
 * Expand the compact reply: a whole-cell reference gets the cell's text
 * from the sheet (empty if the cell is empty; the checks report that).
 */
export function expandReply(
  reply: ExtractSuppliersReply,
  cells: ReadonlyMap<string, string>,
): ExtractSuppliersAnswer {
  return {
    suppliers: reply.suppliers.map((s) => ({
      values: EXTRACT_FIELDS.flatMap((field) => {
        const refs = s[field];
        if (refs === undefined) return [];
        return (Array.isArray(refs) ? refs : [refs]).map((ref) =>
          typeof ref === "string"
            ? { field, cell: ref, text: cells.get(ref) ?? "", whole: true }
            : { field, cell: ref.cell, text: ref.text, whole: false },
        );
      }),
      multiple_in_cell: s.multiple_in_cell ?? false,
      unsure: s.unsure ?? false,
      ...(s.reason === undefined ? {} : { reason: s.reason }),
    })),
    other_rows: reply.other_rows,
  };
}

export interface ExtractTaskOptions {
  /** Upper limit on the answer's length, in tokens. */
  maxOutputTokens: number;
  /** Random marker around the file content; fixed in tests. */
  boundary: () => string;
}

export const DEFAULT_EXTRACT_OPTIONS: ExtractTaskOptions = {
  // ~50 rows × a few values each, with plenty of room (thinking included).
  maxOutputTokens: 32_000,
  boundary: () => randomBytes(6).toString("hex"),
};

/**
 * Build the extraction task for one chunk of `sheet`. The source checks
 * (values really in their cells, every row accounted for) are always
 * attached: an answer that fails them is sent back to the model.
 */
export function extractSuppliersTask(
  chunk: SheetChunk,
  sheet: SheetData,
  options: ExtractTaskOptions = DEFAULT_EXTRACT_OPTIONS,
): AiTask<ExtractSuppliersAnswer> {
  const cells = cellTexts(sheet);
  return {
    type: "extract_suppliers",
    promptVersion: EXTRACT_SUPPLIERS_PROMPT_VERSION,
    instructions: EXTRACT_SUPPLIERS_INSTRUCTIONS,
    input: wrapSource(chunk, options.boundary()),
    outputSchema: ExtractSuppliersReply.transform((reply) =>
      expandReply(reply, cells),
    ),
    check: (answer) => checkExtraction(answer, chunk, cells, sheet.merges),
    maxOutputTokens: options.maxOutputTokens,
  };
}

/**
 * Put the chunk between markers carrying a random id, so text inside a cell
 * can't pretend to end the file content (it can't know the id).
 */
function wrapSource(chunk: SheetChunk, id: string): string {
  return [
    `Rows to account for: ${chunk.rows.join(", ")}`,
    chunk.contextRows.length > 0
      ? `Context rows (reference only, do not extract or list): ${chunk.contextRows.join(", ")}`
      : "Context rows: none",
    "",
    `<source_content id="${id}">`,
    chunk.text,
    `</source_content id="${id}">`,
  ].join("\n");
}
