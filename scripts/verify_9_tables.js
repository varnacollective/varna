const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const tables = [
    'client_master',
    'category_spend_by_client',
    'supplier_detail_by_client',
    'client_summary',
    'order_register',
    'product_catalogue',
    'scores_summary',
    'assessment_inputs',
    'enterprise_master'
  ];

  console.log('Testing reading 9 tables via @supabase/supabase-js:');
  for (const t of tables) {
    const { data, count, error } = await supabase.from(t).select('*', { count: 'exact' });
    if (error) {
      console.error(`❌ ${t} error:`, error.message);
    } else {
      console.log(`✅ ${t}: ${data.length} records fetched (total count: ${count})`);
      if (t === 'enterprise_master') {
        console.log('   Sample enterprises:', data.map(d => `${d.enterprise_id}: ${d.enterprise_name}`).slice(0, 4));
      }
      if (t === 'client_master') {
        console.log('   Sample clients:', data.map(d => `${d.client_id}: ${d.client_name}`).slice(0, 4));
      }
    }
  }
}

verify().catch(console.error);
