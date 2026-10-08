"use client";

import { motion } from "framer-motion";
import { Building, ShoppingBag, Wallet, Award } from "lucide-react";
import VarnaScoreHoverCard, { type VarnaScoreData } from "@/components/ui/VarnaScoreHoverCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import VarnaScoreBandScale, { PerformanceBandsLegend } from "@/components/ui/VarnaScoreBandScale";

interface SuppliersKpiV2Props {
  totalSuppliers: number;
  totalOrders: number;
  totalSpend: number;
  avgVarnaScore: number;
  supplierNames?: string[];
  varnaScoreData: VarnaScoreData;
}

function getBandLabel(score: number): string {
  if (score >= 85) return "Leader";
  if (score >= 70) return "Advanced";
  if (score >= 55) return "Emerging";
  if (score >= 40) return "Foundational";
  return "Not Ready";
}

export default function SuppliersKpiV2({
  totalSuppliers = 3,
  totalOrders = 5,
  totalSpend = 3773,
  avgVarnaScore = 67.6,
  supplierNames = ["Bare Necessities", "Kheoni Ventures", "UKHI India"],
  varnaScoreData,
}: SuppliersKpiV2Props) {
  const bandLabel = getBandLabel(avgVarnaScore);

  // D3 Derived Insight: Format list of supplier names cleanly using Intl.ListFormat
  let supplierNamesCaption = "Across verified artisanal partners";
  if (supplierNames.length > 0) {
    const shortNames = supplierNames.map((name) => {
      const lower = (name || "").toLowerCase();
      if (lower.includes("bare")) return "Bare Necessities";
      if (lower.includes("kheoni")) return "Kheoni Ventures";
      if (lower.includes("ukhi")) return "UKHI India";
      return (name || "").split(" ")[0] || "Partner";
    });

    try {
      const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
      supplierNamesCaption = formatter.format(shortNames.slice(0, 3));
      if (shortNames.length > 3) {
        supplierNamesCaption += ` and ${shortNames.length - 3} more`;
      }
    } catch {
      supplierNamesCaption = shortNames.join(", ");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6 items-stretch">
      {/* 1) Column 1: Vertical Stack of Active Partners & Total Orders */}
      <div className="col-span-12 lg:col-span-3 xl:col-span-2 flex flex-col gap-4 h-full">
        {/* KPI 1: Active Partners */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="
            bg-white dark:bg-[#20242B]
            border border-black/[0.07] dark:border-white/[0.08]
            shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
            dark:shadow-none dark:border-t-white/[0.12]
            p-4 rounded-[20px] flex-1
            flex flex-col justify-between
            hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
          "
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
              Active Partners
            </span>
            <div className="w-7 h-7 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57]">
              <Building className="w-3.5 h-3.5" strokeWidth={1.8} />
            </div>
          </div>

          <div className="text-2xl font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-none mt-1.5 tabular-nums">
            <AnimatedCounter value={totalSuppliers} delay={0.2} />
          </div>
        </motion.div>

        {/* KPI 2: Total Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="
            bg-white dark:bg-[#20242B]
            border border-black/[0.07] dark:border-white/[0.08]
            shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
            dark:shadow-none dark:border-t-white/[0.12]
            p-4 rounded-[20px] flex-1
            flex flex-col justify-between
            hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
          "
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
              Total Orders
            </span>
            <div className="w-7 h-7 rounded-full bg-[#6F8391]/15 dark:bg-[#93A9B8]/20 flex items-center justify-center text-[#6F8391] dark:text-[#93A9B8]">
              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.8} />
            </div>
          </div>

          <div className="text-2xl font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none mt-1.5 tabular-nums">
            <AnimatedCounter value={totalOrders} delay={0.25} />
          </div>
        </motion.div>
      </div>

      {/* 2) Column 2: Sustainable Spend above Sutra Verified Score stack */}
      <div className="col-span-12 lg:col-span-9 xl:col-span-10 flex flex-col gap-4 h-full">
        {/* KPI 3: Sustainable Spend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="
            bg-white dark:bg-[#20242B]
            border border-black/[0.07] dark:border-white/[0.08]
            shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
            dark:shadow-none dark:border-t-white/[0.12]
            p-4 rounded-[20px]
            flex items-center justify-between
            hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
          "
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0] shrink-0">
              <Wallet className="w-3.5 h-3.5" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
                Sustainable Spend
              </span>
              <span className="text-xs text-[#5B564E] dark:text-[#C2BCB0] font-normal leading-none">
                Verified procurement spend
              </span>
            </div>
          </div>

          <div className="text-2xl sm:text-[26px] font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none tabular-nums" aria-label={`Total spend $${Math.round(totalSpend).toLocaleString('en-US')}`}>
            <AnimatedCounter value={Math.round(totalSpend)} prefix="$" delay={0.3} />
          </div>
        </motion.div>

        {/* KPI 4: Sutra Verified Score */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col min-h-0"
        >
          <VarnaScoreHoverCard {...varnaScoreData} className="h-full w-full flex flex-col">
            <div
              className="
                bg-white dark:bg-[#20242B]
                border border-black/[0.07] dark:border-white/[0.08]
                shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
                dark:shadow-none dark:border-t-white/[0.12]
                py-3 px-4 rounded-[20px]
                flex flex-col justify-between h-full cursor-help
                hover:border-[#7D3F1E]/50 dark:hover:border-[#E07A57]/50
                hover:shadow-md transition-all duration-200
              "
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight uppercase">
                    Sutra Verified Score
                  </span>

                  {/* Band Rating Pill */}
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 text-[#7D3F1E] dark:text-[#E07A57] text-[10px] font-medium">
                    {bandLabel}
                  </div>
                </div>

                <div className="text-2xl font-light text-[#7D3F1E] dark:text-[#E07A57] tracking-tight leading-none flex items-baseline tabular-nums">
                  <AnimatedCounter
                    value={avgVarnaScore}
                    decimals={1}
                    delay={0.35}
                  />
                  <span className="text-xs text-[#7D3F1E]/70 dark:text-[#E07A57]/70 ml-0.5 font-normal">
                    /100
                  </span>
                </div>
              </div>

              {/* Bottom Section: Flushed Legend directly over Segmented Line Chart */}
              <div className="w-full mt-1.5 flex flex-col">
                <PerformanceBandsLegend activeScore={avgVarnaScore} orientation="horizontal" className="mb-0" />
                <div className="w-full mt-0 pt-0">
                  <VarnaScoreBandScale score={avgVarnaScore} legendOrientation="none" className="my-0 mt-0 pt-0" />
                </div>
              </div>
            </div>
          </VarnaScoreHoverCard>
        </motion.div>
      </div>
    </div>
  );
}
