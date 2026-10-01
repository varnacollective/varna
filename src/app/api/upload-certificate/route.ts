import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 1. Extract file, partnerName, and certificateType from formData
    const file = formData.get("file") as File | null;
    const partnerName = (formData.get("partnerName") || formData.get("partner_name")) as string | null;
    const certificateType = (formData.get("certificateType") || formData.get("certificate_type")) as string | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A valid certificate file is required." },
        { status: 400 }
      );
    }

    if (!partnerName || !partnerName.trim()) {
      return NextResponse.json(
        { error: "Partner name is required." },
        { status: 400 }
      );
    }

    if (!certificateType || !certificateType.trim()) {
      return NextResponse.json(
        { error: "Certificate type is required." },
        { status: 400 }
      );
    }

    // 2. Validate Google credentials
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!clientEmail || !rawPrivateKey) {
      console.error("Missing Google Drive API credentials (GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY).");
      return NextResponse.json(
        { error: "Google Drive service account is not configured on the server." },
        { status: 500 }
      );
    }

    // Handle \n character replacement in private key
    const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

    // 3. Authenticate with Google Drive API via JWT
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });

    const drive = google.drive({ version: "v3", auth });

    // 4. Convert file to stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // 5. Upload file to Google Drive folder
    const fileMetadata: { name: string; parents?: string[] } = {
      name: `${partnerName.trim()}_${certificateType.trim()}_${file.name}`,
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: file.type || "application/octet-stream",
        body: stream,
      },
      fields: "id, webViewLink, webContentLink, name",
    });

    const driveFileId = driveResponse.data.id;
    const driveWebViewLink = driveResponse.data.webViewLink;

    if (!driveFileId || !driveWebViewLink) {
      throw new Error("Google Drive upload completed but returned no file ID or webViewLink.");
    }

    // Attempt to make file readable to anyone with link for iframe preview
    try {
      await drive.permissions.create({
        fileId: driveFileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
    } catch (permError) {
      console.warn("Could not set anyone-reader permission on Drive file:", permError);
    }

    // 6. Insert new record into partner_certificates Supabase table
    const supabase = await createClient();

    const insertPayload = {
      partner_name: partnerName.trim(),
      certificate_type: certificateType.trim(),
      drive_file_id: driveFileId,
      drive_webview_link: driveWebViewLink,
      status: "Pending",
    };

    const { data: record, error: dbError } = await supabase
      .from("partner_certificates")
      .insert(insertPayload)
      .select()
      .single();

    if (dbError) {
      console.error("Supabase insert error in partner_certificates:", dbError);
      return NextResponse.json(
        {
          error: "Failed to record certificate in database.",
          details: dbError.message,
          drive_file_id: driveFileId,
          drive_webview_link: driveWebViewLink,
        },
        { status: 500 }
      );
    }

    // 7. Return success response to the client
    return NextResponse.json(
      {
        success: true,
        message: "Certificate uploaded and registered successfully.",
        data: record || insertPayload,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in upload-certificate route:", error);
    return NextResponse.json(
      {
        error: error?.message || "An unexpected error occurred during certificate upload.",
      },
      { status: 500 }
    );
  }
}
