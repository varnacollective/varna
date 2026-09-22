const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });

async function run() {
  try {
    console.log("=== category_spend_by_client columns ===");
    const cols1 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'category_spend_by_client'
      ORDER BY ordinal_position;
    `);
    console.log(cols1.rows);

    console.log("\n=== category_spend_by_client current rows ===");
    const rows1 = await pool.query("SELECT * FROM category_spend_by_client ORDER BY client_id, category_name");
    console.log(rows1.rows);

    console.log("\n=== order_register unique orders (grouped by order_id or order_number) ===");
    const rows2 = await pool.query(`
      SELECT DISTINCT order_id, client_id, order_date, order_status
      FROM order_register 
      ORDER BY order_id ASC
    `);
    console.log(rows2.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
