import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EXTRACT_SUPPLIERS_PROMPT_VERSION } from "@/agents/list/ai/prompts/extract-suppliers";
import { DOCUMENT_EXTENSIONS } from "@/agents/list/parsers/document";
import { readSpreadsheet } from "@/agents/list/parsers/spreadsheet";
import { readTextFile } from "@/agents/list/parsers/text";
import { extractDocument } from "@/agents/list/pipeline/extract-document";
import {
  extractWorkbook,
  type AiCallRecord,
  type ExtractionRun,
  type Progress,
  type RunContext,
} from "@/agents/list/pipeline/extract-workbook";
import { createAdminClient } from "@/utils/supabase/admin";
import { listReaders } from "./config";
import { checkEmailDomains, domainOf } from "./email-domains";
import {
  checkStatus,
  emailDomainIssue,
  existingSupplierIssue,
  linkRelatedRows,
  linkRowOf,
  toReviewRow,
  type NewReviewRow,
} from "./review-row";
import { UPLOAD_BUCKET } from "./files";
import type { FailedPart, ReadEvent } from "./types";

const INSERT_BATCH = 500;

export class UploadNotReadableError extends Error {}

interface FileRow {
  id: string;
  file_name: string;
  storage_path: string;
}

/**
 * Read every file of an upload with the List agent and save what it found
 * for review. Sends progress through `emit`. Runs once per upload: a second
 * call (a double click, a refresh) is refused.
 */
export async function readUpload(
  uploadId: string,
  emit: (event: ReadEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const db = createAdminClient();
  const readers = listReaders();
  const started = Date.now();

  // Claim the upload: the model is set when reading starts.
  const { data: upload } = await db
    .from("list_uploads")
    .update({ model: readers.model, vision_model: readers.visionModel, updated_at: new Date().toISOString() })
    .eq("id", uploadId)
    .eq("status", "reading")
    .is("model", null)
    .select("id, client_id")
    .maybeSingle<{ id: string; client_id: string | null }>();
  if (!upload) throw new UploadNotReadableError("This upload has already been read.");

  const { data: files, error: filesError } = await db
    .from("list_upload_files")
    .select("id, file_name, storage_path")
    .eq("upload_id", uploadId)
    .order("created_at")
    .order("file_name")
    .overrideTypes<FileRow[], { merge: false }>();
  if (filesError) throw new Error(filesError.message);

  const rows: NewReviewRow[] = [];
  const calls: { file: FileRow; call: AiCallRecord }[] = [];
  const failed: FailedPart[] = [];
  try {
    for (const [index, file] of files.entries()) {
      emit({ type: "file", index, total: files.length, name: file.file_name });
      const run = await readFile(db, file, {
        client_id: upload.client_id ?? randomUUID(),
        // The dashboard has no programmes yet; the agent's records need an id.
        programme_id: randomUUID(),
        upload_id: uploadId,
        file_id: file.id,
        file_name: file.file_name,
      }, readers, (p) => emit({ type: "progress", ...p }), signal);
      if ("error" in run) {
        failed.push({ fileName: file.file_name, part: "whole file", message: run.error });
        continue;
      }
      for (const supplier of run.suppliers) {
        rows.push(toReviewRow(supplier, {
          id: randomUUID(),
          uploadId,
          fileId: file.id,
          fileName: file.file_name,
          position: rows.length + 1,
        }));
      }
      for (const call of run.aiCalls) calls.push({ file, call });
      for (const f of run.failed) {
        failed.push({ fileName: file.file_name, part: partName(f.sheet, f.rows), message: f.message });
      }
    }

    await markBadEmailDomains(rows);
    await markExistingSuppliers(db, rows);
    linkRelated(rows);
    await insertBatches(db, "list_upload_suppliers", rows);
    await insertBatches(db, "list_upload_ai_calls", calls.flatMap(({ file, call }) =>
      call.attempts.map((a, i) => ({
        upload_id: uploadId,
        file_id: file.id,
        part: partName(call.sheet, call.rows),
        task: call.taskType,
        prompt_version: call.promptVersion,
        model: a.model ?? "unknown",
        attempt: i + 1,
        response: parseJson(a.rawResponse),
        problems: a.problems,
        input_tokens: a.inputTokens,
        output_tokens: a.outputTokens,
        thinking_tokens: a.thinkingTokens ?? 0,
        duration_ms: Math.round(a.latencyMs),
      })),
    ));

    const attempts = calls.flatMap(({ call }) => call.attempts);
    const sum = (pick: (a: (typeof attempts)[number]) => number) =>
      attempts.reduce((total, a) => total + pick(a), 0);
    await finish(db, uploadId, {
      status: "review",
      prompt_version: EXTRACT_SUPPLIERS_PROMPT_VERSION,
      input_tokens: sum((a) => a.inputTokens),
      output_tokens: sum((a) => a.outputTokens),
      thinking_tokens: sum((a) => a.thinkingTokens ?? 0),
      duration_ms: Date.now() - started,
      failed_parts: failed,
    });
    emit({ type: "done", suppliers: rows.length, failedParts: failed.length });
  } catch (error) {
    const cancelled = signal.aborted;
    await finish(db, uploadId, {
      status: cancelled ? "cancelled" : "failed",
      duration_ms: Date.now() - started,
      failed_parts: failed,
      error: cancelled ? "Stopped by the reviewer." : errorMessage(error),
    });
    throw error;
  }
}

type FileRun = ExtractionRun | { error: string };

async function readFile(
  db: SupabaseClient,
  file: FileRow,
  context: RunContext,
  readers: ReturnType<typeof listReaders>,
  onProgress: (p: Progress) => void,
  signal: AbortSignal,
): Promise<FileRun> {
  const { data: blob, error } = await db.storage.from(UPLOAD_BUCKET).download(file.storage_path);
  if (error) return { error: "The file could not be found in storage. Upload it again." };
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await db
    .from("list_upload_files")
    .update({ size_bytes: bytes.byteLength, sha256: createHash("sha256").update(bytes).digest("hex") })
    .eq("id", file.id);

  const options = { onProgress, signal };
  try {
    if (DOCUMENT_EXTENSIONS.test(file.file_name)) {
      const run = await extractDocument(bytes, readers.rows, context, {
        ...options,
        transcriber: readers.pages,
      });
      if (run.pageCount !== undefined) {
        await db.from("list_upload_files").update({ page_count: run.pageCount }).eq("id", file.id);
      }
      return run;
    }
    const workbook = /\.(txt|text)$/i.test(file.file_name)
      ? readTextFile(bytes)
      : readSpreadsheet(bytes);
    return await extractWorkbook(workbook, readers.rows, context, options);
  } catch (error) {
    // A stop or an outage ends the whole upload; a bad file only itself.
    if (signal.aborted) throw error;
    return { error: errorMessage(error) };
  }
}

/** Flag emails whose domain doesn't exist or takes no email (DNS only, no AI). */
async function markBadEmailDomains(rows: NewReviewRow[]): Promise<void> {
  const verdicts = await checkEmailDomains(rows.flatMap((r) => (r.email ? [domainOf(r.email)] : [])));
  for (const row of rows) {
    if (!row.email) continue;
    const domain = domainOf(row.email);
    const verdict = verdicts.get(domain);
    if (verdict !== "no_domain" && verdict !== "no_mail") continue;
    row.issues.push(emailDomainIssue(domain, verdict));
    row.check_status = checkStatus(row);
  }
}

/** Name the other rows in "may be the same supplier" and "same email" issues. */
function linkRelated(rows: NewReviewRow[]): void {
  const changed = linkRelatedRows(rows.map(linkRowOf));
  for (const row of rows) {
    const issues = changed.get(row.id);
    if (!issues) continue;
    row.issues = issues;
    row.check_status = checkStatus(row);
  }
}

/** Flag suppliers whose email is already in the supplier list. */
async function markExistingSuppliers(db: SupabaseClient, rows: NewReviewRow[]): Promise<void> {
  const emails = [...new Set(rows.flatMap((r) => (r.email ? [r.email.toLowerCase()] : [])))];
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
    row.issues.push(existingSupplierIssue());
    row.check_status = checkStatus(row);
  }
}

async function insertBatches(db: SupabaseClient, table: string, rows: object[]): Promise<void> {
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const { error } = await db.from(table).insert(rows.slice(i, i + INSERT_BATCH));
    if (error) throw new Error(`Saving to ${table} failed: ${error.message}`);
  }
}

async function finish(db: SupabaseClient, uploadId: string, fields: Record<string, unknown>) {
  const now = new Date().toISOString();
  await db.from("list_uploads").update({ ...fields, finished_at: now, updated_at: now }).eq("id", uploadId);
}

function partName(sheet: string, rows: readonly number[]): string {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (first === undefined || last === undefined) return sheet;
  return first === last ? `${sheet}, row ${first}` : `${sheet}, rows ${first}–${last}`;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
