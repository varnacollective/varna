const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || "postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres",
});

async function fixRLS() {
  const tables = [
    'supplier_sdgs',
    'supplier_assessments',
    'supplier_sustainability',
    'supplier_social',
    'supplier_craft'
  ];

  for (const t of tables) {
    console.log(`Disabling RLS on ${t}...`);
    await pool.query(`ALTER TABLE public.${t} DISABLE ROW LEVEL SECURITY;`);
  }

  console.log("RLS successfully disabled on new tables to match rest of database.");
  await pool.end();
}

fixRLS().catch(console.error);
