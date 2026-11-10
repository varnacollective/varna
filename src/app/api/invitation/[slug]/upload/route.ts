import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing invitation slug" }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Resolve invitation
    const { data: invitation, error: invError } = await admin
      .from("partner_invitations")
      .select("id, status")
      .eq("slug", slug)
      .single();

    if (invError || !invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // 2. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const questionRef = (formData.get("questionRef") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Validation
    const fileName = file.name;
    const fileSize = file.size;
    const mimeType = file.type || "application/octet-stream";
    const isVideo = mimeType.startsWith("video/") || /\.(mp4|mov|webm|mkv|avi)$/i.test(fileName);
    const maxSize = isVideo ? 500 * 1024 * 1024 : 25 * 1024 * 1024; // 500MB for video, 25MB for other

    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds the limit (${isVideo ? "500 MB" : "25 MB"}).` },
        { status: 400 }
      );
    }

    // 4. Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${invitation.id}/${Date.now()}_${cleanFileName}`;

    const { error: uploadError } = await admin.storage
      .from("partner-documents")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Storage Upload Error]:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 5. Insert metadata into partner_documents
    const now = new Date().toISOString();
    const { data: docRow, error: docError } = await admin
      .from("partner_documents")
      .insert({
        invitation_id: invitation.id,
        question_ref: questionRef,
        file_path: filePath,
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType,
        storage_bucket: "partner-documents",
        status: "uploaded",
        uploaded_at: now,
      })
      .select()
      .single();

    if (docError) {
      console.error("[DB Document Insert Error]:", docError);
      return NextResponse.json(
        { error: `Failed to record document metadata: ${docError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document: docRow,
    });
  } catch (err: any) {
    console.error("[API Invitation Upload] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal upload error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!slug || !documentId) {
      return NextResponse.json({ error: "Missing slug or documentId" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify invitation
    const { data: invitation } = await admin
      .from("partner_invitations")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Get document
    const { data: doc } = await admin
      .from("partner_documents")
      .select("id, file_path, storage_bucket")
      .eq("id", documentId)
      .eq("invitation_id", invitation.id)
      .single();

    if (doc) {
      await admin.storage.from(doc.storage_bucket || "partner-documents").remove([doc.file_path]);
      await admin.from("partner_documents").delete().eq("id", doc.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[API Invitation Delete Doc] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}
