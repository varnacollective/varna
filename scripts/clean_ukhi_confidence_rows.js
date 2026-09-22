const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function dryRunCleanUKHI() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  console.log("=== DRY RUN: UKHI confidence_scoring cleanup ===");

  const currentUkhiRows = await client.query(
    "SELECT id, supplier, pillar, num, item, score FROM confidence_scoring WHERE supplier ILIKE '%ukhi%' ORDER BY id"
  );
  console.log(`Current UKHI rows count: ${currentUkhiRows.rows.length}`);

  const supplierNames = [...new Set(currentUkhiRows.rows.map(r => r.supplier))];
  console.log(`Supplier name variations found: ${JSON.stringify(supplierNames)}`);

  console.log("\nProposed Action:");
  console.log("1. Delete duplicate rows with supplier = 'UKHI' (18 rows).");
  console.log("2. Preserve the 18 authoritative rows with supplier = 'UKHI INDIA PRIVATE LIMITED'.");

  const preservedRows = currentUkhiRows.rows.filter(r => r.supplier === 'UKHI INDIA PRIVATE LIMITED');
  console.log(`\nPreserved 18 rows for UKHI INDIA PRIVATE LIMITED:`);
  preservedRows.forEach(r => console.log(`  - [${r.pillar}] Num ${r.num}: ${r.item} = ${r.score}`));

  const sumScore = preservedRows.reduce((acc, r) => acc + (parseFloat(r.score) || 0), 0);
  console.log(`\nTotal confirmed score sum: ${sumScore} / 18 (${Math.round((sumScore / 18) * 100)}%)`);

  await client.end();
}

dryRunCleanUKHI().catch(console.error);
