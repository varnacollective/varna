import "server-only";
import { createAdminClient } from "@/utils/supabase/admin";
import { paidCostUsd, type TokenUse } from "./pricing";
import type { ReviewSupplier, UploadSummary } from "./types";

/** Reads for the review page. Only the server can read these tables. */

const SUPPLIER_COLUMNS =
  "id, upload_id, file_id, position, company_name, brand_name, contact_name, email, other_emails, phone, other_phones, " +
  "city, state, category, check_status, issues, decision, duplicate_of, invitation_id, evidence:extracted->evidence, " +
  // The invitation's status is read from the invitation itself, never copied.
  "invitation:partner_invitations(status)";

export async function getUpload(id: string): Promise<UploadSummary | null> {
  const db = createAdminClient();
  const { data: u } = await db
    .from("list_uploads")
    .select(
      "id, client_id, source, status, created_at, finished_at, model, vision_model, input_tokens, " +
        "output_tokens, thinking_tokens, failed_parts, error, " +
        "client:client_master(name:client_name), files:list_upload_files(id, file_name, size_bytes, page_count, created_at), " +
        "calls:list_upload_ai_calls(model, input_tokens, output_tokens)",
    )
    .eq("id", id)
    .maybeSingle<RawUpload>();
  if (!u) return null;
  return {
    id: u.id,
    clientId: u.client_id,
    source: u.source,
    clientName: u.client?.name ?? null,
    status: u.status,
    createdAt: u.created_at,
    finishedAt: u.finished_at,
    model: u.model,
    visionModel: u.vision_model,
    inputTokens: u.input_tokens,
    outputTokens: u.output_tokens,
    thinkingTokens: u.thinking_tokens,
    paidCostUsd: paidCostUsd(u.calls),
    failedParts: u.failed_parts,
    error: u.error,
    files: [...u.files]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((f) => ({ id: f.id, name: f.file_name, sizeBytes: f.size_bytes, pageCount: f.page_count })),
  };
}

export async function getReviewSuppliers(uploadId: string): Promise<ReviewSupplier[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("list_upload_suppliers")
    .select(SUPPLIER_COLUMNS)
    .eq("upload_id", uploadId)
    .order("position")
    .overrideTypes<ReviewSupplier[], { merge: false }>();
  if (error) throw new Error(error.message);
  return data;
}

export async function getReviewSupplier(uploadId: string, id: string): Promise<ReviewSupplier | null> {
  const db = createAdminClient();
  const { data } = await db
    .from("list_upload_suppliers")
    .select(SUPPLIER_COLUMNS)
    .eq("upload_id", uploadId)
    .eq("id", id)
    .maybeSingle<ReviewSupplier>();
  return data;
}

export const REVIEW_SUPPLIER_COLUMNS = SUPPLIER_COLUMNS;

interface RawUpload {
  id: string;
  client_id: string | null;
  source: UploadSummary["source"];
  status: UploadSummary["status"];
  created_at: string;
  finished_at: string | null;
  model: string | null;
  vision_model: string | null;
  input_tokens: number;
  output_tokens: number;
  thinking_tokens: number;
  failed_parts: UploadSummary["failedParts"];
  error: string | null;
  client: { name: string } | null;
  files: { id: string; file_name: string; size_bytes: number; page_count: number | null; created_at: string }[];
  calls: TokenUse[];
}
