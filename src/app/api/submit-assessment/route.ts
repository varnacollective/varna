import { NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import nodemailer from "nodemailer";
import { createClient } from "@/utils/supabase/server";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface AssessmentPayload {
  uuid: string;
  enterprise_name: string;
  // Step 1 — Enterprise Overview
  legal_name: string;
  trade_name?: string;
  udyam_number?: string;
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
  // Step 3 — Environment
  water_source?: string;
  water_recycling?: string;
  carbon_footprint_tracked?: string;
  energy_sources?: string;
  chemical_usage?: string;
  chemical_disposal?: string;
  // Step 4 — People & Community
  total_workers?: string;
  women_workers_pct?: string;
  artisan_workers_pct?: string;
  minimum_wage_compliance?: string;
  esi_pf_coverage?: string;
  health_safety_measures?: string;
  community_programs?: string;
  // Step 5 — Legal & Compliance
  gst_registered?: string;
  gst_number?: string;
  legal_disputes?: string;
  ethics_policy?: string;
  // Step 6 — Craft & Cultural Heritage
  craft_traditions?: string;
  gi_tags?: string;
  pehchaan_card?: string;
  artisan_training?: string;
  // Step 7 — Sustainability Management
  sdg_alignment?: string;
  sustainability_tracking?: string;
  sustainability_goals?: string;
  additional_certifications?: string;
  submitted_at?: string;
}

// ─── Label Lookups ───────────────────────────────────────────────────────────
const TURNOVER_LABELS: Record<string, string> = {
  below_10L: "< 0.1 Cr (Below ₹10 Lakhs)",
  "10L_to_50L": "0.1–0.5 Cr (₹10 Lakhs – ₹50 Lakhs)",
  "50L_to_1Cr": "0.5–1 Cr (₹50 Lakhs – ₹1 Crore)",
  "1Cr_to_5Cr": "1–5 Cr (₹1 Crore – ₹5 Crores)",
  above_5Cr: "> 5 Cr (Above ₹5 Crores)",
};

const TURNOVER_TIERS: Record<string, string> = {
  below_10L: "Micro A",
  "10L_to_50L": "Micro B",
  "50L_to_1Cr": "Small",
  "1Cr_to_5Cr": "Medium",
  above_5Cr: "Large",
};

const WAGE_LABELS: Record<string, string> = {
  above_minimum: "Above State Minimum Wage",
  at_minimum: "At State Minimum Wage",
  below_minimum: "Below Minimum Wage",
  piece_rate: "Piece-rate / Commission-based",
  living_wage: "Living Wage (international benchmarks)",
};

const SDG_LABELS: Record<string, string> = {
  sdg1: "SDG 1 — No Poverty",
  sdg2: "SDG 2 — Zero Hunger",
  sdg3: "SDG 3 — Good Health & Well-being",
  sdg4: "SDG 4 — Quality Education",
  sdg5: "SDG 5 — Gender Equality",
  sdg6: "SDG 6 — Clean Water & Sanitation",
  sdg7: "SDG 7 — Affordable & Clean Energy",
  sdg8: "SDG 8 — Decent Work & Economic Growth",
  sdg9: "SDG 9 — Industry, Innovation & Infrastructure",
  sdg10: "SDG 10 — Reduced Inequalities",
  sdg11: "SDG 11 — Sustainable Cities & Communities",
  sdg12: "SDG 12 — Responsible Consumption & Production",
  sdg13: "SDG 13 — Climate Action",
  sdg14: "SDG 14 — Life Below Water",
  sdg15: "SDG 15 — Life on Land",
  sdg16: "SDG 16 — Peace, Justice & Strong Institutions",
  sdg17: "SDG 17 — Partnerships for the Goals",
};

// ─── Google Sheets JWT Authentication ───────────────────────────────────────
function getServiceAccountCredentials() {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  }

  const parsed = typeof rawKey === "string" ? JSON.parse(rawKey) : rawKey;
  const client_email = parsed.client_email || process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const private_key = parsed.private_key || process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!client_email || !private_key) {
    throw new Error("Service account client_email or private_key is missing.");
  }

  return { client_email, private_key };
}

async function getAuthenticatedDoc(): Promise<GoogleSpreadsheet> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    throw new Error("GOOGLE_SHEET_ID environment variable is not set.");
  }

  const { client_email, private_key } = getServiceAccountCredentials();

  const serviceAccountAuth = new JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
}

// ─── Helper: Determine Next Sequential Enterprise ID (ENT-XXX) ──────────────
async function getNextEnterpriseId(
  masterSheet: import("google-spreadsheet").GoogleSpreadsheetWorksheet
): Promise<string> {
  try {
    const rows = await masterSheet.getRows();
    let maxNum = 0;

    for (const row of rows) {
      // Look for ID in row data
      const idVal = String(
        row.get("Enterprise\nID") ||
        row.get("Enterprise ID") ||
        row.get("Enterprise_ID") ||
        ""
      );
      const match = idVal.match(/ENT-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }

    const nextNum = maxNum + 1;
    return `ENT-${String(nextNum).padStart(3, "0")}`;
  } catch (err) {
    console.warn("Could not determine next Enterprise ID from rows, falling back to count:", err);
    return "ENT-004";
  }
}

// ─── Helper: Safely Map Fields to Sheet Header Values ───────────────────────
function mapToHeaderRow(
  headers: string[],
  mapping: Record<string, string | number | boolean | null | undefined>
): Record<string, string> {
  const result: Record<string, string> = {};

  // Build a normalized lookup table for the provided mapping keys
  const normalizedMapping: Record<string, string> = {};
  for (const [k, v] of Object.entries(mapping)) {
    if (v !== undefined && v !== null) {
      const cleanKey = k.replace(/[\r\n\s]+/g, " ").trim().toLowerCase();
      normalizedMapping[cleanKey] = String(v);
      normalizedMapping[k] = String(v);
    }
  }

  // Populate each column based on matching header
  for (const header of headers) {
    const cleanHeader = header.replace(/[\r\n\s]+/g, " ").trim().toLowerCase();
    result[header] = mapping[header] !== undefined
      ? String(mapping[header] ?? "")
      : normalizedMapping[cleanHeader] ?? "";
  }

  return result;
}

// ─── Email Notification via Nodemailer ──────────────────────────────────────
async function sendSubmissionConfirmationEmail(
  payload: AssessmentPayload,
  enterpriseId: string
) {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!smtpPass) {
    console.warn(
      "[Nodemailer] SMTP_PASS or GMAIL_APP_PASSWORD is not configured in environment variables. Email notification skipped."
    );
    return { sent: false, reason: "SMTP credentials not configured" };
  }

  const transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    : nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser || "varnacollective@gmail.com",
          pass: smtpPass,
        },
      });

  const enterpriseName = payload.enterprise_name || payload.legal_name;
  const contactName = payload.primary_contact_name || "N/A";
  const contactEmail = payload.primary_contact_email || "N/A";
  const contactPhone = payload.primary_contact_phone || "N/A";
  const udyamNumber = payload.udyam_number || "Not provided / Pending";
  const turnoverRange = TURNOVER_LABELS[payload.annual_turnover || ""] || payload.annual_turnover || "Not specified";
  const sdgAlignment = SDG_LABELS[payload.sdg_alignment || ""] || payload.sdg_alignment || "None";
  const wageStatus = WAGE_LABELS[payload.minimum_wage_compliance || ""] || payload.minimum_wage_compliance || "Not specified";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #121316;
      color: #E4DFD7;
      margin: 0;
      padding: 32px 16px;
    }
    .card {
      max-width: 640px;
      margin: 0 auto;
      background-color: #1A1C20;
      border: 1px solid rgba(140, 157, 168, 0.2);
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
    }
    .header {
      padding: 28px 32px 20px;
      border-bottom: 1px solid rgba(140, 157, 168, 0.15);
      background-color: #15171A;
    }
    .brand-title {
      font-size: 11px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #B86B52;
      margin: 0 0 6px 0;
      font-weight: 600;
    }
    .main-title {
      font-size: 22px;
      font-weight: 300;
      color: #F5F2EC;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .badge {
      display: inline-block;
      margin-top: 10px;
      padding: 4px 10px;
      background: rgba(155, 174, 157, 0.12);
      border: 1px solid rgba(155, 174, 157, 0.3);
      color: #9BAE9D;
      font-size: 11px;
      font-family: monospace;
      letter-spacing: 0.1em;
    }
    .content {
      padding: 28px 32px;
    }
    .section-title {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #8C9DA8;
      margin: 24px 0 12px 0;
      font-weight: 600;
      border-bottom: 1px solid rgba(140, 157, 168, 0.1);
      padding-bottom: 6px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    table.data-table td {
      padding: 9px 0;
      vertical-align: top;
      font-size: 13px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    td.label {
      width: 38%;
      color: #8C9DA8;
      font-weight: 400;
    }
    td.value {
      width: 62%;
      color: #E4DFD7;
      font-weight: 500;
    }
    .narrative-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(140, 157, 168, 0.15);
      padding: 14px 16px;
      font-size: 12.5px;
      line-height: 1.6;
      color: #CBD5E1;
      font-style: italic;
      margin-top: 8px;
    }
    .footer {
      padding: 20px 32px;
      background-color: #141518;
      border-top: 1px solid rgba(140, 157, 168, 0.15);
      font-size: 11px;
      color: #64748B;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    a.sheet-link {
      color: #9BAE9D;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p class="brand-title">Varna Collective Assessment Notification</p>
      <h1 class="main-title">New Enterprise Assessment Submitted</h1>
      <div class="badge">${enterpriseId} &bull; ${enterpriseName}</div>
    </div>

    <div class="content">
      <div class="section-title">Enterprise Overview</div>
      <table class="data-table">
        <tr>
          <td class="label">Legal Entity Name:</td>
          <td class="value">${payload.legal_name || enterpriseName}</td>
        </tr>
        <tr>
          <td class="label">Trade / Brand Name:</td>
          <td class="value">${payload.trade_name || "Same as legal name"}</td>
        </tr>
        <tr>
          <td class="label">Assigned ID:</td>
          <td class="value"><strong>${enterpriseId}</strong></td>
        </tr>
        <tr>
          <td class="label">Udyam Registration:</td>
          <td class="value">${udyamNumber}</td>
        </tr>
        <tr>
          <td class="label">GST Number:</td>
          <td class="value">${payload.gst_number || (payload.gst_registered === "yes" ? "Registered (unsupplied)" : "Not registered")}</td>
        </tr>
        <tr>
          <td class="label">Year Established:</td>
          <td class="value">${payload.year_established || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Turnover Range:</td>
          <td class="value">${turnoverRange}</td>
        </tr>
        <tr>
          <td class="label">Total Workforce:</td>
          <td class="value">${payload.employee_count || payload.total_workers || "N/A"} employees / artisans</td>
        </tr>
      </table>

      <div class="section-title">Primary Contact</div>
      <table class="data-table">
        <tr>
          <td class="label">Contact Name:</td>
          <td class="value">${contactName}</td>
        </tr>
        <tr>
          <td class="label">Email Address:</td>
          <td class="value"><a href="mailto:${contactEmail}" style="color: #9BAE9D;">${contactEmail}</a></td>
        </tr>
        <tr>
          <td class="label">Phone / WhatsApp:</td>
          <td class="value">${contactPhone}</td>
        </tr>
      </table>

      <div class="section-title">Key ESG & Craft Metrics</div>
      <table class="data-table">
        <tr>
          <td class="label">% Women Workers:</td>
          <td class="value">${payload.women_workers_pct ? `${payload.women_workers_pct}%` : "Not specified"}</td>
        </tr>
        <tr>
          <td class="label">% Artisan Workers:</td>
          <td class="value">${payload.artisan_workers_pct ? `${payload.artisan_workers_pct}%` : "Not specified"}</td>
        </tr>
        <tr>
          <td class="label">Wage Compliance:</td>
          <td class="value">${wageStatus}</td>
        </tr>
        <tr>
          <td class="label">Water Source / Recycling:</td>
          <td class="value">${payload.water_source || "N/A"} (Recycling: ${payload.water_recycling || "N/A"})</td>
        </tr>
        <tr>
          <td class="label">Craft Traditions Practised:</td>
          <td class="value">${payload.craft_traditions || "None declared"}</td>
        </tr>
        <tr>
          <td class="label">GI Tags / Pehchaan Card:</td>
          <td class="value">GI: ${payload.gi_tags || "None"} | Pehchaan: ${payload.pehchaan_card || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">SDG Alignment:</td>
          <td class="value">${sdgAlignment}</td>
        </tr>
      </table>

      ${payload.founders_story ? `
      <div class="section-title">Founder's Narrative</div>
      <div class="narrative-box">
        "${payload.founders_story}"
      </div>
      ` : ""}
    </div>

    <div class="footer">
      <span>Logged at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</span>
      <span>Live records updated in Google Sheets (1_ENTERPRISE_MASTER & 2_ASSESSMENT_INPUTS)</span>
    </div>
  </div>
</body>
</html>
  `;

  const info = await transporter.sendMail({
    from: `"Varna Collective" <${smtpUser || "varnacollective@gmail.com"}>`,
    to: "varnacollective@gmail.com",
    subject: `New Enterprise Assessment Submitted: ${enterpriseName}`,
    html: htmlContent,
  });

  return { sent: true, messageId: info.messageId };
}

// ─── Route Handler (POST) ────────────────────────────────────────────────────
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

    // ── 1. Connect to Google Sheets via google-spreadsheet v4 ─────────────────
    const doc = await getAuthenticatedDoc();

    const masterSheet =
      doc.sheetsByTitle["1_ENTERPRISE_MASTER"] ||
      doc.sheetsByTitle["ENTERPRISE_MASTER"];

    const inputsSheet =
      doc.sheetsByTitle["2_ASSESSMENT_INPUTS"] ||
      doc.sheetsByTitle["ASSESSMENT_INPUTS"];

    if (!masterSheet || !inputsSheet) {
      throw new Error(
        `Target worksheets not found in spreadsheet. Available sheets: ${Object.keys(doc.sheetsByTitle).join(", ")}`
      );
    }

    // Load header rows to guarantee header-to-column alignment
    await masterSheet.loadHeaderRow();
    await inputsSheet.loadHeaderRow();

    // ── 2. Determine Enterprise ID ───────────────────────────────────────────
    const enterpriseId = await getNextEnterpriseId(masterSheet);

    // ── 3. Map & Append to 1_ENTERPRISE_MASTER ────────────────────────────────
    const isCraftLed =
      (payload.artisan_workers_pct && Number(payload.artisan_workers_pct) > 0) ||
      Boolean(payload.craft_traditions && payload.craft_traditions.toLowerCase() !== "none")
        ? "Y"
        : "N";

    const isMaterialInnovation =
      Boolean(payload.raw_materials && payload.raw_materials.length > 5) ||
      Boolean(payload.sustainability_goals)
        ? "Y"
        : "N";

    const isWomenLed =
      (payload.women_workers_pct && Number(payload.women_workers_pct) >= 50)
        ? "Y"
        : "N";

    const isCooperative =
      payload.legal_structure === "cooperative" ||
      payload.legal_structure === "section_8"
        ? "Y"
        : "N";

    const turnoverLabel =
      TURNOVER_LABELS[payload.annual_turnover || ""] ||
      payload.annual_turnover ||
      "";

    const turnoverTier =
      TURNOVER_TIERS[payload.annual_turnover || ""] ||
      "Micro B";

    const yearsInOperation = payload.year_established
      ? String(Math.max(0, new Date().getFullYear() - parseInt(payload.year_established, 10)))
      : "";

    const masterMapping: Record<string, string> = {
      "Enterprise\nID": enterpriseId,
      "Enterprise\nName": payload.legal_name || payload.enterprise_name,
      "Brand Name\n(if different)": payload.trade_name || payload.enterprise_name || "",
      "Evaluation\nCluster": isCraftLed === "Y" ? "Craft-Led" : "Climate & Material Innovation",
      "Sub-Sector\n(free text)": payload.primary_product_categories || payload.product_description || "",
      "District": payload.operating_address || payload.registered_address || "",
      "State": "",
      "NDMA Climate\nRisk Zone": "LOW (unverified)",
      "Is Craft-Led\n(Y/N)": isCraftLed,
      "Is Material\nInnovation (Y/N)": isMaterialInnovation,
      "Is Women-Led\n(Y/N)": isWomenLed,
      "Is Cooperative\nor SHG (Y/N)": isCooperative,
      "Udyam\nNumber": payload.udyam_number || "PENDING",
      "GSTIN": payload.gst_number || (payload.gst_registered === "yes" ? "Registered (Pending Upload)" : "N/A"),
      "Year\nEstablished": payload.year_established || "",
      "Annual Turnover\nRange (₹ Cr)": turnoverLabel,
      "Employee\nCount": payload.employee_count || payload.total_workers || "",
      "Years in\nOperation (auto)": yearsInOperation,
      "Active\nStatus": "Under Review",
      "Notes": [
        payload.founder_name ? `Founder: ${payload.founder_name}` : "",
        payload.founders_story ? `Story: ${payload.founders_story}` : "",
        payload.primary_contact_name ? `Contact: ${payload.primary_contact_name} (${payload.primary_contact_email || ""}, ${payload.primary_contact_phone || ""})` : "",
        payload.additional_certifications ? `Certifications: ${payload.additional_certifications}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
      "Shipping\nOrigin Port": "",
    };

    const masterRowData = mapToHeaderRow(masterSheet.headerValues, masterMapping);
    // strictly append new row - guarantees existing data is never disturbed
    await masterSheet.addRow(masterRowData, { insert: true });

    // ── 4. Map & Append to 2_ASSESSMENT_INPUTS ────────────────────────────────
    const wageRatio =
      WAGE_LABELS[payload.minimum_wage_compliance || ""] ||
      payload.minimum_wage_compliance ||
      "";

    const sdgText =
      SDG_LABELS[payload.sdg_alignment || ""] ||
      payload.sdg_alignment ||
      "";

    const inputsMapping: Record<string, string> = {
      "Enterprise\nID": enterpriseId,
      "Enterprise\nName (auto)": payload.enterprise_name || payload.legal_name,
      "Tier\n(auto)": "",
      "Manual Tier\nOverride": turnoverTier,
      "TIER USED\n(auto)": turnoverTier,
      // E1 Carbon
      "E1 Carbon\nInput: Reduction %": payload.carbon_footprint_tracked === "yes" ? "Yes (Tracked)" : "",
      "E1\nEvidence": payload.carbon_footprint_tracked === "yes" ? "Self-Reported" : "None/Proxy",
      // E2 Material
      "E2 Material\nInput: % Sustainable": payload.raw_materials || "",
      "E2\nEvidence": payload.raw_materials ? "Self-Reported" : "None/Proxy",
      // E3 Circularity
      "E3 Circularity\nInput: Condition": payload.production_process || "",
      "E3\nEvidence": payload.production_process ? "Self-Reported" : "None/Proxy",
      // E4 Water
      "E4 Water\nInput: Reduction %": payload.water_source ? `Source: ${payload.water_source}, Recycled: ${payload.water_recycling || "no"}` : "",
      "E4\nEvidence": payload.water_recycling === "yes" ? "Self-Reported" : "None/Proxy",
      // E5 Pollution
      "E5 Pollution\nInput: Condition": `Chemicals: ${payload.chemical_usage || "None"}. Disposal: ${payload.chemical_disposal || "None"}`,
      "E5\nEvidence": payload.chemical_usage ? "Self-Reported" : "None/Proxy",
      // E6 Packaging
      "E6 Packaging\nInput: Condition": "",
      "E6\nEvidence": "",
      // S1 Employment
      "S1 Employment\nInput: Worker Count": payload.total_workers || payload.employee_count || "",
      "S1\nEvidence": "Self-Reported",
      // S2 Gender
      "S2 Gender\nInput: % Women": payload.women_workers_pct || "",
      "S2\nEvidence": "Self-Reported",
      "Women-Led\nBonus (Y/N)": isWomenLed,
      // S3 Wages
      "S3 Wages\nInput: Wage Ratio": wageRatio,
      "S3\nEvidence": "Self-Reported",
      // S4 Health
      "S4 Health\nInput: Condition": payload.health_safety_measures || "",
      "S4\nEvidence": payload.health_safety_measures ? "Self-Reported" : "None/Proxy",
      // G1 Legal
      "G1 Legal\nInput: Checklist 0-100": payload.gst_registered === "yes" ? "100" : "50",
      "G1\nEvidence": "Self-Reported",
      // G2 Ethics
      "G2 Ethics\nInput: Condition": `Ethics Policy: ${payload.ethics_policy || "None"}. Disputes: ${payload.legal_disputes || "None"}`,
      "G2\nEvidence": payload.ethics_policy === "yes" ? "Self-Reported" : "None/Proxy",
      // G3 Sourcing
      "G3 Sourcing\nInput: Checklist 0-100": "",
      "G3\nEvidence": "",
      // Cultural Pillar
      "Cultural Pillar\nApplies? (auto)": isCraftLed,
      "C1 Craft\nInput: Condition": payload.craft_traditions || "",
      "C1\nEvidence": payload.craft_traditions ? "Self-Reported" : "None/Proxy",
      "C2 Skill/GI\nInput: Condition": `GI: ${payload.gi_tags || "None"}. Pehchaan: ${payload.pehchaan_card || "N/A"}. Trained Artisans: ${payload.artisan_training || "0"}`,
      "C2\nEvidence": (payload.gi_tags || payload.pehchaan_card === "yes") ? "Self-Reported" : "None/Proxy",
      "C3 Climate\nInput: Condition": "",
      "C3\nEvidence": "",
      // Readiness Pillar
      "R1 Env Mgmt\nInput: Condition": payload.sustainability_tracking || "",
      "R1\nEvidence": payload.sustainability_tracking ? "Self-Reported" : "None/Proxy",
      "R2 Social Mgmt\nInput: Condition": payload.community_programs || "",
      "R2\nEvidence": payload.community_programs ? "Self-Reported" : "None/Proxy",
      "R3 Gov Mgmt\nInput: Condition": payload.legal_disputes || "",
      "R3\nEvidence": "Self-Reported",
      "R4 Certs\nInput: Condition": [
        sdgText ? `SDG: ${sdgText}` : "",
        payload.sustainability_goals ? `Goals: ${payload.sustainability_goals}` : "",
        payload.additional_certifications ? `Certifications: ${payload.additional_certifications}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
      "R4\nEvidence": payload.additional_certifications ? "Self-Reported" : "None/Proxy",
      "RK1 Regulatory\nDeductions (0-100)": "",
      "RK1\nNotes": "",
      "RK2 Data\nReliability (auto)": "",
      "RK3 Material\nDeductions (0-100)": "",
      "RK3\nNotes": "",
    };

    const inputsRowData = mapToHeaderRow(inputsSheet.headerValues, inputsMapping);
    // strictly append new row - guarantees existing data is never disturbed
    await inputsSheet.addRow(inputsRowData, { insert: true });

    // ── 5. Update Assessment Link Status in Supabase ───────────────────────────
    try {
      const supabase = await createClient();
      await supabase
        .from("assessment_links")
        .update({ status: "submitted", submitted_at: payload.submitted_at })
        .eq("uuid", payload.uuid);
    } catch (supabaseErr) {
      console.warn("Supabase status update failed (non-fatal):", supabaseErr);
    }

    // ── 6. Send Summary Confirmation Email ────────────────────────────────────
    try {
      await sendSubmissionConfirmationEmail(payload, enterpriseId);
    } catch (emailErr) {
      console.error("Nodemailer confirmation email failed (non-fatal):", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Assessment submitted successfully and appended to Google Sheets.",
      enterprise_id: enterpriseId,
    });
  } catch (err) {
    console.error("submit-assessment error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to submit assessment. Please try again.",
      },
      { status: 500 }
    );
  }
}
