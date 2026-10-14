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
  const isAstorDubai = Boolean(
    (logoPath && logoPath.toLowerCase().includes("astor")) ||
    clientName.toLowerCase().includes("astor") ||
    clientName.toLowerCase().includes("a dubai")
  );

  return (
    // Use the same grid-cols-12 + gap-6 as KpiRowV2 so left edges align
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* Left: Cream Welcome Card — col-span-9 matches (3 Spend/Orders + 6 Score) below */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          col-span-12 lg:col-span-9
          bg-gradient-to-r from-[#F3ECE0] via-[#EFE5D4] to-[#E8DEC8] dark:bg-gradient-to-r dark:from-[#2B2720] dark:via-[#25221C] dark:to-[#1E1B16]
          border border-[#DFD3BD] dark:border-[#DFD3BD]/20
          p-4 lg:p-5 rounded-[24px] shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)]
          flex flex-row items-center gap-5 lg:gap-6
          relative overflow-hidden min-h-[130px] lg:min-h-[150px]
        "
      >
        {/* Faint Decorative Background SVG — Subtle Compass Watermark (opacity-25) */}
        <div className="absolute right-0 bottom-0 opacity-25 pointer-events-none transform translate-x-1/6 translate-y-1/6 select-none text-[#9A4A2E] dark:text-[#D4C5A9]">
          <svg width="320" height="320" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1.5" />
            <path d="M100 10 L100 190 M10 100 L190 100" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Circular Logo Container */}
        <div
          className={`
            w-20 h-20 lg:w-24 lg:h-24 rounded-full shrink-0
            ${isAstorDubai ? "bg-black dark:bg-black border border-[#D4AF37]/35 dark:border-[#D4AF37]/40 shadow-lg" : "bg-white dark:bg-white border border-[#E8E3DA] shadow-md"}
            flex items-center justify-center relative z-10 overflow-hidden
          `}
        >
          <BrandLogo
            logoPath={logoPath}
            alt={clientName}
            name={clientName}
            size="lg"
            entityType="client"
            className={`
              !border-0 !shadow-none !h-full !w-full !max-w-none flex items-center justify-center
              ${isAstorDubai ? "!bg-black !p-0 rounded-full overflow-hidden" : "!bg-transparent scale-140"}
            `}
          />
        </div>

        {/* Vertically Centered Text Stack */}
        <div className="flex flex-col justify-center text-left flex-1 min-w-0 relative z-10 gap-1">
          <p className="text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.12em] text-[#8C827A] dark:text-[#C2BCB0] leading-tight m-0">
            Your Procurement Impact explained
          </p>

          <h1 className="font-serif font-medium uppercase tracking-[0.1em] leading-tight text-[#1C1917] dark:text-[#F1E6C8] text-[26px] sm:text-[32px] lg:text-[38px] xl:text-[42px] text-balance break-words m-0">
            {clientName}
          </h1>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-[#9A4A2E] dark:text-[#D4C5A9] leading-none">
              {industry}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Right: Building Image Card — col-span-3 matches the Quote Box below */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="
          col-span-12 lg:col-span-3
          rounded-[24px] overflow-hidden relative min-h-[130px] lg:min-h-[150px]
          border border-[#E8E3DA] dark:border-white/[0.12] shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)]
          bg-[#1C1917] group flex flex-col justify-end p-5
        "
      >
        <Image
          src="/assets/Dashboard_Hotel.svg"
          alt="Hotel Showcase Visual"
          fill
          sizes="(max-width: 1024px) 100vw, 300px"
          className="object-cover rounded-[24px] transition-transform duration-700 group-hover:scale-[1.03] dark:brightness-95"
          priority
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none rounded-[24px]" />

        {/* Export Button */}
        <div className="relative z-10">
          {dashboardData ? (
            <ExportButton data={dashboardData} variant="topbar" />
          ) : (
            <button
              disabled
              className="backdrop-blur-md bg-[#9A4A2E]/90 hover:bg-[#823C23] text-white px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider flex items-center gap-2 shadow-md cursor-not-allowed opacity-60"
            >
              Export Report
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
