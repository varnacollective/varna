const { google } = require('googleapis');
const fs = require('fs');

async function checkScores() {
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

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: '3_SCORES_SUMMARY!A1:Z10' });
  console.log("3_SCORES_SUMMARY rows:");
  console.log(res.data.values);
}
checkScores().catch(console.error);
