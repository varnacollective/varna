import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";

// ─── Types ──────────────────────────────────────────────────────────────────
interface AssessmentPayload {
  uuid: string;
  enterprise_name: string;
  // Step 1 — Enterprise Overview
  legal_name: string;
  trade_name?: string;
  udyam_number?: string;
  udyam_certificate_link?: string;
  year_established?: string;
  legal_structure?: string;
  registered_address?: string;
  operating_address?: string;
  annual_turnover?: string;
  employee_count?: string;
  founder_name?: string;
  founders_story?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  // Step 2 — Products Overview
  primary_product_categories?: string;
  product_description?: string;
  raw_materials?: string;
  production_process?: string;
  production_video_link?: string;
  // Step 3 — Environment
  water_source?: string;
  water_recycling?: string;
  carbon_footprint_tracked?: string;
  energy_sources?: string;
  chemical_usage?: string;
  chemical_disposal?: string;
  environmental_certifications?: string;
  // Step 4 — People & Community
  total_workers?: string;
  women_workers_pct?: string;
  artisan_workers_pct?: string;
  minimum_wage_compliance?: string;
  esi_pf_coverage?: string;
  esi_documents_link?: string;
  health_safety_measures?: string;
  community_programs?: string;
  // Step 5 — Legal & Compliance
  gst_registered?: string;
  gst_number?: string;
  legal_disputes?: string;
  ethics_policy?: string;
  ethics_policy_document_link?: string;
  // Step 6 — Craft & Cultural Heritage
  craft_traditions?: string;
  gi_tags?: string;
  pehchaan_card?: string;
  artisan_training?: string;
  heritage_documentation_link?: string;
  // Step 7 — Sustainability Management
  sdg_alignment?: string;
  sustainability_tracking?: string;
  sustainability_goals?: string;
  additional_certifications?: string;
  submitted_at: string;
}

// ─── Google Sheets Auth ──────────────────────────────────────────────────────
async function getAuthenticatedSheets() {
  const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyRaw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set.");

  const credentials = typeof keyRaw === "string" ? JSON.parse(keyRaw) : keyRaw;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

// ─── Row Mapper ──────────────────────────────────────────────────────────────
// Maps the form payload to the ordered column values for "2_ASSESSMENT_INPUTS".
// Column headers in the sheet (Row 1) must match this order exactly.
function payloadToRow(p: AssessmentPayload): string[] {
  return [
    p.submitted_at,
    p.uuid,
    p.enterprise_name,
    p.legal_name,
    p.trade_name ?? "",
    p.udyam_number ?? "",
    p.udyam_certificate_link ?? "",
    p.year_established ?? "",
    p.legal_structure ?? "",
    p.registered_address ?? "",
    p.operating_address ?? "",
    p.annual_turnover ?? "",
    p.employee_count ?? "",
    p.founder_name ?? "",
    p.founders_story ?? "",
    p.primary_contact_name ?? "",
    p.primary_contact_email ?? "",
    p.primary_contact_phone ?? "",
    p.primary_product_categories ?? "",
    p.product_description ?? "",
    p.raw_materials ?? "",
    p.production_process ?? "",
    p.production_video_link ?? "",
    p.water_source ?? "",
    p.water_recycling ?? "",
    p.carbon_footprint_tracked ?? "",
    p.energy_sources ?? "",
    p.chemical_usage ?? "",
    p.chemical_disposal ?? "",
    p.environmental_certifications ?? "",
    p.total_workers ?? "",
    p.women_workers_pct ?? "",
    p.artisan_workers_pct ?? "",
    p.minimum_wage_compliance ?? "",
    p.esi_pf_coverage ?? "",
    p.esi_documents_link ?? "",
    p.health_safety_measures ?? "",
    p.community_programs ?? "",
    p.gst_registered ?? "",
    p.gst_number ?? "",
    p.legal_disputes ?? "",
    p.ethics_policy ?? "",
    p.ethics_policy_document_link ?? "",
    p.craft_traditions ?? "",
    p.gi_tags ?? "",
    p.pehchaan_card ?? "",
    p.artisan_training ?? "",
    p.heritage_documentation_link ?? "",
    p.sdg_alignment ?? "",
    p.sustainability_tracking ?? "",
    p.sustainability_goals ?? "",
    p.additional_certifications ?? "",
  ];
}

// ─── Route Handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const payload: AssessmentPayload = await request.json();

    if (!payload.uuid || !payload.enterprise_name || !payload.legal_name) {
      return NextResponse.json(
        { error: "Missing required fields: uuid, enterprise_name, legal_name." },
        { status: 400 }
      );
    }

    payload.submitted_at = new Date().toISOString();

    // 1. Append to Google Sheets
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) throw new Error("GOOGLE_SHEET_ID is not set.");

    const sheets = await getAuthenticatedSheets();
    const rowValues = payloadToRow(payload);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "2_ASSESSMENT_INPUTS!A:A",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowValues],
      },
    });

    // 2. Mark assessment_links row as submitted
    try {
      const supabase = await createClient();
      await supabase
        .from("assessment_links")
        .update({ status: "submitted", submitted_at: payload.submitted_at })
        .eq("uuid", payload.uuid);
    } catch (supabaseErr) {
      // Non-fatal — log and continue. Sheet append already succeeded.
      console.warn("Supabase status update failed (non-fatal):", supabaseErr);
    }

    return NextResponse.json({ success: true, message: "Assessment submitted successfully." });
  } catch (err) {
    console.error("submit-assessment error:", err);
    return NextResponse.json(
      { error: "Failed to submit assessment. Please try again." },
      { status: 500 }
    );
  }
}
