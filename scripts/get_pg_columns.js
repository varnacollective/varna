const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || "postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres",
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('client_master', 'supplier_detail_by_client');
    `);
    
    const columnsByTable = {};
    for (const row of res.rows) {
      if (!columnsByTable[row.table_name]) {
        columnsByTable[row.table_name] = [];
      }
      columnsByTable[row.table_name].push(row.column_name);
    }
    
    console.log(JSON.stringify(columnsByTable, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

main();
