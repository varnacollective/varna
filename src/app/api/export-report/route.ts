import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import path from "path";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import VarnaReportPDF from "@/components/PDF/VarnaReportPDF";
import { getSupplierLogoFallback, getClientLogoFallback } from "@/lib/mock-data";
import type { DashboardData, SupplierDetail } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  // ── Auth: read client from session cookie (same as dashboard page) ──
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("varna_session");

  // Also accept ?clientId= override from ExportButton as fallback
  const { searchParams } = new URL(request.url);
  const queryClientId = searchParams.get("clientId");

  let clientId: string;
  let clientName: string;

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      clientId = session.clientId;
      clientName = session.clientName;
    } catch {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }
  } else if (queryClientId) {
    // dev fallback — not used in production
    clientId = queryClientId;
    clientName = queryClientId;
  } else {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    // ── Replicate the same Supabase queries as /dashboard/page.tsx ──

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

    const { data: allAssessmentData } = await supabase
      .from("assessment_inputs")
      .select(
        "enterprise_name_auto, tier_used_auto, s2_gender_input_pct_women, s3_wages_input_wage_ratio"
      );

    const assessmentData: any[] = allAssessmentData || [];

    // Average women %
    const validGenderPct = assessmentData
      .map((r) => r.s2_gender_input_pct_women)
      .filter((v) => v !== null && v !== undefined && v !== "" && !isNaN(Number(v)))
      .map(Number);

    const calculatedAvgGenderPct =
      validGenderPct.length > 0
        ? Math.round(validGenderPct.reduce((a, b) => a + b, 0) / validGenderPct.length)
        : 0;

    // Tier distribution
    let platinum = 0, gold = 0, silver = 0;
    assessmentData.forEach((row: any) => {
      const tier = (row.tier_used_auto || "").toLowerCase();
      if (tier.includes("platinum") || tier.includes("medium")) platinum++;
      else if (tier.includes("gold") || tier.includes("small")) gold++;
      else silver++;
    });

    const tierDistribution = [
      { tier: "Platinum", count: platinum, color: "#7A3F1E" },
      { tier: "Gold", count: gold, color: "#738678" },
      { tier: "Silver", count: silver, color: "#6F848F" },
    ];

    const supplierImpactData = assessmentData.map((row: any) => ({
      name: row.enterprise_name_auto,
      womenPct: Number(row.s2_gender_input_pct_women) || 0,
      wageRatio: Number(row.s3_wages_input_wage_ratio) || 0,
    }));

    // Category spend
    const { data: catSpendData } = await supabase
      .from("category_spend_by_client")
      .select("*")
      .eq("client_id", clientId);

    const categorySpend = (catSpendData || []).map((row: any) => ({
      clientId,
      categoryName: row.category_name,
      totalSpend: row.total_spend_inr_auto ?? 0,
      totalOrders: row.total_units_auto ?? 0,
      avgVarnaScore: 0,
    }));

    // Suppliers
    const { data: scoresData } = await supabase
      .from("scores_summary")
      .select(
        "enterprise_id, enterprise_name, logo_path, final_varna_score, e_pillar_score, s_pillar_score, g_pillar_score, c_pillar_score"
      );

    const suppliers: SupplierDetail[] = (scoresData || []).map((s: any) => {
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

    const dashboardData: DashboardData = {
      client: {
        clientId,
        clientName,
        industry: clientData?.industry || "Hospitality",
        city: clientData?.city || "",
        state: clientData?.state || "",
        onboardingDate: clientData?.onboarding_date || "2024-01-01",
        status: clientData?.status || "Active",
        logoPath: clientData?.logo_path || getClientLogoFallback(clientName),
      },
      summary: {
        clientId,
        clientName,
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
      },
      suppliers,
      categorySpend,
      tierDistribution,
      supplierImpactData,
    };

    // ── Render PDF ──
    // logoSrc must be an absolute path so @react-pdf/renderer can open it server-side.
    const logoSrc = path.join(process.cwd(), "public", "varna-logo.svg");
    const element = React.createElement(VarnaReportPDF, { data: dashboardData, logoSrc });
    const buffer = await renderToBuffer(element as React.ReactElement<any>);

    const slug = clientName.toLowerCase().replace(/\s+/g, "-");
    const date = new Date().toISOString().slice(0, 10);
    const filename = `varna-esg-report-${slug}-${date}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("[PDF] renderToBuffer failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed", detail: String(err) },
      { status: 500 }
    );
  }
}
