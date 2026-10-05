"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Info, Building2 } from "lucide-react";
import type { SupplierDetail } from "@/lib/mock-data";

interface SMESpendCardProps {
  suppliers: SupplierDetail[];
  totalSpend: number;
}

// Map tiers to MSME categories
// Micro: turnover <= 1Cr; Small: 1Cr-10Cr; Medium: 10Cr-50Cr
// In this system: Platinum=Micro A, Gold=Micro B, Silver=Small, Bronze=Medium
const TIER_TO_MSME: Record<string, "Micro" | "Small" | "Medium" | null> = {
  Platinum: "Micro",
  Gold: "Micro",
  Silver: "Small",
  Bronze: "Medium",
};

const MSME_COLORS: Record<"Micro" | "Small" | "Medium", string> = {
  Micro: "#55705A",
  Small: "#7D3F1E",
  Medium: "#6F8391",
};

function formatInrShort(val: number): string {
  if (val >= 10000000) return `Rs.${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `Rs.${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `Rs.${(val / 1000).toFixed(0)}K`;
  return `Rs.${val.toFixed(0)}`;
}

export default function SMESpendCard({ suppliers, totalSpend }: SMESpendCardProps) {
  const smeData = useMemo(() => {
    const breakdown: Record<"Micro" | "Small" | "Medium", number> = {
      Micro: 0,
      Small: 0,
      Medium: 0,
    };

    suppliers.forEach((s) => {
      const msme = TIER_TO_MSME[s.tier];
      if (msme) {
        breakdown[msme] += s.totalSpend;
      }
    });

    const totalSME = breakdown.Micro + breakdown.Small + breakdown.Medium;
    const smePct = totalSpend > 0 ? (totalSME / totalSpend) * 100 : 0;

    return { breakdown, totalSME, smePct };
  }, [suppliers, totalSpend]);

  const { breakdown, totalSME, smePct } = smeData;
  const hasSMEData = totalSME > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="
        bg-white dark:bg-[#20242B]
        border border-black/[0.07] dark:border-white/[0.08]
        shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
        dark:shadow-none
        rounded-[24px] p-6 lg:p-7
        flex flex-col justify-between
        hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
      "
    >
      {/* Header */}
      <div className="pb-4 border-b border-black/[0.07] dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57]">
            <Building2 className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <h2 className="text-xl lg:text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
            SME Spend
          </h2>
        </div>
        <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] mt-1 font-normal">
          Spend with small and micro businesses (Udyam-registered)
        </p>
      </div>

      {/* Main Metric */}
      <div className="py-5">
        {hasSMEData ? (
          <>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl lg:text-[44px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums">
                {formatInrShort(totalSME)}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-light text-[#7D3F1E] dark:text-[#E07A57] tabular-nums">
                  {smePct.toFixed(1)}%
                </span>
                <span className="text-[11px] text-[#6F6A61] dark:text-[#9A948A] font-normal leading-tight">
                  of total spend
                </span>
              </div>
            </div>
            <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] mt-2 font-normal">
              with small and micro businesses
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#7D3F1E] dark:text-[#E07A57] shrink-0" strokeWidth={1.8} />
            <span className="text-sm text-[#6F6A61] dark:text-[#9A948A]">SME spend data pending</span>
          </div>
        )}
      </div>

      {/* Mini Stacked Bar Chart */}
      {hasSMEData && (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6F6A61] dark:text-[#9A948A]">
            Breakdown by Enterprise Size
          </p>

          {/* Stacked bar */}
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/10 gap-0.5">
            {(["Micro", "Small", "Medium"] as const).map((tier) => {
              const pct = totalSME > 0 ? (breakdown[tier] / totalSME) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <motion.div
                  key={tier}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: MSME_COLORS[tier] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  title={`${tier}: ${formatInrShort(breakdown[tier])} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Legend rows */}
          <div className="space-y-2">
            {(["Micro", "Small", "Medium"] as const).map((tier) => {
              const pct = totalSME > 0 ? (breakdown[tier] / totalSME) * 100 : 0;
              return (
                <div key={tier} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: MSME_COLORS[tier] }} />
                    <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-normal">{tier}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#6F6A61] dark:text-[#9A948A] text-xs tabular-nums">
                      {formatInrShort(breakdown[tier])}
                    </span>
                    <span className="font-semibold text-[#1F1B16] dark:text-[#F3EFE7] min-w-[36px] text-right tabular-nums text-sm">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-black/[0.07] dark:border-white/[0.08] mt-4">
        <p className="text-[11px] text-[#6F6A61] dark:text-[#9A948A] font-normal flex items-center gap-1.5">
          <Info className="w-3 h-3 shrink-0" strokeWidth={1.8} />
          Based on Udyam (MSME) registration. Tier classification per MSME Act 2006.
        </p>
      </div>
    </motion.div>
  );
}
