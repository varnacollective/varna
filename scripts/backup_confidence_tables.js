const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function backupTables() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const scoringRes = await client.query("SELECT * FROM confidence_scoring");
  const summaryRes = await client.query("SELECT * FROM confidence_summary");

  const backupData = {
    timestamp: new Date().toISOString(),
    confidence_scoring: scoringRes.rows,
    confidence_summary: summaryRes.rows,
  };

  const backupPath = "./scripts/confidence_tables_backup.json";
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`Backup written to ${backupPath}. Scoring rows: ${scoringRes.rows.length}, Summary rows: ${summaryRes.rows.length}`);

  await client.end();
}

backupTables().catch(console.error);
