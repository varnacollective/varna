const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres' });
pool.query("SELECT table_name, column_name FROM information_schema.columns WHERE column_name LIKE '%sdg%' AND table_schema = 'public'").then(r => console.log(r.rows)).finally(() => pool.end());
