"use client";

import type { DashboardData } from "@/lib/mock-data";
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
  const { client, summary, categorySpend, tierDistribution, supplierImpactData } = data;

  const varnaScoreData = {
    score: Math.round(summary.avgVarnaScore),
    eScore: Math.round(summary.avgEScore),
    sScore: Math.round(summary.avgSScore),
    gScore: Math.round(summary.avgGScore),
    cScore: Math.round(summary.avgCScore),
    supplierName: "Portfolio Average",
  };

  return (
    <div className="client-overview-v2 w-full max-w-[1400px] mx-auto space-y-6">
      {/* 1. Top Bar */}
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
          "Total Spend": summary?.totalSpend ? `INR ${summary.totalSpend.toLocaleString('en-IN')}` : undefined,
        }}
      />

      {/* 2. Welcome & Hero Banner */}
      <WelcomeCardV2
        clientName={client.clientName}
        industry={client.industry}
        logoPath={client.logoPath}
        dashboardData={data}
      />

      {/* 3. KPI Strip & Tagline */}
      <KpiRowV2
        totalSpend={summary.totalSpend}
        totalOrders={summary.totalOrders}
        avgVarnaScore={summary.avgVarnaScore}
        totalSuppliers={summary.totalSuppliers}
        varnaScoreData={varnaScoreData}
      />

      {/* 4. Mid Section: Visual + ESG Pillars + Spend by Product Category */}
      <PillarsAndCategoryV2
        eScore={summary.avgEScore}
        sScore={summary.avgSScore}
        gScore={summary.avgGScore}
        cScore={summary.avgCScore}
        pillarBreakdown={summary.pillarBreakdown}
        categorySpend={categorySpend}
      />

      {/* 5. Carbon Impact + Supplier Tier Distribution */}
      <CarbonAndTiersV2
        totalCO2eAvoidedKg={summary.totalCO2eAvoidedKg}
        totalSuppliers={summary.totalSuppliers}
        tierDistribution={tierDistribution}
      />

      {/* 6. Social Livelihood Impact */}
      <SocialImpactV2
        artisansSupported={summary.totalArtisansSupported}
        womenWorkforcePercent={summary.womenWorkforcePercent}
        wageRatio={supplierImpactData?.[0]?.wageRatio || 1.05}
        supplierImpactData={supplierImpactData}
      />

      {/* 7. Footer Disclaimer */}
      <FooterDisclaimerV2 />
    </div>
  );
}
