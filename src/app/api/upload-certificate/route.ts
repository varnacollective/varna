/**
 * POST /api/upload-certificate
 *
 * Security fixes applied:
 *   F7  – Requires a valid signed session (superadmin) OR valid non-expired
 *          assessment_links token passed as `linkToken` in the form data.
 *   F7  – Rate-limited: max 20 requests / minute per IP.
 *   F8  – Public "anyone" Drive permission is REMOVED.
 *   F8  – File size capped at 10 MB.
 *   F8  – MIME-type restricted to PDF, PNG, JPEG, WEBP.
 *   F8  – Magic-byte validation guards against disguised executables.
 *   F8  – SHA-256 hash of file buffer stored in partner_certificates.extracted_metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import { createAdminClient } from "@/utils/supabase/admin";
import { getSession } from "@/lib/session";
import { createRateLimiter } from "@/lib/rate-limiter";
import { createHash } from "crypto";

// ── Rate limiter: 20 req / min per IP ────────────────────────────────────────
const uploadRateLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Magic-byte signatures ──────────────────────────────────────────────────
function validateMagicBytes(buf: Buffer, declaredMime: string): boolean {
  if (declaredMime === "application/pdf") {
    return buf.slice(0, 4).toString("ascii") === "%PDF";
  }
  if (declaredMime === "image/png") {
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  }
  if (declaredMime === "image/jpeg") {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (declaredMime === "image/webp") {
    // RIFF....WEBP
    return (
      buf.slice(0, 4).toString("ascii") === "RIFF" &&
      buf.slice(8, 12).toString("ascii") === "WEBP"
    );
  }
  return false;
}

export async function POST(request: NextRequest) {
  // ── Rate limiting ───────────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { allowed, remaining, resetAt } = uploadRateLimiter.check(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before uploading again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const formData = await request.formData();

    // ── Auth: valid superadmin session OR valid non-expired assessment link ────
    const session = await getSession();
    const linkToken = formData.get("linkToken") as string | null;

    let authorised = false;

    if (session && session.role === "superadmin") {
      authorised = true;
    } else if (linkToken) {
      const supabase = createAdminClient();
      const { data: link } = await supabase
        .from("assessment_links")
        .select("uuid, expires_at, status")
        .eq("uuid", linkToken)
        .maybeSingle();

      if (
        link &&
        link.status !== "Completed" &&
        link.expires_at &&
        new Date(link.expires_at) > new Date()
      ) {
        authorised = true;
      }
    }

    if (!authorised) {
      return NextResponse.json(
        { error: "Unauthorised. A valid session or link token is required." },
        { status: 401 }
      );
    }

    // ── Extract fields ─────────────────────────────────────────────────────────
    const file = formData.get("file") as File | null;
    const partnerName = (
      formData.get("partnerName") || formData.get("partner_name")
    ) as string | null;
    const certificateType = (
      formData.get("certificateType") || formData.get("certificate_type")
    ) as string | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A valid certificate file is required." },
        { status: 400 }
      );
    }
    if (!partnerName?.trim()) {
      return NextResponse.json({ error: "Partner name is required." }, { status: 400 });
    }
    if (!certificateType?.trim()) {
      return NextResponse.json({ error: "Certificate type is required." }, { status: 400 });
    }

    // ── File size check ────────────────────────────────────────────────────────
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds the 10 MB maximum size limit.` },
        { status: 400 }
      );
    }

    // ── MIME type check ────────────────────────────────────────────────────────
    const declaredMime = file.type || "";
    if (!ALLOWED_MIME_TYPES.has(declaredMime)) {
      return NextResponse.json(
        {
          error: `File type "${declaredMime}" is not allowed. Accepted: PDF, PNG, JPEG, WEBP.`,
        },
        { status: 400 }
      );
    }

    // ── Read buffer ────────────────────────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Magic-byte validation ──────────────────────────────────────────────────
    if (!validateMagicBytes(buffer, declaredMime)) {
      return NextResponse.json(
        { error: "File content does not match its declared type. Upload rejected." },
        { status: 400 }
      );
    }

    // ── SHA-256 hash for evidence integrity ───────────────────────────────────
    const sha256Hash = createHash("sha256").update(buffer).digest("hex");

    // ── Google Drive credentials ──────────────────────────────────────────────
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    const folderId = (
      formData.get("folderId") ||
      formData.get("folder") ||
      process.env.GOOGLE_DRIVE_FOLDER_ID
    ) as string | null;

    if (!clientEmail || !rawPrivateKey) {
      return NextResponse.json(
        { error: "Google Drive service account is not configured on the server." },
        { status: 500 }
      );
    }

    const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

    // ── Authenticate with Google Drive ────────────────────────────────────────
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });
    const drive = google.drive({ version: "v3", auth });

    // ── Upload to Google Drive (private – no public permissions) ─────────────
    const fileMetadata: { name: string; parents?: string[] } = {
      name: `${partnerName.trim()}_${certificateType.trim()}_${file.name}`,
    };
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: declaredMime,
        body: Readable.from(buffer),
      },
      fields: "id, webViewLink, name",
      supportsAllDrives: true,
    });

    // NOTE: We intentionally do NOT call drive.permissions.create with
    // type: 'anyone'.  The file remains private to the Service Account.

    const driveFileId = driveResponse.data.id;
    const driveWebViewLink = driveResponse.data.webViewLink;

    if (!driveFileId) {
      throw new Error("Google Drive upload returned no file ID.");
    }

    // ── Insert into partner_certificates (admin client) ───────────────────────
    const supabase = createAdminClient();

    const { data: record, error: dbError } = await supabase
      .from("partner_certificates")
      .insert({
        partner_name: partnerName.trim(),
        certificate_type: certificateType.trim(),
        drive_file_id: driveFileId,
        drive_webview_link: driveWebViewLink ?? null,
        status: "Pending",
        extracted_metadata: {
          sha256: sha256Hash,
          file_size_bytes: file.size,
          mime_type: declaredMime,
          original_name: file.name,
          uploaded_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase insert error in partner_certificates:", dbError);
      return NextResponse.json(
        {
          error: "Failed to record certificate in database.",
          drive_file_id: driveFileId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Certificate uploaded and registered successfully.",
        data: record,
      },
      {
        status: 201,
        headers: { "X-RateLimit-Remaining": String(remaining) },
      }
    );
  } catch (error: any) {
    console.error("Error in upload-certificate route:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred during certificate upload." },
      { status: 500 }
    );
  }
}
