import { DEFAULT_RULES, type ListRules } from "./rules";
import type { SupplierFlag, SupplierStatus, Suggestion } from "./supplier";

/** Flags that need a human to look at the row. Other flags are informational. */
export const ATTENTION_FLAGS: ReadonlySet<SupplierFlag> = new Set([
  "missing_name",
  "invalid_email",
  "shared_email",
  "possible_duplicate",
  "low_confidence",
  "id_in_wrong_field",
  // Read by AI from a PDF or photo: no original text to check it against,
  // so a person compares it with the page.
  "read_from_image",
]);

/** Fields a supplier needs. Phone is optional and never affects status. */
export const KEY_FIELDS = ["company_name", "emails"] as const;

/** Suggestions about these fields are informational and don't hold a row back. */
const OPTIONAL_FIELDS: ReadonlySet<string> = new Set(["phones"]);

export interface StatusInput {
  flags: readonly SupplierFlag[];
  emails: readonly string[];
  suggestions: readonly Suggestion[];
}

/**
 * Decide a row's status. READY needs a company name and a valid email.
 * DUPLICATE is never set here: only a human confirms a duplicate.
 *
 * 1. No valid email → MISSING_CONTACT (email is mandatory; phone doesn't count).
 * 2. Any attention flag (incl. missing_name) → NEEDS_ATTENTION.
 * 3. Any suggestion awaiting a human, except about optional fields → NEEDS_ATTENTION.
 * 4. Otherwise → READY.
 */
export function decideStatus(input: StatusInput): SupplierStatus {
  if (input.emails.length === 0) return "MISSING_CONTACT";
  if (input.flags.some((flag) => ATTENTION_FLAGS.has(flag))) {
    return "NEEDS_ATTENTION";
  }
  if (input.suggestions.some((s) => !OPTIONAL_FIELDS.has(s.field))) {
    return "NEEDS_ATTENTION";
  }
  return "READY";
}

/** True if any key field present in the row is below the confidence threshold. */
export function isLowConfidence(
  fieldConfidence: Readonly<Record<string, number>>,
  rules: Pick<ListRules, "lowConfidenceThreshold"> = DEFAULT_RULES,
): boolean {
  return KEY_FIELDS.some((field) => {
    const confidence = fieldConfidence[field];
    return (
      confidence !== undefined && confidence < rules.lowConfidenceThreshold
    );
  });
}

/** Rows flagged not_a_supplier (headers, totals, hotel staff) are left out of the output and kept in the run log. */
export function isExcluded(flags: readonly SupplierFlag[]): boolean {
  return flags.includes("not_a_supplier");
}

/** Combine flags from several checks, without repeats, in a stable order. */
export function combineFlags(
  ...groups: readonly (readonly SupplierFlag[])[]
): SupplierFlag[] {
  return [...new Set(groups.flat())];
}
