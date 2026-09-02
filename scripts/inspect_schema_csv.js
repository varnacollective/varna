const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*').limit(0).csv();
  if (error) {
    console.error(`Error fetching ${tableName}:`, error.message);
  } else {
    console.log(`Columns for ${tableName}:`, data.split('\n')[0]);
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
