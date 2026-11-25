import type { Supplier, SupplierFlag } from "@/agents/list/core/supplier";
import type {
  CheckStatus,
  EditableField,
  Evidence,
  Issue,
  ReviewSupplier,
} from "./types";

/**
 * Turns a supplier found by the List agent into a row for the review table,
 * and re-checks a row after a reviewer edits it. No database access here.
 */

const FLAG_ISSUES: Partial<Record<SupplierFlag, Omit<Issue, "code">>> = {
  missing_name: { level: "attention", message: "No company name" },
  invalid_email: { level: "attention", message: "An email doesn't look valid" },
  shared_email: { level: "attention", message: "Same email as another supplier in this list" },
  possible_duplicate: { level: "attention", message: "May be the same supplier as another row in this list" },
  low_confidence: { level: "attention", message: "The AI was not sure about this one" },
  id_in_wrong_field: { level: "attention", message: "A business ID was in the wrong column" },
  read_from_image: { level: "attention", message: "Read from a PDF or photo: compare with the original" },
  corrupted_value: { level: "attention", message: "A value looks damaged in the file (for example 9.19877E+11)" },
  unverified_value: { level: "info", message: "A value could not be matched to the file exactly" },
  invalid_phone: { level: "info", message: "A phone number doesn't look valid" },
  generic_email: { level: "info", message: "General inbox (like info@ or sales@)" },
  multiple_suppliers_in_cell: { level: "info", message: "Written in the same cell as another supplier" },
};

/** Which field an issue is about: editing that field clears it. */
const ISSUE_FIELD: Record<string, EditableField> = {
  missing_name: "company_name",
  low_confidence: "company_name",
  invalid_email: "email",
  shared_email: "email",
  missing_email: "email",
  email_suggestion: "email",
  invalid_phone: "phone",
  corrupted_value: "phone",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isSendableEmail(email: string | null | undefined): email is string {
  return typeof email === "string" && EMAIL.test(email.trim());
}

export function noContactNameIssue(company: string | null): Issue {
  return {
    code: "no_contact_name",
    level: "info",
    message: `No contact name: the email will start "Dear ${company ?? "the"} team"`,
  };
}

export function existingSupplierIssue(): Issue {
  return {
    code: "already_supplier",
    level: "attention",
    message: "This email is already in the supplier list",
  };
}

export function issuesFor(supplier: Supplier): Issue[] {
  const issues: Issue[] = [];
  for (const flag of supplier.flags) {
    const issue = FLAG_ISSUES[flag];
    if (issue) issues.push({ code: flag, ...issue });
  }
  for (const s of supplier.suggestions) {
    if (s.field !== "emails" || s.suggested_value === undefined) continue;
    issues.push({
      code: "email_suggestion",
      level: "attention",
      message: `${s.issue}: did you mean ${s.suggested_value}?`,
    });
  }
  if (!supplier.contact_name) {
    issues.push(noContactNameIssue(supplier.company_name ?? null));
  }
  return issues;
}

/** Ready needs a company name, a valid email, and nothing left to look at. */
export function checkStatus(
  row: Pick<ReviewSupplier, "company_name" | "email" | "issues">,
): CheckStatus {
  if (!isSendableEmail(row.email)) return "missing_contact";
  if (!row.company_name?.trim()) return "needs_attention";
  return row.issues.some((i) => i.level === "attention") ? "needs_attention" : "ready";
}

export function evidenceFor(supplier: Supplier, fileName: string): Evidence {
  const { sheet, row, page } = supplier.source;
  return {
    fileName,
    ...(sheet === undefined ? {} : { sheet }),
    ...(row === undefined ? {} : { row }),
    ...(page === undefined ? {} : { page }),
    readFromImage: supplier.flags.includes("read_from_image"),
    cells: Object.entries(supplier.raw_values).map(([cell, text]) => ({ cell, text })),
  };
}

export interface NewReviewRow {
  upload_id: string;
  file_id: string;
  position: number;
  company_name: string | null;
  brand_name: string | null;
  contact_name: string | null;
  email: string | null;
  other_emails: string[];
  phone: string | null;
  other_phones: string[];
  city: string | null;
  state: string | null;
  check_status: CheckStatus;
  issues: Issue[];
  extracted: { supplier: Supplier; evidence: Evidence };
  /** Set when the email is already in the supplier list. */
  duplicate_of?: string;
}

export function toReviewRow(
  supplier: Supplier,
  where: { uploadId: string; fileId: string; fileName: string; position: number },
): NewReviewRow {
  const [email = null, ...otherEmails] = supplier.emails;
  const [phone = null, ...otherPhones] = supplier.phones;
  const issues = issuesFor(supplier);
  const row = {
    upload_id: where.uploadId,
    file_id: where.fileId,
    position: where.position,
    company_name: supplier.company_name ?? null,
    brand_name: supplier.brand_name ?? null,
    contact_name: supplier.contact_name ?? null,
    email,
    other_emails: otherEmails,
    phone,
    other_phones: otherPhones,
    city: supplier.city ?? null,
    state: supplier.state ?? null,
    issues,
  };
  return {
    ...row,
    check_status: checkStatus(row),
    extracted: { supplier, evidence: evidenceFor(supplier, where.fileName) },
  };
}

/**
 * After a reviewer edits fields: drop the issues about those fields, add
 * back "no contact name" if it is still empty, and work out the status again.
 */
export function recheck(
  row: Pick<ReviewSupplier, "company_name" | "contact_name" | "email" | "issues">,
  edited: readonly EditableField[],
): { issues: Issue[]; check_status: CheckStatus } {
  // "No contact name" is rebuilt every time: its text names the company.
  const issues = row.issues.filter((i) => {
    if (i.code === "no_contact_name") return false;
    const field = ISSUE_FIELD[i.code];
    return field === undefined || !edited.includes(field);
  });
  if (!row.contact_name?.trim()) issues.push(noContactNameIssue(row.company_name));
  return { issues, check_status: checkStatus({ ...row, issues }) };
}

/** The name the invitation email greets: the contact, else "<Company> team". */
export function greetingName(row: Pick<ReviewSupplier, "company_name" | "contact_name">): string {
  return row.contact_name?.trim() || `${row.company_name?.trim() ?? "Supplier"} team`;
}
