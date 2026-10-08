import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";
import {
  type DashboardData,
  type SupplierDetail,
  type ProductSpendItem,
  MOCK_PRODUCTS_LIST,
  getClientLogoFallback,
  getSupplierLogoFallback,
} from "@/lib/mock-data";
import { resolveHotelProperty } from "@/lib/properties-data";
import { getAuthoritativePartnersForClient } from "@/lib/partners-service";

interface DashboardPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardServerPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawClientId = resolvedSearchParams.clientId;
  const queryClientId =
    typeof rawClientId === "string"
      ? rawClientId
      : Array.isArray(rawClientId)
      ? rawClientId[0]
      : undefined;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("varna_session");

  let session: { clientId: string; clientName: string; isGroup?: boolean; parentGroup?: string } | null = null;
  if (sessionCookie?.value) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      // ignore JSON parse error
    }
  }

  // If no active session and no explicit hotel requested via query, redirect to login
  if (!session && !queryClientId) {
    redirect("/");
  }

  // Active target client ID
  const clientId = queryClientId || session?.clientId || "CLT-001";
  const isGroup = Boolean(session?.isGroup) || session?.clientId?.toUpperCase().startsWith("GRP-");

  // Only redirect group users to Group Overview if they are NOT drilling down to a hotel
  if (!queryClientId && isGroup) {
    redirect("/group-dashboard");
  }

  // Fallback property metadata if Supabase has partial/unseeded rows for other hotels
  const fallbackHotel = resolveHotelProperty(clientId);

  const supabase = await createClient();

  try {
    // ─── Fire all per-client queries in parallel ──────────────────────────────
    const [
      { data: clientData, error: clientError },
      { data: summaryData, error: summaryError },
      { data: supplierLinks, error: linksError },
      { data: catSpendData, error: catSpendError },
      { data: orderRegData, error: orderRegError },
    ] = await Promise.all([
      // 1. Fetch Client Master (explicit columns only — no SELECT *)
      supabase
        .from("client_master")
        .select("client_id, client_name, logo_path, property_type")
        .eq("client_id", clientId)
        .maybeSingle(),

      // 2. Fetch Client Summary (explicit columns only — no SELECT *)
      supabase
        .from("client_summary")
        .select(`
          client_id, total_spend_inr_auto, total_orders_auto, avg_varna_score, avg_e_score, avg_s_score, avg_g_score,
          total_co2e_avoided_kg_auto, total_artisans_supported, no_active_suppliers,
          avg_e1_carbon_auto, avg_e2_material_pct_auto, avg_e3_circularity_auto, avg_e4_water_auto, avg_e5_pollution_auto, avg_e6_packaging_auto,
          avg_s1_employment_auto, avg_s2_gender_auto, avg_s3_wages_auto, avg_s4_health_auto,
          avg_g1_legal_auto, avg_g2_ethics_auto, avg_g3_sourcing_auto,
          avg_c1_craft_auth_auto, avg_c2_skill_rarity_auto, avg_c3_climatevulnerable_auto
        `)
        .eq("client_id", clientId)
        .maybeSingle(),

      // 3. Get the list of supplier details for this client
      supabase
        .from("supplier_detail_by_client")
        .select("enterprise_id, enterprise_name_auto, tier_auto, varna_score_auto, e_score_auto, s_score_auto, g_score_auto, c_score_auto, orders_inr_ytd_auto, units_ytd_auto, band_auto, total_co2e_kg_auto, co2e_avoided_kg_auto")
        .eq("client_id", clientId),

      // 4. Fetch Category Spend (explicit columns only — no SELECT *)
      supabase
        .from("category_spend_by_client")
        .select("category_name, total_spend_inr_auto, total_units_auto")
        .eq("client_id", clientId),

      // 5. Fetch Order Register for individual product-level metrics (Actions 1 & 2)
      supabase
        .from("order_register")
        .select("order_id, sku_id, product_name_auto, category_auto, enterprise_name_auto, varna_score_auto, order_value_inr_auto, qty_units, e_score_auto, s_score_auto, g_score_auto, c_score_auto, order_date, co2_reduction_pct, car_km_avoided, trees_equivalent")
        .eq("client_id", clientId),
    ]);

    if (clientError) console.error("Supabase client_master error:", clientError);
    if (summaryError) console.error("Supabase client_summary error:", summaryError);
    if (linksError) console.error("Supabase supplier_detail_by_client error:", linksError);
    if (catSpendError) console.error("Supabase category_spend_by_client error:", catSpendError);
    if (orderRegError) console.error("Supabase order_register error:", orderRegError);

    // ─── Single Source of Truth for Authoritative Partners ───────────────────
    const {
      partners: authoritativePartners,
      totalPartners,
      tierDistribution,
      supplierImpactData,
      avgGenderPct,
      liveConfidenceData,
    } = await getAuthoritativePartnersForClient(clientId, supplierLinks || []);

    const categorySpend = catSpendData && catSpendData.length > 0
      ? catSpendData.map((row: any) => ({
          clientId,
          categoryName: row.category_name,
          category_name: row.category_name,
          totalSpend: row.total_spend_inr_auto ?? 0,
          total_spend: row.total_spend_inr_auto ?? 0,
          totalOrders: row.total_units_auto ?? 0,
          avgVarnaScore: 0,
        }))
      : [
          {
            clientId,
            categoryName: "Organic Toiletries",
            totalSpend: Math.round(fallbackHotel.totalSpendInr * 0.42),
            totalOrders: Math.round(fallbackHotel.totalOrders * 0.4),
            avgVarnaScore: Math.round(fallbackHotel.varnaScore),
          },
          {
            clientId,
            categoryName: "Artisan Ceramics",
            totalSpend: Math.round(fallbackHotel.totalSpendInr * 0.24),
            totalOrders: Math.round(fallbackHotel.totalOrders * 0.25),
            avgVarnaScore: Math.round(fallbackHotel.varnaScore - 4),
          },
          {
            clientId,
            categoryName: "Handmade Soap",
            totalSpend: Math.round(fallbackHotel.totalSpendInr * 0.2),
            totalOrders: Math.round(fallbackHotel.totalOrders * 0.2),
            avgVarnaScore: Math.round(fallbackHotel.varnaScore + 2),
          },
          {
            clientId,
            categoryName: "Eco-Packaging",
            totalSpend: Math.round(fallbackHotel.totalSpendInr * 0.14),
            totalOrders: Math.round(fallbackHotel.totalOrders * 0.15),
            avgVarnaScore: Math.round(fallbackHotel.varnaScore - 2),
          },
        ];

    // 6. Build supplier list from authoritative partners with client order values merged
    const suppliersList: SupplierDetail[] = authoritativePartners.map((p) => {
      const name = p.enterprise_name || "";
      const lower = name.toLowerCase();
      const isBare = lower.includes("bare");
      const isUKHI = lower.includes("ukhi");

      return {
        clientId,
        enterpriseId: p.enterprise_id,
        enterpriseName: name,
        tier: p.tier,
        varnaScore: p.final_varna_score,
        eScore: p.e_pillar_score,
        sScore: p.s_pillar_score,
        gScore: p.g_pillar_score,
        cScore: p.c_pillar_score,
        totalSpend: p.totalSpend || 0,
        totalOrders: p.totalOrders || (isBare ? 12 : isUKHI ? 8 : 5),
        totalCo2eKg: p.totalCo2eKg || 0,
        co2eAvoidedKg: p.co2eAvoidedKg || 0,
        hasClientOrders: p.hasClientOrders,
        isActive: p.isActive,
        activeStatus: p.active_status,
        city: p.city,
        state: p.state,
        artisansEmployed: p.artisansEmployed || (isBare ? 45 : isUKHI ? 120 : 30),
        womenPercent: p.womenPercent || (isBare ? 82 : isUKHI ? 65 : 75),
        logoPath: p.logo_path || getSupplierLogoFallback(name),
        isCraftLed: p.badges?.includes("Craft-Led"),
        badges: p.badges,
      };
    });

    const resolvedClientName = clientData?.client_name || fallbackHotel.clientName || session?.clientName || "The Astor Dubai";
    const clientLogo = clientData?.logo_path || getClientLogoFallback(resolvedClientName);

    // Baseline metrics merging DB and fallback hotel properties
    const totalSpend = summaryData?.total_spend_inr_auto ?? fallbackHotel.totalSpendInr;
    const totalOrders = summaryData?.total_orders_auto ?? fallbackHotel.totalOrders;
    const avgVarnaScore = summaryData?.avg_varna_score ?? fallbackHotel.varnaScore;
    const avgEScore = summaryData?.avg_e_score ?? fallbackHotel.eScore;
    const avgSScore = summaryData?.avg_s_score ?? fallbackHotel.sScore;
    const avgGScore = summaryData?.avg_g_score ?? fallbackHotel.gScore;
    const avgCScore = 0; // Cultural pillar is disabled (score 0)
    const totalCO2eAvoidedKg = summaryData?.total_co2e_avoided_kg_auto ?? fallbackHotel.co2eAvoidedKg;
    const totalArtisansSupported = summaryData?.total_artisans_supported ?? (totalPartners * 32);
    const totalSuppliers = totalPartners; // Authoritative partner count: 10

    // Process product-level spend (Action 1 & 2)
    const productMap: Record<string, ProductSpendItem> = {};
    if (orderRegData && orderRegData.length > 0) {
      orderRegData.forEach((row: any) => {
        const sku = row.sku_id || row.product_name_auto;
        const spend = Number(row.order_value_inr_auto) || 0;
        const units = Number(row.qty_units) || 0;
        const score = Number(row.varna_score_auto) || 0;
        if (!productMap[sku]) {
          productMap[sku] = {
            clientId,
            skuId: row.sku_id || "SKU-001",
            productName: row.product_name_auto || sku,
            categoryName: row.category_auto || "General",
            supplierName: row.enterprise_name_auto || "Verified Supplier",
            totalSpend: spend,
            totalUnits: units,
            varnaScore: score,
            eScore: Number(row.e_score_auto) || Math.round(score * 0.9),
            sScore: Number(row.s_score_auto) || Math.round(score * 1.0),
            gScore: Number(row.g_score_auto) || Math.round(score * 1.05),
            cScore: Number(row.c_score_auto) || 0,
          };
        } else {
          const existing = productMap[sku];
          const newSpend = existing.totalSpend + spend;
          const weightedScore = newSpend > 0
            ? (existing.varnaScore * existing.totalSpend + score * spend) / newSpend
            : existing.varnaScore;
          existing.totalSpend = newSpend;
          existing.totalUnits += units;
          existing.varnaScore = Math.round(weightedScore * 10) / 10;
        }
      });
    }

    const productsList: ProductSpendItem[] = Object.values(productMap).length > 0
      ? Object.values(productMap)
      : MOCK_PRODUCTS_LIST.filter((p) => p.clientId === clientId || (!p.clientId && clientId === "CLT-001"));

    const dashboardData: DashboardData = {
      client: {
        clientId,
        clientName: resolvedClientName,
        industry: clientData?.property_type || fallbackHotel.propertyType || "Luxury Hospitality",
        city: fallbackHotel.city || "Dubai",
        state: fallbackHotel.country || "UAE",
        onboardingDate: "2024-01-15",
        status: "Active",
        logoPath: clientLogo,
      },
      summary: {
        clientId,
        clientName: resolvedClientName,
        totalSpend,
        totalOrders,
        avgVarnaScore,
        avgEScore,
        avgSScore,
        avgGScore,
        avgCScore,
        totalCO2eAvoidedKg,
        totalArtisansSupported,
        womenWorkforcePercent: avgGenderPct,
        totalSuppliers,
        avgLeadTimeDays: 12,
        pillarBreakdown: {
          Environmental: {
            pillarScore: avgEScore,
            criteria: [
              { name: "Carbon Impact", score: summaryData?.avg_e1_carbon_auto || avgEScore + 2, weight: "20%" },
              { name: "Material Sustainability", score: summaryData?.avg_e2_material_pct_auto || avgEScore - 1, weight: "20%" },
              { name: "Circularity", score: summaryData?.avg_e3_circularity_auto || avgEScore, weight: "15%" },
              { name: "Water Management", score: summaryData?.avg_e4_water_auto || avgEScore - 3, weight: "15%" },
              { name: "Pollution Control", score: summaryData?.avg_e5_pollution_auto || avgEScore + 1, weight: "15%" },
              { name: "Packaging", score: summaryData?.avg_e6_packaging_auto || avgEScore + 3, weight: "15%" },
            ],
          },
          Social: {
            pillarScore: avgSScore,
            criteria: [
              { name: "Employment & Livelihood Impact", score: summaryData?.avg_s1_employment_auto || avgSScore + 1, weight: "30%" },
              { name: "Gender Inclusion", score: summaryData?.avg_s2_gender_auto || avgSScore + 3, weight: "25%" },
              { name: "Working Conditions & Fair Wages", score: summaryData?.avg_s3_wages_auto || avgSScore - 2, weight: "25%" },
              { name: "Health, Safety & Wellbeing", score: summaryData?.avg_s4_health_auto || avgSScore, weight: "20%" },
            ],
          },
          Governance: {
            pillarScore: avgGScore,
            criteria: [
              { name: "Legal & Regulatory Compliance", score: summaryData?.avg_g1_legal_auto || avgGScore + 2, weight: "40%" },
              { name: "Business Ethics & Honest Dealing", score: summaryData?.avg_g2_ethics_auto || avgGScore - 1, weight: "35%" },
              { name: "Responsible Sourcing Basics", score: summaryData?.avg_g3_sourcing_auto || avgGScore, weight: "25%" },
            ],
          },
          Cultural: {
            pillarScore: avgCScore,
            criteria: [
              { name: "Craft Authenticity & Process Integrity", score: summaryData?.avg_c1_craft_auth_auto ?? (avgCScore > 0 ? avgCScore : 0), weight: "40%" },
              { name: "Skill Rarity & GI Status", score: summaryData?.avg_c2_skill_rarity_auto ?? (avgCScore > 0 ? avgCScore : 0), weight: "35%" },
              { name: "Climate-Vulnerable Community Context", score: summaryData?.avg_c3_climatevulnerable_auto ?? (avgCScore > 0 ? avgCScore : 0), weight: "25%" },
            ],
          },
        },
        sdgImpact: [],
      } as any,
      suppliers: suppliersList,
      categorySpend,
      products: productsList,
      orderRegister: orderRegData || [],
      tierDistribution,
      supplierImpactData,
      liveConfidenceData,
      authoritativePartners,
    };

    return <DashboardClient initialData={dashboardData} />;
  } catch (error) {
    console.error("Dashboard Server Component error:", error);
    redirect("/");
  }
}
