import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ImpactClient from "./ImpactClient";
import type { DashboardData } from "@/lib/mock-data";
import { resolveHotelProperty } from "@/lib/properties-data";
import { getAuthoritativePartnersForClient } from "@/lib/partners-service";

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
    const [
      { data: clientData },
      { data: summaryData },
      { data: supplierLinks },
    ] = await Promise.all([
      supabase.from("client_master").select("client_name, logo_path, property_type").eq("client_id", clientId).maybeSingle(),
      supabase.from("client_summary").select("total_spend_inr_auto, total_orders_auto, avg_varna_score, avg_e_score, avg_s_score, avg_g_score, total_co2e_avoided_kg_auto, total_artisans_supported, no_active_suppliers").eq("client_id", clientId).maybeSingle(),
      supabase.from("supplier_detail_by_client").select("enterprise_id, enterprise_name_auto, tier_auto, varna_score_auto, e_score_auto, s_score_auto, g_score_auto, c_score_auto, orders_inr_ytd_auto, units_ytd_auto, band_auto, total_co2e_kg_auto, co2e_avoided_kg_auto").eq("client_id", clientId),
    ]);

    const {
      partners: authoritativePartners,
      totalPartners,
      tierDistribution,
      supplierImpactData,
      avgGenderPct,
    } = await getAuthoritativePartnersForClient(clientId, supplierLinks || []);

    const suppliersList = authoritativePartners.map((p) => ({
      clientId,
      enterpriseId: p.enterprise_id,
      enterpriseName: p.enterprise_name,
      tier: p.tier,
      varnaScore: p.final_varna_score,
      eScore: p.e_pillar_score,
      sScore: p.s_pillar_score,
      gScore: p.g_pillar_score,
      cScore: p.c_pillar_score,
      totalSpend: p.totalSpend || 0,
      totalOrders: p.totalOrders || 5,
      totalCo2eKg: p.totalCo2eKg || 0,
      co2eAvoidedKg: p.co2eAvoidedKg || 0,
      hasClientOrders: p.hasClientOrders,
      isActive: p.isActive,
      activeStatus: p.active_status,
      city: p.city,
      state: p.state,
      artisansEmployed: p.artisansEmployed || 30,
      womenPercent: p.womenPercent || 70,
    }));

    const resolvedClientName = clientData?.client_name || fallbackHotel.clientName || session?.clientName || "The Astor Dubai";

    const dashboardData: DashboardData = {
      client: {
        clientId,
        clientName: resolvedClientName,
        industry: clientData?.property_type || fallbackHotel.propertyType || "Hospitality",
        city: fallbackHotel.city || "Dubai",
        state: fallbackHotel.country || "UAE",
        onboardingDate: "2024-01-01",
        status: "Active",
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
        avgCScore: fallbackHotel.cScore,
        totalCO2eAvoidedKg: summaryData?.total_co2e_avoided_kg_auto ?? fallbackHotel.co2eAvoidedKg,
        totalArtisansSupported: summaryData?.total_artisans_supported ?? (totalPartners * 32),
        womenWorkforcePercent: avgGenderPct,
        totalSuppliers: totalPartners,
        avgLeadTimeDays: 14,
        pillarBreakdown: {} as any,
        sdgImpact: [],
      } as any,
      suppliers: suppliersList as any,
      categorySpend: [],
      tierDistribution,
      supplierImpactData,
    };

    return <ImpactClient dashboardData={dashboardData} supplierImpactData={supplierImpactData} />;
  } catch (error) {
    console.error("Impact server page error:", error);
    return <ImpactClient dashboardData={null} supplierImpactData={[]} />;
  }
}
