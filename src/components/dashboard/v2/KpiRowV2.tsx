"use client";

import { motion } from "framer-motion";
import { Wallet, ShoppingBag, Award, Quote } from "lucide-react";
import VarnaScoreHoverCard, { type VarnaScoreData } from "@/components/ui/VarnaScoreHoverCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import VarnaScoreBandScale from "@/components/ui/VarnaScoreBandScale";

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 8 Cols: 3 Equal-Width KPI Cards (P1-5 fixed) */}
      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
        {/* KPI 1: Total Spend */}
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
          {/* Top Row: Eyebrow + 36px Tinted Icon Chip (W4) */}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
              Total Spend
            </span>
            <div className="w-9 h-9 rounded-full bg-[#6E8471]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0]">
              <Wallet className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>

          {/* Display Number (Text-Safe Sage #55705A / #9DB4A0) */}
          <div className="text-3xl lg:text-[38px] font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none my-3 tabular-nums" aria-label={`Total spend $${Math.round(totalSpend / 83).toLocaleString('en-US')}`}>
            {totalOrders === 0 ? (
              <span className="text-xl text-[#6F6A61] dark:text-[#9A948A] font-medium">$0</span>
            ) : (
              <AnimatedCounter
                value={Math.round(totalSpend / 83)}
                prefix="$"
                delay={0.2}
              />
            )}
          </div>

          {/* Caption */}
          <p className="text-[13px] text-[#5B564E] dark:text-[#C2BCB0] font-normal leading-snug">
            {totalOrders === 0 ? "No data in this period" : " "}
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
          {/* Top Row: Eyebrow + Icon Chip */}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-full bg-[#6F8391]/15 dark:bg-[#93A9B8]/20 flex items-center justify-center text-[#6F8391] dark:text-[#93A9B8]">
              <ShoppingBag className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>

          {/* Display Number */}
          <div className="text-3xl lg:text-[42px] font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none my-3 tabular-nums">
            {totalOrders === 0 ? (
              <span className="text-xl text-[#6F6A61] dark:text-[#9A948A] font-medium">0</span>
            ) : (
              <AnimatedCounter value={totalOrders} delay={0.25} />
            )}
          </div>

          {/* Caption */}
          <p className="text-[13px] text-[#5B564E] dark:text-[#C2BCB0] font-normal leading-snug">
            {totalOrders === 0 ? "No data in this period" : ` `}
          </p>
        </motion.div>

        {/* KPI 3: Average Varna Score with Hover Breakdown (NO TRANSFORM to prevent clipping! - P1-4 & Constraint 4) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
              {/* Top Row: Eyebrow + Icon Chip */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
                  Average Varna Score
                </span>
                <div className="w-9 h-9 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57]">
                  <Award className="w-4 h-4" strokeWidth={1.8} />
                </div>
              </div>

              {/* Display Number (Brown #7D3F1E / #E07A57) */}
              <div className="text-3xl lg:text-[42px] font-light text-[#7D3F1E] dark:text-[#E07A57] tracking-tight leading-none my-3 flex items-baseline tabular-nums">
                <AnimatedCounter
                  value={avgVarnaScore}
                  decimals={1}
                  delay={0.3}
                />
                <span className="text-base text-[#7D3F1E]/70 dark:text-[#E07A57]/70 ml-1 font-normal">
                  /100
                </span>
              </div>

              {/* Redesigned 5-Segment Performance Band Indicator */}
              <VarnaScoreBandScale score={avgVarnaScore} />
            </div>
          </VarnaScoreHoverCard>
        </motion.div>
      </div>

      {/* 4 Cols: Tagline Card (Handwritten Script Font - P1-10 & W5 fixed) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-4
          bg-gradient-to-br from-[#7D3F1E] to-[#663318] dark:from-[#8A4622] dark:to-[#552811]
          text-white p-7 lg:p-8 rounded-[24px]
          border border-[#663318] dark:border-white/10 shadow-sm
          flex flex-col justify-center items-center text-center
          relative overflow-hidden min-h-[200px] h-full
        "
      >

        {/* Oversized Faint Decorative Quote Mark */}
        <div className="absolute right-3 bottom-2 opacity-[0.06] pointer-events-none text-white select-none">
          <Quote className="w-32 h-32" />
        </div>

        <p className="varna-tagline-text text-white/95 text-[26px] sm:text-[30px] lg:text-[32px] leading-[1.3] font-normal text-balance relative z-10">
          Products become purpose<br />
          Rooms become stories<br />
          Hotels become impact makers
        </p>
      </motion.div>
    </div>
  );
}
