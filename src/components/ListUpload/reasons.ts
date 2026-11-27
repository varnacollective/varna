import { isSendableEmail } from "@/lib/list-uploads/review-row";
import type { Issue, ReviewSupplier } from "@/lib/list-uploads/types";

/** Why a supplier is in its state, in a few words, for the review table. */

export interface Reason {
  code: string;
  label: string;
  level: Issue["level"];
}

/** Short labels, most important first. The full message stays in the side panel. */
const REASONS: readonly (readonly [code: string, label: string])[] = [
  ["missing_name", "No company name"],
  ["missing_email", "No email"],
  ["invalid_email", "Email not valid"],
  ["email_domain", "Email domain looks wrong"],
  ["email_suggestion", "Possible typo in email"],
  ["already_supplier", "Already a supplier"],
  ["possible_duplicate", "Possible duplicate"],
  ["shared_email", "Same email as another row"],
  ["corrupted_value", "Damaged value in file"],
  ["id_in_wrong_field", "ID in wrong column"],
  ["low_confidence", "AI not sure"],
  ["invalid_phone", "Phone not valid"],
  ["generic_email", "General inbox email"],
  ["unverified_value", "Value not found in file"],
  ["multiple_suppliers_in_cell", "Shares a cell with another"],
  ["no_contact_name", "No contact name"],
  ["read_from_image", "Read from PDF or photo"],
];

const ORDER = new Map(REASONS.map(([code], n) => [code, n]));
const LABEL = new Map(REASONS);

export function reasonLabel(code: string): string | undefined {
  return LABEL.get(code);
}

/**
 * Every reason for a row: problems a person must look at first, then
 * things worth knowing. Name and email are read from the row itself, so
 * they stay right after an edit.
 */
export function reasonsOf(row: Pick<ReviewSupplier, "company_name" | "email" | "issues">): Reason[] {
  const found = new Map<string, Reason>();
  if (!row.company_name?.trim()) found.set("missing_name", reason("missing_name", "attention"));
  if (!row.email?.trim()) found.set("missing_email", reason("missing_email", "attention"));
  else if (!isSendableEmail(row.email)) found.set("invalid_email", reason("invalid_email", "attention"));

  for (const issue of row.issues) {
    if (found.has(issue.code)) continue;
    // A name or email the reviewer has since filled in is no longer a reason.
    if (issue.code === "missing_name" || issue.code === "missing_email") continue;
    found.set(issue.code, { code: issue.code, label: LABEL.get(issue.code) ?? issue.message, level: issue.level });
  }

  return [...found.values()].sort(
    (a, b) => rank(a.level) - rank(b.level) || (ORDER.get(a.code) ?? REASONS.length) - (ORDER.get(b.code) ?? REASONS.length),
  );
}

function reason(code: string, level: Issue["level"]): Reason {
  return { code, label: LABEL.get(code) ?? code, level };
}

function rank(level: Issue["level"]): number {
  return level === "attention" ? 0 : 1;
}
