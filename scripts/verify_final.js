const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });

async function verify() {
  try {
    console.log("=== VERIFYING category_spend_by_client FOR CLT-001, CLT-002, CLT-003 ===");
    const resCat = await pool.query(`
      SELECT client_id, category_name, total_spend_inr_auto, total_units_auto, total_co2e_kg_auto, co2e_avoided_kg_auto, pct_of_client_total_spend_auto
      FROM category_spend_by_client 
      WHERE client_id IN ('CLT-001', 'CLT-002', 'CLT-003')
      ORDER BY client_id, total_spend_inr_auto DESC
    `);
    console.table(resCat.rows);

    console.log("\n=== VERIFYING order_register STATUS FOR ORD-001 AND ORD-004 ===");
    const resOrders = await pool.query(`
      SELECT DISTINCT order_id, client_id, order_date, order_status
      FROM order_register 
      WHERE order_id IN ('ORD-001', 'ORD-004')
      ORDER BY order_id
    `);
    console.table(resOrders.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

verify();
