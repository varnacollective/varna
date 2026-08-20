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
        bg-[#E4DEC9] dark:bg-[#222326] border border-slate-mist/30 dark:border-midnight-blue
        rounded-none shadow-sm
      "
    >
      {/* Left: Branding + Client info (Left Aligned by Default) */}
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-deep-clay dark:text-warm-stone/60">
            Enterprise Portal
          </span>
        </div>
        <h1 className="text-3xl font-serif font-light tracking-tighter text-carbon-ink dark:text-warm-stone leading-tight">
          {clientName}
        </h1>
        {industry && (
          <p className="text-xs text-slate-mist dark:text-warm-stone/50 mt-1 font-light tracking-wide">
            {industry}
          </p>
        )}
      </div>

      {/* Right: Date + Actions */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-mist dark:text-warm-stone/50 font-light tracking-wider uppercase">
          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>{currentDate}</span>
        </div>

        <div className="h-6 w-px bg-slate-mist/20 dark:bg-midnight-blue hidden sm:block" />

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 border border-slate-mist/20 hover:border-slate-mist/50 dark:border-midnight-blue text-slate-mist dark:text-warm-stone/50 hover:text-carbon-ink dark:hover:text-warm-stone transition-all duration-200 rounded-none bg-warm-stone/20 dark:bg-black/10"
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
            bg-deep-clay hover:bg-[#683315] dark:bg-warm-stone dark:hover:bg-[#C8BFAB] text-warm-stone dark:text-carbon-ink
            text-xs font-serif uppercase tracking-widest transition-all duration-200 shadow-sm
          "
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Export Report</span>
        </button>
      </div>
    </motion.header>
  );
}
