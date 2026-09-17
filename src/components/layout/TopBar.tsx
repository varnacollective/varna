"use client";

import { motion } from "framer-motion";
import { Calendar, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

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
        flex flex-col sm:flex-row items-start sm:items-center justify-between
        px-8 py-5 mb-8 gap-4
        bg-white dark:bg-[#1E2028]
        border border-[#EAE5DC] dark:border-[#9BA9B4]/16
        shadow-[0_1px_3px_rgba(26,31,38,0.04),0_4px_16px_rgba(26,31,38,0.05)]
        dark:shadow-elevation-dark-low
        rounded-none
      "
    >
      {/* Left: Branding + Client info */}
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2.5 mb-1.5">
          <img src="/logo-light.svg" alt="Varna" className="block dark:hidden h-7 sm:h-8 w-auto object-contain shrink-0" />
          <img src="/logo-dark.svg" alt="Varna" className="hidden dark:block h-7 sm:h-8 w-auto object-contain shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#B85333] dark:text-[#C85D3B]">
            Enterprise Portal · Procurement Intelligence
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <BrandLogo
            logoPath={logoPath}
            alt={clientName}
            name={clientName}
            size="md"
            entityType="client"
            details={defaultDetails}
          />
          {/* Serif editorial client name */}
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight leading-none">
            {clientName}
          </h1>
        </div>
        {industry && (
          <p className="text-xs text-[#6E7781] dark:text-[#9BA9B4] mt-1.5 font-light tracking-wide">
            {industry} · Active Assessment Interval
          </p>
        )}
      </div>

      {/* Right: Date + Actions */}
      <div className="flex items-center gap-4">
        {/* Date display */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#6E7781] dark:text-[#9BA9B4] font-light tracking-wider uppercase">
          <Calendar className="w-3.5 h-3.5 text-[#6E7781] dark:text-[#9BA9B4] shrink-0" strokeWidth={1.5} />
          <span>{currentDate}</span>
        </div>

        <div className="h-5 w-px bg-[#EAE5DC] dark:bg-[#9BA9B4]/20 hidden sm:block" />

        {/* Theme Toggle — refined bordered icon */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="
              p-2.5 border border-[#EAE5DC] dark:border-[#9BA9B4]/25
              hover:border-[#B85333]/40 dark:hover:border-[#C85D3B]/50
              text-[#6E7781] dark:text-[#9BA9B4]
              hover:text-[#B85333] dark:hover:text-[#C85D3B]
              bg-white dark:bg-[#252830]
              transition-all duration-200 cursor-pointer
            "
            title="Toggle theme"
            id="theme-toggle-btn"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Export Report — Terracotta pill */}
        {dashboardData ? (
          <ExportButton data={dashboardData} variant="topbar" />
        ) : (
          <button
            disabled
            className="flex items-center gap-2.5 px-5 py-3 rounded-none bg-[#B85333]/40 text-white/60 dark:bg-[#C85D3B]/30 dark:text-[#FAF8F5]/50 text-xs font-sans uppercase tracking-widest cursor-not-allowed"
          >
            Export Report
          </button>
        )}
      </div>
    </motion.header>
  );
}

