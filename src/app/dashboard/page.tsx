import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";
import {
  type DashboardData,
  type SupplierDetail,
  getClientLogoFallback,
  getSupplierLogoFallback,
} from "@/lib/mock-data";
import { resolveHotelProperty } from "@/lib/properties-data";

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
    // 1. Fetch Client Master
    const { data: clientData, error: clientError } = await supabase
      .from("client_master")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    if (clientError) {
      console.error("Supabase client_master error:", clientError);
    }

    // 2. Fetch Client Summary (Overview Page KPI Metrics)
    const { data: summaryData, error: summaryError } = await supabase
      .from("client_summary")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    if (summaryError) {
      console.error("Supabase client_summary error:", summaryError);
    }

    // 3. Get the list of supplier IDs for this client
    const { data: supplierLinks, error: linksError } = await supabase
      .from("supplier_detail_by_client")
      .select("enterprise_id")
      .eq("client_id", clientId);

    if (linksError) {
      console.error("Supabase supplier_detail_by_client error:", linksError);
    }

    // 4. Fetch Assessment Inputs (Supplier Tier Distribution & Impact Metrics)
    let assessmentData: any[] = [];
    const { data: allAssessmentData, error: assessmentError } = await supabase
      .from("assessment_inputs")
      .select("enterprise_name_auto, tier_used_auto, s2_gender_input_pct_women, s3_wages_input_wage_ratio");

    if (assessmentError) {
      console.error("Supabase assessment_inputs error:", assessmentError);
    } else {
      assessmentData = allAssessmentData || [];
    }

    // Calculate Average Gender Representation (% Women) in TypeScript
    const validGenderPctValues = assessmentData
      .map((row: any) => row.s2_gender_input_pct_women)
      .filter((val: any) => val !== null && val !== undefined && val !== "" && !isNaN(Number(val)))
      .map((val: any) => Number(val));

    const calculatedAvgGenderPct = validGenderPctValues.length > 0
      ? Math.round(validGenderPctValues.reduce((acc, curr) => acc + curr, 0) / validGenderPctValues.length)
      : 68;

    // Process Supplier Tier Distribution
    let platinum = 0, gold = 0, silver = 0;
    let microA = 0, microB = 0, small = 0, medium = 0;

    assessmentData?.forEach((row: any) => {
      const tier = (row.tier_used_auto || "").toLowerCase();
      if (tier.includes("platinum") || tier.includes("medium")) { platinum++; medium++; }
      else if (tier.includes("gold") || tier.includes("small")) { gold++; small++; }
      else if (tier.includes("silver") || tier.includes("micro b")) { silver++; microB++; }
      else { silver++; microA++; }
    });

    const tierDistribution = [
      {
        tier: "Platinum",
        count: fallbackHotel.varnaLeaders > 0 ? fallbackHotel.varnaLeaders : (platinum > 0 ? platinum : 2),
        color: "#7A3F1E",
      },
      {
        tier: "Gold",
        count: Math.max(1, fallbackHotel.activeSuppliers - (fallbackHotel.varnaLeaders || 0)),
        color: "#738678",
      },
      {
        tier: "Silver",
        count: silver > 0 ? silver : 1,
        color: "#6F848F",
      },
    ];

    // Calculate Impact Metrics (Gender & Wages)
    const supplierImpactData = assessmentData && assessmentData.length > 0
      ? assessmentData.map((row: any) => ({
          name: row.enterprise_name_auto,
          womenPct: Number(row.s2_gender_input_pct_women) || 0,
          wageRatio: Number(row.s3_wages_input_wage_ratio) || 0,
        }))
      : [
          { name: "Bare Necessities", womenPct: 82, wageRatio: 1.8 },
          { name: "UKHI India", womenPct: 65, wageRatio: 1.4 },
          { name: "Kheoni Ventures", womenPct: 75, wageRatio: 1.6 },
        ];

    // 5. Fetch Category Spend
    const { data: catSpendData, error: catSpendError } = await supabase
      .from("category_spend_by_client")
      .select("*")
      .eq("client_id", clientId);

    if (catSpendError) {
      console.error("Supabase category_spend_by_client error:", catSpendError);
    }

    const categorySpend = catSpendData && catSpendData.length > 0
      ? catSpendData.map((row: any) => ({
          clientId,
          categoryName: row.category_name,
          totalSpend: row.total_spend_inr_auto ?? 0,
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

    // 6. Fetch Suppliers for Dashboard Portfolio View (Maintained static/global across views)
    const { data: scoresData } = await supabase
      .from("scores_summary")
      .select("enterprise_id, enterprise_name, logo_path, final_varna_score, e_pillar_score, s_pillar_score, g_pillar_score, c_pillar_score");

    const suppliersList: SupplierDetail[] = (scoresData && scoresData.length > 0 ? scoresData : [
      { enterprise_name: "Bare Necessities Zero Waste Solutions Pvt. Ltd.", enterprise_id: "ENT-001", final_varna_score: 78, e_pillar_score: 75, s_pillar_score: 80, g_pillar_score: 70, c_pillar_score: 72 },
      { enterprise_name: "UKHI INDIA PRIVATE LIMITED", enterprise_id: "ENT-002", final_varna_score: 56, e_pillar_score: 60, s_pillar_score: 55, g_pillar_score: 50, c_pillar_score: 45 },
      { enterprise_name: "Kheoni Ventures Pvt Ltd", enterprise_id: "ENT-003", final_varna_score: 42, e_pillar_score: 40, s_pillar_score: 45, g_pillar_score: 40, c_pillar_score: 35 },
      { enterprise_name: "Greensole Footwear Pvt Ltd", enterprise_id: "ENT-004", final_varna_score: 72, e_pillar_score: 70, s_pillar_score: 75, g_pillar_score: 68, c_pillar_score: 65 },
      { enterprise_name: "Marikar Green Earth Private Limited", enterprise_id: "ENT-005", final_varna_score: 64, e_pillar_score: 62, s_pillar_score: 65, g_pillar_score: 60, c_pillar_score: 58 },
    ]).map((s: any) => {
      const name = s.enterprise_name || "";
      const lower = name.toLowerCase();
      const isBare = lower.includes("bare");
      const isUKHI = lower.includes("ukhi");
      const tier = isBare ? "Platinum" : isUKHI ? "Gold" : "Silver";

      return {
        clientId,
        enterpriseId: s.enterprise_id || name,
        enterpriseName: name,
        tier,
        varnaScore: s.final_varna_score ?? 0,
        eScore: s.e_pillar_score ?? 0,
        sScore: s.s_pillar_score ?? 0,
        gScore: s.g_pillar_score ?? 0,
        cScore: s.c_pillar_score ?? 0,
        totalSpend: isBare ? 1680000 : isUKHI ? 960000 : 800000,
        totalOrders: isBare ? 12 : isUKHI ? 8 : 5,
        city: isBare ? "Bengaluru" : isUKHI ? "Faridabad" : "Indore",
        state: isBare ? "Karnataka" : isUKHI ? "Haryana" : "Madhya Pradesh",
        artisansEmployed: isBare ? 45 : isUKHI ? 120 : 30,
        womenPercent: isBare ? 82 : isUKHI ? 65 : 75,
        logoPath: s.logo_path || getSupplierLogoFallback(name),
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
    const totalArtisansSupported = summaryData?.total_artisans_supported ?? (fallbackHotel.activeSuppliers * 320);
    const totalSuppliers = summaryData?.no_active_suppliers ?? fallbackHotel.activeSuppliers;

    const dashboardData: DashboardData = {
      client: {
        clientId,
        clientName: resolvedClientName,
        industry: clientData?.industry || fallbackHotel.propertyType || "Luxury Hospitality",
        city: clientData?.city || fallbackHotel.city || "Dubai",
        state: clientData?.state || fallbackHotel.country || "UAE",
        onboardingDate: clientData?.onboarding_date || "2024-01-15",
        status: clientData?.status || "Active",
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
        womenWorkforcePercent: calculatedAvgGenderPct,
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
            ]
          },
          Social: { 
            pillarScore: avgSScore, 
            criteria: [
              { name: "Employment & Livelihood Impact", score: summaryData?.avg_s1_employment_auto || avgSScore + 1, weight: "30%" },
              { name: "Gender Inclusion", score: summaryData?.avg_s2_gender_auto || avgSScore + 3, weight: "25%" },
              { name: "Working Conditions & Fair Wages", score: summaryData?.avg_s3_wages_auto || avgSScore - 2, weight: "25%" },
              { name: "Health, Safety & Wellbeing", score: summaryData?.avg_s4_health_auto || avgSScore, weight: "20%" },
            ]
          },
          Governance: { 
            pillarScore: avgGScore, 
            criteria: [
              { name: "Legal & Regulatory Compliance", score: summaryData?.avg_g1_legal_auto || avgGScore + 2, weight: "40%" },
              { name: "Business Ethics & Honest Dealing", score: summaryData?.avg_g2_ethics_auto || avgGScore - 1, weight: "35%" },
              { name: "Responsible Sourcing Basics", score: summaryData?.avg_g3_sourcing_auto || avgGScore, weight: "25%" },
            ]
          },
          Cultural: { 
            pillarScore: avgCScore, 
            criteria: [
              { name: "Craft Authenticity & Process Integrity", score: summaryData?.avg_c1_craft_auth_auto || avgCScore + 1, weight: "40%" },
              { name: "Skill Rarity & GI Status", score: summaryData?.avg_c2_skill_rarity_auto || avgCScore - 2, weight: "35%" },
              { name: "Climate-Vulnerable Community Context", score: summaryData?.avg_c3_climatevulnerable_auto || avgCScore, weight: "25%" },
            ]
          },
        },
        sdgImpact: [],
      } as any,
      suppliers: suppliersList,
      categorySpend,
      tierDistribution,
      supplierImpactData,
    };

    return <DashboardClient initialData={dashboardData} />;
  } catch (error) {
    console.error("Dashboard Server Component error:", error);
    redirect("/");
  }
}
