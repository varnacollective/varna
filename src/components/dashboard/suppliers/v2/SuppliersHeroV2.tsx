"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar } from "lucide-react";
import ExportButton from "@/components/ExportButton";
import type { DashboardData } from "@/lib/mock-data";

interface SuppliersHeroV2Props {
  dateRangeText?: string;
  dashboardData?: DashboardData | null;
}

export default function SuppliersHeroV2({
  dateRangeText = "Apr 1 – Jun 30, 2026",
  dashboardData,
}: SuppliersHeroV2Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 8 Cols: Hero Banner Card (Cream #F4EACF; Dark: #2B2720) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-8
          bg-[#F4EACF] dark:bg-[#2B2720]
          border border-[#E8DFC5] dark:border-[#F4EACF]/14
          p-7 lg:p-10 rounded-[24px] shadow-sm
          flex flex-col justify-between min-h-[300px]
          relative overflow-hidden
        "
      >

        {/* Faint Decorative Background SVG Line Art */}
        <div className="absolute right-0 bottom-0 opacity-[0.05] pointer-events-none transform translate-x-1/6 translate-y-1/6 select-none">
          <svg width="340" height="340" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="#7D3F1E" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M100 10 L100 190 M10 100 L190 100" stroke="#7D3F1E" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <span className="text-xl lg:text-[22px] font-normal text-[#1F1B16] dark:text-[#F1E6C8]">
            My Suppliers
          </span>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E2028] border border-black/10 dark:border-white/15 text-xs text-[#5B564E] dark:text-[#C2BCB0] font-medium tracking-wide shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-[#7D3F1E] dark:text-[#E07A57]" strokeWidth={1.8} />
              <span className="uppercase text-[11px] tracking-wider font-semibold">{dateRangeText}</span>
            </div>

            {/* Export Report Pill */}
            {dashboardData ? (
              <ExportButton data={dashboardData} variant="topbar" />
            ) : (
              <button
                disabled
                className="bg-[#7D3F1E] text-white px-5 py-2 rounded-full text-xs font-medium uppercase tracking-wider flex items-center gap-2 shadow-md cursor-not-allowed opacity-60"
              >
                Export Report
              </button>
            )}
          </div>
        </div>

        {/* Central Headline Stack */}
        <div className="my-auto py-4 relative z-10">
          <h1 className="font-light font-display uppercase tracking-[0.12em] leading-[1.1] text-[#1F1B16] dark:text-[#F1E6C8] text-[28px] sm:text-[36px] lg:text-[46px] xl:text-[52px] text-balance break-words">
            THE  CURATED PARTNERS POWERING YOUR ORDERS
          </h1>
          <p className="text-sm lg:text-[15px] text-[#5B564E] dark:text-[#C2BCB0] font-normal max-w-2xl mt-2 leading-relaxed">
            Scores, evidence and order details for each enterprise that fulfilled your orders.
          </p>
        </div>

        {/* 6–8px Brand Brown Bottom Accent Strip */}
        <div className="absolute inset-x-0 bottom-0 h-2 bg-[#7D3F1E] dark:bg-[#8A4622] rounded-b-[24px]" />
      </motion.div>

      {/* 4 Cols: Craftsman Visual Image Card (S2 & Part 3 fixed) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-4
          rounded-[24px] overflow-hidden relative min-h-[300px]
          border border-black/[0.07] dark:border-white/[0.12] shadow-sm
          bg-[#1F1B16] group flex flex-col justify-end p-6
        "
      >
        <Image
          src="/assets/Suppliers_visual.svg"
          alt="Craftsman at work visual"
          fill
          className="object-cover rounded-[24px] object-[50%_35%] transition-transform duration-700 group-hover:scale-[1.03] dark:brightness-90"
          priority
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none rounded-[24px]" />

        {/* Overlaid Bottom-Left Note Card with Script Text */}
        {/* <div className="relative z-10 p-4 rounded-2xl bg-[#F4EACF]/95 dark:bg-[#2B2720]/95 backdrop-blur-md border border-[#E8DFC5] dark:border-[#F4EACF]/20 shadow-md max-w-[280px]">
          <p className="varna-script-text text-[#7D3F1E] dark:text-[#F1E6C8] text-xl lg:text-[24px] leading-tight font-normal">
            Every credible assessment begins with evidence
          </p>
        </div> */}
      </motion.div>
    </div>
  );
}
