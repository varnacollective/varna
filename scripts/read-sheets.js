// Read the structure & data of the Google Sheet
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const eqIdx = line.indexOf("=");
  if (eqIdx > 0) {
    envVars[line.slice(0, eqIdx).trim()] = line.slice(eqIdx + 1).trim();
  }
}

async function main() {
  const creds = JSON.parse(envVars.GOOGLE_SERVICE_ACCOUNT_KEY);
  const sheetId = envVars.GOOGLE_SHEET_ID;

  console.log("Sheet ID:", sheetId);
  console.log("Service account:", creds.client_email);
  console.log();

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // 1. Get sheet metadata (tab names)
  console.log("=== Sheet Metadata ===\n");
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheetTabs = meta.data.sheets.map(s => s.properties.title);
  
  for (const sheet of meta.data.sheets) {
    const p = sheet.properties;
    console.log(`  📋 "${p.title}" (${p.gridProperties.rowCount}×${p.gridProperties.columnCount})`);
  }

  // 2. Read headers + first 5 data rows from each tab
  console.log("\n=== Sheet Contents ===\n");
  for (const tabName of sheetTabs) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${tabName}'!A1:Z50`,
      });
      const rows = res.data.values || [];
      console.log(`\n────── ${tabName} (${rows.length} rows) ──────`);
      if (rows.length > 0) {
        console.log("HEADERS:", JSON.stringify(rows[0]));
      }
      // Print first 5 data rows
      for (let i = 1; i < Math.min(rows.length, 6); i++) {
        console.log(`Row ${i}:`, JSON.stringify(rows[i]));
      }
      if (rows.length > 6) {
        console.log(`  ... and ${rows.length - 6} more rows`);
      }
    } catch (err) {
      console.log(`\n⚠️ ${tabName}: ${err.message}`);
    }
  }
}

main().catch(e => console.error("FATAL:", e.message));
