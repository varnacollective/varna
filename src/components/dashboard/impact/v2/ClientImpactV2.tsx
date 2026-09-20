"use client";

import type { DashboardData } from "@/lib/mock-data";
import TopBarV2 from "@/components/dashboard/v2/TopBarV2";
import ImpactHeroV2 from "./ImpactHeroV2";
import EsgPillarsV2 from "./EsgPillarsV2";
import CarbonRowV2 from "./CarbonRowV2";
import SocialRowV2 from "./SocialRowV2";
import EvidenceBannerV2 from "./EvidenceBannerV2";
import FooterDisclaimerV2 from "./FooterDisclaimerV2";

interface ClientImpactV2Props {
  dashboardData?: DashboardData | null;
  supplierImpactData?: any[];
}

export default function ClientImpactV2({
  dashboardData,
  supplierImpactData,
}: ClientImpactV2Props) {
  // Client info fallbacks
  const clientName = dashboardData?.client?.clientName || "The Oberoi";
  const industry = dashboardData?.client?.industry || "Hospitality";
  const logoPath = dashboardData?.client?.logoPath || "/logos/clients/oberoi-dubai.png";

  const summary = dashboardData?.summary;
  const eScore = summary?.avgEScore ?? 73.5;
  const sScore = summary?.avgSScore ?? 77.2;
  const gScore = summary?.avgGScore ?? 81.6;
  const pillarBreakdown = summary?.pillarBreakdown;

  const totalCO2eAvoidedKg = summary?.totalCO2eAvoidedKg ?? 2160;
  const womenWorkforcePercent = summary?.womenWorkforcePercent ?? 78;
  const wageRatio = supplierImpactData?.[0]?.wageRatio ?? 1.05;

  return (
    <div className="client-impact-v2 w-full max-w-[1760px] mx-auto space-y-6 pb-32">
      {/* 1. Top Bar */}
      <TopBarV2
        clientName={clientName}
        industry={industry}
        logoPath={logoPath}
        dashboardData={dashboardData}
      />

      {/* 2. Hero Section */}
      <ImpactHeroV2
        dateRangeText="1 Apr – 30 Jun 2026"
        dashboardData={dashboardData}
      />

      {/* 3. ESG Performance Pillars */}
      <EsgPillarsV2
        eScore={eScore}
        sScore={sScore}
        gScore={gScore}
        pillarBreakdown={pillarBreakdown}
        womenWorkforcePercent={womenWorkforcePercent}
      />

      {/* 4. Visual + Carbon Impact Row */}
      <CarbonRowV2
        totalCO2eAvoidedKg={totalCO2eAvoidedKg}
        targetCO2eKg={2640}
      />

      {/* 5. Social Livelihood + Visual Row */}
      <SocialRowV2
        womenWorkforcePercent={womenWorkforcePercent}
        wageRatio={wageRatio}
        supplierImpactData={supplierImpactData}
      />

      {/* 6. Evidence Banner */}
      <EvidenceBannerV2 />

      {/* 7. Disclaimer Bar */}
      <FooterDisclaimerV2 />
    </div>
  );
}
