const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const k = parts[0].trim();
    const v = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    env[k] = v;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAll() {
  const tables = [
    'client_master', 'client_summary', 'enterprise_master', 'scores_summary',
    'assessment_inputs', 'supplier_detail_by_client', 'category_spend_by_client',
    'order_register', 'confidence_summary', 'confidence_scoring',
    'supplier_assessments', 'supplier_craft', 'supplier_social',
    'supplier_sdgs', 'supplier_sustainability', 'credentials'
  ];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(t.padEnd(30), count !== null ? count : 'error: ' + error?.message);
  }

  // Also query information_schema or list all tables if possible
  const { data: cols } = await supabase.from('enterprise_master').select('*');
  console.log('\n--- enterprise_master rows ---');
  console.log(cols);
}
checkAll();
