import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ImpactClient from "./ImpactClient";
import type { DashboardData } from "@/lib/mock-data";
import { resolveHotelProperty } from "@/lib/properties-data";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ImpactServerPage({ searchParams }: PageProps) {
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

  let session: { clientId: string; clientName: string; isGroup?: boolean } | null = null;
  if (sessionCookie?.value) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      // ignore
    }
  }

  if (!session && !queryClientId) {
    redirect("/");
  }

  const clientId = queryClientId || session?.clientId || "CLT-001";
  const isGroup = Boolean(session?.isGroup) || session?.clientId?.toUpperCase().startsWith("GRP-");
  if (!queryClientId && isGroup) {
    redirect("/group-dashboard");
  }

  const fallbackHotel = resolveHotelProperty(clientId);
  const supabase = await createClient();

  try {
    const { data: clientData } = await supabase
      .from("client_master")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    const { data: summaryData } = await supabase
      .from("client_summary")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    const { data: assessmentData } = await supabase
      .from("assessment_inputs")
      .select("enterprise_name_auto, s2_gender_input_pct_women, s3_wages_input_wage_ratio");

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

    const { data: supplierLinks } = await supabase
      .from("supplier_detail_by_client")
      .select("enterprise_id, enterprise_name_auto, tier_auto, varna_score_auto, e_score_auto, s_score_auto, g_score_auto, c_score_auto, orders_inr_ytd_auto, units_ytd_auto")
      .eq("client_id", clientId);

    const suppliersList = (supplierLinks && supplierLinks.length > 0)
      ? supplierLinks.map((s: any) => ({
          clientId,
          enterpriseId: s.enterprise_id || s.enterprise_name_auto,
          enterpriseName: s.enterprise_name_auto,
          tier: s.tier_auto || "Micro B",
          varnaScore: Number(s.varna_score_auto) || 70,
          eScore: Number(s.e_score_auto) || 50,
          sScore: Number(s.s_score_auto) || 60,
          gScore: Number(s.g_score_auto) || 75,
          cScore: Number(s.c_score_auto) || 0,
          totalSpend: Number(s.orders_inr_ytd_auto) || 0,
          totalOrders: Number(s.units_ytd_auto) || 5,
        }))
      : [
          {
            clientId,
            enterpriseId: "ENT-001",
            enterpriseName: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
            tier: "Micro B",
            varnaScore: 74.3,
            eScore: 31.8,
            sScore: 63.8,
            gScore: 85.3,
            cScore: 0,
            totalSpend: 268000,
            totalOrders: 1300,
          },
          {
            clientId,
            enterpriseId: "ENT-002",
            enterpriseName: "UKHI India Private Limited",
            tier: "Small",
            varnaScore: 77.1,
            eScore: 46.3,
            sScore: 67.5,
            gScore: 78.3,
            cScore: 0,
            totalSpend: 11900,
            totalOrders: 7000,
          },
          {
            clientId,
            enterpriseId: "ENT-003",
            enterpriseName: "Kheoni Ventures Pvt Ltd",
            tier: "Micro A",
            varnaScore: 51.3,
            eScore: 25.4,
            sScore: 59.1,
            gScore: 76.5,
            cScore: 0,
            totalSpend: 33250,
            totalOrders: 350,
          },
        ];

    const resolvedClientName = clientData?.client_name || fallbackHotel.clientName || session?.clientName || "The Astor Dubai";

    const dashboardData: DashboardData = {
      client: {
        clientId,
        clientName: resolvedClientName,
        industry: clientData?.industry || fallbackHotel.propertyType || "Hospitality",
        city: clientData?.city || fallbackHotel.city || "Dubai",
        state: clientData?.state || fallbackHotel.country || "UAE",
        onboardingDate: clientData?.onboarding_date || "2024-01-01",
        status: clientData?.status || "Active",
        logoPath: clientData?.logo_path || undefined,
      },
      summary: {
        clientId,
        clientName: resolvedClientName,
        totalSpend: summaryData?.total_spend_inr_auto ?? fallbackHotel.totalSpendInr,
        totalOrders: summaryData?.total_orders_auto ?? fallbackHotel.totalOrders,
        avgVarnaScore: summaryData?.avg_varna_score ?? fallbackHotel.varnaScore,
        avgEScore: summaryData?.avg_e_score ?? fallbackHotel.eScore,
        avgSScore: summaryData?.avg_s_score ?? fallbackHotel.sScore,
        avgGScore: summaryData?.avg_g_score ?? fallbackHotel.gScore,
        avgCScore: summaryData?.avg_c_score_craft_only ?? fallbackHotel.cScore,
        totalCO2eAvoidedKg: summaryData?.total_co2e_avoided_kg_auto ?? fallbackHotel.co2eAvoidedKg,
        totalArtisansSupported: summaryData?.total_artisans_supported ?? (fallbackHotel.activeSuppliers * 320),
        womenWorkforcePercent: 78,
        totalSuppliers: summaryData?.no_active_suppliers ?? fallbackHotel.activeSuppliers,
        avgLeadTimeDays: 14,
        pillarBreakdown: {} as any,
        sdgImpact: [],
      } as any,
      suppliers: suppliersList as any,
      categorySpend: [],
      tierDistribution: [],
      supplierImpactData,
    };

    return <ImpactClient dashboardData={dashboardData} supplierImpactData={supplierImpactData} />;
  } catch (error) {
    console.error("Impact server page error:", error);
    return <ImpactClient dashboardData={null} supplierImpactData={[]} />;
  }
}
