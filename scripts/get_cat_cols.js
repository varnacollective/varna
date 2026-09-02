const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres' });
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'category_spend_by_client'").then(r => console.log(r.rows)).finally(() => pool.end());
