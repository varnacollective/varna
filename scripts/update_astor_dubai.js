const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: 'postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres' });

async function backupAndDryRun() {
  try {
    // 1. Fetch current row
    const res = await pool.query("SELECT * FROM client_master WHERE client_id = 'CLT-001'");
    if (res.rows.length === 0) {
      console.error("CLT-001 not found in client_master!");
      return;
    }
    const currentRow = res.rows[0];
    console.log("=== CURRENT CLIENT_MASTER ROW ===");
    console.log(currentRow);

    // Save backup
    fs.writeFileSync('scripts/backup_client_master_CLT001.json', JSON.stringify(currentRow, null, 2));
    console.log("✅ Backup written to scripts/backup_client_master_CLT001.json");

    // Also backup client_summary
    const sumRes = await pool.query("SELECT * FROM client_summary WHERE client_id = 'CLT-001'");
    if (sumRes.rows.length > 0) {
      fs.writeFileSync('scripts/backup_client_summary_CLT001.json', JSON.stringify(sumRes.rows[0], null, 2));
      console.log("✅ Backup written to scripts/backup_client_summary_CLT001.json");
    }

    // DRY RUN
    console.log("\n=== DRY RUN UPDATE ===");
    console.log("Target table: client_master");
    console.log("Target filter: client_id = 'CLT-001'");
    console.log("Field to change: client_name");
    console.log(`Old value: "${currentRow.client_name}"`);
    console.log(`New value: "The Astor Dubai"`);
    console.log(`Logo field (logo_path): "${currentRow.logo_path}" (UNTOUCHED)`);

    // EXECUTE UPDATE
    await pool.query("UPDATE client_master SET client_name = 'The Astor Dubai' WHERE client_id = 'CLT-001'");
    if (sumRes.rows.length > 0) {
      await pool.query("UPDATE client_summary SET client_name_auto = 'The Astor Dubai' WHERE client_id = 'CLT-001'");
    }

    // VERIFY
    const updatedRes = await pool.query("SELECT * FROM client_master WHERE client_id = 'CLT-001'");
    const updatedRow = updatedRes.rows[0];
    console.log("\n=== VERIFIED UPDATED ROW ===");
    console.log("client_id:", updatedRow.client_id);
    console.log("client_name:", updatedRow.client_name);
    console.log("logo_path:", updatedRow.logo_path);

  } catch (e) {
    console.error("Error:", e);
  } finally {
    pool.end();
  }
}

backupAndDryRun();
