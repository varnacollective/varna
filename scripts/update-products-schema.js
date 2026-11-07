const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const XLSX = require('xlsx');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const dbUrl = process.env.SUPABASE_DB_URL;
const wbPath = 'C:/Users/home/Downloads/Varna_Calculator_V1.xlsx';

console.log('--- Step 1: Updating Supabase Products Schema & Data ---');
console.log('Database URL target:', dbUrl ? 'Configured' : 'Missing');

async function updateDatabase() {
  const pgClient = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pgClient.connect();
    console.log('[OK] Connected to Supabase PostgreSQL database.');

    // 1. Update product_catalogue table with alternative_co2e_per_unit and savings_per_unit
    console.log('Adding columns to product_catalogue...');
    await pgClient.query(`
      ALTER TABLE product_catalogue 
      ADD COLUMN IF NOT EXISTS alternative_co2e_per_unit NUMERIC,
      ADD COLUMN IF NOT EXISTS savings_per_unit NUMERIC,
      ADD COLUMN IF NOT EXISTS baseline_co2e NUMERIC;
    `);

    // Populate product_catalogue
    console.log('Populating product_catalogue metrics...');
    const catUpdateRes = await pgClient.query(`
      UPDATE product_catalogue
      SET 
        baseline_co2e = ROUND(COALESCE(conventional_baseline_co2eunit_kg, 2.500)::numeric, 4),
        alternative_co2e_per_unit = ROUND(COALESCE(carbon_intensity_kg_co2eunit_manual_entry, 0.110)::numeric, 4),
        savings_per_unit = ROUND(GREATEST(0, COALESCE(conventional_baseline_co2eunit_kg, 2.500) - COALESCE(carbon_intensity_kg_co2eunit_manual_entry, 0.110))::numeric, 4);
    `);
    console.log(`[OK] Updated ${catUpdateRes.rowCount} rows in product_catalogue.`);

    // 2. Ensure public.products table exists with target columns
    console.log('Ensuring public.products table exists with target columns...');
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_id TEXT UNIQUE,
        product_name TEXT NOT NULL,
        category TEXT,
        unit TEXT DEFAULT 'Piece',
        baseline_co2e NUMERIC NOT NULL DEFAULT 0,
        alternative_co2e_per_unit NUMERIC NOT NULL DEFAULT 0,
        savings_per_unit NUMERIC NOT NULL DEFAULT 0,
        unit_price_inr NUMERIC,
        is_sustainable BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS alternative_co2e_per_unit NUMERIC,
      ADD COLUMN IF NOT EXISTS savings_per_unit NUMERIC,
      ADD COLUMN IF NOT EXISTS baseline_co2e NUMERIC;
    `);

    // Populate products from product_catalogue
    await pgClient.query(`
      INSERT INTO products (product_id, product_name, category, unit, baseline_co2e, alternative_co2e_per_unit, savings_per_unit, unit_price_inr)
      SELECT 
        sku_id,
        product_name,
        category_name,
        unit_of_measure,
        baseline_co2e,
        alternative_co2e_per_unit,
        savings_per_unit,
        NULLIF(regexp_replace(unit_price_inr, '[^0-9.]', '', 'g'), '')::numeric
      FROM product_catalogue
      ON CONFLICT (product_id) DO UPDATE SET
        baseline_co2e = EXCLUDED.baseline_co2e,
        alternative_co2e_per_unit = EXCLUDED.alternative_co2e_per_unit,
        savings_per_unit = EXCLUDED.savings_per_unit;
    `);

    // 3. Ensure calculator_products table has alternative_co2e_per_unit and savings_per_unit
    console.log('Ensuring calculator_products table has alternative_co2e_per_unit and savings_per_unit...');
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS calculator_products (
        product_id TEXT PRIMARY KEY,
        item_group TEXT,
        category TEXT NOT NULL,
        product_name TEXT NOT NULL,
        unit TEXT NOT NULL,
        product_type TEXT,
        route TEXT NOT NULL DEFAULT 'Weight',
        factor_id_a TEXT,
        share_a NUMERIC DEFAULT 1.0,
        factor_id_b TEXT,
        share_b NUMERIC DEFAULT 0.0,
        weight_per_unit_kg NUMERIC,
        weight_or_price_basis TEXT,
        basis_type TEXT,
        typical_price_inr NUMERIC,
        factor NUMERIC,
        estimate_kg_co2e_per_unit NUMERIC NOT NULL,
        source_grade TEXT,
        confidence TEXT NOT NULL DEFAULT 'Medium',
        compare_with TEXT,
        compare_status TEXT,
        compare_note TEXT,
        current_catalogue_category TEXT,
        factor_used TEXT,
        baseline_co2e NUMERIC,
        alternative_co2e_per_unit NUMERIC,
        savings_per_unit NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE calculator_products 
      ADD COLUMN IF NOT EXISTS alternative_co2e_per_unit NUMERIC,
      ADD COLUMN IF NOT EXISTS savings_per_unit NUMERIC,
      ADD COLUMN IF NOT EXISTS baseline_co2e NUMERIC;
    `);

    // Read Excel workbook for complete 147 products and compare pairs
    const wb = XLSX.readFile(wbPath);
    const prodRows = XLSX.utils.sheet_to_json(wb.Sheets['Products'], { header: 1 });
    const cpRows = XLSX.utils.sheet_to_json(wb.Sheets['Compare Pairs'], { header: 1 });

    const cpMap = new Map();
    for (let i = 4; i < cpRows.length; i++) {
      const r = cpRows[i];
      if (r && r[0]) {
        cpMap.set(String(r[0]).toLowerCase().trim(), {
          alt: String(r[2]),
          altCo2e: Number(r[3]),
          diff: Number(r[4]),
          status: String(r[6] || 'Show'),
        });
      }
    }

    console.log(`Syncing products from workbook into calculator_products & products...`);
    let synced = 0;
    for (let i = 4; i < prodRows.length; i++) {
      const r = prodRows[i];
      if (!r || !r[0]) continue;

      const pId = String(r[0]);
      const group = String(r[1] || '');
      const cat = String(r[2] || '');
      const name = String(r[3] || '');
      const unit = String(r[4] || 'Piece');
      const pType = r[5] ? String(r[5]) : null;
      const route = String(r[6] || 'Weight');
      const baseline = Number(r[16]) || 0;
      const confidence = String(r[18] || 'Medium');
      const compareWith = r[19] ? String(r[19]) : null;
      const compareStatus = r[20] ? String(r[20]) : null;
      const compareNote = r[21] ? String(r[21]) : null;
      const typicalPrice = r[14] != null ? Number(r[14]) : null;
      const weight = r[11] != null ? Number(r[11]) : null;

      let altCo2e = baseline;
      let savings = 0;

      const pair = cpMap.get(name.toLowerCase().trim());
      if (pair && pair.status === 'Show') {
        altCo2e = pair.altCo2e;
        savings = Math.max(0, baseline - pair.altCo2e);
      } else if (compareWith && compareStatus === 'Show') {
        // check if compare with is in sheet
        for (let j = 4; j < prodRows.length; j++) {
          if (prodRows[j] && String(prodRows[j][3]).toLowerCase().trim() === compareWith.toLowerCase().trim()) {
            altCo2e = Number(prodRows[j][16]) || 0;
            savings = Math.max(0, baseline - altCo2e);
            break;
          }
        }
      }

      await pgClient.query(`
        INSERT INTO calculator_products (
          product_id, item_group, category, product_name, unit, product_type, route,
          weight_per_unit_kg, typical_price_inr, estimate_kg_co2e_per_unit, confidence,
          compare_with, compare_status, compare_note, baseline_co2e, alternative_co2e_per_unit, savings_per_unit
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        ) ON CONFLICT (product_id) DO UPDATE SET
          baseline_co2e = EXCLUDED.baseline_co2e,
          alternative_co2e_per_unit = EXCLUDED.alternative_co2e_per_unit,
          savings_per_unit = EXCLUDED.savings_per_unit;
      `, [
        pId, group, cat, name, unit, pType, route,
        weight, typicalPrice, baseline, confidence,
        compareWith, compareStatus, compareNote,
        baseline, altCo2e, savings
      ]);

      await pgClient.query(`
        INSERT INTO products (product_id, product_name, category, unit, baseline_co2e, alternative_co2e_per_unit, savings_per_unit, unit_price_inr)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (product_id) DO UPDATE SET
          baseline_co2e = EXCLUDED.baseline_co2e,
          alternative_co2e_per_unit = EXCLUDED.alternative_co2e_per_unit,
          savings_per_unit = EXCLUDED.savings_per_unit;
      `, [
        pId, name, cat, unit, baseline, altCo2e, savings, typicalPrice
      ]);

      synced++;
    }

    console.log(`[OK] Synced ${synced} products.`);

    // Enable RLS and public read
    await pgClient.query(`
      ALTER TABLE products ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public read products" ON products;
      CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

      ALTER TABLE calculator_products ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public read calculator_products" ON calculator_products;
      CREATE POLICY "Public read calculator_products" ON calculator_products FOR SELECT USING (true);
    `);

    // Verify sample query
    const verifyProducts = await pgClient.query(`
      SELECT product_id, product_name, category, baseline_co2e, alternative_co2e_per_unit, savings_per_unit 
      FROM products 
      WHERE savings_per_unit > 0
      ORDER BY savings_per_unit DESC
      LIMIT 8;
    `);

    console.log('\n[SUCCESS] Verified records from Supabase products table:');
    console.table(verifyProducts.rows);

    await pgClient.end();
    console.log('[DONE] PostgreSQL migration completed successfully.');
  } catch (error) {
    console.error('[ERROR] Migration failed:', error);
    process.exit(1);
  }
}

updateDatabase();
