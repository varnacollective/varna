const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL || "postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres" });

async function main() {
  const tables = ['scores_summary', 'confidence_summary', 'confidence_scoring'];
  const res = {};
  for (const t of tables) {
    const q = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [t]);
    res[t] = q.rows.map(r => r.column_name);
  }
  console.log(JSON.stringify(res, null, 2));
  await pool.end();
}
main();
