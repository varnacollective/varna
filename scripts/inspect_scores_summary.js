const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
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

async function inspect() {
  const { data, error } = await supabase.from('scores_summary').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Total rows:', data.length);
  data.forEach((r, i) => {
    console.log(`\nRow ${i}: id=${r.id}, enterprise_id=${r.enterprise_id}, enterprise_name="${r.enterprise_name}", is_craftled=${r.is_craftled}`);
    console.log(`E: e_pillar=${r.e_pillar_score}, e1=${r.e1_eff_score}, e2=${r.e2_eff_score}, e3=${r.e3_eff_score}, e4=${r.e4_eff_score}, e5=${r.e5_eff_score}, e6=${r.e6_eff_score}`);
    console.log(`S: s_pillar=${r.s_pillar_score}, s1=${r.s1_eff_score}, s2=${r.s2_eff_score}, s3=${r.s3_eff_score}, s4=${r.s4_eff_score}`);
    console.log(`G: g_pillar=${r.g_pillar_score}, g1=${r.g1_eff_score}, g2=${r.g2_eff_score}, g3=${r.g3_eff_score}`);
    console.log(`C: c_pillar=${r.c_pillar_score}, c1=${r.c1_eff_score}, c2=${r.c2_eff_score}, c3=${r.c3_eff_score}`);
  });
}

inspect();
