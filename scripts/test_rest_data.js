const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('client_summary').select('*');
  console.log('client_summary Data Length:', data ? data.length : 0);
  
  const { data: aiData } = await supabase.from('assessment_inputs').select('*');
  console.log('assessment_inputs Data Length:', aiData ? aiData.length : 0);
}

main();
