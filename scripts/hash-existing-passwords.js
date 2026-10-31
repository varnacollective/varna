/**
 * scripts/hash-existing-passwords.js
 *
 * Migration helper: reads every row from client_credentials where the password
 * column does NOT look like a bcrypt hash, hashes it with bcrypt (cost=12),
 * and writes it back.
 *
 * Run ONCE after deploying the auth remediation:
 *   node scripts/hash-existing-passwords.js
 *
 * Prerequisites: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const BCRYPT_COST = 12;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Ensure .env.local is present and contains both variables."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: rows, error } = await supabase
    .from("client_credentials")
    .select("client_id, password");

  if (error) {
    console.error("Failed to fetch client_credentials:", error.message);
    process.exit(1);
  }

  console.log(`Found ${rows.length} credential rows.`);
  let migrated = 0;
  let skipped = 0;

  for (const row of rows) {
    const pw = row.password ?? "";
    if (pw.startsWith("$2a$") || pw.startsWith("$2b$")) {
      console.log(`  SKIP  ${row.client_id} — already bcrypt hashed`);
      skipped++;
      continue;
    }

    if (!pw) {
      console.warn(`  SKIP  ${row.client_id} — empty password (set manually)`);
      skipped++;
      continue;
    }

    const hashed = await bcrypt.hash(pw, BCRYPT_COST);

    const { error: updateError } = await supabase
      .from("client_credentials")
      .update({ password: hashed })
      .eq("client_id", row.client_id);

    if (updateError) {
      console.error(`  ERROR ${row.client_id}:`, updateError.message);
    } else {
      console.log(`  HASHED ${row.client_id}`);
      migrated++;
    }
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}.`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});

