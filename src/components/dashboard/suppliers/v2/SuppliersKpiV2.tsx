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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 items-stretch">
      {/* 1) Col 1: Vertical Stack of Active Partners & Total Orders */}
      <div className="col-span-1 lg:col-span-1 flex flex-col gap-4">
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
            p-4 rounded-[20px]
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

          <div className="text-2xl font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-none my-1.5 tabular-nums">
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
            p-4 rounded-[20px]
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

          <div className="text-2xl font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none my-1.5 tabular-nums">
            <AnimatedCounter value={totalOrders} delay={0.25} />
          </div>
        </motion.div>
      </div>

      {/* 2) Col 2: Sustainable Spend (Relocated next to stack) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="
          col-span-1 lg:col-span-1
          bg-white dark:bg-[#20242B]
          border border-black/[0.07] dark:border-white/[0.08]
          shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
          dark:shadow-none dark:border-t-white/[0.12]
          p-5 lg:p-6 rounded-[24px]
          flex flex-col justify-between h-full
          hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        "
      >
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
            Sustainable Spend
          </span>
          <div className="w-[30px] h-[30px] rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0]">
            <Wallet className="w-3.5 h-3.5" strokeWidth={1.8} />
          </div>
        </div>

        <div className="my-auto py-2">
          <div className="text-2xl lg:text-[32px] font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none tabular-nums" aria-label={`Total spend $${Math.round(totalSpend).toLocaleString('en-US')}`}>
            <AnimatedCounter value={Math.round(totalSpend)} prefix="$" delay={0.3} />
          </div>
        </div>
      </motion.div>

      {/* 3) Col 3-4: Enlarged Sutra Verified Score */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="col-span-1 md:col-span-2 lg:col-span-2 h-full flex flex-col"
      >
        <VarnaScoreHoverCard {...varnaScoreData} className="h-full w-full flex flex-col">
          <div
            className="
              bg-white dark:bg-[#20242B]
              border border-black/[0.07] dark:border-white/[0.08]
              shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
              dark:shadow-none dark:border-t-white/[0.12]
              p-5 lg:p-6 rounded-[24px]
              flex flex-col justify-between h-full cursor-help
              hover:border-[#7D3F1E]/50 dark:hover:border-[#E07A57]/50
              hover:shadow-md transition-all duration-200
            "
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
                  Sutra Verified Score
                </span>

                {/* Band Rating Pill */}
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 text-[#7D3F1E] dark:text-[#E07A57] text-xs font-medium">
                  {bandLabel}
                </div>
              </div>

              <div className="text-5xl lg:text-6xl font-light text-[#7D3F1E] dark:text-[#E07A57] tracking-tight leading-none my-3 flex items-baseline tabular-nums">
                <AnimatedCounter
                  value={avgVarnaScore}
                  decimals={1}
                  delay={0.35}
                />
                <span className="text-xl lg:text-2xl text-[#7D3F1E]/70 dark:text-[#E07A57]/70 ml-2 font-normal">
                  /100
                </span>
              </div>
            </div>

            {/* Redesigned 5-Segment Performance Band Indicator */}
            <div className="w-full mt-2">
              <VarnaScoreBandScale score={avgVarnaScore} />
            </div>
          </div>
        </VarnaScoreHoverCard>
      </motion.div>
    </div>
  );
}
