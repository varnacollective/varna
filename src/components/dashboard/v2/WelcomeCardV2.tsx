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
    <div className="flex flex-col lg:flex-row gap-6 mb-6 items-stretch">
      {/* Welcome Card (Cream #F4EACF; Dark: #2B2720) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          flex-1
          bg-[#F4EACF] dark:bg-[#2B2720]
          border border-[#E8DFC5] dark:border-[#F4EACF]/14
          p-6 lg:p-7 rounded-[24px] shadow-sm
          flex flex-col sm:flex-row items-center gap-6 lg:gap-8
          relative overflow-hidden min-h-[180px] lg:min-h-[200px] justify-center
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

        {/* Circular Logo Container - w-24 h-24 standard size */}
        <div
          className={`
            w-24 h-24 rounded-full
            ${isAstorDubai ? "bg-black dark:bg-black border border-[#D4AF37]/35 dark:border-[#D4AF37]/40 shadow-lg" : "bg-white dark:bg-white border border-black/10 shadow-md"}
            flex items-center justify-center shrink-0 relative z-10 overflow-hidden
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

        {/* Vertically Centered Text Stack - tightly grouped with gap-1 and py stripped */}
        <div className="flex flex-col justify-center text-center sm:text-left flex-1 min-w-0 relative z-10 py-0 gap-1">
          <p className="text-[15px] sm:text-[16px] font-normal text-[#5B564E] dark:text-[#C2BCB0] leading-tight m-0">
            Your Procurement Impact explained
          </p>

          {/* Dynamic Display Title with Clamp */}
          <h1 className="font-light font-display uppercase tracking-[0.12em] leading-tight text-[#1F1B16] dark:text-[#F1E6C8] text-[28px] sm:text-[36px] lg:text-[42px] xl:text-[46px] text-balance break-words m-0">
            {clientName}
          </h1>

          {/* Meta Row: Sector */}
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5 flex-wrap">
            <span className="text-sm font-normal text-[#5B564E] dark:text-[#C2BCB0] leading-none">
              {industry}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Building Image Card on right - constrained to max w-1/4 or max-w-[300px] */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="
          w-full lg:w-1/4 lg:max-w-[300px] shrink-0
          rounded-[24px] overflow-hidden relative min-h-[180px] lg:min-h-[200px]
          border border-black/[0.07] dark:border-white/[0.12] shadow-sm
          bg-[#1F1B16] group flex flex-col justify-end p-5
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
