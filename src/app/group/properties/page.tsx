import React from "react";
import { Building2 } from "lucide-react";

export default function GroupPropertiesPage() {
  return (
    <div className="p-8 space-y-6">
      <header className="border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-4">
        <div className="text-[10px] uppercase font-sans font-semibold tracking-[0.2em] text-[#6E7781] dark:text-[#8C9DA8]">
          PORTFOLIO MANAGEMENT
        </div>
        <h1 className="font-display text-3xl text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight">
          Group Properties
        </h1>
        <p className="text-xs font-sans text-[#6E7781] dark:text-[#8C9DA8] mt-1">
          Detailed property profiles, ESG benchmark scores, and regional operations.
        </p>
      </header>

      <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-12 text-center shadow-card-light dark:shadow-elevation-dark-low flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#B85333]/10 text-[#B85333] flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-sans font-semibold text-[#1A1F26] dark:text-[#FAF8F5]">
          Properties View
        </h3>
        <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] max-w-md">
          Explore and manage individual hotel properties, compliance history, and regional ESG performance metrics.
        </p>
      </div>
    </div>
  );
}
