const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || "postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres",
});

async function main() {
  const tables = [
    'enterprise_master',
    'assessment_inputs',
    'product_catalogue',
    'confidence_summary',
    'order_register',
    'scores_summary',
    'category_spend_by_client',
    'client_master',
    'supplier_detail_by_client',
    'client_summary',
    'confidence_scoring'
  ];

  try {
    for (const table of tables) {
      console.log(`Disabling RLS for ${table}...`);
      await pool.query(`ALTER TABLE public."${table}" DISABLE ROW LEVEL SECURITY;`);
    }
    console.log('Done.');
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

main();
