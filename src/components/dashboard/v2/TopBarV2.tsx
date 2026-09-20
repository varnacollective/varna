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

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="
        varna-topbar-v2
        w-full h-auto min-h-[76px] lg:h-[84px] px-6 lg:px-8 py-4 mb-6
        bg-white dark:bg-[#20242B]
        border border-black/[0.07] dark:border-white/[0.08]
        shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
        dark:shadow-none dark:border-t-white/[0.12]
        rounded-[24px]
        flex items-center justify-between gap-4
        relative z-30
      "
    >
      {/* Left: Unified Branding (P1-11 fixed) */}
      <div className="flex items-center gap-3">
        <span className="text-base lg:text-[18px] font-semibold text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
          Enterprise Portal
        </span>
        <span className="w-px h-5.5 bg-black/15 dark:bg-white/20 shrink-0" />
        <span className="text-base lg:text-[18px] font-medium text-[#7D3F1E] dark:text-[#E07A57] tracking-tight">
          Procurement Intelligence
        </span>
      </div>

      {/* Right Cluster (20px gaps) */}
      <div className="flex items-center gap-4 lg:gap-5 flex-wrap">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#6F6A61] dark:text-[#9A948A] font-medium uppercase tracking-widest">
          <Calendar className="w-4 h-4 text-[#6F6A61] dark:text-[#9A948A]" strokeWidth={1.5} />
          <span>{currentDate}</span>
        </div>

        {/* 44px Round Theme Toggle Button */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="
              w-11 h-11 rounded-full
              border border-black/[0.08] dark:border-white/[0.14]
              hover:border-[#7D3F1E]/50 dark:hover:border-[#E07A57]/60
              text-[#5B564E] dark:text-[#C2BCB0]
              hover:text-[#7D3F1E] dark:hover:text-[#E07A57]
              bg-[#F7F3EA] dark:bg-[#272C34]
              flex items-center justify-center
              transition-all duration-200 cursor-pointer shadow-xs
              focus:outline-none focus:ring-2 focus:ring-[#7D3F1E]/40
            "
            title="Toggle color theme"
            aria-label="Toggle light and dark mode"
            id="theme-toggle-btn-v2"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
          </button>
        )}

        {/* Hairline Divider */}
        <span className="hidden sm:block w-px h-6 bg-black/10 dark:bg-white/15 shrink-0" />

        {/* Client Identity Tile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F7F3EA] dark:bg-[#272C34] flex items-center justify-center p-1 border border-black/5 dark:border-white/10 shrink-0">
            <BrandLogo
              logoPath={logoPath}
              alt={clientName}
              name={clientName}
              size="sm"
              entityType="client"
              details={defaultDetails}
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[15px] font-semibold text-[#1F1B16] dark:text-[#F3EFE7] leading-snug">
              {clientName}
            </span>
            {industry && (
              <span className="hidden md:inline text-[13px] text-[#6F6A61] dark:text-[#9A948A] font-normal leading-tight">
                {industry}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
