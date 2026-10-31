const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  try {
    const res = await pool.query("SELECT * FROM client_credentials WHERE client_id = 'CLT-001'");
    console.log('client_credentials for CLT-001:', res.rows);
  } catch (e) {
    console.log('client_credentials error:', e.message);
  }
  pool.end();
}
check();
