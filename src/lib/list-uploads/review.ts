import "server-only";
import { z } from "zod/v4";
import { createAdminClient } from "@/utils/supabase/admin";
import { REVIEW_SUPPLIER_COLUMNS } from "./queries";
import { checkEmailDomains, domainOf } from "./email-domains";
import { checkStatus, emailDomainIssue, isSendableEmail, recheck } from "./review-row";
import { DECISIONS, EDITABLE_FIELDS, type Decision, type EditableField, type ReviewSupplier } from "./types";

/** A reviewer's edits and decisions, checked and recorded in the audit log. */

const fieldValue = z
  .string()
  .max(300)
  .nullable()
  .transform((v) => (v?.trim() ? v.trim() : null));

export const SupplierChange = z
  .strictObject({
    fields: z.partialRecord(z.enum(EDITABLE_FIELDS), fieldValue).optional(),
    decision: z.enum(DECISIONS).optional(),
  })
  .refine((c) => c.fields !== undefined || c.decision !== undefined, "Nothing to change");
export type SupplierChange = z.infer<typeof SupplierChange>;

export const BulkDecision = z.strictObject({
  ids: z.array(z.uuid()).min(1).max(1000),
  decision: z.enum(DECISIONS),
});

export type ChangeResult =
  | { ok: true; supplier: ReviewSupplier }
  | { ok: false; status: number; error: string };

/** Why a supplier can't be approved, or null if it can. */
export function cannotApprove(row: Pick<ReviewSupplier, "company_name" | "email">): string | null {
  if (!row.company_name?.trim()) return "Add a company name first.";
  if (!isSendableEmail(row.email)) return "Add a valid email first.";
  return null;
}

export async function changeSupplier(
  uploadId: string,
  id: string,
  change: SupplierChange,
  userId: string,
): Promise<ChangeResult> {
  const db = createAdminClient();
  const { data: row } = await db
    .from("list_upload_suppliers")
    .select(REVIEW_SUPPLIER_COLUMNS)
    .eq("upload_id", uploadId)
    .eq("id", id)
    .maybeSingle<ReviewSupplier>();
  if (!row) return { ok: false, status: 404, error: "Supplier not found." };
  if (row.invitation_id) return { ok: false, status: 409, error: "Already invited: it can't be changed here." };

  const edits = Object.entries(change.fields ?? {}) as [EditableField, string | null][];
  if (edits.some(([field, value]) => field === "email" && value !== null && !isSendableEmail(value))) {
    return { ok: false, status: 400, error: "That email doesn't look valid." };
  }
  const next = { ...row, ...Object.fromEntries(edits) } as ReviewSupplier;
  const update: Record<string, unknown> = Object.fromEntries(edits);
  if (edits.length > 0) {
    const checked = recheck(next, edits.map(([f]) => f));
    // A newly typed email gets the same domain check as one read from the file.
    const newEmail = edits.find(([f]) => f === "email")?.[1];
    if (newEmail) {
      const domain = domainOf(newEmail);
      const verdict = (await checkEmailDomains([domain])).get(domain);
      if (verdict === "no_domain" || verdict === "no_mail") {
        checked.issues.push(emailDomainIssue(domain, verdict));
        checked.check_status = checkStatus({ ...next, issues: checked.issues });
      }
    }
    next.issues = checked.issues;
    Object.assign(update, checked);
  }

  if (change.decision !== undefined && change.decision !== row.decision) {
    const reason = change.decision === "approved" ? cannotApprove(next) : null;
    if (reason) return { ok: false, status: 400, error: reason };
    Object.assign(update, decisionFields(change.decision, userId));
  }
  if (Object.keys(update).length === 0) return { ok: true, supplier: row };

  const { data: saved, error } = await db
    .from("list_upload_suppliers")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", id)
    .is("invitation_id", null)
    .select(REVIEW_SUPPLIER_COLUMNS)
    .single<ReviewSupplier>();
  if (error) return { ok: false, status: 500, error: error.message };
  await audit(userId, "list_upload_supplier", id, pick(row, update), pick(saved, update));
  return { ok: true, supplier: saved };
}

/** Approve or reject many at once. Rows that can't be approved are skipped. */
export async function decideMany(
  uploadId: string,
  ids: readonly string[],
  decision: Decision,
  userId: string,
): Promise<{ updated: string[]; skipped: { id: string; reason: string }[] }> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("list_upload_suppliers")
    .select("id, company_name, email, invitation_id")
    .eq("upload_id", uploadId)
    .in("id", ids);
  if (error) throw new Error(error.message);

  const skipped: { id: string; reason: string }[] = [];
  const allowed: string[] = [];
  for (const row of data ?? []) {
    const reason = row.invitation_id
      ? "Already invited."
      : decision === "approved"
        ? cannotApprove(row)
        : null;
    if (reason) skipped.push({ id: row.id, reason });
    else allowed.push(row.id);
  }
  if (allowed.length > 0) {
    const { error: updateError } = await db
      .from("list_upload_suppliers")
      .update({ ...decisionFields(decision, userId), updated_at: new Date().toISOString() })
      .in("id", allowed)
      .is("invitation_id", null);
    if (updateError) throw new Error(updateError.message);
    await audit(userId, "list_upload", uploadId, null, { decision, suppliers: allowed });
  }
  return { updated: allowed, skipped };
}

function decisionFields(decision: Decision, userId: string) {
  const pending = decision === "pending";
  return {
    decision,
    decided_by: pending ? null : userId,
    decided_at: pending ? null : new Date().toISOString(),
  };
}

function pick(row: object, keys: object): Record<string, unknown> {
  const source = row as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(keys)
      .filter((k) => k in source && k !== "issues")
      .map((k) => [k, source[k]]),
  );
}

async function audit(
  userId: string,
  entityType: "list_upload" | "list_upload_supplier",
  entityId: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
): Promise<void> {
  const { error } = await createAdminClient().from("audit_log").insert({
    user_id: userId,
    action: "review_list_upload",
    entity_type: entityType,
    entity_id: entityId,
    before_state: before,
    after_state: after,
  });
  if (error) console.warn("Could not write the audit log:", error.message);
}
