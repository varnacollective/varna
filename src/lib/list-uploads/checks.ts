import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { checkEmailDomains, domainOf } from "./email-domains";
import { checkStatus, emailDomainIssue, existingSupplierIssue, inOtherListIssue } from "./review-row";
import type { CheckStatus, Issue } from "./types";

/**
 * Checks that need the outside world (DNS, the database), run on new
 * suppliers before they are saved: whether they came from a file or were
 * added by hand, they get the same checks.
 */

export interface CheckedRow {
  company_name: string | null;
  email: string | null;
  issues: Issue[];
  check_status: CheckStatus;
  /** Set when the email is already in the supplier list. */
  duplicate_of?: string;
}

/** Flag emails whose domain doesn't exist or takes no email (DNS only, no AI). */
export async function markBadEmailDomains(rows: CheckedRow[]): Promise<void> {
  const verdicts = await checkEmailDomains(rows.flatMap((r) => (r.email ? [domainOf(r.email)] : [])));
  for (const row of rows) {
    if (!row.email) continue;
    const domain = domainOf(row.email);
    const verdict = verdicts.get(domain);
    if (verdict !== "no_domain" && verdict !== "no_mail") continue;
    add(row, emailDomainIssue(domain, verdict));
  }
}

/** Flag suppliers whose email is already in the supplier list (invited before). */
export async function markExistingSuppliers(db: SupabaseClient, rows: CheckedRow[]): Promise<void> {
  const emails = emailsOf(rows);
  if (emails.length === 0) return;
  const { data, error } = await db
    .from("partner_suppliers")
    .select("id, contact_email")
    .in("contact_email", emails)
    .overrideTypes<{ id: string; contact_email: string | null }[], { merge: false }>();
  if (error) throw new Error(error.message);
  const existing = new Map(
    data.flatMap((s) => (s.contact_email ? [[s.contact_email.toLowerCase(), s.id] as const] : [])),
  );
  for (const row of rows) {
    const id = row.email ? existing.get(row.email.toLowerCase()) : undefined;
    if (id === undefined) continue;
    row.duplicate_of = id;
    add(row, existingSupplierIssue());
  }
}

/**
 * Flag suppliers whose email is already among the same hotel's suppliers
 * (another list, or added by hand), so adding more never doubles anyone up.
 * Skipped for rows already flagged as an existing supplier: that says more.
 */
export async function markInOtherLists(
  db: SupabaseClient,
  rows: CheckedRow[],
  hotel: { clientId: string | null; uploadId: string },
): Promise<void> {
  const emails = emailsOf(rows);
  if (emails.length === 0) return;
  const query = db
    .from("list_upload_suppliers")
    .select("email, place:extracted->evidence->>fileName, upload:list_uploads!inner(client_id)")
    .in("email", emails)
    .neq("upload_id", hotel.uploadId);
  const { data, error } = await (hotel.clientId === null
    ? query.is("upload.client_id", null)
    : query.eq("upload.client_id", hotel.clientId)
  ).overrideTypes<{ email: string | null; place: string | null }[], { merge: false }>();
  if (error) throw new Error(error.message);
  const places = new Map<string, string>();
  for (const r of data) {
    const key = r.email?.toLowerCase();
    if (key && !places.has(key)) places.set(key, r.place ?? "another list");
  }
  for (const row of rows) {
    const place = row.email ? places.get(row.email.toLowerCase()) : undefined;
    if (place === undefined || row.duplicate_of) continue;
    add(row, inOtherListIssue(place));
  }
}

function add(row: CheckedRow, issue: Issue): void {
  row.issues.push(issue);
  row.check_status = checkStatus(row);
}

function emailsOf(rows: readonly CheckedRow[]): string[] {
  return [...new Set(rows.flatMap((r) => (r.email ? [r.email.toLowerCase()] : [])))];
}
