const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT table_name, column_name FROM information_schema.columns WHERE column_name LIKE '%sdg%' AND table_schema = 'public'").then(r => console.log(r.rows)).finally(() => pool.end());
