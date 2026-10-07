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
      supabase.from("client_master").select("*").eq("client_id", clientId).maybeSingle(),
      supabase.from("client_summary").select("*").eq("client_id", clientId).maybeSingle(),
      supabase.from("supplier_detail_by_client").select("*").eq("client_id", clientId),
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
    }));

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
