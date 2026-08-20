// Discover Google Sheets accessible to the service account
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
  console.log("Service account email:", creds.client_email);

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  const drive = google.drive({ version: "v3", auth });

  console.log("\nSearching for spreadsheets shared with this service account...\n");

  try {
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "files(id, name, createdTime, modifiedTime)",
      orderBy: "modifiedTime desc",
      pageSize: 20,
    });

    if (!res.data.files || res.data.files.length === 0) {
      console.log("No spreadsheets found. Make sure the sheet is shared with:");
      console.log(creds.client_email);
      return;
    }

    console.log(`Found ${res.data.files.length} spreadsheet(s):\n`);
    for (const file of res.data.files) {
      console.log(`  📊 "${file.name}"`);
      console.log(`     ID: ${file.id}`);
      console.log(`     Modified: ${file.modifiedTime}`);
      console.log();
    }

    // Try to read sheet names from the first spreadsheet
    const sheetId = res.data.files[0].id;
    console.log(`\n--- Reading sheet tabs from "${res.data.files[0].name}" (${sheetId}) ---\n`);

    const sheets = google.sheets({ version: "v4", auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });

    for (const sheet of meta.data.sheets) {
      console.log(`  📋 ${sheet.properties.title} (${sheet.properties.gridProperties.rowCount} rows × ${sheet.properties.gridProperties.columnCount} cols)`);
    }

    // Read first 3 rows of each sheet to see headers
    console.log("\n--- Sheet headers ---\n");
    for (const sheet of meta.data.sheets) {
      const title = sheet.properties.title;
      try {
        const dataRes = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: `'${title}'!A1:Z3`,
        });
        const rows = dataRes.data.values || [];
        console.log(`  📋 ${title}:`);
        if (rows.length > 0) {
          console.log(`     Headers: ${JSON.stringify(rows[0])}`);
        }
        if (rows.length > 1) {
          console.log(`     Row 1:   ${JSON.stringify(rows[1])}`);
        }
        console.log();
      } catch (err) {
        console.log(`  ⚠️ ${title}: Could not read (${err.message})`);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
