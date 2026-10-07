"use client";

import { motion } from "framer-motion";
import { Wallet, ShoppingBag, Award, Quote } from "lucide-react";
import VarnaScoreHoverCard, { type VarnaScoreData } from "@/components/ui/VarnaScoreHoverCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import VarnaScoreBandScale, { SCORE_BANDS, getActiveBandId, PerformanceBandsLegend } from "@/components/ui/VarnaScoreBandScale";

interface KpiRowV2Props {
  totalSpend: number;
  totalOrders: number;
  avgVarnaScore: number;
  totalSuppliers: number;
  varnaScoreData: VarnaScoreData;
}

export default function KpiRowV2({
  totalSpend,
  totalOrders,
  avgVarnaScore,
  totalSuppliers,
  varnaScoreData,
}: KpiRowV2Props) {
  const activeBandId = getActiveBandId(avgVarnaScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 1) Col 1: Spend/Orders Stack (col-span-12 lg:col-span-3) */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full justify-between">
        {/* KPI 1: Sustainable Spend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="
            bg-white dark:bg-[#20242B]
            border border-black/[0.07] dark:border-white/[0.08]
            shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
            dark:shadow-none dark:border-t-white/[0.12]
            p-4 lg:p-5 rounded-[20px]
            flex flex-col justify-between
            hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
          "
        >
          {/* Top Row: Eyebrow + Icon Chip */}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
              Sustainable Spend
            </span>
            <div className="w-7 h-7 rounded-full bg-[#6E8471]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0]">
              <Wallet className="w-3.5 h-3.5" strokeWidth={1.8} />
            </div>
          </div>

          {/* Display Number */}
          <div className="text-xl lg:text-2xl font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none my-1.5 tabular-nums" aria-label={`Total spend $${Math.round(totalSpend / 83).toLocaleString('en-US')}`}>
            {totalOrders === 0 ? (
              <span className="text-lg text-[#6F6A61] dark:text-[#9A948A] font-medium">$0</span>
            ) : (
              <AnimatedCounter
                value={Math.round(totalSpend / 83)}
                prefix="$"
                delay={0.2}
              />
            )}
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
            p-4 lg:p-5 rounded-[20px]
            flex flex-col justify-between
            hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
          "
        >
          {/* Top Row: Eyebrow + Icon Chip */}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
              Total Orders
            </span>
            <div className="w-7 h-7 rounded-full bg-[#6F8391]/15 dark:bg-[#93A9B8]/20 flex items-center justify-center text-[#6F8391] dark:text-[#93A9B8]">
              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.8} />
            </div>
          </div>

          {/* Display Number */}
          <div className="text-xl lg:text-2xl font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none my-1.5 tabular-nums">
            {totalOrders === 0 ? (
              <span className="text-lg text-[#6F6A61] dark:text-[#9A948A] font-medium">0</span>
            ) : (
              <AnimatedCounter value={totalOrders} delay={0.25} />
            )}
          </div>
        </motion.div>
      </div>

      {/* 2) Col 2: Sutra Verified Score Card (col-span-12 lg:col-span-6) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="col-span-12 lg:col-span-6 h-full flex flex-col"
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
            {/* Top Section: Title & Number */}
            <div>
              {/* Top Row: Eyebrow + Icon Chip */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
                  Sutra Verified Score
                </span>
                <div className="w-[30px] h-[30px] rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57]">
                  <Award className="w-3.5 h-3.5" strokeWidth={1.8} />
                </div>
              </div>

              {/* Display Number (Brown #7D3F1E / #E07A57) */}
              <div className="text-2xl lg:text-[32px] font-light text-[#7D3F1E] dark:text-[#E07A57] tracking-tight leading-none mt-2 flex items-baseline tabular-nums">
                <AnimatedCounter
                  value={avgVarnaScore}
                  decimals={1}
                  delay={0.3}
                />
                <span className="text-base text-[#7D3F1E]/70 dark:text-[#E07A57]/70 ml-1 font-normal">
                  /100
                </span>
              </div>
            </div>

            {/* Bottom Section: Legend & Segmented Chart */}
            <div className="w-full mt-4">
              {/* Performance Bands Legend aligned 1-to-1 in 5-columns directly over the 5 bar segments */}
              <PerformanceBandsLegend activeScore={avgVarnaScore} orientation="horizontal" className="mb-2" />

              {/* Segmented Horizontal Line Chart */}
              <div className="w-full">
                <VarnaScoreBandScale score={avgVarnaScore} legendOrientation="none" />
              </div>
            </div>
          </div>
        </VarnaScoreHoverCard>
      </motion.div>

      {/* 3) Col 3: Quote Box (col-span-12 lg:col-span-3) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="
          col-span-12 lg:col-span-3
          bg-gradient-to-br from-[#7D3F1E] to-[#663318] dark:from-[#8A4622] dark:to-[#552811]
          text-white p-5 lg:p-[22px] rounded-[24px]
          border border-[#663318] dark:border-white/10 shadow-sm
          flex flex-col justify-center items-center text-center
          relative overflow-hidden min-h-[160px] h-full
        "
      >
        {/* Oversized Faint Decorative Quote Mark */}
        <div className="absolute right-3 bottom-2 opacity-[0.06] pointer-events-none text-white select-none">
          <Quote className="w-24 h-24" />
        </div>

        <p className="varna-tagline-text text-white/95 text-[20px] sm:text-[22px] lg:text-[24px] leading-[1.3] font-normal text-balance relative z-10">
          Products become purpose<br />
          Rooms become stories<br />
          Hotels become impact makers
        </p>
      </motion.div>
    </div>
  );
}
