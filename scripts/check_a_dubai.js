const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres' });
async function check() {
  const tables = ['client_master', 'client_summary', 'supplier_detail_by_client', 'scores_summary', 'confidence_summary', 'enterprise_master', 'credentials'];
  for (const t of tables) {
    try {
      const res = await pool.query(`SELECT * FROM ${t} WHERE to_jsonb(${t})::text ILIKE '%A Dubai%'`);
      if (res.rows.length) {
        console.log(`Found in ${t}: ${res.rows.length} rows`);
        console.log(res.rows);
      }
    } catch (e) {
      console.log(`Error checking ${t}: ${e.message}`);
    }
  }
  pool.end();
}
check();
