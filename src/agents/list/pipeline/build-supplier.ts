import type {
  ExtractField,
  ExtractedSupplier,
} from "../ai/tasks/extract-suppliers";
import { checkEmails } from "../core/emails";
import { checkGstin, checkUdyam, compactId } from "../core/ids";
import { checkCompanyName } from "../core/names";
import { checkPhones } from "../core/phones";
import { DEFAULT_RULES, type ListRules } from "../core/rules";
import { combineFlags } from "../core/status";
import type {
  Suggestion,
  SupplierFlag,
  SupplierSource,
} from "../core/supplier";
import { cleanWhitespace, isPlaceholder } from "../core/text";

/**
 * Turns one supplier found by the AI (already checked against the source)
 * into the fields of a supplier record, using the M1 rules. Duplicate checks
 * and status need the whole list, so they happen later.
 *
 * Nothing from the file is lost: `raw_values` holds the full text of every
 * cell in the rows this supplier uses (cited by the AI or not), keyed by cell
 * address. Typed fields hold only values that passed their checks.
 */

/** Confidence for a value the AI copied and code verified in its cell. */
export const AI_VERIFIED_CONFIDENCE = 0.9;
/** Confidence when the AI said it is unsure. Below the low-confidence threshold. */
export const AI_UNSURE_CONFIDENCE = 0.5;

export interface SupplierFields {
  company_name?: string;
  company_name_normalised?: string;
  brand_name?: string;
  contact_name?: string;
  emails: string[];
  phones: string[];
  website?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  category?: string;
  gstin?: string;
  udyam_number?: string;
  other_ids?: Record<string, string>;
  notes?: string;
  raw_values: Record<string, string>;
  suggestions: Suggestion[];
  field_confidence: Record<string, number>;
  flags: SupplierFlag[];
  source: SupplierSource;
}

export interface BuildContext {
  file_id: string;
  file_name: string;
  sheet: string;
  /** Page number, when the sheet is a page read from a PDF or photo. */
  page?: number;
  /** Text of every cell in the sheet, by address. */
  cells: ReadonlyMap<string, string>;
  rules?: ListRules;
}

/** Plain-text fields, and how several values for one field are joined. */
const TEXT_FIELDS = {
  brand_name: " ",
  contact_name: ", ",
  website: ", ",
  address: ", ",
  city: ", ",
  district: ", ",
  state: ", ",
  country: ", ",
  category: ", ",
  notes: "; ",
} as const satisfies Partial<Record<ExtractField, string>>;

export function buildSupplierFields(
  found: ExtractedSupplier,
  context: BuildContext,
): SupplierFields {
  const rules = context.rules ?? DEFAULT_RULES;
  const texts = (field: ExtractField) =>
    found.values.filter((v) => v.field === field).map((v) => v.text);
  const flags: SupplierFlag[][] = [];
  const suggestions: Suggestion[] = [];
  const fields: Partial<SupplierFields> = {};

  // Company name: the first one given. Any others stay in raw_values.
  const names = texts("company_name");
  const name = checkCompanyName(names[0]);
  flags.push(name.flags);
  if (
    name.company_name !== undefined &&
    name.company_name_normalised !== undefined
  ) {
    fields.company_name = name.company_name;
    fields.company_name_normalised = name.company_name_normalised;
  }
  if (names.length > 1) {
    suggestions.push({
      field: "company_name",
      issue: `several names given for one supplier: ${names.map((n) => JSON.stringify(n)).join(", ")}`,
    });
  }

  for (const [field, separator] of Object.entries(TEXT_FIELDS)) {
    const values = texts(field as ExtractField)
      .map(cleanWhitespace)
      .filter((v) => !isPlaceholder(v));
    if (values.length > 0) {
      (fields as Record<string, string>)[field] = values.join(separator);
    }
  }

  const emails = checkEmails(texts("email"));
  flags.push(emails.flags);
  suggestions.push(...emails.suggestions);

  const phones = checkPhones(texts("phone"), rules);
  flags.push(phones.flags);
  suggestions.push(...phones.suggestions);

  const gstins = texts("gstin");
  if (gstins[0] !== undefined) {
    const gstin = checkGstin(gstins[0], fields.state);
    flags.push(gstin.flags);
    suggestions.push(...gstin.suggestions);
    if (gstin.value !== undefined) fields.gstin = gstin.value;
  }
  const udyams = texts("udyam_number");
  if (udyams[0] !== undefined) {
    const udyam = checkUdyam(udyams[0]);
    flags.push(udyam.flags);
    suggestions.push(...udyam.suggestions);
    if (udyam.value !== undefined) fields.udyam_number = udyam.value;
  }

  const otherIds: Record<string, string> = {};
  for (const [field, key] of [
    ["pan", "pan"],
    ["cin", "cin"],
    ["other_id", "other"],
  ] as const) {
    const values = texts(field)
      .map((v) => (field === "other_id" ? cleanWhitespace(v) : compactId(v)))
      .filter((v) => !isPlaceholder(v));
    if (values.length > 0) otherIds[key] = values.join(", ");
  }
  if (Object.keys(otherIds).length > 0) fields.other_ids = otherIds;

  if (found.multiple_in_cell) flags.push(["multiple_suppliers_in_cell"]);
  if (found.unsure) {
    flags.push(["low_confidence"]);
    suggestions.push({
      field: "supplier",
      issue: `AI was unsure${found.reason ? `: ${found.reason}` : ""}`,
    });
  }

  const confidence = found.unsure
    ? AI_UNSURE_CONFIDENCE
    : AI_VERIFIED_CONFIDENCE;
  const field_confidence: Record<string, number> = {};
  for (const value of found.values) {
    field_confidence[confidenceKey(value.field)] = confidence;
  }

  return {
    ...fields,
    emails: emails.emails,
    phones: phones.phones,
    raw_values: rawValues(found, context.cells),
    suggestions,
    field_confidence,
    flags: combineFlags(...flags),
    source: {
      file_id: context.file_id,
      file_name: context.file_name,
      sheet: context.sheet,
      row: firstRow(found),
      ...(context.page === undefined ? {} : { page: context.page }),
    },
  };
}

/** Field names as used in the supplier record. */
function confidenceKey(field: ExtractField): string {
  switch (field) {
    case "email":
      return "emails";
    case "phone":
      return "phones";
    case "pan":
    case "cin":
    case "other_id":
      return "other_ids";
    default:
      return field;
  }
}

/**
 * Full text of every cell in the rows this supplier uses, plus any cell it
 * cites elsewhere (a merged cell), keyed by address in sheet order.
 */
function rawValues(
  found: ExtractedSupplier,
  cells: ReadonlyMap<string, string>,
): Record<string, string> {
  const rows = new Set(found.values.map((v) => rowOf(v.cell)));
  const addresses = new Set(found.values.map((v) => v.cell));
  for (const address of cells.keys()) {
    if (rows.has(rowOf(address))) addresses.add(address);
  }
  const ordered = [...addresses].sort(
    (a, b) => rowOf(a) - rowOf(b) || colOf(a) - colOf(b),
  );
  const result: Record<string, string> = {};
  for (const address of ordered) {
    const text = cells.get(address);
    if (text !== undefined) result[address] = text;
  }
  return result;
}

/** The row the supplier starts on (its first cited cell's row). */
function firstRow(found: ExtractedSupplier): number {
  return Math.min(...found.values.map((v) => rowOf(v.cell)));
}

function rowOf(address: string): number {
  return Number(/\d+$/.exec(address)?.[0] ?? 0);
}

function colOf(address: string): number {
  const letters = /^[A-Z]+/.exec(address)?.[0] ?? "";
  let col = 0;
  for (const letter of letters) col = col * 26 + (letter.charCodeAt(0) - 64);
  return col;
}
