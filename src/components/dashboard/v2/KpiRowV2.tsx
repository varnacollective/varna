"use client";

import { motion } from "framer-motion";
import VarnaScoreHoverCard, { type VarnaScoreData } from "@/components/ui/VarnaScoreHoverCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface KpiRowV2Props {
  totalSpend: number;
  totalOrders: number;
  avgVarnaScore: number;
  totalSuppliers: number;
  varnaScoreData: VarnaScoreData;
}

function formatInrCurrency(val: number): string {
  return `INR ${val.toLocaleString("en-IN")}`;
}

function getBandCaption(score: number): string {
  if (score >= 85) return "Leader band: 85–100";
  if (score >= 70) return "Advanced band: 70–84";
  if (score >= 55) return "Emerging band: 55–69";
  if (score >= 40) return "Foundational band: 40–54";
  return "Not Ready band: <40";
}

export default function KpiRowV2({
  totalSpend,
  totalOrders,
  avgVarnaScore,
  totalSuppliers,
  varnaScoreData,
}: KpiRowV2Props) {
  const bandCaption = getBandCaption(avgVarnaScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 8 Cols: 3 KPI Cards */}
      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* KPI 1: Total Spend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="
            bg-white dark:bg-[#1E2028]
            border border-[#EAE5DC] dark:border-[#9BA9B4]/16
            p-6 rounded-2xl shadow-sm
            flex flex-col justify-between min-h-[205px]
          "
        >
          <span className="text-xs text-[#6F848F] dark:text-[#8C9DA8] font-normal uppercase tracking-wider">
            Total Spend
          </span>

          <div className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#6E8471] dark:text-[#8AA391] tracking-tight my-2">
            <AnimatedCounter
              value={totalSpend}
              prefix="INR "
              delay={0.2}
            />
          </div>

          <p className="text-[11px] text-[#6F848F] dark:text-[#8C9DA8] font-light leading-snug">
            Across vetted ethical artisanal enterprises
          </p>
        </motion.div>

        {/* KPI 2: Total Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="
            bg-white dark:bg-[#1E2028]
            border border-[#EAE5DC] dark:border-[#9BA9B4]/16
            p-6 rounded-2xl shadow-sm
            flex flex-col justify-between min-h-[205px]
          "
        >
          <span className="text-xs text-[#6F848F] dark:text-[#8C9DA8] font-normal uppercase tracking-wider">
            Total Orders
          </span>

          <div className="text-3xl sm:text-4xl font-light text-[#6E8471] dark:text-[#8AA391] tracking-tight my-2">
            <AnimatedCounter value={totalOrders} delay={0.25} />
          </div>

          <p className="text-[11px] text-[#6F848F] dark:text-[#8C9DA8] font-light leading-snug">
            Fulfilled by {totalSuppliers} verified craft group{totalSuppliers !== 1 ? "s" : ""}
          </p>
        </motion.div>

        {/* KPI 3: Average Varna Score with Hover Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <VarnaScoreHoverCard {...varnaScoreData}>
            <div
              className="
                bg-white dark:bg-[#1E2028]
                border border-[#EAE5DC] dark:border-[#9BA9B4]/16
                p-6 rounded-2xl shadow-sm
                flex flex-col justify-between min-h-[205px] cursor-help
                hover:border-[#7D3F1E]/40 transition-colors duration-200
                h-full
              "
            >
              <span className="text-xs text-[#6F848F] dark:text-[#8C9DA8] font-normal uppercase tracking-wider">
                Average Varna Score
              </span>

              <div className="text-3xl sm:text-4xl font-light text-[#7D3F1E] dark:text-[#D87D56] tracking-tight my-2 flex items-baseline">
                <AnimatedCounter
                  value={avgVarnaScore}
                  decimals={1}
                  delay={0.3}
                />
                <span className="text-base text-[#7D3F1E]/70 dark:text-[#D87D56]/70 ml-1 font-normal">
                  /100
                </span>
              </div>

              <p className="text-[11px] text-[#6F848F] dark:text-[#8C9DA8] font-light leading-snug">
                {bandCaption}
              </p>
            </div>
          </VarnaScoreHoverCard>
        </motion.div>
      </div>

      {/* 4 Cols: Tagline Card (Rich Terracotta/Brown) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-4
          bg-[#7D3F1E] dark:bg-[#6A3518]
          text-white p-6 rounded-2xl
          border border-[#663318] shadow-sm
          flex flex-col justify-center items-center text-center
          relative overflow-hidden min-h-[205px]
        "
      >
        <p className="font-serif italic text-white/95 text-base sm:text-lg lg:text-xl leading-relaxed font-normal">
          Products become purpose<br />
          Rooms become stories<br />
          Hotels become impact makers
        </p>
      </motion.div>
    </div>
  );
}
