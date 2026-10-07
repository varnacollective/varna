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

async function audit() {
  console.log('================ AUDIT OF ALL TABLES FOR PARTNERS ================');

  // 1. enterprise_master
  const { data: em } = await supabase.from('enterprise_master').select('*');
  console.log('\n--- 1. enterprise_master (count: ' + (em ? em.length : 0) + ') ---');
  if (em) em.forEach(r => console.log(`  ${r.enterprise_id}: ${r.enterprise_name}`));

  // 2. scores_summary
  const { data: ss } = await supabase.from('scores_summary').select('*');
  console.log('\n--- 2. scores_summary (count: ' + (ss ? ss.length : 0) + ') ---');
  if (ss) ss.forEach(r => console.log(`  ${r.enterprise_id}: ${r.enterprise_name} (final_varna_score: ${r.final_varna_score})`));

  // 3. assessment_inputs
  const { data: ai } = await supabase.from('assessment_inputs').select('*');
  console.log('\n--- 3. assessment_inputs (count: ' + (ai ? ai.length : 0) + ') ---');
  if (ai) ai.forEach(r => console.log(`  ${r.enterprise_id_auto || r.id}: ${r.enterprise_name_auto}`));

  // 4. supplier_detail_by_client for all clients
  const { data: sdbc } = await supabase.from('supplier_detail_by_client').select('*');
  console.log('\n--- 4. supplier_detail_by_client (total count: ' + (sdbc ? sdbc.length : 0) + ') ---');
  const byClient = {};
  if (sdbc) {
    sdbc.forEach(r => {
      byClient[r.client_id] = byClient[r.client_id] || [];
      byClient[r.client_id].push(`${r.enterprise_id}: ${r.enterprise_name_auto}`);
    });
  }
  console.log(byClient);

  // 5. order_register for all clients
  const { data: ord } = await supabase.from('order_register').select('*');
  console.log('\n--- 5. order_register (total count: ' + (ord ? ord.length : 0) + ') ---');
  const ordByClient = {};
  if (ord) {
    ord.forEach(r => {
      ordByClient[r.client_id] = ordByClient[r.client_id] || new Set();
      ordByClient[r.client_id].add(`${r.enterprise_id || r.enterprise_name_auto}: ${r.enterprise_name_auto}`);
    });
  }
  Object.keys(ordByClient).forEach(c => {
    console.log(`  Client ${c}: ${[...ordByClient[c]].join('; ')}`);
  });

  // 6. Any other tables in Supabase?
  const tables = [
    'supplier_assessments', 'supplier_craft', 'supplier_social',
    'supplier_sdgs', 'supplier_sustainability', 'client_master',
    'client_summary', 'category_spend_by_client', 'confidence_summary',
    'confidence_scoring'
  ];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*');
    console.log(`\n--- Table ${t}: count = ${data ? data.length : 'error: ' + error?.message} ---`);
    if (data && data.length > 0 && data.length <= 15) {
      if (t === 'supplier_social' || t === 'supplier_sustainability' || t === 'supplier_assessments') {
        data.forEach(r => console.log(`  ${r.enterprise_id || r.id}: ${r.enterprise_name || r.enterprise_name_auto || ''}`));
      }
    }
  }
}

audit();
