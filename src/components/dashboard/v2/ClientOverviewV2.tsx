"use client";

import { useMemo } from "react";
import type { DashboardData } from "@/lib/mock-data";
import { CLIENT_ORDERS_LIST } from "@/lib/mock-data";
import { useDateRange } from "@/context/DateRangeContext";
import TopBarV2 from "./TopBarV2";
import WelcomeCardV2 from "./WelcomeCardV2";
import KpiRowV2 from "./KpiRowV2";
import PillarsAndCategoryV2 from "./PillarsAndCategoryV2";
import CarbonAndTiersV2 from "./CarbonAndTiersV2";
import SocialImpactV2 from "./SocialImpactV2";
import FooterDisclaimerV2 from "./FooterDisclaimerV2";

interface ClientOverviewV2Props {
  data: DashboardData;
}

export default function ClientOverviewV2({ data }: ClientOverviewV2Props) {
  const { state: dateState } = useDateRange();
  const { client, summary, categorySpend, tierDistribution, supplierImpactData } = data;

  const filteredOrders = useMemo(() => {
    if (!dateState.startDate && !dateState.endDate) return null;
    const start = dateState.startDate ? new Date(dateState.startDate + "T00:00:00") : null;
    const end = dateState.endDate ? new Date(dateState.endDate + "T23:59:59") : null;

    return CLIENT_ORDERS_LIST.filter((order) => {
      if (!order.orderDate) return true;
      const orderDate = new Date(order.orderDate);
      if (isNaN(orderDate.getTime())) return true;
      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
      return true;
    });
  }, [dateState.startDate, dateState.endDate]);

  const currentTotalOrders = filteredOrders ? filteredOrders.length : summary.totalOrders;
  const currentTotalSpend = filteredOrders ? filteredOrders.reduce((acc, o) => acc + o.orderValue, 0) : summary.totalSpend;

  const varnaScoreData = {
    score: Math.round(summary.avgVarnaScore),
    eScore: Math.round(summary.avgEScore),
    sScore: Math.round(summary.avgSScore),
    gScore: Math.round(summary.avgGScore),
    cScore: Math.round(summary.avgCScore),
    supplierName: "Weighted average across your verified suppliers",
  };

  const ratingBand = summary.avgVarnaScore >= 85 ? "Leader band" : summary.avgVarnaScore >= 70 ? "Advanced band" : "Emerging band";

  return (
    <div className="client-overview-v2 w-full max-w-[1760px] mx-auto space-y-6 pb-32">
      {/* 1. Top Bar (W1) */}
      <TopBarV2
        clientName={client.clientName}
        industry={client.industry}
        logoPath={client.logoPath}
        dashboardData={data}
        clientDetails={{
          "Industry Sector": client.industry,
          "Location": client.city && client.state ? `${client.city}, ${client.state}` : client.city || client.state,
          "Status": client.status || "Active",
          "Onboarding Date": client.onboardingDate,
          "Active Suppliers": summary?.totalSuppliers ? `${summary.totalSuppliers} Verified Enterprises` : undefined,
          "Total Spend": summary?.totalSpend ? `$${Math.round(summary.totalSpend / 83).toLocaleString('en-US')}` : undefined,
        }}
      />

      {/* 2. Welcome & Hero Banner (W2, W3 & D6) */}
      <WelcomeCardV2
        clientName={client.clientName}
        industry={client.industry}
        logoPath={client.logoPath}
        totalSuppliers={summary.totalSuppliers}
        totalOrders={currentTotalOrders}
        ratingBand={ratingBand}
        dashboardData={data}
      />

      {/* 3. KPI Strip & Tagline (W4, W5 & D1) */}
      <KpiRowV2
        totalSpend={currentTotalSpend}
        totalOrders={currentTotalOrders}
        avgVarnaScore={summary.avgVarnaScore}
        totalSuppliers={summary.totalSuppliers}
        varnaScoreData={varnaScoreData}
      />

      {/* 4. Mid Section: Visual + ESG Pillars + Spend by Product Category (W6, W7, W8 & D2, D3) */}
      <PillarsAndCategoryV2
        eScore={summary.avgEScore}
        sScore={summary.avgSScore}
        gScore={summary.avgGScore}
        cScore={summary.avgCScore}
        pillarBreakdown={summary.pillarBreakdown}
        categorySpend={categorySpend}
      />

      {/* 5. Carbon Impact + Supplier Tier Distribution (W9, W10 & D4, D5) */}
      <CarbonAndTiersV2
        totalCO2eAvoidedKg={summary.totalCO2eAvoidedKg}
        totalSuppliers={summary.totalSuppliers}
        tierDistribution={tierDistribution}
      />

      {/* 6. Social Livelihood Impact (W11) */}
      <SocialImpactV2
        artisansSupported={summary.totalArtisansSupported}
        womenWorkforcePercent={summary.womenWorkforcePercent}
        wageRatio={supplierImpactData?.[0]?.wageRatio || 1.05}
        supplierImpactData={supplierImpactData}
      />

      {/* 7. Footer Disclaimer (W12) */}
      <FooterDisclaimerV2 />
    </div>
  );
}
