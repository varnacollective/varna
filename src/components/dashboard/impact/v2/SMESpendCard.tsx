"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Info, Building2 } from "lucide-react";
import type { SupplierDetail } from "@/lib/mock-data";

export interface SMESpendCardProps {
  suppliers: SupplierDetail[];
  totalSpend: number;
}

export const TIER_TO_MSME: Record<string, "Micro" | "Small" | "Medium" | null> = {
  "Micro A": "Micro",
  "Micro B": "Micro",
  "Micro": "Micro",
  "Small": "Small",
  "Medium": "Medium",
  "Platinum": "Micro",
  "Gold": "Micro",
  "Silver": "Small",
  "Bronze": "Medium",
};

export function getMsmeCategory(tier?: string): "Micro" | "Small" | "Medium" | null {
  if (!tier) return null;
  const t = tier.trim();
  if (TIER_TO_MSME[t]) return TIER_TO_MSME[t];
  const lower = t.toLowerCase();
  if (lower.includes("micro")) return "Micro";
  if (lower.includes("small")) return "Small";
  if (lower.includes("medium")) return "Medium";
  if (lower.includes("plat") || lower.includes("gold")) return "Micro";
  if (lower.includes("silv")) return "Small";
  if (lower.includes("bronz")) return "Medium";
  return null;
}

export const MSME_COLORS: Record<"Micro" | "Small" | "Medium", string> = {
  Micro: "#55705A",
  Small: "#7D3F1E",
  Medium: "#6F8391",
};

export function inrToUsd(inr: number): number {
  return inr > 0 ? Math.round(inr / 83) : 0;
}

export function formatUsd(usd: number): string {
  return `$${usd.toLocaleString("en-US")}`;
}

export interface SmeSpendResult {
  breakdown: Record<"Micro" | "Small" | "Medium", number>;
  breakdownUsd: Record<"Micro" | "Small" | "Medium", number>;
  totalSMEInr: number;
  totalSMEUsd: number;
  totalSpendUsd: number;
  smePct: number;
  hasSMEData: boolean;
}

export function computeSmeSpendData(suppliers: SupplierDetail[], totalSpendInr: number): SmeSpendResult {
  const breakdown: Record<"Micro" | "Small" | "Medium", number> = {
    Micro: 0,
    Small: 0,
    Medium: 0,
  };

  suppliers.forEach((s) => {
    const msme = getMsmeCategory(s.tier);
    if (msme) {
      breakdown[msme] += (s.totalSpend || 0);
    }
  });

  const totalSMEInr = breakdown.Micro + breakdown.Small + breakdown.Medium;
  const breakdownUsd = {
    Micro: inrToUsd(breakdown.Micro),
    Small: inrToUsd(breakdown.Small),
    Medium: inrToUsd(breakdown.Medium),
  };
  const totalSMEUsd = breakdownUsd.Micro + breakdownUsd.Small + breakdownUsd.Medium;
  const totalSpendUsd = inrToUsd(totalSpendInr);

  const rawSmePct = totalSpendInr > 0 ? (totalSMEInr / totalSpendInr) * 100 : 0;
  if (rawSmePct > 100) {
    console.warn(`[SME Spend] Data warning: raw SME percentage (${rawSmePct.toFixed(1)}%) exceeds 100% of total spend.`);
  }
  const smePct = Math.min(100, Math.max(0, rawSmePct));

  return {
    breakdown,
    breakdownUsd,
    totalSMEInr,
    totalSMEUsd,
    totalSpendUsd,
    smePct,
    hasSMEData: totalSMEInr > 0,
  };
}

export default function SMESpendCard({ suppliers, totalSpend }: SMESpendCardProps) {
  const smeData = useMemo(() => {
    return computeSmeSpendData(suppliers, totalSpend);
  }, [suppliers, totalSpend]);

  const { breakdownUsd, totalSMEUsd, smePct, hasSMEData } = smeData;

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
                {formatUsd(totalSMEUsd)}
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
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/10 gap-0.5">
            {(["Micro", "Small", "Medium"] as const).map((tier) => {
              const pct = totalSMEUsd > 0 ? (breakdownUsd[tier] / totalSMEUsd) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <motion.div
                  key={tier}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: MSME_COLORS[tier] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  title={`${tier}: ${formatUsd(breakdownUsd[tier])} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Legend rows */}
          <div className="space-y-2">
            {(["Micro", "Small", "Medium"] as const).map((tier) => {
              const amount = breakdownUsd[tier];
              const pct = totalSMEUsd > 0 ? (amount / totalSMEUsd) * 100 : 0;
              return (
                <div key={tier} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: MSME_COLORS[tier] }} />
                    <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-normal">{tier}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#6F6A61] dark:text-[#9A948A] text-xs tabular-nums">
                      {formatUsd(amount)}
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
