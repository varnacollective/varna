"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import BrandLogo from "@/components/ui/BrandLogo";
import ExportButton from "@/components/ExportButton";
import type { DashboardData } from "@/lib/mock-data";

interface WelcomeCardV2Props {
  clientName: string;
  industry?: string;
  logoPath?: string;
  totalSuppliers?: number;
  totalOrders?: number;
  ratingBand?: string;
  dashboardData?: DashboardData | null;
}

export default function WelcomeCardV2({
  clientName,
  industry = "Hospitality",
  logoPath,
  totalSuppliers = 3,
  totalOrders = 5,
  ratingBand = "Advanced band",
  dashboardData,
}: WelcomeCardV2Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 8 Cols: Welcome Card (Cream #F4EACF; Dark: #2B2720) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-8
          bg-[#F4EACF] dark:bg-[#2B2720]
          border border-[#E8DFC5] dark:border-[#F4EACF]/14
          p-7 lg:p-9 rounded-[24px] shadow-sm
          flex flex-col sm:flex-row items-center sm:items-center gap-7 lg:gap-9
          relative overflow-hidden min-h-[300px] justify-center
        "
      >
        {/* Faint Decorative Background SVG (Concentric Arcs / Leaf Art) */}
        <div className="absolute right-0 bottom-0 opacity-[0.06] pointer-events-none transform translate-x-1/6 translate-y-1/6 select-none">
          <svg width="340" height="340" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="#7D3F1E" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="65" stroke="#7D3F1E" strokeWidth="2" />
            <path d="M100 10 L100 190 M10 100 L190 100" stroke="#7D3F1E" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Large White Circular Logo Container (Single Clean Outer Circle - P1-9 fixed) */}
        <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-full bg-white dark:bg-white shadow-md flex items-center justify-center p-5 border border-black/10 shrink-0 relative z-10">
          <BrandLogo
            logoPath={logoPath}
            alt={clientName}
            name={clientName}
            size="lg"
            entityType="client"
          />
        </div>

        {/* Vertically Centered Text Stack (P1-6 fixed) */}
        <div className="flex flex-col justify-center text-center sm:text-left flex-1 min-w-0 relative z-10 py-1">
          <p className="text-[18px] font-normal text-[#5B564E] dark:text-[#C2BCB0] mb-1">
            Welcome to your Varna Dashboard
          </p>

          {/* Dynamic Display Title with Clamp */}
          <h1 className="font-light font-display uppercase tracking-[0.12em] leading-[1.05] text-[#1F1B16] dark:text-[#F1E6C8] text-[32px] sm:text-[40px] lg:text-[48px] xl:text-[56px] text-balance break-words my-1.5">
            {clientName}
          </h1>

          {/* Meta Row: Sector + Active Assessment Interval with Softly Pulsing Dot */}
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 flex-wrap">
            <span className="text-sm font-normal text-[#5B564E] dark:text-[#C2BCB0]">
              {industry}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7D3F1E]/30 dark:bg-[#F1E6C8]/30" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-[#7D3F1E]/15 dark:border-[#F1E6C8]/20 text-xs text-[#7D3F1E] dark:text-[#F1E6C8] font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#7D3F1E] dark:bg-[#E07A57] animate-pulse" />
              <span>Active Assessment Interval</span>
            </div>
          </div>

          {/* D6 Derived Insight Chips (At a Glance) */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-4 flex-wrap pt-3 border-t border-[#7D3F1E]/12 dark:border-[#F1E6C8]/15">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#7D3F1E]/10 dark:bg-[#F1E6C8]/10 text-[#7D3F1E] dark:text-[#F1E6C8]">
              {totalSuppliers} supplier enterprises
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#6E8471]/15 dark:bg-[#9DB4A0]/20 text-[#55705A] dark:text-[#9DB4A0]">
              {totalOrders} fulfilled orders
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#6F8391]/15 dark:bg-[#93A9B8]/20 text-[#6F8391] dark:text-[#93A9B8]">
              {ratingBand}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 4 Cols: Hero Hotel Image Card (W3 & P1-8 fixed) */}
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
          src="/assets/Dashboard_Hotel.svg"
          alt="Hotel Showcase Visual"
          fill
          className="object-cover rounded-[24px] transition-transform duration-700 group-hover:scale-[1.03] dark:brightness-95"
          priority
        />

        {/* Gradient Scrim (Transparent → rgba(0,0,0,0.5)) */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none rounded-[24px]" />

        {/* Brand Brown Pill Export Button Overlaid Bottom Left */}
        <div className="relative z-10">
          {dashboardData ? (
            <ExportButton data={dashboardData} variant="topbar" />
          ) : (
            <button
              disabled
              className="bg-[#7D3F1E] text-white px-5 py-2.5 rounded-full text-xs font-medium uppercase tracking-wider flex items-center gap-2 shadow-md cursor-not-allowed opacity-60"
            >
              Export Report
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
