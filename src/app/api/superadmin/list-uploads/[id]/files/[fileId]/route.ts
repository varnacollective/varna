import { superadminId, unauthorized } from "@/lib/list-uploads/auth";
import { UPLOAD_BUCKET } from "@/lib/list-uploads/files";
import { createAdminClient } from "@/utils/supabase/admin";

/** A link to an uploaded file, valid for 5 minutes, for a quick preview. */
export async function GET(_request: Request, ctx: RouteContext<"/api/superadmin/list-uploads/[id]/files/[fileId]">) {
  if (!(await superadminId())) return unauthorized();
  const { id, fileId } = await ctx.params;

  const db = createAdminClient();
  const { data: file } = await db
    .from("list_upload_files")
    .select("storage_path")
    .eq("upload_id", id)
    .eq("id", fileId)
    .maybeSingle<{ storage_path: string | null }>();
  if (!file?.storage_path) return Response.json({ error: "File not found." }, { status: 404 });

  const { data, error } = await db.storage.from(UPLOAD_BUCKET).createSignedUrl(file.storage_path, 300);
  if (error) return Response.json({ error: "The file is no longer in storage." }, { status: 404 });
  return Response.json({ url: data.signedUrl }, { headers: { "Cache-Control": "no-store" } });
}
