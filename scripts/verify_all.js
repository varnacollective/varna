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

async function verifyAll() {
  console.log('=== VERIFY ITEM 1: CLT-001 in DB ===');
  const { data: cm } = await supabase.from('client_master').select('*').eq('client_id', 'CLT-001');
  const { data: cs } = await supabase.from('client_summary').select('*').eq('client_id', 'CLT-001');
  console.log('client_master:', {
    client_id: cm[0].client_id,
    client_name: cm[0].client_name,
    logo_path: cm[0].logo_path,
  });
  console.log('client_summary:', {
    client_id: cs[0].client_id,
    client_name_auto: cs[0].client_name_auto,
  });

  console.log('\n=== VERIFY ITEM 4: Scores Summary Sub-criteria ===');
  const { data: ukhi } = await supabase.from('scores_summary').select('*').eq('enterprise_id', 'ENT-002');
  const { data: bare } = await supabase.from('scores_summary').select('*').eq('enterprise_id', 'ENT-001');
  const { data: kheoni } = await supabase.from('scores_summary').select('*').eq('enterprise_id', 'ENT-003');

  console.log('UKHI (ENT-002) E-pillar:', ukhi[0].e_pillar_score, {
    CAR: ukhi[0].e1_eff_score,
    MAT: ukhi[0].e2_eff_score,
    CIR: ukhi[0].e3_eff_score,
    WAT: ukhi[0].e4_eff_score,
    POL: ukhi[0].e5_eff_score,
    PAC: ukhi[0].e6_eff_score,
  });
  console.log('UKHI (ENT-002) S-pillar:', ukhi[0].s_pillar_score, {
    EMP: ukhi[0].s1_eff_score,
    GEN: ukhi[0].s2_eff_score,
    WOR: ukhi[0].s3_eff_score,
    HEA: ukhi[0].s4_eff_score,
  });
  console.log('UKHI (ENT-002) G-pillar:', ukhi[0].g_pillar_score, {
    LEG: ukhi[0].g1_eff_score,
    BUS: ukhi[0].g2_eff_score,
    RES: ukhi[0].g3_eff_score,
  });
  console.log('UKHI (ENT-002) Cultural/4th-pillar:', ukhi[0].c_pillar_score, {
    CRA: ukhi[0].c1_eff_score,
    SKI: ukhi[0].c2_eff_score,
    CLI: ukhi[0].c3_eff_score,
  });

  console.log('\nBare Necessities (ENT-001) E-pillar:', bare[0].e_pillar_score, {
    CAR: bare[0].e1_eff_score,
    MAT: bare[0].e2_eff_score,
    CIR: bare[0].e3_eff_score,
    WAT: bare[0].e4_eff_score,
    POL: bare[0].e5_eff_score,
    PAC: bare[0].e6_eff_score,
  });
  console.log('Bare Necessities (ENT-001) G-pillar:', bare[0].g_pillar_score, {
    LEG: bare[0].g1_eff_score,
    BUS: bare[0].g2_eff_score,
    RES: bare[0].g3_eff_score,
  });

  console.log('\nKheoni (ENT-003) G-pillar:', kheoni[0].g_pillar_score, {
    LEG: kheoni[0].g1_eff_score,
    BUS: kheoni[0].g2_eff_score,
    RES: kheoni[0].g3_eff_score, // Expected null
  });
}

verifyAll();
