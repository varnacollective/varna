const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const r1 = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'scores_summary'");
  console.log('scores_summary columns:', r1.rows.map(x => x.column_name));
  const r2 = await pool.query("SELECT enterprise_id, enterprise_name, tier FROM scores_summary");
  console.log('scores_summary sample tier:', r2.rows);
  await pool.end();
}

main().catch(console.error);
