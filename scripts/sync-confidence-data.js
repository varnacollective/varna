/**
 * sync-confidence-data.js
 * ────────────────────────────────────────────────────────────────────────────
 * One-off migration: pushes updated Confidence Ring scoring rows to
 *   1. Google Sheets  → "Scoring" tab in GOOGLE_SHEET_ID_CONFIDENCE
 *   2. Supabase / PG  → table `confidence_scoring`
 *
 * Uses the same googleapis + pg pattern as the rest of this project.
 * Reads all credentials from .env.local — no extra deps required.
 *
 * Run:
 *   node scripts/sync-confidence-data.js
 * ────────────────────────────────────────────────────────────────────────────
 */

"use strict";

const { google } = require("googleapis");
const { Client }  = require("pg");
const fs          = require("fs");
const path        = require("path");

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath    = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env        = {};
for (const line of envContent.split("\n")) {
  const eqIdx = line.indexOf("=");
  if (eqIdx > 0) {
    env[line.slice(0, eqIdx).trim()] = line.slice(eqIdx + 1).trim();
  }
}

// ── Constants ────────────────────────────────────────────────────────────────
const SHEET_ID      = env.GOOGLE_SHEET_ID_CONFIDENCE || "18HNgn2yWpLNpkbcZuOyn74EO3YxnKhUqY1OJFcR9hEQ";
const TAB_NAME      = "Scoring";
const SHEET_HEADERS = ["Supplier", "Pillar", "Num", "Item", "Score"];

// ── DATA PAYLOAD ─────────────────────────────────────────────────────────────
// Source: Varna-Confidence-Ring-Scoring updated.xlsx
const SCORING_DATA = [
  // ── Bare Necessities · Governance ──────────────────────────────────────────
  { Supplier: "Bare Necessities", Pillar: "Governance",    Num: 1, Item: "Incorporation certificate",                    Score: 1.00 },
  { Supplier: "Bare Necessities", Pillar: "Governance",    Num: 2, Item: "Tax registration, no discrepancy",              Score: 1.00 },
  { Supplier: "Bare Necessities", Pillar: "Governance",    Num: 3, Item: "MSME / Udyam recognition",                      Score: 1.00 },
  { Supplier: "Bare Necessities", Pillar: "Governance",    Num: 4, Item: "Signed, dated Code of Conduct",                 Score: 0.25 },
  { Supplier: "Bare Necessities", Pillar: "Governance",    Num: 5, Item: "Docs internally consistent",                    Score: 0.25 },
  // ── Bare Necessities · Environment ─────────────────────────────────────────
  { Supplier: "Bare Necessities", Pillar: "Environment",   Num: 1, Item: "Environmental mgmt. certificate, current",      Score: 0.50 },
  { Supplier: "Bare Necessities", Pillar: "Environment",   Num: 2, Item: "Packaging disclosed",                           Score: 1.00 },
  { Supplier: "Bare Necessities", Pillar: "Environment",   Num: 3, Item: "Composition % disclosed",                       Score: 0.00 },
  { Supplier: "Bare Necessities", Pillar: "Environment",   Num: 4, Item: "Energy data, allocated",                        Score: 0.50 },
  { Supplier: "Bare Necessities", Pillar: "Environment",   Num: 5, Item: "Waste / circularity program",                   Score: 1.00 },
  // ── Bare Necessities · Social ───────────────────────────────────────────────
  { Supplier: "Bare Necessities", Pillar: "Social",        Num: 1, Item: "OHS certificate, current",                     Score: 0.50 },
  { Supplier: "Bare Necessities", Pillar: "Social",        Num: 2, Item: "Labour welfare policy",                        Score: 0.50 },
  { Supplier: "Bare Necessities", Pillar: "Social",        Num: 3, Item: "Community / livelihood program",                Score: 0.00 },
  { Supplier: "Bare Necessities", Pillar: "Social",        Num: 4, Item: "Cruelty-free / ethical certification",          Score: 1.00 },
  // ── Bare Necessities · Carbon Impact ───────────────────────────────────────
  { Supplier: "Bare Necessities", Pillar: "Carbon Impact", Num: 1, Item: "Product safety certificate, current & direct", Score: 0.25 },
  { Supplier: "Bare Necessities", Pillar: "Carbon Impact", Num: 2, Item: "Third-party audited report",                   Score: 0.00 },
  { Supplier: "Bare Necessities", Pillar: "Carbon Impact", Num: 3, Item: "Self-reported impact report",                  Score: 0.25 },
  { Supplier: "Bare Necessities", Pillar: "Carbon Impact", Num: 4, Item: "Verified carbon / LCA data",                   Score: 0.00 },
  // ── Kheoni · Governance ────────────────────────────────────────────────────
  { Supplier: "Kheoni",           Pillar: "Governance",    Num: 1, Item: "Incorporation certificate",                    Score: 1.00 },
  { Supplier: "Kheoni",           Pillar: "Governance",    Num: 2, Item: "Tax registration, no discrepancy",              Score: 1.00 },
  { Supplier: "Kheoni",           Pillar: "Governance",    Num: 3, Item: "MSME / Udyam recognition",                      Score: 1.00 },
  { Supplier: "Kheoni",           Pillar: "Governance",    Num: 4, Item: "Signed, dated Code of Conduct",                 Score: 0.00 },
  { Supplier: "Kheoni",           Pillar: "Governance",    Num: 5, Item: "Docs internally consistent",                    Score: 1.00 },
  { Supplier: "Kheoni",           Pillar: "Environment",   Num: 1, Item: "Environmental mgmt. certificate, current",      Score: 0.00 },
];

// ── PART 1: Google Sheets ─────────────────────────────────────────────────────
async function syncToGoogleSheets() {
  console.log("\n\uD83D\uDD35 [1/2] Syncing to Google Sheets...");

  const creds = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth  = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // Verify the Scoring tab exists
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const scoringTab = meta.data.sheets.find(
    (s) => s.properties.title === TAB_NAME
  );
  if (!scoringTab) {
    const available = meta.data.sheets.map((s) => s.properties.title).join(", ");
    throw new Error(`Tab "${TAB_NAME}" not found. Available tabs: ${available}`);
  }
  console.log(`   \u2705 Found tab "${TAB_NAME}" (sheetId: ${scoringTab.properties.sheetId})`);

  // Read current rows to know how many to clear
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${TAB_NAME}'!A:E`,
  });
  const existing = readRes.data.values || [];
  console.log(`   \uD83D\uDCCB Current rows in sheet (incl. header): ${existing.length}`);

  // Clear data rows (keep row 1 header)
  if (existing.length > 1) {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `'${TAB_NAME}'!A2:E${Math.max(existing.length, 1000)}`,
    });
    console.log(`   \uD83D\uDDD1\uFE0F  Cleared ${existing.length - 1} existing data row(s)`);
  }

  // Write header if sheet was empty
  if (existing.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `'${TAB_NAME}'!A1:E1`,
      valueInputOption: "RAW",
      requestBody: { values: [SHEET_HEADERS] },
    });
    console.log("   \uD83D\uDCDD Wrote header row");
  }

  // Append all payload rows starting at A2
  const rows = SCORING_DATA.map((r) => [r.Supplier, r.Pillar, r.Num, r.Item, r.Score]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `'${TAB_NAME}'!A2`,
    valueInputOption: "RAW",
    insertDataOption: "OVERWRITE",
    requestBody: { values: rows },
  });

  console.log(`   \u2705 Wrote ${rows.length} rows \u2192 Google Sheets "${TAB_NAME}" tab`);
}

// ── PART 2: Supabase / Postgres ───────────────────────────────────────────────
async function syncToSupabase() {
  console.log("\n\uD83D\uDFE0 [2/2] Syncing to Supabase (confidence_scoring)...");

  const pg = new Client({
    connectionString:
      env.SUPABASE_DB_URL ||
      "postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false },
  });

  await pg.connect();
  console.log("   \u2705 Connected to Postgres");

  // Only delete rows for suppliers present in this payload
  const suppliers = [...new Set(SCORING_DATA.map((r) => r.Supplier))];
  console.log(`   \uD83D\uDD0D Suppliers in payload: ${suppliers.join(", ")}`);

  for (const supplier of suppliers) {
    const del = await pg.query(
      "DELETE FROM confidence_scoring WHERE supplier = $1",
      [supplier]
    );
    console.log(`   \uD83D\uDDD1\uFE0F  Deleted ${del.rowCount} row(s) for "${supplier}"`);
  }

  // Insert fresh rows
  let inserted = 0;
  for (const row of SCORING_DATA) {
    await pg.query(
      `INSERT INTO confidence_scoring (supplier, pillar, num, item, score)
       VALUES ($1, $2, $3, $4, $5)`,
      [row.Supplier, row.Pillar, row.Num, row.Item, row.Score]
    );
    inserted++;
  }

  console.log(`   \u2705 Inserted ${inserted} rows \u2192 confidence_scoring`);
  await pg.end();
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\u256C\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563");
  console.log("\u2551  Varna \u2014 Confidence Ring Data Sync                              \u2551");
  console.log("\u2551  Google Sheets + Supabase (confidence_scoring)               \u2551");
  console.log("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D");
  console.log(`\n\uD83D\uDCE6 Payload: ${SCORING_DATA.length} rows`);
  console.log(`\uD83D\uDCC4 Sheet: ${SHEET_ID}`);
  console.log(`\uD83D\uDDC4\uFE0F  Table: confidence_scoring`);

  const errors = [];

  try {
    await syncToGoogleSheets();
  } catch (err) {
    console.error("\n\u274C Google Sheets sync failed:", err.message);
    errors.push({ target: "Google Sheets", error: err.message });
  }

  try {
    await syncToSupabase();
  } catch (err) {
    console.error("\n\u274C Supabase sync failed:", err.message);
    errors.push({ target: "Supabase", error: err.message });
  }

  console.log("\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  if (errors.length === 0) {
    console.log("\u2705 All syncs completed successfully.\n");
  } else {
    console.log(`\u26A0\uFE0F  ${errors.length} sync(s) failed:`);
    for (const e of errors) {
      console.log(`   \u2022 ${e.target}: ${e.error}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n\uD83D\uDCA5 Fatal error:", err);
  process.exit(1);
});
