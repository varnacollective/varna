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
  dashboardData?: DashboardData | null;
}

export default function WelcomeCardV2({
  clientName,
  industry = "Hospitality",
  logoPath,
  dashboardData,
}: WelcomeCardV2Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 8 Cols: Welcome Card (Cream) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-8
          bg-[#F4EACF] dark:bg-[#22241D]
          border border-[#E8DFC5] dark:border-[#9BA9B4]/15
          p-6 sm:p-8 rounded-2xl shadow-sm
          flex flex-col sm:flex-row items-center sm:items-start gap-6
          relative overflow-hidden min-h-[284px] justify-center sm:justify-start
        "
      >
        {/* Large White Circular Logo Container */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white dark:bg-[#1A1F26] shadow-sm flex items-center justify-center p-4 border border-[#E0D5B5] dark:border-[#9BA9B4]/20 shrink-0">
          <BrandLogo
            logoPath={logoPath}
            alt={clientName}
            name={clientName}
            size="lg"
            entityType="client"
          />
        </div>

        {/* Text Area */}
        <div className="flex flex-col justify-center text-center sm:text-left flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-normal text-[#5A5243] dark:text-[#C5BBAA] mb-1">
            Welcome to your Varna Dashboard
          </p>

          {/* Dynamic Fluid Display Title */}
          <h1 className="font-light font-display uppercase tracking-[0.12em] leading-tight text-[#2B261F] dark:text-[#FAF8F5] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl break-words my-1">
            {clientName}
          </h1>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-2 text-xs text-[#736A5A] dark:text-[#A89D8B] font-light tracking-wide flex-wrap">
            <span>{industry}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7D3F1E] dark:bg-[#D87D56]" />
            <span>Active Assessment Interval</span>
          </div>
        </div>
      </motion.div>

      {/* 4 Cols: Hero Hotel Image Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-4
          rounded-2xl overflow-hidden relative min-h-[284px]
          border border-[#EAE5DC] dark:border-[#9BA9B4]/16 shadow-sm
          bg-[#1A1F26] group flex flex-col justify-end p-6
        "
      >
        <Image
          src="/assets/Dashboard_Hotel.svg"
          alt="Hotel Showcase Visual"
          fill
          className="object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
          priority
        />
        {/* Dark overlay gradient for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none rounded-2xl" />

        {/* Export Report Pill Overlaid Bottom Left */}
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
