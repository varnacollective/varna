const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT item, score FROM confidence_scoring LIMIT 10").then(r => console.log(r.rows)).finally(() => pool.end());
