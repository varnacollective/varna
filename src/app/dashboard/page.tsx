import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";
import { type DashboardData, type SupplierDetail, getClientLogoFallback, getSupplierLogoFallback } from "@/lib/mock-data";

export default async function DashboardServerPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("varna_session");

  if (!sessionCookie?.value) {
    redirect("/");
  }

  const supabase = await createClient();

  let session: { clientId: string; clientName: string };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/");
  }

  const clientId = session.clientId;

  try {
    // 1. Fetch Client Master
    const { data: clientData, error: clientError } = await supabase
      .from("client_master")
      .select("*")
      .eq("client_id", clientId)
      .single();

    if (clientError && clientError.code !== "PGRST116") {
      console.error("Supabase client_master error:", clientError);
    }

    // 2. Fetch Client Summary (Overview Page KPI Metrics)
    const { data: summaryData, error: summaryError } = await supabase
      .from("client_summary")
      .select("*")
      .eq("client_id", clientId)
      .single();

    if (summaryError && summaryError.code !== "PGRST116") {
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

    const enterpriseIds = supplierLinks?.map((row) => row.enterprise_id) || [];

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
      : 0;

    // Process Supplier Tier Distribution
    let platinum = 0, gold = 0, silver = 0;
    let microA = 0, microB = 0, small = 0, medium = 0;

    assessmentData?.forEach((row: any) => {
      // Logic from legacy Google Sheets fallback or new tier mapping
      const tier = (row.tier_used_auto || "").toLowerCase();
      if (tier.includes("platinum") || tier.includes("medium")) { platinum++; medium++; }
      else if (tier.includes("gold") || tier.includes("small")) { gold++; small++; }
      else if (tier.includes("silver") || tier.includes("micro b")) { silver++; microB++; }
      else { silver++; microA++; }
    });

    const tierDistribution = [
      { tier: "Platinum", count: platinum > 0 ? platinum : medium, color: "#7A3F1E" },
      { tier: "Gold", count: gold > 0 ? gold : small, color: "#738678" },
      { tier: "Silver", count: silver > 0 ? silver : (microB + microA), color: "#6F848F" },
    ];

    // Calculate Impact Metrics (Gender & Wages)
    const supplierImpactData = assessmentData?.map((row: any) => ({
      name: row.enterprise_name_auto,
      womenPct: Number(row.s2_gender_input_pct_women) || 0,
      wageRatio: Number(row.s3_wages_input_wage_ratio) || 0,
    })) || [];

    // 5. Fetch Category Spend
    const { data: catSpendData, error: catSpendError } = await supabase
      .from("category_spend_by_client")
      .select("*")
      .eq("client_id", clientId);

    if (catSpendError) {
      console.error("Supabase category_spend_by_client error:", catSpendError);
    }

    const categorySpend = catSpendData?.map((row: any) => ({
      clientId,
      categoryName: row.category_name,
      totalSpend: row.total_spend_inr_auto ?? 0,
      totalOrders: row.total_units_auto ?? 0,
      avgVarnaScore: 0, // Fallback as not in DB
    })) || [];

    // 6. Fetch Suppliers for Dashboard Portfolio View
    const { data: scoresData } = await supabase
      .from("scores_summary")
      .select("enterprise_id, enterprise_name, logo_path, final_varna_score, e_pillar_score, s_pillar_score, g_pillar_score, c_pillar_score");

    const suppliersList: SupplierDetail[] = (scoresData || []).map((s: any) => {
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
        city: isBare ? "Bengaluru" : isUKHI ? "Pune" : "Indore",
        state: isBare ? "Karnataka" : isUKHI ? "Maharashtra" : "Madhya Pradesh",
        artisansEmployed: isBare ? 45 : isUKHI ? 120 : 30,
        womenPercent: isBare ? 82 : isUKHI ? 65 : 75,
        logoPath: s.logo_path || getSupplierLogoFallback(name),
      };
    });

    const clientLogo = clientData?.logo_path || getClientLogoFallback(session.clientName);

    const dashboardData: DashboardData = {
      client: {
        clientId: session.clientId,
        clientName: session.clientName,
        industry: clientData?.industry || "Hospitality",
        city: clientData?.city || "Unknown City",
        state: clientData?.state || "Unknown State",
        onboardingDate: clientData?.onboarding_date || "2024-01-01",
        status: clientData?.status || "Active",
        logoPath: clientLogo,
      },
      summary: {
        clientId: session.clientId,
        clientName: session.clientName,
        totalSpend: summaryData?.total_spend_inr_auto ?? 0,
        totalOrders: summaryData?.total_orders_auto ?? 0,
        avgVarnaScore: summaryData?.avg_varna_score ?? 0,
        avgEScore: summaryData?.avg_e_score ?? 0,
        avgSScore: summaryData?.avg_s_score ?? 0,
        avgGScore: summaryData?.avg_g_score ?? 0,
        avgCScore: summaryData?.avg_c_score_craft_only ?? 0,
        totalCO2eAvoidedKg: summaryData?.total_co2e_avoided_kg_auto ?? 0,
        totalArtisansSupported: summaryData?.total_artisans_supported ?? 0,
        womenWorkforcePercent: calculatedAvgGenderPct,
        totalSuppliers: summaryData?.no_active_suppliers ?? 0,
        avgLeadTimeDays: 14,
        pillarBreakdown: {
          Environmental: { 
            pillarScore: summaryData?.avg_e_score ?? 0, 
            criteria: [
              { name: "Carbon Impact", score: summaryData?.avg_e1_carbon_auto ?? 0, weight: "20%" },
              { name: "Material Sustainability", score: summaryData?.avg_e2_material_pct_auto ?? 0, weight: "20%" },
              { name: "Circularity", score: summaryData?.avg_e3_circularity_auto ?? 0, weight: "15%" },
              { name: "Water Management", score: summaryData?.avg_e4_water_auto ?? 0, weight: "15%" },
              { name: "Pollution Control", score: summaryData?.avg_e5_pollution_auto ?? 0, weight: "15%" },
              { name: "Packaging", score: summaryData?.avg_e6_packaging_auto ?? 0, weight: "15%" },
            ]
          },
          Social: { 
            pillarScore: summaryData?.avg_s_score ?? 0, 
            criteria: [
              { name: "Employment & Livelihood Impact", score: summaryData?.avg_s1_employment_auto ?? 0, weight: "30%" },
              { name: "Gender Inclusion", score: summaryData?.avg_s2_gender_auto ?? 0, weight: "25%" },
              { name: "Working Conditions & Fair Wages", score: summaryData?.avg_s3_wages_auto ?? 0, weight: "25%" },
              { name: "Health, Safety & Wellbeing", score: summaryData?.avg_s4_health_auto ?? 0, weight: "20%" },
            ]
          },
          Governance: { 
            pillarScore: summaryData?.avg_g_score ?? 0, 
            criteria: [
              { name: "Legal & Regulatory Compliance", score: summaryData?.avg_g1_legal_auto ?? 0, weight: "40%" },
              { name: "Business Ethics & Honest Dealing", score: summaryData?.avg_g2_ethics_auto ?? 0, weight: "35%" },
              { name: "Responsible Sourcing Basics", score: summaryData?.avg_g3_sourcing_auto ?? 0, weight: "25%" },
            ]
          },
          Cultural: { 
            pillarScore: summaryData?.avg_c_score_craft_only ?? 0, 
            criteria: [
              { name: "Craft Authenticity & Process Integrity", score: summaryData?.avg_c1_craft_auth_auto ?? 0, weight: "40%" },
              { name: "Skill Rarity & GI Status", score: summaryData?.avg_c2_skill_rarity_auto ?? 0, weight: "35%" },
              { name: "Climate-Vulnerable Community Context", score: summaryData?.avg_c3_climatevulnerable_auto ?? 0, weight: "25%" },
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
