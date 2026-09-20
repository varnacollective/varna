"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";

export default function EvidenceBannerV2() {
  const chips = [
    { label: "None or proxy", weight: "0.50×" },
    { label: "Self-reported", weight: "0.75×" },
    { label: "Third-party verified", weight: "1.00×" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="
        varna-evidence-banner-v2
        mb-6 p-7 lg:p-10 rounded-[24px]
        bg-gradient-to-r from-[#7D3F1E] to-[#5C2E16] dark:from-[#8A4622] dark:to-[#4A230F]
        border border-white/15 text-white shadow-lg
        flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6
        relative overflow-hidden
      "
    >
      {/* Background Decorative Shield Icon Watermark */}
      <div className="absolute right-4 bottom-0 opacity-[0.06] pointer-events-none text-white select-none">
        <ShieldCheck className="w-56 h-56" strokeWidth={1} />
      </div>

      {/* Left Column: Script Headline & Copy */}
      <div className="space-y-1.5 max-w-xl relative z-10">
        <h2 className="varna-script-text text-white text-3xl sm:text-4xl lg:text-[42px] leading-tight font-normal">
          Not all evidence is equal
        </h2>
        <p className="text-sm lg:text-[15px] text-white/90 font-normal leading-relaxed">
          Every claim behind these scores is weighted by the evidence that supports it.
        </p>
      </div>

      {/* Right Column: Weight Chips & Link */}
      <div className="flex flex-col items-start lg:items-end gap-4 relative z-10 w-full lg:w-auto">
        <div className="flex items-center gap-2.5 flex-wrap">
          {chips.map((chip) => (
            <div
              key={chip.label}
              className="
                inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                border border-white/40 bg-white/10 backdrop-blur-xs
                text-xs font-medium text-white shadow-2xs min-h-[36px]
              "
            >
              <span>{chip.label}</span>
              <span className="font-semibold text-[#F4EACF]">{chip.weight}</span>
            </div>
          ))}
        </div>

        <Link
          href="/algorithm"
          className="
            inline-flex items-center gap-1.5 text-xs font-semibold text-[#F4EACF]
            hover:underline underline-offset-4 cursor-pointer min-h-[44px] py-1
          "
        >
          <span>How scores are calculated</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
