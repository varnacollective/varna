"use client";

import { motion } from "framer-motion";
import { Calendar, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Image from "next/image";

import BrandLogo from "@/components/ui/BrandLogo";
import ExportButton from "@/components/ExportButton";
import type { DashboardData } from "@/lib/mock-data";

interface TopBarProps {
  clientName: string;
  industry?: string;
  logoPath?: string;
  clientDetails?: Record<string, any>;
  dashboardData?: DashboardData | null;
}

export default function TopBar({ clientName, industry, logoPath, clientDetails, dashboardData }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const defaultDetails = clientDetails || {
    "Industry Sector": industry,
    "Account Status": "Active Assessment Interval",
    "Portal Access": "Authenticated Enterprise Client",
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="
        varna-topbar
        flex flex-col md:flex-row items-start md:items-center justify-between
        px-6 py-6 sm:px-8 sm:py-7 mb-8 gap-6
        bg-[#F4F1EA] dark:bg-[#1E2028]
        border border-[#EAE5DC] dark:border-[#9BA9B4]/16
        shadow-[0_1px_3px_rgba(26,31,38,0.04),0_4px_16px_rgba(26,31,38,0.05)]
        dark:shadow-elevation-dark-low
        rounded-xl relative overflow-hidden
      "
    >
      {/* Left: Branding & Welcome Section */}
      <div className="flex flex-col items-start relative z-10 max-w-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <img src="/logo-light.svg" alt="Varna" className="block dark:hidden h-6 sm:h-7 w-auto object-contain shrink-0" />
          <img src="/logo-dark.svg" alt="Varna" className="hidden dark:block h-6 sm:h-7 w-auto object-contain shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#B85333] dark:text-[#C85D3B]">
            Your Procurement Impact explained
          </span>
        </div>

        <div className="flex items-center gap-4 mt-1">
          <BrandLogo
            logoPath={logoPath}
            alt={clientName}
            name={clientName}
            size="md"
            entityType="client"
            details={defaultDetails}
          />
          {/* Refined Serif client name */}
          <h1 className="varna-client-h1 font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight leading-none">
            {clientName}
          </h1>
        </div>

        {industry && (
          <p className="text-xs text-[#6E7781] dark:text-[#9BA9B4] mt-2.5 font-light tracking-wide flex items-center gap-2">
            <span>{industry}</span>
          </p>
        )}
      </div>

      {/* Right: Hotel SVG Visual & Action Buttons */}
      <div className="varna-topbar-actions flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10 shrink-0 w-full md:w-auto justify-end">
        {/* Hotel Visual Image */}
        <div className="relative overflow-hidden rounded-xl border border-[#E0D8C8] dark:border-[#9BA9B4]/20 shadow-xs shrink-0 hidden lg:block">
          <Image
            src="/assets/Dashboard_Hotel.svg"
            alt="Hotel Banner Visual"
            width={240}
            height={130}
            className="object-cover rounded-xl w-auto h-28"
            priority
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          {/* Date display */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-[#6E7781] dark:text-[#9BA9B4] font-light tracking-wider uppercase pr-2">
            <Calendar className="w-3.5 h-3.5 text-[#6E7781] dark:text-[#9BA9B4] shrink-0" strokeWidth={1.5} />
            <span>{currentDate}</span>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="
                p-2.5 border border-[#EAE5DC] dark:border-[#9BA9B4]/25
                hover:border-[#B85333]/40 dark:hover:border-[#C85D3B]/50
                text-[#6E7781] dark:text-[#9BA9B4]
                hover:text-[#B85333] dark:hover:text-[#C85D3B]
                bg-white dark:bg-[#252830]
                rounded-lg transition-all duration-200 cursor-pointer shadow-xs
              "
              title="Toggle theme"
              id="theme-toggle-btn"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Export Report button */}
          {dashboardData ? (
            <ExportButton data={dashboardData} variant="topbar" />
          ) : (
            <button
              disabled
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#B85333]/40 text-white/60 text-xs font-sans uppercase tracking-widest cursor-not-allowed"
            >
              Export Report
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );

}

