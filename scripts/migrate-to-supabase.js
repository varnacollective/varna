/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  Varna Collective — Google Sheets → Supabase PostgreSQL Migration Script   ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Reads all tabs from two Google Sheets and migrates data to Supabase.      ║
 * ║                                                                            ║
 * ║  Usage:                                                                    ║
 * ║    1. Add SUPABASE_DB_URL to .env.local                                    ║
 * ║    2. Run: node scripts/migrate-to-supabase.js                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const { google } = require("googleapis");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// ─── Load Environment Variables ──────────────────────────────────────────────

let envPath = path.join(__dirname, "..", ".env.migration");
if (!fs.existsSync(envPath)) {
  envPath = path.join(__dirname, "..", ".env.local");
}
console.log(`Loading environment from: ${envPath}`);

const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const eqIdx = line.indexOf("=");
  if (eqIdx > 0) {
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim().replace(/\r$/, "");
    env[key] = val;
  }
}

// ─── Configuration ───────────────────────────────────────────────────────────

const SHEETS_CONFIG = [
  {
    name: "Varna Main Backend",
    spreadsheetId: env.GOOGLE_SHEET_ID || "1Dizj3c2F0nCYAQRQ20FotwvUi6uCPYHyQGBunsHqxnU",
    // Tabs will be auto-discovered from the spreadsheet metadata
    tabs: null,
    // Main Backend: Row 0 = title description, Row 1 = sub-description,
    // Row 2 (index 2) = actual column headers, Row 3+ = data
    headerRowIndex: 2,
    dataStartRow: 3,
  },
  {
    name: "Varna Confidence Ring",
    spreadsheetId: env.GOOGLE_SHEET_ID_CONFIDENCE || "111diQZ9iJP2MHAj9I9RBj7KhivROukO-VpTUefQR51I",
    tabs: null,
    // Confidence Ring: Row 0 = headers, Row 1+ = data
    headerRowIndex: 0,
    dataStartRow: 1,
  },
];

const SUPABASE_DB_URL = env.SUPABASE_DB_URL;
if (!SUPABASE_DB_URL) {
  console.error("╔══════════════════════════════════════════════════════════════╗");
  console.error("║  ERROR: Missing SUPABASE_DB_URL in .env.local              ║");
  console.error("║                                                            ║");
  console.error("║  Add this line to your .env.local:                         ║");
  console.error("║  SUPABASE_DB_URL=postgresql://postgres.[ref]:[pass]@...    ║");
  console.error("╚══════════════════════════════════════════════════════════════╝");
  process.exit(1);
}

// ─── Google Auth ─────────────────────────────────────────────────────────────

function getAuth() {
  const creds = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_KEY);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

// ─── Column Name Sanitizer ───────────────────────────────────────────────────

/**
 * Converts messy Google Sheet headers into clean PostgreSQL column names.
 *
 * Examples:
 *   "Enterprise Name"          → "enterprise_name"
 *   "Total Spend (INR)\n₹"    → "total_spend_inr"
 *   "Avg. Varna Score"        → "avg_varna_score"
 *   "CO2e Avoided (kg)"       → "co2e_avoided_kg"
 *   "Women Workforce %"       → "women_workforce_pct"
 *   "Auto-Generated (auto)"   → "auto_generated_auto"
 *   "Carbon Intensity\nScore"  → "carbon_intensity_score"
 *   "#Orders"                 → "num_orders"
 *   ""                        → "column_0" (unnamed columns get positional names)
 */
function sanitizeColumnName(header, index) {
  if (!header || header.trim() === "") {
    return `column_${index}`;
  }

  let col = header;

  // Replace common symbols with meaningful words
  col = col.replace(/₹/g, " inr ");
  col = col.replace(/%/g, " pct ");
  col = col.replace(/#/g, " num ");
  col = col.replace(/&/g, " and ");
  col = col.replace(/\+/g, " plus ");
  col = col.replace(/@/g, " at ");

  // Replace newlines, carriage returns, tabs with spaces
  col = col.replace(/[\r\n\t]/g, " ");

  // Remove parenthetical annotations like (auto), (kg), (INR)
  // but keep the text inside as part of the name
  col = col.replace(/\(([^)]+)\)/g, " $1 ");

  // Remove all remaining special characters except letters, digits, spaces, underscores
  col = col.replace(/[^a-zA-Z0-9\s_]/g, "");

  // Normalize whitespace → single underscore
  col = col.replace(/\s+/g, "_");

  // Remove leading/trailing underscores
  col = col.replace(/^_+|_+$/g, "");

  // Lowercase
  col = col.toLowerCase();

  // Collapse consecutive underscores
  col = col.replace(/_+/g, "_");

  // Ensure it doesn't start with a digit (prepend "col_")
  if (/^\d/.test(col)) {
    col = "col_" + col;
  }

  // Truncate to 63 chars (PostgreSQL identifier limit)
  col = col.slice(0, 63);

  return col || `column_${index}`;
}

/**
 * Ensures all column names in a header row are unique.
 * Appends _2, _3, etc. for duplicates.
 */
function deduplicateColumns(columns) {
  const seen = {};
  return columns.map((col) => {
    if (!seen[col]) {
      seen[col] = 1;
      return col;
    }
    seen[col]++;
    return `${col}_${seen[col]}`;
  });
}

/**
 * Convert a Google Sheet tab name to a PostgreSQL table name.
 * E.g., "1_ENTERPRISE_MASTER" → "enterprise_master"
 *        "Scoring"            → "confidence_scoring"
 */
function sanitizeTableName(tabName, sheetGroup) {
  let name = tabName.toLowerCase().replace(/\s+/g, "_");

  // Remove leading number prefix (e.g., "1_", "10_")
  name = name.replace(/^\d+_/, "");

  // Remove non-alphanumeric (except underscores)
  name = name.replace(/[^a-z0-9_]/g, "");

  // For the confidence ring, prefix to avoid collisions
  if (sheetGroup === "Varna Confidence Ring") {
    name = `confidence_${name}`;
  }

  return name;
}

// ─── Migration Engine ────────────────────────────────────────────────────────

/**
 * Discover all tab (sheet) names from a spreadsheet via metadata.
 */
async function discoverTabs(sheetsApi, spreadsheetId) {
  const meta = await sheetsApi.spreadsheets.get({ spreadsheetId });
  return meta.data.sheets.map((s) => s.properties.title);
}

/**
 * Auto-detect the real header row by finding the first row with more than
 * MIN_HEADER_COLS non-empty cells. This skips merged description/title rows
 * which typically appear as a single cell.
 */
function detectHeaderRow(allRows, fallbackIndex) {
  const MIN_HEADER_COLS = 3;
  for (let i = 0; i < Math.min(allRows.length, 10); i++) {
    const row = allRows[i];
    if (!row) continue;
    const nonEmptyCells = row.filter(
      (cell) => cell !== undefined && cell !== null && String(cell).trim() !== ""
    ).length;
    if (nonEmptyCells >= MIN_HEADER_COLS) {
      return i;
    }
  }
  return fallbackIndex;
}

async function fetchSheetData(sheetsApi, spreadsheetId, tabName) {
  // Use encodeURIComponent-safe quoting: wrap tab name in single quotes
  // This handles tabs starting with numbers, spaces, etc.
  const escapedTab = tabName.replace(/'/g, "''");
  const range = `'${escapedTab}'!A1:ZZ`;
  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return res.data.values || [];
}

async function createTable(pool, tableName, columns) {
  // Build column definitions — all TEXT to avoid type errors during migration
  const colDefs = columns
    .map((col) => `  "${col}" TEXT`)
    .join(",\n");

  const sql = `
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      id BIGSERIAL PRIMARY KEY,
    ${colDefs}
    );
  `;

  await pool.query(sql);
}

async function insertRows(pool, tableName, columns, rows) {
  if (rows.length === 0) {
    console.log(`    ⚪ No data rows to insert for "${tableName}"`);
    return 0;
  }

  // Batch insert using parameterized queries (safe from SQL injection)
  const BATCH_SIZE = 100;
  let totalInserted = 0;

  for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
    const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);

    // Build a multi-row INSERT with parameterized placeholders
    const valuePlaceholders = [];
    const allValues = [];
    let paramIndex = 1;

    for (const row of batch) {
      const rowPlaceholders = [];
      for (let c = 0; c < columns.length; c++) {
        rowPlaceholders.push(`$${paramIndex}`);
        // Handle rows that are shorter than the header
        allValues.push(row[c] !== undefined && row[c] !== null ? String(row[c]) : null);
        paramIndex++;
      }
      valuePlaceholders.push(`(${rowPlaceholders.join(", ")})`);
    }

    const colNames = columns.map((c) => `"${c}"`).join(", ");
    const sql = `INSERT INTO "${tableName}" (${colNames}) VALUES ${valuePlaceholders.join(", ")}`;

    await pool.query(sql, allValues);
    totalInserted += batch.length;
  }

  return totalInserted;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  🚀  Varna Collective — Google Sheets → Supabase Migration     ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");
  console.log();

  // Initialize Google Sheets API
  const auth = getAuth();
  const sheetsApi = google.sheets({ version: "v4", auth });

  // Initialize PostgreSQL connection to Supabase
  const pool = new Pool({
    connectionString: SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Test connection
  try {
    const testRes = await pool.query("SELECT NOW()");
    console.log(`✅ Connected to Supabase PostgreSQL at ${testRes.rows[0].now}`);
    console.log();
  } catch (err) {
    console.error("❌ Failed to connect to Supabase PostgreSQL:", err.message);
    process.exit(1);
  }

  const migrationSummary = [];

  for (const sheetConfig of SHEETS_CONFIG) {
    console.log("━".repeat(68));
    console.log(`📊 Processing: ${sheetConfig.name}`);
    console.log(`   Sheet ID: ${sheetConfig.spreadsheetId}`);
    console.log("━".repeat(68));
    console.log();

    // Auto-discover tabs if not hardcoded
    let tabs = sheetConfig.tabs;
    if (!tabs) {
      try {
        tabs = await discoverTabs(sheetsApi, sheetConfig.spreadsheetId);
        console.log(`  🔍 Discovered ${tabs.length} tabs: ${tabs.join(", ")}`);
        console.log();
      } catch (err) {
        console.error(`  ❌ Failed to discover tabs: ${err.message}`);
        continue;
      }
    }

    for (const tabName of tabs) {
      const tableName = sanitizeTableName(tabName, sheetConfig.name);

      console.log(`  📋 Tab: "${tabName}" → Table: "${tableName}"`);

      try {
        // 1. Fetch all data from the sheet tab
        const allRows = await fetchSheetData(sheetsApi, sheetConfig.spreadsheetId, tabName);

        if (allRows.length === 0) {
          console.log(`    ⚠️  Empty sheet — skipping`);
          console.log();
          migrationSummary.push({ tab: tabName, table: tableName, rows: 0, status: "SKIPPED (empty)" });
          continue;
        }

        // 2. Auto-detect the header row (skip merged description rows)
        const detectedHeaderIdx = detectHeaderRow(allRows, sheetConfig.headerRowIndex);
        const headerRow = allRows[detectedHeaderIdx];
        if (!headerRow || headerRow.length === 0) {
          console.log(`    ⚠️  No headers found (tried row ${detectedHeaderIdx}) — skipping`);
          console.log();
          migrationSummary.push({ tab: tabName, table: tableName, rows: 0, status: "SKIPPED (no headers)" });
          continue;
        }

        if (detectedHeaderIdx !== sheetConfig.headerRowIndex) {
          console.log(`    🔎 Auto-detected header at row ${detectedHeaderIdx + 1} (config suggested row ${sheetConfig.headerRowIndex + 1})`);
        }

        // 3. Sanitize and deduplicate column names
        const rawColumns = headerRow.map((h, i) => sanitizeColumnName(h, i));
        const columns = deduplicateColumns(rawColumns);

        console.log(`    📐 Columns (${columns.length}): ${columns.slice(0, 5).join(", ")}${columns.length > 5 ? `, ... (+${columns.length - 5} more)` : ""}`);

        // 4. Extract data rows (everything after the detected header row)
        const dataStartRow = detectedHeaderIdx + 1;
        const dataRows = allRows.slice(dataStartRow);

        // Filter out completely empty rows
        const validRows = dataRows.filter((row) =>
          row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== "")
        );

        console.log(`    📊 Data rows: ${validRows.length} (filtered from ${dataRows.length})`);

        // 5. Drop existing table if it exists (fresh migration)
        await pool.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
        console.log(`    🗑️  Dropped existing table (if any)`);

        // 6. Create table
        await createTable(pool, tableName, columns);
        console.log(`    ✅ Created table "${tableName}"`);

        // 7. Insert data
        const inserted = await insertRows(pool, tableName, columns, validRows);
        console.log(`    ✅ Inserted ${inserted} rows`);
        console.log();

        migrationSummary.push({ tab: tabName, table: tableName, rows: inserted, status: "SUCCESS" });
      } catch (err) {
        console.error(`    ❌ Error migrating "${tabName}":`, err.message);
        console.log();
        migrationSummary.push({ tab: tabName, table: tableName, rows: 0, status: `ERROR: ${err.message}` });
      }
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────────────

  console.log();
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  📋  Migration Summary                                         ║");
  console.log("╠══════════════════════════════════════════════════════════════════╣");

  const maxTabLen = Math.max(...migrationSummary.map((s) => s.tab.length), 10);
  const maxTableLen = Math.max(...migrationSummary.map((s) => s.table.length), 10);

  console.log(
    `║  ${"Sheet Tab".padEnd(maxTabLen)}  │  ${"PG Table".padEnd(maxTableLen)}  │  Rows   │  Status`
  );
  console.log(`║  ${"─".repeat(maxTabLen)}──┼──${"─".repeat(maxTableLen)}──┼─────────┼──────────`);

  let totalRows = 0;
  let successCount = 0;
  for (const s of migrationSummary) {
    const rowStr = String(s.rows).padStart(5);
    const statusIcon = s.status === "SUCCESS" ? "✅" : s.status.startsWith("SKIPPED") ? "⚪" : "❌";
    console.log(
      `║  ${s.tab.padEnd(maxTabLen)}  │  ${s.table.padEnd(maxTableLen)}  │  ${rowStr}  │  ${statusIcon} ${s.status}`
    );
    totalRows += s.rows;
    if (s.status === "SUCCESS") successCount++;
  }

  console.log(`║`);
  console.log(`║  Total: ${successCount}/${migrationSummary.length} tables migrated, ${totalRows} rows inserted`);
  console.log("╚══════════════════════════════════════════════════════════════════╝");

  // Close pool
  await pool.end();
  console.log("\n✅ Done. Connection closed.");
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
