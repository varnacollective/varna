const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

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

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheetTabs = meta.data.sheets.map(s => s.properties.title);
  console.log("Available tabs:", sheetTabs);

  for (const tabName of sheetTabs) {
    if (tabName.includes("CATEGORY_SPEND") || tabName.includes("8_")) {
      console.log(`\n=== TAB: ${tabName} ===`);
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${tabName}'!A1:Z100`,
      });
      console.log(JSON.stringify(res.data.values, null, 2));
    }
  }
}

main().catch(console.error);
