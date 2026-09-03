"use client";

import { motion } from "framer-motion";
import { Download, Calendar, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface TopBarProps {
  clientName: string;
  industry?: string;
}

export default function TopBar({ clientName, industry }: TopBarProps) {
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

  const handleDownload = () => {
    alert("Enterprise PDF report export is preparing to download.");
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="
        flex flex-col sm:flex-row items-start sm:items-center justify-between
        px-8 py-6 mb-8 gap-4
        bg-[#E4DEC9] dark:bg-[#272A30] border border-[#6F848F]/30 dark:border-[#2F3C52]
        rounded-none shadow-sm
      "
    >
      {/* Left: Branding + Client info */}
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#7A3F1E] dark:text-[#D8CFB8]/70">
            Enterprise Portal · Procurement Intelligence
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#222326] dark:text-[#D8CFB8] tracking-hero uppercase leading-none mt-1">
          {clientName}
        </h1>
        {industry && (
          <p className="text-xs text-[#6F848F] dark:text-[#D8CFB8]/60 mt-1 font-light tracking-wide">
            {industry} · Active Assessment Interval
          </p>
        )}
      </div>

      {/* Right: Date + Actions */}
      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-2 text-xs text-[#6F848F] dark:text-[#D8CFB8]/60 font-light tracking-wider uppercase">
          <Calendar className="w-3.5 h-3.5 text-[#6F848F]" strokeWidth={1.5} />
          <span>{currentDate}</span>
        </div>

        <div className="h-6 w-px bg-[#6F848F]/25 dark:bg-[#2F3C52] hidden sm:block" />

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 border border-[#6F848F]/30 hover:border-[#7A3F1E] text-[#6F848F] dark:text-[#D8CFB8]/60 hover:text-[#222326] dark:hover:text-[#D8CFB8] transition-all duration-200 rounded-none bg-[#DFD8C2]/40 dark:bg-[#222326]/60 cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        )}

        <button
          onClick={handleDownload}
          className="
            flex items-center gap-2.5
            px-5 py-3 rounded-none
            bg-[#7A3F1E] hover:bg-[#683315] dark:bg-[#D8CFB8] dark:hover:bg-[#E8E2D1] text-[#D8CFB8] dark:text-[#222326]
            text-xs font-serif uppercase tracking-widest transition-all duration-200 shadow-sm cursor-pointer
          "
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Export Report</span>
        </button>
      </div>
    </motion.header>
  );
}
