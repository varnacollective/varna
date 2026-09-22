import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ImpactClient from "./ImpactClient";
import type { DashboardData } from "@/lib/mock-data";

export default async function ImpactServerPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("varna_session");

  if (!sessionCookie?.value) {
    redirect("/");
  }

  const supabase = await createClient();

  let session: { clientId: string; clientName: string; isGroup?: boolean };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/");
  }

  const clientId = session.clientId;
  if (session.isGroup || clientId?.toUpperCase().startsWith("GRP-")) {
    redirect("/group-dashboard");
  }

  try {
    const { data: clientData } = await supabase
      .from("client_master")
      .select("*")
      .eq("client_id", clientId)
      .single();

    const { data: summaryData } = await supabase
      .from("client_summary")
      .select("*")
      .eq("client_id", clientId)
      .single();

    const { data: assessmentData } = await supabase
      .from("assessment_inputs")
      .select("enterprise_name_auto, s2_gender_input_pct_women, s3_wages_input_wage_ratio");

    const supplierImpactData = assessmentData?.map((row: any) => ({
      name: row.enterprise_name_auto,
      womenPct: Number(row.s2_gender_input_pct_women) || 0,
      wageRatio: Number(row.s3_wages_input_wage_ratio) || 0,
    })) || [];

    const dashboardData: DashboardData = {
      client: {
        clientId: session.clientId,
        clientName: session.clientName,
        industry: clientData?.industry || "Hospitality",
        city: clientData?.city || "Unknown City",
        state: clientData?.state || "Unknown State",
        onboardingDate: clientData?.onboarding_date || "2024-01-01",
        status: clientData?.status || "Active",
        logoPath: clientData?.logo_path || undefined,
      },
      summary: {
        clientId: session.clientId,
        clientName: session.clientName,
        totalSpend: summaryData?.total_spend_inr_auto ?? 313150,
        totalOrders: summaryData?.total_orders_auto ?? 5,
        avgVarnaScore: summaryData?.avg_varna_score ?? 75.3,
        avgEScore: summaryData?.avg_e_score ?? 39,
        avgSScore: summaryData?.avg_s_score ?? 66,
        avgGScore: summaryData?.avg_g_score ?? 80,
        avgCScore: summaryData?.avg_c_score_craft_only ?? 85.0,
        totalCO2eAvoidedKg: summaryData?.total_co2e_avoided_kg_auto ?? 2160,
        totalArtisansSupported: summaryData?.total_artisans_supported ?? 195,
        womenWorkforcePercent: 78,
        totalSuppliers: summaryData?.no_active_suppliers ?? 3,
        avgLeadTimeDays: 14,
        pillarBreakdown: {} as any,
        sdgImpact: [],
      } as any,
      suppliers: [],
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
