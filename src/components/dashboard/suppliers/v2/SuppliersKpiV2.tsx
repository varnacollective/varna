"use client";

import { motion } from "framer-motion";
import { Building, ShoppingBag, Wallet, Award } from "lucide-react";
import VarnaScoreHoverCard, { type VarnaScoreData } from "@/components/ui/VarnaScoreHoverCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import VarnaScoreBandScale from "@/components/ui/VarnaScoreBandScale";

interface SuppliersKpiV2Props {
  totalSuppliers: number;
  totalOrders: number;
  totalSpend: number;
  avgVarnaScore: number;
  supplierNames?: string[];
  varnaScoreData: VarnaScoreData;
}

function getBandCaption(score: number): string {
  if (score >= 85) return "Leader band: 85–100";
  if (score >= 70) return "Advanced band: 70–84";
  if (score >= 55) return "Emerging band: 55–69";
  if (score >= 40) return "Foundational band: 40–54";
  return "Not Ready band: <40";
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
  avgVarnaScore = 75.3,
  supplierNames = ["Bare Necessities", "Kheoni Ventures", "UKHI India"],
  varnaScoreData,
}: SuppliersKpiV2Props) {
  const bandCaption = getBandCaption(avgVarnaScore);
  const bandLabel = getBandLabel(avgVarnaScore);

  // D3 Derived Insight: Format list of supplier names cleanly using Intl.ListFormat
  let supplierNamesCaption = "Across verified artisanal partners";
  if (supplierNames.length > 0) {
    const shortNames = supplierNames.map((name) => {
      if (name.toLowerCase().includes("bare")) return "Bare Necessities";
      if (name.toLowerCase().includes("kheoni")) return "Kheoni Ventures";
      if (name.toLowerCase().includes("ukhi")) return "UKHI India";
      return name.split(" ")[0];
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 items-stretch">
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
          p-6 lg:p-7 rounded-[24px]
          flex flex-col justify-between min-h-[200px] h-full
          hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        "
      >
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
            Active Partners
          </span>
          <div className="w-9 h-9 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57]">
            <Building className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="text-3xl lg:text-[42px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-none my-3 tabular-nums">
          <AnimatedCounter value={totalSuppliers} delay={0.2} />
        </div>

        {/* D3 Derived Insight Caption */}
        <p className="text-[13px] text-[#5B564E] dark:text-[#C2BCB0] font-normal leading-snug truncate" title={supplierNamesCaption}>
          {supplierNamesCaption}
        </p>
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
          p-6 lg:p-7 rounded-[24px]
          flex flex-col justify-between min-h-[200px] h-full
          hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        "
      >
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
            Total Orders
          </span>
          <div className="w-9 h-9 rounded-full bg-[#6F8391]/15 dark:bg-[#93A9B8]/20 flex items-center justify-center text-[#6F8391] dark:text-[#93A9B8]">
            <ShoppingBag className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="text-3xl lg:text-[42px] font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none my-3 tabular-nums">
          <AnimatedCounter value={totalOrders} delay={0.25} />
        </div>

        {/* P1-7 fixed: Across N partners */}
        <p className="text-[13px] text-[#5B564E] dark:text-[#C2BCB0] font-normal leading-snug">
          Across {totalSuppliers} partner enterprise{totalSuppliers !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* KPI 3: Total Spend */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="
          bg-white dark:bg-[#20242B]
          border border-black/[0.07] dark:border-white/[0.08]
          shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
          dark:shadow-none dark:border-t-white/[0.12]
          p-6 lg:p-7 rounded-[24px]
          flex flex-col justify-between min-h-[200px] h-full
          hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        "
      >
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
            Total Spend
          </span>
          <div className="w-9 h-9 rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0]">
            <Wallet className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="text-3xl lg:text-[38px] font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none my-3 tabular-nums" aria-label={`Total spend $${Math.round(totalSpend).toLocaleString('en-US')}`}>
          <AnimatedCounter value={Math.round(totalSpend)} prefix="$" delay={0.3} />
        </div>


      </motion.div>

      {/* KPI 4: Average Varna Score with Hover Breakdown (NO TRANSFORM to prevent popover clipping!) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="h-full"
      >
        <VarnaScoreHoverCard {...varnaScoreData}>
          <div
            className="
              bg-white dark:bg-[#20242B]
              border border-black/[0.07] dark:border-white/[0.08]
              shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
              dark:shadow-none dark:border-t-white/[0.12]
              p-6 lg:p-7 rounded-[24px]
              flex flex-col justify-between min-h-[200px] h-full cursor-help
              hover:border-[#7D3F1E]/50 dark:hover:border-[#E07A57]/50
              hover:shadow-md transition-all duration-200
            "
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
                Avg. Varna Score
              </span>

              {/* D1 Band Rating Pill */}
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 text-[#7D3F1E] dark:text-[#E07A57] text-[11px] font-medium">
                {bandLabel}
              </div>
            </div>

            <div className="text-3xl lg:text-[42px] font-light text-[#7D3F1E] dark:text-[#E07A57] tracking-tight leading-none my-3 flex items-baseline tabular-nums">
              <AnimatedCounter
                value={avgVarnaScore}
                decimals={1}
                delay={0.35}
              />
              <span className="text-base text-[#7D3F1E]/70 dark:text-[#E07A57]/70 ml-1 font-normal">
                /100
              </span>
            </div>

            {/* Redesigned 5-Segment Performance Band Indicator */}
            <VarnaScoreBandScale score={avgVarnaScore} />

            <p className="text-[13px] text-[#5B564E] dark:text-[#C2BCB0] font-normal leading-snug mt-1">
              {bandCaption}
            </p>
          </div>
        </VarnaScoreHoverCard>
      </motion.div>
    </div>
  );
}
