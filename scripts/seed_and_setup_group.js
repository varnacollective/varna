const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
let envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  envPath = path.join(__dirname, '..', '.env.migration');
}
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const eqIdx = line.indexOf('=');
  if (eqIdx > 0) {
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim().replace(/\r$/, '');
    env[key] = val;
  }
}

const pool = new Pool({
  connectionString: env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('🚀 Seeding Meridian Hospitality Group (DEMO) Data...');

  // 1. Ensure columns exist
  await pool.query(`
    ALTER TABLE client_master ADD COLUMN IF NOT EXISTS parent_group TEXT;
    ALTER TABLE client_summary ADD COLUMN IF NOT EXISTS parent_group TEXT;
    ALTER TABLE client_summary ADD COLUMN IF NOT EXISTS car_km_avoided NUMERIC;
    ALTER TABLE client_summary ADD COLUMN IF NOT EXISTS trees_equivalent NUMERIC;
    ALTER TABLE supplier_detail_by_client ADD COLUMN IF NOT EXISTS parent_group TEXT;

    CREATE TABLE IF NOT EXISTS client_credentials (
      id BIGSERIAL PRIMARY KEY,
      client_id TEXT UNIQUE NOT NULL,
      client_name TEXT,
      password TEXT NOT NULL
    );

    ALTER TABLE client_credentials ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT FALSE;
    ALTER TABLE client_credentials ADD COLUMN IF NOT EXISTS parent_group TEXT;
  `);
  console.log('✅ Checked / updated table schemas.');

  // 2. Data for 9_CLIENT_MASTER
  const clientMasterRows = [
    ['CLT-004', 'Meridian Grand Palm', 'Luxury Hotel', 'Dubai', 'UAE', 'DUMMY: Illustrative Contact', 'dummy@meridiandemo.com', '2026-01-01', 'Yes', 'Active', 'Meridian Hospitality Group (DEMO)'],
    ['CLT-005', 'Meridian Oceanview Resort', 'Resort', 'Abu Dhabi', 'UAE', 'DUMMY: Illustrative Contact', 'dummy@meridiandemo.com', '2026-01-01', 'Yes', 'Active', 'Meridian Hospitality Group (DEMO)'],
    ['CLT-006', 'Meridian Heritage Suites', 'Boutique Hotel', 'Jaipur', 'India', 'DUMMY: Illustrative Contact', 'dummy@meridiandemo.com', '2026-01-01', 'No', 'Active', 'Meridian Hospitality Group (DEMO)'],
    ['CLT-007', 'Meridian Urban Loft', 'Business Hotel', 'Mumbai', 'India', 'DUMMY: Illustrative Contact', 'dummy@meridiandemo.com', '2026-01-01', 'No', 'Active', 'Meridian Hospitality Group (DEMO)'],
    ['CLT-008', 'Meridian Coastal Retreat', 'Resort', 'Goa', 'India', 'DUMMY: Illustrative Contact', 'dummy@meridiandemo.com', '2026-01-01', 'No', 'Active', 'Meridian Hospitality Group (DEMO)'],
    ['CLT-009', 'Meridian Business Tower', 'Business Hotel', 'Bengaluru', 'India', 'DUMMY: Illustrative Contact', 'dummy@meridiandemo.com', '2026-01-01', 'No', 'Active', 'Meridian Hospitality Group (DEMO)'],
    ['CLT-010', 'Meridian Desert Oasis', 'Resort', 'Ras Al Khaimah', 'UAE', 'DUMMY: Illustrative Contact', 'dummy@meridiandemo.com', '2026-01-01', 'No', 'Active', 'Meridian Hospitality Group (DEMO)'],
    ['CLT-011', 'Meridian Riverside Lodge', 'Boutique Hotel', 'Kochi', 'India', 'DUMMY: Illustrative Contact', 'dummy@meridiandemo.com', '2026-01-01', 'No', 'Active', 'Meridian Hospitality Group (DEMO)'],
  ];

  for (const row of clientMasterRows) {
    await pool.query(`DELETE FROM client_master WHERE client_id = $1`, [row[0]]);
    await pool.query(`
      INSERT INTO client_master (client_id, client_name, property_type, city, country, procurement_contact_name, contact_email, account_start_date, csrd_reporting_obligation, account_status, parent_group)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
    `, row);
  }
  console.log('✅ Seeded client_master rows.');

  // 3. Data for 6_CLIENT_SUMMARY
  // Client ID,Client Name,Total Spend,Total Orders,Total Units,Total CO2e kg,Total CO2e Avoided kg,CO2 Reduction %,No Active Suppliers,Avg Varna Score,Avg E Score,Avg S Score,Avg G Score,Avg C Score,No Varna Leaders,Avg E1 Carbon,Avg E2 Material%,Avg E3 Circularity,Avg E4 Water,Avg E5 Pollution,Avg E6 Packaging,Avg S1 Employment,Avg S2 Gender,Avg S3 Wages,Avg S4 Health,Avg G1 Legal,Avg G2 Ethics,Avg G3 Sourcing,Car Km Avoided,Trees Equivalent
  const clientSummaryRows = [
    ['CLT-004', 'Meridian Grand Palm', 534000, 3, 2200, 1160, 3912, 77.1, 2, 85.3, 64.4, 78.2, 88, 55.7, 1, 52.5, 55, 76.3, 57.5, 100, 78.2, 65.7, 87.5, 66.3, 100, 97.5, 100, 55.7, 16033, 178, 'Meridian Hospitality Group (DEMO)'],
    ['CLT-005', 'Meridian Oceanview Resort', 174000, 3, 10000, 519, 1985.8, 79.3, 3, 70.5, 46.9, 62.5, 72.6, 37.5, 0, 37.5, 26.7, 70.8, 28.8, 86.7, 64.6, 60, 62.5, 47.1, 85.4, 87.9, 80, 37.5, 8139, 90, 'Meridian Hospitality Group (DEMO)'],
    ['CLT-006', 'Meridian Heritage Suites', 295500, 3, 1100, 960, 1440, 60, 3, 64.4, 53.2, 67.4, 72.2, 85, 1, 47.5, 51.7, 58.3, 43.3, 70.8, 58.3, 62.5, 78.3, 59.6, 70.8, 79.2, 65.8, 85, 5902, 65, 'Meridian Hospitality Group (DEMO)'],
    ['CLT-007', 'Meridian Urban Loft', 30400, 3, 6300, 1924, 1891.25, 49.6, 3, 52, 33.6, 51.8, 53.9, 33.8, 0, 25.8, 28.3, 47.5, 15, 51.7, 50.8, 63.8, 47.5, 36.3, 58.3, 68.4, 51.7, 33.8, 7751, 86, 'Meridian Hospitality Group (DEMO)'],
    ['CLT-008', 'Meridian Coastal Retreat', 184400, 3, 2500, 1081, 1562, 59.1, 3, 63.3, 46, 60.9, 64.9, 37.5, 0, 41.3, 38.3, 53.3, 36.3, 72.5, 50, 60, 67.5, 47.1, 70.9, 74.6, 73.3, 37.5, 6402, 71, 'Meridian Hospitality Group (DEMO)'],
    ['CLT-009', 'Meridian Business Tower', 40550, 3, 2950, 1072.5, 252.6, 19.1, 3, 45.3, 26.6, 45.6, 46.9, 33.8, 0, 22.5, 16.7, 38.3, 15, 44.2, 41.7, 63.8, 40, 26.3, 49.2, 59.6, 44.2, 33.8, 1035, 11, 'Meridian Hospitality Group (DEMO)'],
    ['CLT-010', 'Meridian Desert Oasis', 491100, 3, 4000, 875, 4687, 84.3, 3, 82.6, 58.4, 74.6, 84.7, 50.9, 1, 47.5, 40, 80.8, 43.3, 93.3, 85.4, 66.3, 78.3, 60.4, 100, 98.3, 93.3, 50.9, 19209, 213, 'Meridian Hospitality Group (DEMO)'],
    ['CLT-011', 'Meridian Riverside Lodge', 146550, 3, 530, 409.5, 346.5, 45.8, 3, 39.3, 25, 45.4, 48.5, null, 0, 22.5, 21.7, 28.3, 15, 42.5, 28.3, 56.3, 55, 26.3, 40.8, 57.5, 37.5, null, null, 16, 'Meridian Hospitality Group (DEMO)'],
  ];

  for (const row of clientSummaryRows) {
    // Delete existing record for client_id to keep clean
    await pool.query(`DELETE FROM client_summary WHERE client_id = $1`, [row[0]]);

    await pool.query(`
      INSERT INTO client_summary (
        client_id, client_name_auto, total_spend_inr_auto, total_orders_auto, total_units_auto,
        total_co2e_kg_auto, total_co2e_avoided_kg_auto, co2_reduction_pct_auto, no_active_suppliers,
        avg_varna_score, avg_e_score, avg_s_score, avg_g_score, avg_c_score_craft_only, no_varna_leaders,
        avg_e1_carbon_auto, avg_e2_material_pct_auto, avg_e3_circularity_auto, avg_e4_water_auto,
        avg_e5_pollution_auto, avg_e6_packaging_auto, avg_s1_employment_auto, avg_s2_gender_auto,
        avg_s3_wages_auto, avg_s4_health_auto, avg_g1_legal_auto, avg_g2_ethics_auto, avg_g3_sourcing_auto,
        car_km_avoided, trees_equivalent, parent_group
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
      )
    `, row);
  }
  console.log('✅ Seeded client_summary rows.');

  // 4. Data for 7_SUPPLIER_DETAIL_BY_CLIENT
  const supplierDetailRows = [
    ['CLT-004','ENT-001','Bare Necessities Zero Waste Solutions Pvt. Ltd.','Micro B',73.5,'Advanced',31.8,63.8,81.6,366000,720,3072,15,10,52.5,15,100,56.3,56.3,75,32.5,100,100,100,26.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-004','ENT-004','Terra Weave Textiles Pvt Ltd','Small',97.1,'Varna Leader',97,92.5,94.3,168000,440,840,90,100,100,100,100,100,75,100,100,100,95,100,85,'Meridian Hospitality Group (DEMO)'],
    ['CLT-005','ENT-002','UKHI India Private Limited','Small',77.1,'Advanced',46.3,67.5,78.3,12000,64,20.8,37.5,10,90,15,80,100,67.5,60,48.8,100,100,80,41.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-005','ENT-005','Coastal Bamboo Co','Micro B',61,'Emerging',62.5,56.3,57.8,57000,330,840,60,60,70,56.3,80,37.5,56.3,52.5,60,56.3,63.8,60,45,'Meridian Hospitality Group (DEMO)'],
    ['CLT-005','ENT-001','Bare Necessities Zero Waste Solutions Pvt. Ltd.','Micro B',73.5,'Advanced',31.8,63.8,81.6,105000,125,1125,15,10,52.5,15,100,56.3,56.3,75,32.5,100,100,100,26.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-006','ENT-004','Terra Weave Textiles Pvt Ltd','Small',97.1,'Varna Leader',97,92.5,94.3,126000,330,630,90,100,100,100,100,100,75,100,100,100,95,100,85,'Meridian Hospitality Group (DEMO)'],
    ['CLT-006','ENT-007','Green Loom Cooperative','Micro A',44.1,'Foundational',37.1,50.6,45.8,117000,630,810,37.5,45,37.5,15,37.5,37.5,56.3,75,30,37.5,52.5,37.5,null,'Meridian Hospitality Group (DEMO)'],
    ['CLT-006','ENT-003','Kheoni Ventures Pvt Ltd','Micro A',52,'Foundational',25.4,59.1,76.5,52500,0,0,15,10,37.5,15,75,37.5,56.3,60,48.8,75,90,60,null,'Meridian Hospitality Group (DEMO)'],
    ['CLT-007','ENT-002','UKHI India Private Limited','Small',77.1,'Advanced',46.3,67.5,78.3,5500,250,81.25,37.5,10,90,15,80,100,67.5,60,48.8,100,100,80,41.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-007','ENT-008','PureLeaf Packaging Pvt Ltd','Micro B',42,'Foundational',33.4,45,44.1,10500,1050,1650,25,45,37.5,15,37.5,37.5,56.3,52.5,30,37.5,56.3,37.5,33.8,'Meridian Hospitality Group (DEMO)'],
    ['CLT-007','ENT-009','Nimbus Amenities Ltd','Small',37,'Not Ready',21,42.8,39.2,14400,624,160,15,30,15,15,37.5,15,67.5,30,30,37.5,48.8,37.5,26.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-008','ENT-005','Coastal Bamboo Co','Micro B',61,'Emerging',62.5,56.3,57.8,68400,396,1008,60,60,70,56.3,80,37.5,56.3,52.5,60,56.3,63.8,60,45,'Meridian Hospitality Group (DEMO)'],
    ['CLT-008','ENT-006','Sundari Herbals Pvt Ltd','Small',55.4,'Emerging',43.7,62.5,55.3,38000,340,500,48.8,45,37.5,37.5,37.5,56.3,67.5,75,48.8,56.3,60,60,41.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-008','ENT-001','Bare Necessities Zero Waste Solutions Pvt. Ltd.','Micro B',73.5,'Advanced',31.8,63.8,81.6,78000,345,54,15,10,52.5,15,100,56.3,56.3,75,32.5,100,100,100,26.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-009','ENT-002','UKHI India Private Limited','Small',77.1,'Advanced',46.3,67.5,78.3,8100,108,35.1,37.5,10,90,15,80,100,67.5,60,48.8,100,100,80,41.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-009','ENT-009','Nimbus Amenities Ltd','Small',37,'Not Ready',21,42.8,39.2,16200,702,180,15,30,15,15,37.5,15,67.5,30,30,37.5,48.8,37.5,26.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-009','ENT-010','Rustic Clay Works','Micro A',21.8,'Not Ready',12.5,26.4,23.3,16250,262.5,37.5,15,10,10,15,15,10,56.3,30,0,10,30,15,null,'Meridian Hospitality Group (DEMO)'],
    ['CLT-010','ENT-001','Bare Necessities Zero Waste Solutions Pvt. Ltd.','Micro B',73.5,'Advanced',31.8,63.8,81.6,277500,165,3585,15,10,52.5,15,100,56.3,56.3,75,32.5,100,100,100,26.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-010','ENT-004','Terra Weave Textiles Pvt Ltd','Small',97.1,'Varna Leader',97,92.5,94.3,210000,550,1050,90,100,100,100,100,100,75,100,100,100,95,100,85,'Meridian Hospitality Group (DEMO)'],
    ['CLT-010','ENT-002','UKHI India Private Limited','Small',77.1,'Advanced',46.3,67.5,78.3,3600,160,52,37.5,10,90,15,80,100,67.5,60,48.8,100,100,80,41.3,'Meridian Hospitality Group (DEMO)'],
    ['CLT-011','ENT-003','Kheoni Ventures Pvt Ltd','Micro A',52,'Foundational',25.4,59.1,76.5,90000,0,0,15,10,37.5,15,75,37.5,56.3,60,48.8,75,90,60,null,'Meridian Hospitality Group (DEMO)'],
    ['CLT-011','ENT-007','Green Loom Cooperative','Micro A',44.1,'Foundational',37.1,50.6,45.8,46800,252,324,37.5,45,37.5,15,37.5,37.5,56.3,75,30,37.5,52.5,37.5,null,'Meridian Hospitality Group (DEMO)'],
    ['CLT-011','ENT-010','Rustic Clay Works','Micro A',21.8,'Not Ready',12.5,26.4,23.3,9750,157.5,22.5,15,10,10,15,15,10,56.3,30,0,10,30,15,null,'Meridian Hospitality Group (DEMO)'],
  ];

  // Delete existing Meridian rows from supplier_detail_by_client
  await pool.query(`DELETE FROM supplier_detail_by_client WHERE parent_group = 'Meridian Hospitality Group (DEMO)' OR client_id IN ('CLT-004','CLT-005','CLT-006','CLT-007','CLT-008','CLT-009','CLT-010','CLT-011')`);

  for (const row of supplierDetailRows) {
    await pool.query(`
      INSERT INTO supplier_detail_by_client (
        client_id, enterprise_id, enterprise_name_auto, tier_auto, varna_score_auto, band_auto,
        e_score_auto, s_score_auto, g_score_auto, orders_inr_ytd_auto, total_co2e_kg_auto, co2e_avoided_kg_auto,
        e1_carbon_auto, e2_material_pct_auto, e3_circularity_auto, e4_water_auto, e5_pollution_auto, e6_packaging_auto,
        s1_employment_auto, s2_gender_auto, s3_wages_auto, s4_health_auto, g1_legal_auto, g2_ethics_auto, g3_sourcing_auto, parent_group
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      )
    `, row);
  }
  console.log('✅ Seeded supplier_detail_by_client rows.');

  // 5. Seed GRP-001 credentials in client_credentials
  await pool.query(`
    INSERT INTO client_credentials (client_id, client_name, password, is_group, parent_group)
    VALUES ('GRP-001', 'Meridian Hospitality Group (DEMO)', '1234', true, 'Meridian Hospitality Group (DEMO)')
    ON CONFLICT (client_id) DO UPDATE SET
      password = EXCLUDED.password,
      client_name = EXCLUDED.client_name,
      is_group = EXCLUDED.is_group,
      parent_group = EXCLUDED.parent_group;
  `);
  console.log('✅ Seeded GRP-001 group credentials.');

  // 6. Test aggregation SQL query directly
  const aggRes = await pool.query(`
    WITH prop_agg AS (
      SELECT
        parent_group,
        COUNT(DISTINCT client_id) AS no_properties,
        SUM(total_spend_inr_auto) AS total_spend,
        SUM(total_co2e_kg_auto) AS total_co2e_kg,
        SUM(total_co2e_avoided_kg_auto) AS total_co2e_avoided_kg,
        SUM(car_km_avoided) AS car_km_avoided,
        SUM(trees_equivalent) AS trees_equivalent
      FROM client_summary
      WHERE parent_group = 'Meridian Hospitality Group (DEMO)'
      GROUP BY parent_group
    ),
    sup_agg AS (
      SELECT
        parent_group,
        COUNT(*) AS no_active_supplier_relationships,
        ROUND(AVG(varna_score_auto)::numeric, 1) AS avg_varna_score,
        ROUND(AVG(e_score_auto)::numeric, 1) AS avg_e,
        ROUND(AVG(s_score_auto)::numeric, 1) AS avg_s,
        ROUND(AVG(g_score_auto)::numeric, 1) AS avg_g,
        ROUND(AVG(e1_carbon_auto)::numeric, 1) AS avg_e1,
        ROUND(AVG(e2_material_pct_auto)::numeric, 1) AS avg_e2,
        ROUND(AVG(e3_circularity_auto)::numeric, 1) AS avg_e3,
        ROUND(AVG(e4_water_auto)::numeric, 1) AS avg_e4,
        ROUND(AVG(e5_pollution_auto)::numeric, 1) AS avg_e5,
        ROUND(AVG(e6_packaging_auto)::numeric, 1) AS avg_e6,
        ROUND(AVG(s1_employment_auto)::numeric, 1) AS avg_s1,
        ROUND(AVG(s2_gender_auto)::numeric, 1) AS avg_s2,
        ROUND(AVG(s3_wages_auto)::numeric, 1) AS avg_s3,
        ROUND(AVG(s4_health_auto)::numeric, 1) AS avg_s4,
        ROUND(AVG(g1_legal_auto)::numeric, 1) AS avg_g1,
        ROUND(AVG(g2_ethics_auto)::numeric, 1) AS avg_g2,
        ROUND(AVG(g3_sourcing_auto)::numeric, 1) AS avg_g3,
        SUM(CASE WHEN band_auto IN ('Foundational', 'Not Ready') THEN orders_inr_ytd_auto ELSE 0 END) AS spend_at_risk
      FROM supplier_detail_by_client
      WHERE parent_group = 'Meridian Hospitality Group (DEMO)'
      GROUP BY parent_group
    ),
    hotel_counts AS (
      SELECT
        cs.parent_group,
        COUNT(CASE WHEN cs.avg_varna_score > sa.avg_varna_score THEN 1 END) AS hotels_above_group_avg,
        COUNT(CASE WHEN cs.avg_varna_score < 50 THEN 1 END) AS hotels_needing_support
      FROM client_summary cs
      JOIN sup_agg sa ON cs.parent_group = sa.parent_group
      WHERE cs.parent_group = 'Meridian Hospitality Group (DEMO)'
      GROUP BY cs.parent_group
    )
    SELECT
      p.parent_group,
      p.no_properties,
      s.no_active_supplier_relationships,
      p.total_spend,
      p.total_co2e_kg,
      p.total_co2e_avoided_kg,
      s.avg_varna_score,
      s.avg_e,
      s.avg_s,
      s.avg_g,
      p.car_km_avoided,
      p.trees_equivalent,
      h.hotels_above_group_avg,
      h.hotels_needing_support,
      s.spend_at_risk,
      ROUND((s.spend_at_risk / p.total_spend * 100)::numeric, 1) AS spend_at_risk_pct,
      s.avg_e1, s.avg_e2, s.avg_e3, s.avg_e4, s.avg_e5, s.avg_e6,
      s.avg_s1, s.avg_s2, s.avg_s3, s.avg_s4,
      s.avg_g1, s.avg_g2, s.avg_g3
    FROM prop_agg p
    JOIN sup_agg s ON p.parent_group = s.parent_group
    JOIN hotel_counts h ON p.parent_group = h.parent_group;
  `);

  console.log('\n📊 Live Aggregation Results:');
  console.table(aggRes.rows[0]);

  await pool.end();
  console.log('✅ Done!');
}

main().catch((err) => {
  console.error('💥 Error seeding group data:', err);
  process.exit(1);
});
