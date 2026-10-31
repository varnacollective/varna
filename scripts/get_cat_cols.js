const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'category_spend_by_client'").then(r => console.log(r.rows)).finally(() => pool.end());
