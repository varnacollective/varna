const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres' });
pool.query("SELECT item, score FROM confidence_scoring LIMIT 10").then(r => console.log(r.rows)).finally(() => pool.end());
