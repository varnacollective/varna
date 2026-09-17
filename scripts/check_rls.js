const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || "postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
  console.log("=== CHECKING PG RLS STATUS ===");
  const rlsRes = await pool.query(`
    SELECT relname as table_name, relrowsecurity as rls_enabled 
    FROM pg_class 
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
    WHERE nspname = 'public' AND relkind = 'r'
    ORDER BY table_name;
  `);
  console.table(rlsRes.rows);

  const policiesRes = await pool.query(`
    SELECT tablename, policyname, roles, cmd 
    FROM pg_policies 
    WHERE schemaname = 'public';
  `);
  console.log("=== EXISTING POLICIES ===");
  console.table(policiesRes.rows);

  console.log("\n=== TESTING SUPABASE JS CLIENT QUERY (ANON KEY) ===");
  const { data: scores, error: scoresErr } = await supabase.from('scores_summary').select('enterprise_id');
  console.log("scores_summary (anon query):", scoresErr ? `ERROR: ${scoresErr.message}` : `Rows returned: ${scores ? scores.length : 0}`);

  const { data: sdgs, error: sdgsErr } = await supabase.from('supplier_sdgs').select('*');
  console.log("supplier_sdgs (anon query):", sdgsErr ? `ERROR: ${sdgsErr.message}` : `Rows returned: ${sdgs ? sdgs.length : 0}`);

  await pool.end();
}

checkRLS().catch(console.error);
