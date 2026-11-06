import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  CALCULATOR_SETTINGS,
  EMISSION_FACTORS,
  CALCULATOR_PRODUCTS,
  COMPARE_PAIRS,
} from "@/lib/calculator-data";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Seed settings
    const { error: setErr } = await supabase.from("calculator_settings").upsert([
      {
        setting_key: "rupees_per_usd",
        setting_value: CALCULATOR_SETTINGS.rupeesPerUsd,
        description: "2022 average, Pound Sterling Live, matches EPA 2022 dollar basis",
      },
      {
        setting_key: "factor_version",
        setting_value: CALCULATOR_SETTINGS.factorVersion,
        description: "Emission Factor dataset version",
      },
    ]);

    // 2. Seed emission factors (in chunks of 50)
    const efPayload = EMISSION_FACTORS.map((ef) => ({
      factor_id: ef.factorId,
      category: ef.category,
      material_or_product: ef.materialOrProduct,
      variant: ef.variant,
      factor: ef.factor,
      unit: ef.unit,
      low: ef.low,
      high: ef.high,
      boundary: ef.boundary,
      region: ef.region,
      data_year: ef.dataYear,
      use_status: ef.useStatus,
      source_grade: ef.sourceGrade,
      fit_for_india: ef.fitForIndia,
      source: ef.source,
      source_type: ef.sourceType,
      link: ef.link,
      licence_note: ef.licenceNote,
      notes: ef.notes,
    }));

    for (let i = 0; i < efPayload.length; i += 50) {
      const chunk = efPayload.slice(i, i + 50);
      await supabase.from("calculator_emission_factors").upsert(chunk);
    }

    // 3. Seed products (in chunks of 50)
    const prodPayload = CALCULATOR_PRODUCTS.map((p) => ({
      product_id: p.productId,
      item_group: p.group,
      category: p.category,
      product_name: p.product,
      unit: p.unit,
      product_type: p.type,
      route: p.route,
      factor_id_a: p.factorIdA,
      share_a: p.shareA,
      factor_id_b: p.factorIdB,
      share_b: p.shareB,
      weight_per_unit_kg: p.weightPerUnitKg,
      weight_or_price_basis: p.weightOrPriceBasis,
      basis_type: p.basisType,
      typical_price_inr: p.typicalPriceInr,
      factor: p.factor,
      estimate_kg_co2e_per_unit: p.estimateKgCo2ePerUnit,
      source_grade: p.sourceGrade,
      confidence: p.confidence,
      compare_with: p.compareWith,
      compare_status: p.compareStatus,
      compare_note: p.compareNote,
      current_catalogue_category: p.currentCatalogueCategory,
      factor_used: p.factorUsed,
    }));

    for (let i = 0; i < prodPayload.length; i += 50) {
      const chunk = prodPayload.slice(i, i + 50);
      await supabase.from("calculator_products").upsert(chunk);
    }

    return NextResponse.json({
      success: true,
      message: "Calculator tables successfully seeded",
      counts: {
        emissionFactors: EMISSION_FACTORS.length,
        products: CALCULATOR_PRODUCTS.length,
        comparePairs: COMPARE_PAIRS.length,
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed calculator tables",
        localFallbackReady: true,
      },
      { status: 500 }
    );
  }
}

