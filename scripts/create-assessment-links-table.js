/**
 * create-assessment-links-table.js
 * Run with: node scripts/create-assessment-links-table.js
 *
 * Creates the `assessment_links` table in Supabase via direct PostgreSQL
 * connection using the SUPABASE_DB_URL from .env.local
 */

require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error("❌ SUPABASE_DB_URL not found in .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("✓ Connected to Supabase PostgreSQL");

  await client.query(`
    CREATE TABLE IF NOT EXISTS assessment_links (
      id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      uuid          TEXT         UNIQUE NOT NULL,
      enterprise_name TEXT       NOT NULL,
      status        TEXT         DEFAULT 'pending' CHECK (status IN ('pending', 'submitted')),
      created_at    TIMESTAMPTZ  DEFAULT now(),
      submitted_at  TIMESTAMPTZ
    );
  `);
  console.log("✓ Table `assessment_links` created (or already exists)");

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_assessment_links_uuid
    ON assessment_links (uuid);
  `);
  console.log("✓ Index on uuid created");

  // Enable RLS
  await client.query(`ALTER TABLE assessment_links ENABLE ROW LEVEL SECURITY;`);
  console.log("✓ RLS enabled");

  // Drop old policies if they exist so we can recreate cleanly
  await client.query(`
    DROP POLICY IF EXISTS "Allow public read by uuid"    ON assessment_links;
    DROP POLICY IF EXISTS "Allow service insert"         ON assessment_links;
    DROP POLICY IF EXISTS "Allow service update"         ON assessment_links;
  `);

  // Allow anyone to SELECT (needed by the server component page validation)
  await client.query(`
    CREATE POLICY "Allow public read by uuid"
    ON assessment_links FOR SELECT
    USING (true);
  `);

  // Allow INSERT from any authenticated or anon call (API route uses anon key)
  await client.query(`
    CREATE POLICY "Allow anon insert"
    ON assessment_links FOR INSERT
    WITH CHECK (true);
  `);

  // Allow UPDATE (to mark status as submitted)
  await client.query(`
    CREATE POLICY "Allow anon update"
    ON assessment_links FOR UPDATE
    USING (true);
  `);

  console.log("✓ RLS policies applied (SELECT, INSERT, UPDATE open via anon key)");

  await client.end();
  console.log("\n🎉 Done! The assessment_links table is ready.");
  console.log("   Restart your dev server and try generating a link again.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
