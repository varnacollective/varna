const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testAuthoritativePartners() {
  const [
    scoresRes,
    masterRes,
    clientRes,
    assessRes
  ] = await Promise.all([
    pool.query('SELECT * FROM scores_summary ORDER BY enterprise_id ASC'),
    pool.query('SELECT * FROM enterprise_master ORDER BY enterprise_id ASC'),
    pool.query("SELECT * FROM supplier_detail_by_client WHERE client_id = 'CLT-001'"),
    pool.query('SELECT * FROM assessment_inputs ORDER BY id ASC')
  ]);

  console.log(`Scores rows: ${scoresRes.rows.length}`);
  console.log(`Master rows: ${masterRes.rows.length}`);
  console.log(`Client CLT-001 links: ${clientRes.rows.length}`);
  console.log(`Assessment rows: ${assessRes.rows.length}`);

  const tierCounts = { 'Micro A': 0, 'Micro B': 0, 'Small': 0, 'Medium': 0 };
  scoresRes.rows.forEach(r => {
    if (tierCounts[r.tier] !== undefined) {
      tierCounts[r.tier]++;
    }
  });
  console.log('Tier counts across 10 partners:', tierCounts);

  const merged = scoresRes.rows.map(scoreRow => {
    const link = clientRes.rows.find(l => l.enterprise_id === scoreRow.enterprise_id);
    return {
      id: scoreRow.enterprise_id,
      name: scoreRow.enterprise_name,
      tier: scoreRow.tier,
      varnaScore: scoreRow.final_varna_score,
      clientSpend: link ? Number(link.orders_inr_ytd_auto) : 0,
      clientOrders: link ? Number(link.units_ytd_auto) : 0,
      hasClientOrder: Boolean(link)
    };
  });

  console.log('Merged sample:', merged);
  await pool.end();
}

testAuthoritativePartners().catch(console.error);
