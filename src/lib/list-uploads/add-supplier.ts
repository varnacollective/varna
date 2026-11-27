import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/utils/supabase/admin";
import { markBadEmailDomains, markExistingSuppliers, markInOtherLists } from "./checks";
import { manualRow, type ManualSupplier } from "./manual";

/**
 * Save one supplier added by hand for review, after the same checks as a
 * list (email domain, already a supplier, already among this hotel's
 * suppliers). It is kept as its own small "upload", marked manual, so
 * reviewing and inviting work exactly as for a list.
 */
export async function addSupplier(
  input: ManualSupplier,
  userId: string,
): Promise<{ uploadId: string; supplierId: string }> {
  const db = createAdminClient();
  const now = new Date().toISOString();
  const { data: upload, error } = await db
    .from("list_uploads")
    .insert({ client_id: input.clientId, created_by: userId, source: "manual", status: "review", finished_at: now })
    .select("id")
    .single<{ id: string }>();
  if (error) throw new Error(error.message);

  try {
    const row = manualRow(input, { id: randomUUID(), uploadId: upload.id });
    await markBadEmailDomains([row]);
    await markExistingSuppliers(db, [row]);
    await markInOtherLists(db, [row], { clientId: input.clientId, uploadId: upload.id });
    const { error: rowError } = await db.from("list_upload_suppliers").insert(row);
    if (rowError) throw new Error(rowError.message);

    await db.from("audit_log").insert({
      user_id: userId,
      action: "add_supplier",
      entity_type: "list_upload_supplier",
      entity_id: row.id,
      after_state: { client_id: input.clientId, company_name: row.company_name, check_status: row.check_status },
    });
    return { uploadId: upload.id, supplierId: row.id };
  } catch (caught) {
    // Nothing half-saved: the upload goes with its row.
    await db.from("list_uploads").delete().eq("id", upload.id);
    throw caught;
  }
}
