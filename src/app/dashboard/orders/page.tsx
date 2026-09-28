import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OrdersClient from "./OrdersClient";
import type { DashboardData } from "@/lib/mock-data";
import { resolveHotelProperty } from "@/lib/properties-data";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrdersServerPage({ searchParams }: PageProps) {
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
      suppliers: [],
      categorySpend: [],
      tierDistribution: [],
      supplierImpactData: [],
    };

    return <OrdersClient dashboardData={dashboardData} />;
  } catch (error) {
    console.error("Orders server page error:", error);
    return <OrdersClient dashboardData={null} />;
  }
}
