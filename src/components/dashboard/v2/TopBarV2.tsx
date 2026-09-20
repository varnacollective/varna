"use client";

import { motion } from "framer-motion";
import { Calendar, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import BrandLogo from "@/components/ui/BrandLogo";
import type { DashboardData } from "@/lib/mock-data";

interface TopBarV2Props {
  clientName: string;
  industry?: string;
  logoPath?: string;
  clientDetails?: Record<string, any>;
  dashboardData?: DashboardData | null;
}

export default function TopBarV2({
  clientName,
  industry,
  logoPath,
  clientDetails,
  dashboardData,
}: TopBarV2Props) {
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
        varna-topbar-v2
        w-full min-h-[88px] px-6 py-4 mb-6
        bg-white dark:bg-[#1E2028]
        border border-[#EAE5DC] dark:border-[#9BA9B4]/16
        shadow-sm rounded-2xl
        flex flex-wrap items-center justify-between gap-4
        relative z-20
      "
    >
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm sm:text-base text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight">
          Enterprise Portal
        </span>
        <span className="text-[#6F848F]/40 dark:text-[#9BA9B4]/30">|</span>
        <span className="font-semibold text-xs sm:text-sm text-[#7D3F1E] dark:text-[#D87D56] tracking-wide uppercase">
          Procurement Intelligence
        </span>
      </div>

      {/* Right: Date, Theme Toggle, Client Identity */}
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#6F848F] dark:text-[#9BA9B4] font-light uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-[#6F848F] dark:text-[#9BA9B4]" strokeWidth={1.5} />
          <span>{currentDate}</span>
        </div>

        {/* Dark / Light Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="
              p-2.5 rounded-full border border-[#EAE5DC] dark:border-[#9BA9B4]/25
              hover:border-[#7D3F1E]/40 dark:hover:border-[#D87D56]/50
              text-[#6F848F] dark:text-[#9BA9B4]
              hover:text-[#7D3F1E] dark:hover:text-[#D87D56]
              bg-[#FAF8F4] dark:bg-[#252830]
              transition-all duration-200 cursor-pointer shadow-xs
            "
            title="Toggle theme"
            id="theme-toggle-btn-v2"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Client identity pill */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#EAE5DC] dark:border-[#9BA9B4]/20">
          <BrandLogo
            logoPath={logoPath}
            alt={clientName}
            name={clientName}
            size="sm"
            entityType="client"
            details={defaultDetails}
          />
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-semibold text-[#1A1F26] dark:text-[#FAF8F5] leading-tight">
              {clientName}
            </span>
            {industry && (
              <span className="text-[10px] text-[#6F848F] dark:text-[#9BA9B4] font-light">
                {industry}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
