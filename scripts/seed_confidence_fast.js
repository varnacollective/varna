const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL || "postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres",
  });
  await client.connect();

  console.log("Seeding confidence tables via single client connection...");

  const suppliersData = [
    { supplier: 'Bare Necessities Zero Waste Solutions Pvt. Ltd.', gov: 4.5, env: 4.0, soc: 3.5, carb: 3.0, total: 15.0, pct: 83 },
    { supplier: 'UKHI INDIA PRIVATE LIMITED', gov: 4.0, env: 4.5, soc: 3.0, carb: 2.5, total: 14.0, pct: 78 },
    { supplier: 'Kheoni Ventures Pvt Ltd', gov: 3.5, env: 3.5, soc: 3.0, carb: 2.0, total: 12.0, pct: 67 },
    { supplier: 'Greensole Footwear Pvt Ltd', gov: 4.0, env: 3.5, soc: 3.0, carb: 2.5, total: 13.0, pct: 72 },
    { supplier: 'Marikar Green Earth Private Limited', gov: 3.5, env: 3.5, soc: 2.5, carb: 2.0, total: 11.5, pct: 64 }
  ];

  for (const s of suppliersData) {
    await client.query('DELETE FROM confidence_summary WHERE supplier = $1', [s.supplier]);
    await client.query(`
      INSERT INTO confidence_summary (supplier, governance_5, environment_5, social_4, carbon_impact_4, total_18, confidence_pct)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [s.supplier, s.gov, s.env, s.soc, s.carb, s.total, s.pct]);
  }

  const suppliers = [
    'Bare Necessities Zero Waste Solutions Pvt. Ltd.',
    'UKHI INDIA PRIVATE LIMITED',
    'Kheoni Ventures Pvt Ltd',
    'Greensole Footwear Pvt Ltd',
    'Marikar Green Earth Private Limited'
  ];

  const items = [
    ['Governance', 1, 'GST Registration Certificate', 1],
    ['Governance', 2, 'Udyam MSME Registration Certificate', 1],
    ['Governance', 3, 'Ethics & Responsible Sourcing Policy', 1],
    ['Governance', 4, 'On-Time Supplier Payment Terms', 1],
    ['Governance', 5, 'Clean Legal & Regulatory Compliance Track Record', 1],
    ['Environment', 6, 'Water Footprint Reduction Actions', 1],
    ['Environment', 7, 'Water Recycling & Conservation Protocols', 1],
    ['Environment', 8, 'Non-Toxic & Chemical Safety Compliance', 1],
    ['Environment', 9, 'Environmental Management System (ISO 14001 / Equivalent)', 1],
    ['Environment', 10, 'Zero Waste & Circular Packaging Standards', 1],
    ['Social', 11, 'Written Employee & Artisan Contracts', 1],
    ['Social', 12, 'State Minimum Wage & Fair Living Wage Compliance', 1],
    ['Social', 13, 'ESI / Worker Health Insurance Coverage', 0.75],
    ['Social', 14, 'Workplace Health & Safety Measures', 1],
    ['Carbon Impact', 15, 'Carbon Footprint Audit & Report', 0.75],
    ['Carbon Impact', 16, 'Energy Consumption & Electricity Tracking', 1],
    ['Carbon Impact', 17, 'Raw Material Traceability & Sustainable Sourcing', 1],
    ['Carbon Impact', 18, 'PETA / BCorp / Quality Audit Certifications', 1]
  ];

  for (const s of suppliers) {
    await client.query('DELETE FROM confidence_scoring WHERE supplier = $1', [s]);
    for (const item of items) {
      await client.query(
        'INSERT INTO confidence_scoring (supplier, pillar, num, item, score) VALUES ($1, $2, $3, $4, $5)',
        [s, item[0], item[1], item[2], item[3]]
      );
    }
  }

  console.log("Successfully seeded confidence tables!");
  await client.end();
}

run().catch(console.error);
