const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable(tableName) {
  const { data, error } = await supabase.rpc('query_schema', { table_name: tableName });
  if (error) {
    // If rpc fails, we can't easily query information_schema directly via REST API if it's not exposed.
    // Let's use standard POSTGRESQL API if possible, but PostgREST doesn't expose information_schema by default.
    // We can try to force an error to get column hints, but since we already got "column X doesn't exist", we know the names don't match.
    console.error(`Error with RPC for ${tableName}:`, error.message);
  } else {
    console.log(`Columns for ${tableName}:`, data);
  }
}

async function main() {
  await inspectTable('client_summary');
  await inspectTable('assessment_inputs');
  await inspectTable('scores_summary');
  await inspectTable('confidence_summary');
  await inspectTable('confidence_scoring');
}

main();
