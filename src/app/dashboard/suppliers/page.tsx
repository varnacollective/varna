import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SuppliersClient from "./SuppliersClient";
import { getClientLogoFallback } from "@/lib/mock-data";
import { resolveHotelProperty } from "@/lib/properties-data";
import { getAuthoritativePartnersForClient } from "@/lib/partners-service";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuppliersServerPage({ searchParams }: PageProps) {
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
  const fallbackHotel = resolveHotelProperty(clientId);

  const supabase = await createClient();

  try {
    // ─── Fire client-scoped queries in parallel ──────────────────────────────
    const [
      clientData,
      summaryData,
      clientSuppliersData,
    ] = await Promise.all([
      supabase
        .from("client_master")
        .select("client_name, logo_path, property_type")
        .eq("client_id", clientId)
        .maybeSingle()
        .then((r) => r.data),
      supabase
        .from("client_summary")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle()
        .then((r) => r.data),
      supabase
        .from("supplier_detail_by_client")
        .select("enterprise_id, enterprise_name_auto, tier_auto, varna_score_auto, e_score_auto, s_score_auto, g_score_auto, c_score_auto, orders_inr_ytd_auto, units_ytd_auto, band_auto, total_co2e_kg_auto, co2e_avoided_kg_auto")
        .eq("client_id", clientId)
        .then((r) => r.data),
    ]);

    // ─── Single Source of Truth for Authoritative Partners ───────────────────
    // Retrieves ALL 10 verified partner enterprises from the authoritative tables,
    // merging this client's specific order spend/units where transactions occurred.
    const {
      partners: mergedSuppliers,
      totalPartners,
      liveConfidenceData,
    } = await getAuthoritativePartnersForClient(clientId, clientSuppliersData || []);

    const clientName = clientData?.client_name || fallbackHotel.clientName || session?.clientName || "The Astor Dubai";
    const logoPath = clientData?.logo_path || getClientLogoFallback(clientName);

    const dashboardData = {
      client: {
        clientId,
        clientName,
        industry: clientData?.property_type || fallbackHotel.propertyType || "Luxury Hospitality",
        city: fallbackHotel.city || "Dubai",
        state: fallbackHotel.country || "UAE",
        onboardingDate: "2024-01-15",
        status: "Active",
        logoPath,
      },
      summary: {
        clientId,
        clientName,
        totalSpend: summaryData?.total_spend_inr_auto != null ? Number(summaryData.total_spend_inr_auto) : fallbackHotel.totalSpendInr,
        totalOrders: summaryData?.total_orders_auto != null ? Number(summaryData.total_orders_auto) : fallbackHotel.totalOrders,
        avgVarnaScore: summaryData?.avg_varna_score != null ? Number(summaryData.avg_varna_score) : 67.6,
        avgEScore: summaryData?.avg_e_score != null ? Number(summaryData.avg_e_score) : 34.5,
        avgSScore: summaryData?.avg_s_score != null ? Number(summaryData.avg_s_score) : 63.5,
        avgGScore: summaryData?.avg_g_score != null ? Number(summaryData.avg_g_score) : 80.0,
        avgCScore: 0,
        totalSuppliers: totalPartners,
      },
    };

    return (
      <SuppliersClient
        suppliersData={mergedSuppliers}
        liveConfidenceData={liveConfidenceData}
        clientName={clientName}
        logoPath={logoPath}
        dashboardData={dashboardData}
      />
    );
  } catch (error) {
    console.error("Suppliers Server Component error:", error);
    redirect("/");
  }
}
