require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("Updating client_credentials in Supabase...");

  // 1. Ensure columns exist
  await pool.query(`
    ALTER TABLE client_credentials ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT FALSE;
    ALTER TABLE client_credentials ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT FALSE;
    ALTER TABLE client_credentials ADD COLUMN IF NOT EXISTS parent_group TEXT;
  `);

  // 2. Update existing rows to plaintext passwords that work with BOTH old and new deployed code
  const accounts = [
    { client_id: 'superadmin', client_name: 'Super Admin', password: 'Varna', is_superadmin: true, is_group: false, parent_group: null },
    { client_id: 'GRP-001', client_name: 'Meridian Hospitality Group (DEMO)', password: '1234', is_superadmin: false, is_group: true, parent_group: 'Meridian Hospitality Group (DEMO)' },
    { client_id: 'CLT-001', client_name: 'The Astor Dubai', password: '1234', is_superadmin: false, is_group: false, parent_group: null },
    { client_id: 'CLT-002', client_name: 'Six Senses The Palm', password: '1234', is_superadmin: false, is_group: false, parent_group: null },
    { client_id: 'CLT-003', client_name: 'The Dorchester Dubai', password: '1234', is_superadmin: false, is_group: false, parent_group: null },
    { client_id: 'CLT-004', client_name: 'Meridian Grand Palm', password: '1234', is_superadmin: false, is_group: false, parent_group: 'Meridian Hospitality Group (DEMO)' },
    { client_id: 'CLT-005', client_name: 'Meridian Oceanview Resort', password: '1234', is_superadmin: false, is_group: false, parent_group: 'Meridian Hospitality Group (DEMO)' },
    { client_id: 'CLT-006', client_name: 'Meridian Heritage Suites', password: '1234', is_superadmin: false, is_group: false, parent_group: 'Meridian Hospitality Group (DEMO)' },
    { client_id: 'CLT-007', client_name: 'Meridian Urban Loft', password: '1234', is_superadmin: false, is_group: false, parent_group: 'Meridian Hospitality Group (DEMO)' },
    { client_id: 'CLT-008', client_name: 'Meridian Coastal Retreat', password: '1234', is_superadmin: false, is_group: false, parent_group: 'Meridian Hospitality Group (DEMO)' },
    { client_id: 'CLT-009', client_name: 'Meridian Business Tower', password: '1234', is_superadmin: false, is_group: false, parent_group: 'Meridian Hospitality Group (DEMO)' },
    { client_id: 'CLT-010', client_name: 'Meridian Desert Oasis', password: '1234', is_superadmin: false, is_group: false, parent_group: 'Meridian Hospitality Group (DEMO)' },
    { client_id: 'CLT-011', client_name: 'Meridian Riverside Lodge', password: '1234', is_superadmin: false, is_group: false, parent_group: 'Meridian Hospitality Group (DEMO)' },
  ];

  for (const acc of accounts) {
    await pool.query(`
      INSERT INTO client_credentials (client_id, client_name, password, is_superadmin, is_group, parent_group)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (client_id) DO UPDATE SET
        client_name = EXCLUDED.client_name,
        password = EXCLUDED.password,
        is_superadmin = EXCLUDED.is_superadmin,
        is_group = EXCLUDED.is_group,
        parent_group = EXCLUDED.parent_group;
    `, [acc.client_id, acc.client_name, acc.password, acc.is_superadmin, acc.is_group, acc.parent_group]);
    console.log(`  ✓ Synced credentials for ${acc.client_id}`);
  }

  // Verify
  const res = await pool.query("SELECT client_id, client_name, password, is_superadmin, is_group FROM client_credentials ORDER BY id");
  console.log("\nVerified rows in client_credentials:");
  console.table(res.rows);

  await pool.end();
  console.log("Done!");
}

main().catch(err => {
  console.error("Error updating credentials:", err);
  process.exit(1);
});

