"use client";

import { motion } from "framer-motion";
import { Calendar, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import BrandLogo from "@/components/ui/BrandLogo";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
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
  industry = "Hospitality",
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

  const isAstorDubai = Boolean(
    (logoPath && logoPath.toLowerCase().includes("astor")) ||
    clientName.toLowerCase().includes("astor") ||
    clientName.toLowerCase().includes("a dubai")
  );

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="
        varna-topbar-v2
        w-full h-auto min-h-[76px] lg:h-[84px] px-6 lg:px-8 py-4 mb-6
        bg-white dark:bg-[#20242B]
        border border-[#E8E3DA] dark:border-white/[0.08]
        shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)]
        dark:shadow-none dark:border-t-white/[0.12]
        rounded-[24px]
        flex items-center justify-between gap-4
        relative z-30
      "
    >
      {/* Left: Dynamic Breadcrumb / Page Title */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C827A] dark:text-[#9BA9B4]">
        </span>
        <span className="text-sm text-[#D4C5A9] dark:text-[#57534E] font-light">/</span>
        <h1 className="text-sm sm:text-base lg:text-[17px] font-serif font-medium text-[#1C1917] dark:text-[#FAF8F5] tracking-tight m-0">
        </h1>
      </div>

      {/* Right Cluster (20px gaps) */}
      <div className="flex items-center gap-4 lg:gap-5 flex-wrap">
        {/* Date Range Filter */}
        <div className="hidden lg:flex items-center">
          <DateRangeFilter />
        </div>

        {/* 44px Round Theme Toggle Button with Optimistic UI */}
        {mounted && (
          <button
            onClick={() => {
              const nextTheme = (theme === "dark" ? "light" : "dark");
              // Optimistically update document element class immediately
              if (typeof document !== "undefined") {
                if (nextTheme === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              }
              setTheme(nextTheme);
            }}
            className="
              w-11 h-11 rounded-full
              border border-[#E6E1D6] dark:border-white/[0.14]
              hover:border-[#9A4A2E]/50 dark:hover:border-[#E07A57]/60
              text-[#5B564E] dark:text-[#C2BCB0]
              hover:text-[#9A4A2E] dark:hover:text-[#E07A57]
              bg-[#FAF8F5] dark:bg-[#272C34]
              flex items-center justify-center
              transition-all duration-150 cursor-pointer shadow-xs
              focus:outline-none focus:ring-2 focus:ring-[#9A4A2E]/40
              active:scale-95
            "
            title="Toggle color theme"
            aria-label="Toggle light and dark mode"
            id="theme-toggle-btn-v2"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 transition-transform duration-200 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 transition-transform duration-200 rotate-0 hover:-rotate-12" />
            )}
          </button>
        )}

        {/* Hairline Divider */}
        <span className="hidden sm:block w-px h-6 bg-[#E8E3DA] dark:bg-white/15 shrink-0" />

        {/* Client Identity Tile / Profile Pill */}
        <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-[#E6E1D6] dark:border-white/15 bg-[#FAF8F5] dark:bg-[#272C34] shadow-xs">
          <div className={`w-8 h-8 ${isAstorDubai ? "rounded-full bg-black border border-[#D4AF37]/30 shadow-xs" : "rounded-full bg-white dark:bg-[#1C1917] border border-[#E6E1D6]"} flex items-center justify-center p-0 shrink-0 overflow-hidden`}>
            <BrandLogo
              logoPath={logoPath}
              alt={clientName}
              name={clientName}
              size="sm"
              entityType="client"
              details={defaultDetails}
              className={isAstorDubai ? "!border-0 !shadow-none !h-full !w-full !min-w-0 !max-w-none !bg-black !p-0 rounded-full overflow-hidden" : ""}
            />
          </div>
          <div className="flex flex-col text-left pr-1.5">
            <span className="text-[13px] font-semibold text-[#1C1917] dark:text-[#F3EFE7] leading-tight">
              {clientName}
            </span>
            {industry && (
              <span className="hidden md:inline text-[11px] text-[#6F6A61] dark:text-[#9A948A] font-normal leading-tight">
                {industry}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
