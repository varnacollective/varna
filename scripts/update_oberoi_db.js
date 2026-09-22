const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Updating database records for CLT-001...");

  const { data: masterData, error: masterError } = await supabase
    .from('client_master')
    .update({ client_name: 'A Dubai', logo_path: null })
    .eq('client_id', 'CLT-001')
    .select();

  if (masterError) {
    console.error("client_master error:", masterError);
  } else {
    console.log("✅ client_master updated:", JSON.stringify(masterData, null, 2));
  }

  const { data: summaryData, error: summaryError } = await supabase
    .from('client_summary')
    .update({ client_name_auto: 'A Dubai' })
    .eq('client_id', 'CLT-001')
    .select();

  if (summaryError) {
    console.error("client_summary error:", summaryError);
  } else {
    console.log("✅ client_summary updated:", JSON.stringify(summaryData, null, 2));
  }
}

main();
