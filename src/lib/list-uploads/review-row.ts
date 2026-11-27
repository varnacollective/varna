import type { Supplier, SupplierFlag } from "@/agents/list/core/supplier";
import type {
  CheckStatus,
  EditableField,
  Evidence,
  Issue,
  RelatedRow,
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
  read_from_image: { level: "info", message: "Read by AI from a PDF or photo" },
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
  email_domain: "email",
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

/** The email's domain doesn't exist or takes no email: most likely misread or mistyped. */
export function emailDomainIssue(domain: string, verdict: "no_domain" | "no_mail"): Issue {
  return {
    code: "email_domain",
    level: "attention",
    message:
      verdict === "no_domain"
        ? `The email domain "${domain}" doesn't exist. Check the email for a typo or misread.`
        : `The email domain "${domain}" doesn't accept email. Check the email.`,
  };
}

export function issuesFor(supplier: Supplier): Issue[] {
  const issues: Issue[] = [];
  for (const flag of supplier.flags) {
    const issue = FLAG_ISSUES[flag];
    if (!issue) continue;
    const reason = flag === "low_confidence" ? unsureReason(supplier) : undefined;
    issues.push({ code: flag, ...issue, ...(reason ? { message: `The AI was not sure: ${reason}` } : {}) });
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

/** The AI's own words on why it was unsure, if it gave any. */
function unsureReason(supplier: Supplier): string | undefined {
  const prefix = "AI was unsure: ";
  const note = supplier.suggestions.find((s) => s.field === "supplier" && s.issue.startsWith(prefix));
  return note?.issue.slice(prefix.length).trim() || undefined;
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
  id: string;
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
  where: { id: string; uploadId: string; fileId: string; fileName: string; position: number },
): NewReviewRow {
  const [email = null, ...otherEmails] = supplier.emails;
  const [phone = null, ...otherPhones] = supplier.phones;
  const issues = issuesFor(supplier);
  const row = {
    id: where.id,
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

/** What linking needs to know about each supplier of an upload. */
export interface LinkRow {
  id: string;
  file_id: string | null;
  company_name: string | null;
  email: string | null;
  other_emails: string[];
  issues: Issue[];
  evidence: Evidence;
  /** The agent's duplicate group. The agent compares rows within one file. */
  group: string | null;
}

/** Issues that point at other rows, and how their message starts. */
export const LINKED_ISSUES = {
  possible_duplicate: "May be the same supplier as",
  shared_email: "Same email as",
} as const;
type LinkedCode = keyof typeof LINKED_ISSUES;

export function linkRowOf(row: NewReviewRow): LinkRow {
  return {
    id: row.id,
    file_id: row.file_id,
    company_name: row.company_name,
    email: row.email,
    other_emails: row.other_emails,
    issues: row.issues,
    evidence: row.extracted.evidence,
    group: row.extracted.supplier.duplicate_group_id ?? null,
  };
}

/**
 * Point "may be the same supplier" and "same email" issues at the other rows,
 * so the reviewer doesn't have to hunt for them. Same email is compared
 * across every file of the upload. Safe to run again after an edit: it
 * rebuilds these two issues from the current emails.
 * Returns the new issues of the rows whose issues changed.
 */
export function linkRelatedRows(rows: readonly LinkRow[]): Map<string, Issue[]> {
  const byGroup = groupBy(rows, (r) => (r.group ? [r.group] : []));
  const byEmail = groupBy(rows, emailKeys);
  const changed = new Map<string, Issue[]>();
  for (const row of rows) {
    const twins = othersIn(byGroup, row.group ? [row.group] : [], row);
    const twinIds = new Set(twins.map((t) => t.id));
    const sharing = othersIn(byEmail, emailKeys(row), row).filter((o) => !twinIds.has(o.id));
    let issues = setLinked(row.issues, "possible_duplicate", row, twins);
    issues = setLinked(issues, "shared_email", row, sharing);
    if (JSON.stringify(issues) !== JSON.stringify(row.issues)) changed.set(row.id, issues);
  }
  return changed;
}

/** Replace the issue in place, add it at the end, or drop it when nothing is linked. */
function setLinked(issues: Issue[], code: LinkedCode, row: LinkRow, others: readonly LinkRow[]): Issue[] {
  if (others.length === 0) return issues.filter((i) => i.code !== code);
  const issue = linkedIssue(code, row, others);
  const at = issues.findIndex((i) => i.code === code);
  if (at === -1) return [...issues, issue];
  return issues.flatMap((i, n) => (i.code !== code ? [i] : n === at ? [issue] : []));
}

function linkedIssue(code: LinkedCode, row: LinkRow, others: readonly LinkRow[]): Issue {
  const related: RelatedRow[] = others.map((o) => ({ id: o.id, place: placeOf(o, row) }));
  const names = others.map((o, n) => `${o.company_name?.trim() || "a supplier with no name"} (${related[n]?.place ?? ""})`);
  const shown = names.length > 3 ? [...names.slice(0, 2), `${String(names.length - 2)} more`] : names;
  const list = shown.length > 1 ? `${shown.slice(0, -1).join(", ")} and ${shown.at(-1) ?? ""}` : (shown[0] ?? "");
  return { code, level: "attention", message: `${LINKED_ISSUES[code]} ${list}`, related };
}

/** Where `other` is, said from `from`'s point of view: the file only if it differs. */
export function placeOf(other: Pick<LinkRow, "file_id" | "evidence">, from: Pick<LinkRow, "file_id" | "evidence">): string {
  const e = other.evidence;
  const otherFile = other.file_id !== from.file_id;
  const sheet = !e.page && e.sheet && e.sheet !== "Text" && (otherFile || e.sheet !== from.evidence.sheet) ? `sheet "${e.sheet}"` : null;
  const spot = e.page ? `page ${String(e.page)}` : e.row ? `row ${String(e.row)}` : null;
  return [otherFile ? e.fileName : null, sheet, spot].filter(Boolean).join(", ") || e.fileName;
}

/** Every email of a row (main and "also in the list"), compared case-insensitively. */
function emailKeys(row: Pick<LinkRow, "email" | "other_emails">): string[] {
  const all = [row.email, ...row.other_emails].map((e) => e?.trim().toLowerCase() ?? "");
  return [...new Set(all.filter(Boolean))];
}

function groupBy(rows: readonly LinkRow[], keys: (r: LinkRow) => string[]): Map<string, LinkRow[]> {
  const groups = new Map<string, LinkRow[]>();
  for (const row of rows) {
    for (const k of keys(row)) {
      const list = groups.get(k);
      if (list) list.push(row);
      else groups.set(k, [row]);
    }
  }
  return groups;
}

/** The other rows sharing any of these keys, each once, in list order. */
function othersIn(groups: Map<string, LinkRow[]>, keys: readonly string[], row: LinkRow): LinkRow[] {
  const found = new Set(keys.flatMap((k) => groups.get(k) ?? []));
  found.delete(row);
  return [...found];
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
