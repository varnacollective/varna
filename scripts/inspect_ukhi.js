const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function inspectUKHI() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const res = await client.query("SELECT * FROM confidence_scoring WHERE supplier ILIKE '%ukhi%'");
  console.log("UKHI confidence_scoring rows count:", res.rows.length);
  res.rows.forEach(r => console.log(r.id, r.supplier, r.pillar, r.num, r.item, r.score));
  await client.end();
}

inspectUKHI().catch(console.error);
