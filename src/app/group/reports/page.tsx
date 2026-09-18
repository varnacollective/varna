import React from "react";
import { FileText } from "lucide-react";

export default function GroupReportsPage() {
  return (
    <div className="p-8 space-y-6">
      <header className="border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-4">
        <div className="text-[10px] uppercase font-sans font-semibold tracking-[0.2em] text-[#6E7781] dark:text-[#8C9DA8]">
          EXECUTIVE DISCLOSURES
        </div>
        <h1 className="font-display text-3xl text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight">
          Group Reports
        </h1>
        <p className="text-xs font-sans text-[#6E7781] dark:text-[#8C9DA8] mt-1">
          Automated ESG compliance documentation, auditor-verified exports, and board presentations.
        </p>
      </header>

      <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-12 text-center shadow-card-light dark:shadow-elevation-dark-low flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#6F848F]/10 text-[#6F848F] flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-sans font-semibold text-[#1A1F26] dark:text-[#FAF8F5]">
          Reports View
        </h3>
        <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] max-w-md">
          Generate, schedule, and export comprehensive ESG portfolio compliance reports for stakeholders and investors.
        </p>
      </div>
    </div>
  );
}
