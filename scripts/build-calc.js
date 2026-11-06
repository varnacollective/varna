const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/calculator-raw.json'), 'utf8'));

const tsCode = `// Varna Carbon Calculator Data & Calculation Logic
// Source: Varna_Calculator_V1.xlsx
// Generated with strict adherence to Varna domain rules and licensing constraints
// Licensing: ecoinvent Reference-only factors excluded. 111 Recommended & Recommended proxy factors loaded.

export interface CalculatorSettings {
  rupeesPerUsd: number;
  factorVersion: string;
}

export interface EmissionFactor {
  factorId: string;
  category: string;
  materialOrProduct: string;
  variant: string | null;
  factor: number;
  unit: string;
  low: number | null;
  high: number | null;
  boundary: string | null;
  region: string | null;
  dataYear: string | null;
  useStatus: string;
  sourceGrade: string | null;
  fitForIndia: string | null;
  source: string;
  sourceType: string | null;
  link: string | null;
  licenceNote: string | null;
  notes: string | null;
}

export type CalculationRoute = 'Weight' | 'Per unit' | 'Spend';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface CalculatorProduct {
  productId: string;
  group: string; // 'Guest room' | 'Food service' | 'Back of house' | 'Larger purchases'
  category: string;
  product: string;
  unit: string;
  type: string | null;
  route: CalculationRoute;
  factorIdA: string | null;
  shareA: number;
  factorIdB: string | null;
  shareB: number;
  weightPerUnitKg: number | null;
  weightOrPriceBasis: string | null;
  basisType: string | null;
  typicalPriceInr: number | null;
  factor: number | null;
  estimateKgCo2ePerUnit: number;
  sourceGrade: string | null;
  confidence: ConfidenceLevel;
  compareWith: string | null;
  compareStatus: string | null; // 'Show' | 'Hold'
  compareNote: string | null;
  currentCatalogueCategory: string | null;
  factorUsed: string | null;
}

export interface ComparePair {
  conventionalProduct: string;
  conventionalKgCo2e: number;
  alternative: string;
  alternativeKgCo2e: number;
  differenceKgCo2e: number;
  change: string;
  status: string; // 'Show' | 'Hold'
  note: string | null;
}

export interface BasketLineItem {
  id?: string;
  lineNumber: number;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  customWeightKg: number | null;
  customPriceInr: number | null;
  unit: string;
  unitCo2eKg: number;
  lineCo2eKg: number;
  confidence: ConfidenceLevel;
  compareWith: string | null;
  alternativeUnitCo2eKg: number | null;
  savingKgCo2e: number;
  compareNote: string | null;
  isCustomized?: boolean;
}

export interface BasketSummary {
  totalCo2eKg: number;
  totalCo2eTonnes: number;
  netSavingKg: number;
  lowConfidenceShare: number;
  categoryBreakdown: { category: string; kgCo2e: number; percentage: number }[];
}

export const CALCULATOR_SETTINGS: CalculatorSettings = ${JSON.stringify(raw.settings, null, 2)};

export const EMISSION_FACTORS: EmissionFactor[] = ${JSON.stringify(raw.emissionFactors, null, 2)};

export const CALCULATOR_PRODUCTS: CalculatorProduct[] = ${JSON.stringify(raw.products, null, 2)};

export const COMPARE_PAIRS: ComparePair[] = ${JSON.stringify(raw.comparePairs, null, 2)};

export const INITIAL_BASKET_ITEMS: BasketLineItem[] = ${JSON.stringify(raw.initialBasket, null, 2)};

// ─── Business Calculation Helpers ─────────────────────────────────────────────

export const EF_MAP = new Map<string, EmissionFactor>(
  EMISSION_FACTORS.map((ef) => [ef.factorId, ef])
);

export const PRODUCT_MAP = new Map<string, CalculatorProduct>(
  CALCULATOR_PRODUCTS.map((p) => [p.productId, p])
);

export const PRODUCT_NAME_MAP = new Map<string, CalculatorProduct>(
  CALCULATOR_PRODUCTS.map((p) => [p.product.toLowerCase().trim(), p])
);

export const COMPARE_PAIRS_MAP = new Map<string, ComparePair>(
  COMPARE_PAIRS.map((cp) => [cp.conventionalProduct.toLowerCase().trim(), cp])
);

/**
 * Calculates composite factor P:
 * P = Share_A * Factor_A + Share_B * Factor_B
 */
export function calculateCompositeFactor(prod: CalculatorProduct): number {
  if (prod.factor != null && !isNaN(prod.factor)) return prod.factor;

  const efA = prod.factorIdA ? EF_MAP.get(prod.factorIdA) : null;
  const efB = prod.factorIdB ? EF_MAP.get(prod.factorIdB) : null;

  const valA = efA ? efA.factor : 0;
  const valB = efB ? efB.factor : 0;

  return (prod.shareA || 1.0) * valA + (prod.shareB || 0.0) * valB;
}

/**
 * Calculates the unit kg CO2e for a given product and optional custom weight/price.
 * Weight route: weight * P
 * Per unit route: P
 * Spend route: (price / rupeesPerUsd) * P
 */
export function calculateUnitCo2e(
  prod: CalculatorProduct,
  customWeightKg?: number | null,
  customPriceInr?: number | null
): { unitCo2eKg: number; effectiveConfidence: ConfidenceLevel; isCustomized: boolean } {
  const p = calculateCompositeFactor(prod);
  let effectiveConfidence: ConfidenceLevel = prod.confidence;
  let isCustomized = false;
  let unitCo2eKg = prod.estimateKgCo2ePerUnit;

  if (prod.route === 'Weight') {
    if (customWeightKg != null && !isNaN(customWeightKg) && customWeightKg > 0) {
      isCustomized = true;
      const factorRate = p > 0 ? p : (prod.weightPerUnitKg ? prod.estimateKgCo2ePerUnit / prod.weightPerUnitKg : prod.estimateKgCo2ePerUnit);
      unitCo2eKg = customWeightKg * factorRate;
      // Dynamic confidence rule: entering user-verified weight elevates Medium to High
      if (effectiveConfidence === 'Medium') {
        effectiveConfidence = 'High';
      }
    } else {
      unitCo2eKg = prod.estimateKgCo2ePerUnit;
    }
  } else if (prod.route === 'Spend') {
    if (customPriceInr != null && !isNaN(customPriceInr) && customPriceInr > 0) {
      isCustomized = true;
      const factorRate = p > 0 ? p : (prod.typicalPriceInr ? (prod.estimateKgCo2ePerUnit * CALCULATOR_SETTINGS.rupeesPerUsd) / prod.typicalPriceInr : 0);
      unitCo2eKg = (customPriceInr / CALCULATOR_SETTINGS.rupeesPerUsd) * factorRate;
      // Dynamic confidence rule: entering user actual price elevates Low to Medium
      if (effectiveConfidence === 'Low') {
        effectiveConfidence = 'Medium';
      }
    } else {
      unitCo2eKg = prod.estimateKgCo2ePerUnit;
    }
  } else {
    // Per unit
    unitCo2eKg = prod.estimateKgCo2ePerUnit > 0 ? prod.estimateKgCo2ePerUnit : p;
  }

  return { unitCo2eKg, effectiveConfidence, isCustomized };
}

/**
 * Computes line total and savings if alternative switched
 */
export function calculateLineTotal(
  prod: CalculatorProduct,
  quantity: number,
  customWeightKg?: number | null,
  customPriceInr?: number | null
): BasketLineItem {
  const { unitCo2eKg, effectiveConfidence, isCustomized } = calculateUnitCo2e(
    prod,
    customWeightKg,
    customPriceInr
  );

  const lineCo2eKg = quantity * unitCo2eKg;

  // Check compare pairs
  const pair = COMPARE_PAIRS_MAP.get(prod.product.toLowerCase().trim());
  let compareWith: string | null = null;
  let alternativeUnitCo2eKg: number | null = null;
  let savingKgCo2e = 0;
  let compareNote: string | null = null;

  if (pair && pair.status === 'Show') {
    compareWith = pair.alternative;
    alternativeUnitCo2eKg = pair.alternativeKgCo2e;
    savingKgCo2e = quantity * (unitCo2eKg - pair.alternativeKgCo2e);
    compareNote = pair.note;
  } else if (prod.compareWith && prod.compareStatus === 'Show') {
    const altProd = PRODUCT_NAME_MAP.get(prod.compareWith.toLowerCase().trim());
    if (altProd) {
      compareWith = altProd.product;
      alternativeUnitCo2eKg = altProd.estimateKgCo2ePerUnit;
      savingKgCo2e = quantity * (unitCo2eKg - altProd.estimateKgCo2ePerUnit);
      compareNote = prod.compareNote;
    }
  }

  return {
    lineNumber: 1,
    productId: prod.productId,
    productName: prod.product,
    category: prod.category,
    quantity,
    customWeightKg: customWeightKg ?? null,
    customPriceInr: customPriceInr ?? null,
    unit: prod.unit,
    unitCo2eKg,
    lineCo2eKg,
    confidence: effectiveConfidence,
    compareWith,
    alternativeUnitCo2eKg,
    savingKgCo2e,
    compareNote,
    isCustomized,
  };
}

/**
 * Calculates complete summary of the user basket
 */
export function calculateBasketSummary(items: BasketLineItem[]): BasketSummary {
  let totalCo2eKg = 0;
  let netSavingKg = 0;
  let lowConfidenceCo2eKg = 0;
  const catMap: Record<string, number> = {};

  for (const item of items) {
    totalCo2eKg += item.lineCo2eKg;
    if (item.savingKgCo2e > 0) {
      netSavingKg += item.savingKgCo2e;
    }
    if (item.confidence === 'Low') {
      lowConfidenceCo2eKg += item.lineCo2eKg;
    }
    catMap[item.category] = (catMap[item.category] || 0) + item.lineCo2eKg;
  }

  const totalCo2eTonnes = totalCo2eKg / 1000;
  const lowConfidenceShare = totalCo2eKg > 0 ? lowConfidenceCo2eKg / totalCo2eKg : 0;

  const categoryBreakdown = Object.entries(catMap)
    .map(([category, kgCo2e]) => ({
      category,
      kgCo2e,
      percentage: totalCo2eKg > 0 ? (kgCo2e / totalCo2eKg) * 100 : 0,
    }))
    .sort((a, b) => b.kgCo2e - a.kgCo2e);

  return {
    totalCo2eKg,
    totalCo2eTonnes,
    netSavingKg,
    lowConfidenceShare,
    categoryBreakdown,
  };
}
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/calculator-data.ts'), tsCode, 'utf8');
console.log('Successfully generated src/lib/calculator-data.ts');

