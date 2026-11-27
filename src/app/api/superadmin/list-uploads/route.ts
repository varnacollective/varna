import { randomUUID } from "node:crypto";
import { z } from "zod/v4";
import { badRequest, superadminId, unauthorized } from "@/lib/list-uploads/auth";
import { ACCEPTED_FILE, MAX_FILE_BYTES, MAX_FILES, UPLOAD_BUCKET } from "@/lib/list-uploads/files";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Start an upload: record it and its files, and return a one-time upload URL
 * per file. The browser sends the files straight to storage (so large files
 * never pass through this server), then calls ./[id]/read.
 */

const Body = z.strictObject({
  /** A hotel code from client_master (e.g. CLT-001). */
  clientId: z.string().trim().min(1).max(64).nullable(),
  files: z
    .array(
      z.strictObject({
        name: z.string().trim().min(1).max(255).regex(ACCEPTED_FILE, "This kind of file can't be read"),
        size: z.int().positive().max(MAX_FILE_BYTES, "A file is over 15 MB"),
        type: z.string().max(255),
      }),
    )
    .min(1)
    .max(MAX_FILES),
});

export async function POST(request: Request) {
  const userId = await superadminId();
  if (!userId) return unauthorized();

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid request");
  const { clientId, files } = parsed.data;

  const db = createAdminClient();
  const { data: upload, error } = await db
    .from("list_uploads")
    .insert({ client_id: clientId, created_by: userId })
    .select("id")
    .single<{ id: string }>();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const now = Date.now();
  const rows = files.map((file, i) => {
    const id = randomUUID();
    const extension = file.name.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase() ?? "";
    return {
      id,
      upload_id: upload.id,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      // Filled in once the file is read.
      sha256: "",
      storage_path: `${upload.id}/${id}${extension}`,
      // Keeps the order the files were picked in.
      created_at: new Date(now + i).toISOString(),
    };
  });
  const { error: filesError } = await db.from("list_upload_files").insert(rows);
  if (filesError) return Response.json({ error: filesError.message }, { status: 500 });

  const targets = await Promise.all(
    rows.map((row) => db.storage.from(UPLOAD_BUCKET).createSignedUploadUrl(row.storage_path)),
  );
  const failed = targets.find((t) => t.error);
  if (failed?.error) return Response.json({ error: failed.error.message }, { status: 500 });

  return Response.json({
    uploadId: upload.id,
    files: targets.map((t) => ({ path: t.data?.path, token: t.data?.token })),
  });
}
