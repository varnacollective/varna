"use client";

import { motion } from "framer-motion";
import { Download, Calendar, Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

import BrandLogo from "@/components/ui/BrandLogo";

interface TopBarProps {
  clientName: string;
  industry?: string;
  logoPath?: string;
  clientDetails?: Record<string, any>;
}

export default function TopBar({ clientName, industry, logoPath, clientDetails }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      alert("Enterprise PDF report export is preparing to download.");
      setIsExporting(false);
    }, 600);
  };

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
        px-8 py-6 mb-8 gap-4
        bg-[#E4DEC9] dark:bg-[#22252B] border border-[#6F848F]/30 dark:border-[#8C9DA8]/20
        rounded-none shadow-elevation-low dark:shadow-elevation-dark-low
      "
    >
      {/* Left: Branding + Client info */}
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2.5 mb-1.5">
          <img src="/logo-light.svg" alt="Varna" className="block dark:hidden h-7 sm:h-8 w-auto object-contain shrink-0" />
          <img src="/logo-dark.svg" alt="Varna" className="hidden dark:block h-7 sm:h-8 w-auto object-contain shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#7A3F1E] dark:text-[#FAF6EE]/85">
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
          <h1 className="text-3xl sm:text-4xl font-serif text-[#222326] dark:text-[#FAF6EE] tracking-hero uppercase leading-none">
            {clientName}
          </h1>
        </div>
        {industry && (
          <p className="text-xs text-[#6F848F] dark:text-[#FAF6EE]/65 mt-1 font-light tracking-wide">
            {industry} · Active Assessment Interval
          </p>
        )}
      </div>

      {/* Right: Date + Actions */}
      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-2 text-xs text-[#6F848F] dark:text-[#FAF6EE]/70 font-light tracking-wider uppercase">
          <Calendar className="w-3.5 h-3.5 text-[#6F848F] dark:text-[#8C9DA8]" strokeWidth={1.5} />
          <span>{currentDate}</span>
        </div>

        <div className="h-6 w-px bg-[#6F848F]/25 dark:bg-[#8C9DA8]/20 hidden sm:block" />

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 border border-[#6F848F]/30 dark:border-[#8C9DA8]/30 hover:border-[#7A3F1E] text-[#6F848F] dark:text-[#FAF6EE]/80 hover:text-[#222326] dark:hover:text-[#FAF6EE] transition-all duration-200 rounded-none bg-[#DFD8C2]/40 dark:bg-[#1A1C20] cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        )}

        <button
          onClick={handleDownload}
          disabled={isExporting}
          className={`
            flex items-center gap-2.5
            px-5 py-3 rounded-none
            bg-[#7A3F1E] hover:bg-[#683315] dark:bg-[#FAF6EE] dark:hover:bg-[#E8E2D1] text-[#D8CFB8] dark:text-[#18191D]
            text-xs font-serif uppercase tracking-widest transition-all duration-200 shadow-sm cursor-pointer
            ${isExporting ? "opacity-75 cursor-wait" : ""}
          `}
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
          )}
          <span>{isExporting ? "Exporting..." : "Export Report"}</span>
        </button>
      </div>
    </motion.header>
  );
}
