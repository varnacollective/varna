const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || "postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres",
});

async function seedConfidence() {
  console.log("Seeding confidence_summary and confidence_scoring for all 5 suppliers...");

  const confidenceSummaries = [
    {
      supplier: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
      governance_5: 4.5,
      environment_5: 4.0,
      social_4: 3.5,
      carbon_impact_4: 3.0,
      total_18: 15.0,
      confidence_pct: 83
    },
    {
      supplier: "UKHI INDIA PRIVATE LIMITED",
      governance_5: 4.0,
      environment_5: 4.5,
      social_4: 3.0,
      carbon_impact_4: 2.5,
      total_18: 14.0,
      confidence_pct: 78
    },
    {
      supplier: "Kheoni Ventures Pvt Ltd",
      governance_5: 3.5,
      environment_5: 3.5,
      social_4: 3.0,
      carbon_impact_4: 2.0,
      total_18: 12.0,
      confidence_pct: 67
    },
    {
      supplier: "Greensole Footwear Pvt Ltd",
      governance_5: 4.0,
      environment_5: 3.5,
      social_4: 3.0,
      carbon_impact_4: 2.5,
      total_18: 13.0,
      confidence_pct: 72
    },
    {
      supplier: "Marikar Green Earth Private Limited",
      governance_5: 3.5,
      environment_5: 3.5,
      social_4: 2.5,
      carbon_impact_4: 2.0,
      total_18: 11.5,
      confidence_pct: 64
    }
  ];

  for (const cs of confidenceSummaries) {
    const check = await pool.query('SELECT id FROM confidence_summary WHERE supplier = $1', [cs.supplier]);
    if (check.rows.length > 0) {
      await pool.query(`
        UPDATE confidence_summary SET
          governance_5 = $2,
          environment_5 = $3,
          social_4 = $4,
          carbon_impact_4 = $5,
          total_18 = $6,
          confidence_pct = $7
        WHERE supplier = $1;
      `, [cs.supplier, cs.governance_5, cs.environment_5, cs.social_4, cs.carbon_impact_4, cs.total_18, cs.confidence_pct]);
    } else {
      await pool.query(`
        INSERT INTO confidence_summary (
          supplier, governance_5, environment_5, social_4, carbon_impact_4, total_18, confidence_pct
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);
      `, [cs.supplier, cs.governance_5, cs.environment_5, cs.social_4, cs.carbon_impact_4, cs.total_18, cs.confidence_pct]);
    }
  }

  const checklistTemplates = [
    { pillar: "Governance", num: 1, item: "GST Registration Certificate", score: 1 },
    { pillar: "Governance", num: 2, item: "Udyam MSME Registration Certificate", score: 1 },
    { pillar: "Governance", num: 3, item: "Ethics & Responsible Sourcing Policy", score: 1 },
    { pillar: "Governance", num: 4, item: "On-Time Supplier Payment Terms", score: 1 },
    { pillar: "Governance", num: 5, item: "Clean Legal & Regulatory Compliance Track Record", score: 1 },
    { pillar: "Environment", num: 6, item: "Water Footprint Reduction Actions", score: 1 },
    { pillar: "Environment", num: 7, item: "Water Recycling & Conservation Protocols", score: 1 },
    { pillar: "Environment", num: 8, item: "Non-Toxic & Chemical Safety Compliance", score: 1 },
    { pillar: "Environment", num: 9, item: "Environmental Management System (ISO 14001 / Equivalent)", score: 1 },
    { pillar: "Environment", num: 10, item: "Zero Waste & Circular Packaging Standards", score: 1 },
    { pillar: "Social", num: 11, item: "Written Employee & Artisan Contracts", score: 1 },
    { pillar: "Social", num: 12, item: "State Minimum Wage & Fair Living Wage Compliance", score: 1 },
    { pillar: "Social", num: 13, item: "ESI / Worker Health Insurance Coverage", score: 0.75 },
    { pillar: "Social", num: 14, item: "Workplace Health & Safety Measures", score: 1 },
    { pillar: "Carbon Impact", num: 15, item: "Carbon Footprint Audit & Report", score: 0.75 },
    { pillar: "Carbon Impact", num: 16, item: "Energy Consumption & Electricity Tracking", score: 1 },
    { pillar: "Carbon Impact", num: 17, item: "Raw Material Traceability & Sustainable Sourcing", score: 1 },
    { pillar: "Carbon Impact", num: 18, item: "PETA / BCorp / Quality Audit Certifications", score: 1 }
  ];

  for (const cs of confidenceSummaries) {
    await pool.query('DELETE FROM confidence_scoring WHERE supplier = $1', [cs.supplier]);
    for (const item of checklistTemplates) {
      await pool.query(`
        INSERT INTO confidence_scoring (supplier, pillar, num, item, score)
        VALUES ($1, $2, $3, $4, $5);
      `, [cs.supplier, item.pillar, item.num, item.item, item.score]);
    }
  }

  console.log("Seeded confidence_summary and confidence_scoring for all suppliers successfully!");
  await pool.end();
}

seedConfidence();
