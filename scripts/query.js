const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres' });
Promise.all([
  pool.query("SELECT enterprise_id, enterprise_name_auto FROM supplier_detail_by_client WHERE client_id = 'CLT-001' LIMIT 5").then(r => console.log('detail:', r.rows)),
  pool.query("SELECT enterprise_id, enterprise_name FROM scores_summary LIMIT 5").then(r => console.log('scores:', r.rows)),
  pool.query("SELECT supplier FROM confidence_summary LIMIT 5").then(r => console.log('confidence:', r.rows))
]).finally(() => pool.end());
