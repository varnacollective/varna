"use client";

import type { DashboardData } from "@/lib/mock-data";
import { getClientLogoFallback } from "@/lib/mock-data";
import TopBarV2 from "@/components/dashboard/v2/TopBarV2";
import ImpactHeroV2 from "./ImpactHeroV2";
import EsgPillarsV2 from "./EsgPillarsV2";
import CarbonRowV2 from "./CarbonRowV2";
import SocialRowV2 from "./SocialRowV2";
import EvidenceBannerV2 from "./EvidenceBannerV2";
import FooterDisclaimerV2 from "./FooterDisclaimerV2";
import SMESpendCard from "./SMESpendCard";

interface ClientImpactV2Props {
  dashboardData?: DashboardData | null;
  supplierImpactData?: any[];
}

export default function ClientImpactV2({
  dashboardData,
  supplierImpactData,
}: ClientImpactV2Props) {
  // Client info fallbacks
  const clientName = dashboardData?.client?.clientName || "The Astor Dubai";
  const industry = dashboardData?.client?.industry || "Hospitality";
  const logoPath = dashboardData?.client?.logoPath || getClientLogoFallback(clientName);

  const summary = dashboardData?.summary;
  const eScore = summary?.avgEScore ?? 39;
  const sScore = summary?.avgSScore ?? 66;
  const gScore = summary?.avgGScore ?? 80;
  const pillarBreakdown = summary?.pillarBreakdown;

  const totalCO2eAvoidedKg = summary?.totalCO2eAvoidedKg ?? 2160;
  const womenWorkforcePercent = summary?.womenWorkforcePercent ?? 78;
  const wageRatio = supplierImpactData?.[0]?.wageRatio ?? 1.05;
  const suppliers = dashboardData?.suppliers ?? [];
  const totalSpend = summary?.totalSpend ?? 0;

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
        dashboardData={dashboardData}
      />

      {/* 3. ESG Performance Pillars */}
      <EsgPillarsV2
        eScore={eScore}
        sScore={sScore}
        gScore={gScore}
        cScore={summary?.avgCScore ?? 0}
        pillarBreakdown={pillarBreakdown}
        womenWorkforcePercent={womenWorkforcePercent}
      />

      {/* 4. Visual + Carbon Impact Row */}
      <CarbonRowV2
        totalCO2eAvoidedKg={totalCO2eAvoidedKg}
        targetCO2eKg={2640}
      />

      {/* 4b. SME Spend Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-5">
          <SMESpendCard suppliers={suppliers} totalSpend={totalSpend} />
        </div>
        <div className="lg:col-span-7 flex flex-col gap-4 p-6 lg:p-7 bg-white dark:bg-[#20242B] border border-black/[0.07] dark:border-white/[0.08] rounded-[24px] shadow-sm justify-center">
          <h3 className="text-lg font-medium text-[#1F1B16] dark:text-[#F3EFE7]">Why SME Sourcing Matters</h3>
          <p className="text-sm text-[#6F6A61] dark:text-[#9A948A] font-normal leading-relaxed">
            Sourcing from Micro, Small and Medium Enterprises (MSMEs) creates direct economic impact at the community level. MSMEs employ over 110 million people in India and contribute 30% of GDP. Every rupee spent with an MSME partner multiplies through local supply chains.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-black/[0.07] dark:border-white/[0.08]">
            {[
              { label: "Employment multiplier", value: "4.3x", note: "vs large industry" },
              { label: "Local GDP retention", value: "62%", note: "stays in community" },
              { label: "Women-led MSMEs", value: "20%", note: "of registered" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-light text-[#7D3F1E] dark:text-[#E07A57] tabular-nums">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#6F6A61] dark:text-[#9A948A] mt-0.5">{stat.label}</p>
                <p className="text-[11px] text-[#9A948A] font-normal">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
