const { google } = require('googleapis');
const fs = require('fs');

async function checkSummaryHeaders() {
  const envText = fs.readFileSync('.env.local', 'utf8');
  let credsJson = '';
  let sheetId = '';
  envText.split('\n').forEach(line => {
    if (line.startsWith('GOOGLE_SERVICE_ACCOUNT_KEY=')) {
      credsJson = line.substring('GOOGLE_SERVICE_ACCOUNT_KEY='.length);
    }
    if (line.startsWith('GOOGLE_SHEET_ID=')) {
      sheetId = line.substring('GOOGLE_SHEET_ID='.length);
    }
  });

  const credentials = JSON.parse(credsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: '6_CLIENT_SUMMARY!A3:AZ3' });
  console.log("Headers:", res.data.values[0]);
}
checkSummaryHeaders().catch(console.error);
