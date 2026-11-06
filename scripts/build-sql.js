const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/calculator-raw.json'), 'utf8'));

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return isNaN(val) ? 'NULL' : String(val);
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

let sql = `-- Varna Native Carbon Calculator Schema & Data Seed
-- Source: Varna_Calculator_V1.xlsx
-- Factor Version: ${raw.settings.factorVersion}
-- Licensing Rule: Excludes ecoinvent Reference-only factors. 111 Recommended & Recommended proxy factors loaded.

-- 1. calculator_settings
CREATE TABLE IF NOT EXISTS calculator_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. calculator_emission_factors
CREATE TABLE IF NOT EXISTS calculator_emission_factors (
  factor_id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  material_or_product TEXT NOT NULL,
  variant TEXT,
  factor NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  low NUMERIC,
  high NUMERIC,
  boundary TEXT,
  region TEXT,
  data_year TEXT,
  use_status TEXT NOT NULL,
  source_grade TEXT,
  fit_for_india TEXT,
  source TEXT NOT NULL,
  source_type TEXT,
  link TEXT,
  licence_note TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. calculator_products
CREATE TABLE IF NOT EXISTS calculator_products (
  product_id TEXT PRIMARY KEY,
  item_group TEXT NOT NULL,
  category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  product_type TEXT,
  route TEXT NOT NULL, -- 'Weight' | 'Per unit' | 'Spend'
  factor_id_a TEXT REFERENCES calculator_emission_factors(factor_id) ON DELETE SET NULL,
  share_a NUMERIC DEFAULT 1.0,
  factor_id_b TEXT REFERENCES calculator_emission_factors(factor_id) ON DELETE SET NULL,
  share_b NUMERIC DEFAULT 0.0,
  weight_per_unit_kg NUMERIC,
  weight_or_price_basis TEXT,
  basis_type TEXT,
  typical_price_inr NUMERIC,
  factor NUMERIC,
  estimate_kg_co2e_per_unit NUMERIC NOT NULL,
  source_grade TEXT,
  confidence TEXT NOT NULL, -- 'High' | 'Medium' | 'Low'
  compare_with TEXT,
  compare_status TEXT,
  compare_note TEXT,
  current_catalogue_category TEXT,
  factor_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. calculator_compare_pairs
CREATE TABLE IF NOT EXISTS calculator_compare_pairs (
  pair_id SERIAL PRIMARY KEY,
  conventional_product TEXT NOT NULL,
  conventional_kg_co2e NUMERIC NOT NULL,
  alternative_product TEXT NOT NULL,
  alternative_kg_co2e NUMERIC NOT NULL,
  difference_kg_co2e NUMERIC NOT NULL,
  change_pct TEXT,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. calculator_baskets
CREATE TABLE IF NOT EXISTS calculator_baskets (
  basket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  basket_name TEXT DEFAULT 'Default Basket',
  total_co2e_kg NUMERIC DEFAULT 0,
  total_savings_kg NUMERIC DEFAULT 0,
  low_confidence_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. calculator_basket_items
CREATE TABLE IF NOT EXISTS calculator_basket_items (
  item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  basket_id UUID REFERENCES calculator_baskets(basket_id) ON DELETE CASCADE,
  line_number INTEGER,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  custom_weight_kg NUMERIC,
  custom_price_inr NUMERIC,
  unit_co2e_kg NUMERIC NOT NULL,
  line_co2e_kg NUMERIC NOT NULL,
  confidence TEXT,
  compare_with TEXT,
  alternative_unit_co2e_kg NUMERIC,
  saving_kg_co2e NUMERIC DEFAULT 0,
  compare_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calc_prod_group ON calculator_products(item_group);
CREATE INDEX IF NOT EXISTS idx_calc_prod_category ON calculator_products(category);
CREATE INDEX IF NOT EXISTS idx_calc_ef_status ON calculator_emission_factors(use_status);
CREATE INDEX IF NOT EXISTS idx_calc_basket_client ON calculator_baskets(client_id);
CREATE INDEX IF NOT EXISTS idx_calc_basket_items_basket ON calculator_basket_items(basket_id);

-- Enable RLS
ALTER TABLE calculator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_compare_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_baskets ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_basket_items ENABLE ROW LEVEL SECURITY;

-- Read policies for all authenticated/anon users
CREATE POLICY "Public read calculator_settings" ON calculator_settings FOR SELECT USING (true);
CREATE POLICY "Public read calculator_emission_factors" ON calculator_emission_factors FOR SELECT USING (true);
CREATE POLICY "Public read calculator_products" ON calculator_products FOR SELECT USING (true);
CREATE POLICY "Public read calculator_compare_pairs" ON calculator_compare_pairs FOR SELECT USING (true);
CREATE POLICY "Public read calculator_baskets" ON calculator_baskets FOR SELECT USING (true);
CREATE POLICY "Public read calculator_basket_items" ON calculator_basket_items FOR SELECT USING (true);

-- Write policies for baskets
CREATE POLICY "Enable insert for calculator_baskets" ON calculator_baskets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for calculator_baskets" ON calculator_baskets FOR UPDATE USING (true);
CREATE POLICY "Enable delete for calculator_baskets" ON calculator_baskets FOR DELETE USING (true);
CREATE POLICY "Enable insert for calculator_basket_items" ON calculator_basket_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for calculator_basket_items" ON calculator_basket_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for calculator_basket_items" ON calculator_basket_items FOR DELETE USING (true);

-- ─── SEED DATA ────────────────────────────────────────────────────────────────

-- Seed Settings
INSERT INTO calculator_settings (setting_key, setting_value, description)
VALUES
  ('rupees_per_usd', '78.6081'::jsonb, '2022 average, Pound Sterling Live, matches EPA 2022 dollar basis'),
  ('factor_version', '"V1 draft, 3 Nov 2026"'::jsonb, 'Emission Factor dataset version')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Seed Emission Factors
INSERT INTO calculator_emission_factors (
  factor_id, category, material_or_product, variant, factor, unit, low, high,
  boundary, region, data_year, use_status, source_grade, fit_for_india, source,
  source_type, link, licence_note, notes
) VALUES
`;

const efValues = raw.emissionFactors.map((ef) => {
  return `  (${esc(ef.factorId)}, ${esc(ef.category)}, ${esc(ef.materialOrProduct)}, ${esc(ef.variant)}, ${ef.factor}, ${esc(ef.unit)}, ${esc(ef.low)}, ${esc(ef.high)}, ${esc(ef.boundary)}, ${esc(ef.region)}, ${esc(ef.dataYear)}, ${esc(ef.useStatus)}, ${esc(ef.sourceGrade)}, ${esc(ef.fitForIndia)}, ${esc(ef.source)}, ${esc(ef.sourceType)}, ${esc(ef.link)}, ${esc(ef.licenceNote)}, ${esc(ef.notes)})`;
});

sql += efValues.join(',\n') + `\nON CONFLICT (factor_id) DO UPDATE SET\n  factor = EXCLUDED.factor,\n  unit = EXCLUDED.unit,\n  use_status = EXCLUDED.use_status,\n  source = EXCLUDED.source;\n\n`;

sql += `-- Seed Products
INSERT INTO calculator_products (
  product_id, item_group, category, product_name, unit, product_type, route,
  factor_id_a, share_a, factor_id_b, share_b, weight_per_unit_kg, weight_or_price_basis,
  basis_type, typical_price_inr, factor, estimate_kg_co2e_per_unit, source_grade,
  confidence, compare_with, compare_status, compare_note, current_catalogue_category, factor_used
) VALUES
`;

const prodValues = raw.products.map((p) => {
  return `  (${esc(p.productId)}, ${esc(p.group)}, ${esc(p.category)}, ${esc(p.product)}, ${esc(p.unit)}, ${esc(p.type)}, ${esc(p.route)}, ${esc(p.factorIdA)}, ${p.shareA}, ${esc(p.factorIdB)}, ${p.shareB}, ${esc(p.weightPerUnitKg)}, ${esc(p.weightOrPriceBasis)}, ${esc(p.basisType)}, ${esc(p.typicalPriceInr)}, ${esc(p.factor)}, ${p.estimateKgCo2ePerUnit}, ${esc(p.sourceGrade)}, ${esc(p.confidence)}, ${esc(p.compareWith)}, ${esc(p.compareStatus)}, ${esc(p.compareNote)}, ${esc(p.currentCatalogueCategory)}, ${esc(p.factorUsed)})`;
});

sql += prodValues.join(',\n') + `\nON CONFLICT (product_id) DO UPDATE SET\n  estimate_kg_co2e_per_unit = EXCLUDED.estimate_kg_co2e_per_unit,\n  confidence = EXCLUDED.confidence,\n  route = EXCLUDED.route;\n\n`;

sql += `-- Seed Compare Pairs
INSERT INTO calculator_compare_pairs (
  conventional_product, conventional_kg_co2e, alternative_product, alternative_kg_co2e,
  difference_kg_co2e, change_pct, status, notes
) VALUES
`;

const cpValues = raw.comparePairs.map((cp) => {
  return `  (${esc(cp.conventionalProduct)}, ${cp.conventionalKgCo2e}, ${esc(cp.alternative)}, ${cp.alternativeKgCo2e}, ${cp.differenceKgCo2e}, ${esc(cp.change)}, ${esc(cp.status)}, ${esc(cp.note)})`;
});

sql += cpValues.join(',\n') + `;\n`;

fs.writeFileSync(path.join(__dirname, '../supabase/migrations/create_varna_calculator.sql'), sql, 'utf8');
console.log('Successfully generated supabase/migrations/create_varna_calculator.sql');

