const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.client_credentials (
        id BIGSERIAL PRIMARY KEY,
        client_id TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        client_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE public.client_credentials DISABLE ROW LEVEL SECURITY;
    `);
    console.log('client_credentials table created successfully!');
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

main();
