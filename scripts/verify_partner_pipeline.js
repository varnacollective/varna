const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  console.log('================ PIPELINE VERIFICATION ================');
  
  // 1. Authoritative Partner Table: enterprise_master and scores_summary
  const scoresRes = await pool.query('SELECT enterprise_id, enterprise_name, tier, final_varna_score FROM scores_summary ORDER BY enterprise_id');
  console.log(`\n1. Authoritative partner count in database: ${scoresRes.rows.length}`);
  console.log('List of partners:');
  scoresRes.rows.forEach(r => console.log(`   - ${r.enterprise_id}: ${r.enterprise_name} (Tier: ${r.tier}, Score: ${r.final_varna_score})`));

  // 2. Client CLT-001 specific orders / spend
  const clientRes = await pool.query("SELECT enterprise_id, enterprise_name_auto, orders_inr_ytd_auto, units_ytd_auto FROM supplier_detail_by_client WHERE client_id = 'CLT-001'");
  console.log(`\n2. CLT-001 contracted suppliers with direct spend: ${clientRes.rows.length}`);
  let totalContractedSpend = 0;
  clientRes.rows.forEach(r => {
    totalContractedSpend += Number(r.orders_inr_ytd_auto || 0);
    console.log(`   - ${r.enterprise_id}: ${r.enterprise_name_auto} => ₹${r.orders_inr_ytd_auto} (${r.units_ytd_auto} units)`);
  });
  console.log(`   Total spend: ₹${totalContractedSpend} ($${Math.round(totalContractedSpend / 83)} USD)`);

  // 3. Client Summary in DB
  const summaryRes = await pool.query("SELECT * FROM client_summary WHERE client_id = 'CLT-001'");
  const s = summaryRes.rows[0];
  console.log(`\n3. CLT-001 client_summary in DB:`);
  console.log(`   - avg_varna_score: ${s.avg_varna_score}`);
  console.log(`   - total_spend_inr_auto: ${s.total_spend_inr_auto} ($${Math.round(s.total_spend_inr_auto / 83)})`);
  console.log(`   - no_active_suppliers (old column in DB): ${s.no_active_suppliers}`);

  // 4. Tier Breakdown across all 10 verified partners
  const tierCounts = { 'Micro A': 0, 'Micro B': 0, 'Small': 0, 'Medium': 0 };
  scoresRes.rows.forEach(r => {
    if (tierCounts[r.tier] !== undefined) tierCounts[r.tier]++;
    else tierCounts['Micro A']++;
  });
  console.log(`\n4. Tier breakdown across all 10 verified partners:`, tierCounts);
  console.log(`   Total across tiers: ${Object.values(tierCounts).reduce((a, b) => a + b, 0)}`);

  // 5. Check if there are any other clients or ENT-011
  const clientMasterRes = await pool.query("SELECT COUNT(*) FROM client_master");
  console.log(`\n5. client_master count (total hotels/clients): ${clientMasterRes.rows[0].count}`);

  await pool.end();
}

verify().catch(console.error);
