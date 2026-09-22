const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function executeUKHICleanup() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  console.log("Executing UKHI confidence_scoring cleanup in transaction...");
  try {
    await client.query("BEGIN");
    const delRes = await client.query("DELETE FROM confidence_scoring WHERE supplier = 'UKHI'");
    console.log(`Deleted ${delRes.rowCount} duplicate rows for supplier = 'UKHI'`);

    const checkRes = await client.query("SELECT COUNT(*) FROM confidence_scoring WHERE supplier = 'UKHI INDIA PRIVATE LIMITED'");
    console.log(`Verified remaining rows for UKHI INDIA PRIVATE LIMITED: ${checkRes.rows[0].count}`);

    await client.query("COMMIT");
    console.log("Cleanup committed successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error during cleanup, rolled back transaction:", err);
  } finally {
    await client.end();
  }
}

executeUKHICleanup().catch(console.error);
