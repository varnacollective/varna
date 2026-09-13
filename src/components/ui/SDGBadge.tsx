"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export interface SDGDefinition {
  id: number;
  name: string;
  shortLabel?: string;
  color?: string;
  textColor?: string;
}

export const OFFICIAL_UN_SDGS: Record<number, SDGDefinition> = {
  1: { id: 1, name: "No Poverty" },
  2: { id: 2, name: "Zero Hunger" },
  3: { id: 3, name: "Good Health and Well-being" },
  4: { id: 4, name: "Quality Education" },
  5: { id: 5, name: "Gender Equality" },
  6: { id: 6, name: "Clean Water and Sanitation" },
  7: { id: 7, name: "Affordable and Clean Energy" },
  8: { id: 8, name: "Decent Work and Economic Growth" },
  9: { id: 9, name: "Industry, Innovation and Infrastructure" },
  10: { id: 10, name: "Reduced Inequalities" },
  11: { id: 11, name: "Sustainable Cities and Communities" },
  12: { id: 12, name: "Responsible Consumption and Production" },
  13: { id: 13, name: "Climate Action" },
  14: { id: 14, name: "Life Below Water" },
  15: { id: 15, name: "Life on Land" },
  16: { id: 16, name: "Peace, Justice and Strong Institutions" },
  17: { id: 17, name: "Partnerships for the Goals" },
};

export function getSDGIconPath(goalNumber: number): string {
  const padded = String(goalNumber).padStart(2, "0");
  return `/logos/SDG/SDG_${padded}.png`;
}

interface SDGBadgeProps {
  goalNumber?: number | string | null;
  size?: number; // default 38px
  isAwaitingVerification?: boolean;
  className?: string;
}

export default function SDGBadge({
  goalNumber,
  size = 38,
  isAwaitingVerification = false,
  className = "",
}: SDGBadgeProps) {
  const [hasError, setHasError] = useState(false);

  const numericId = typeof goalNumber === "string" ? parseInt(goalNumber, 10) : goalNumber;
  const sdg = numericId && OFFICIAL_UN_SDGS[numericId] ? OFFICIAL_UN_SDGS[numericId] : null;

  // If no valid SDG or explicitly marked as awaiting verification:
  if (!sdg || isAwaitingVerification || goalNumber === "?" || goalNumber === null) {
    return (
      <div
        className={`relative group inline-flex flex-col items-center justify-center border border-slate-mist/35 bg-slate-mist/10 rounded-none cursor-help transition-all duration-200 hover:border-slate-mist/60 shrink-0 ${className}`}
        style={{ width: size, height: size }}
        title="SDG Alignment: Awaiting verification during assessment interval"
      >
        <Clock className="w-3.5 h-3.5 text-slate-mist/70 mb-0.5" strokeWidth={1.5} />
        <span className="text-[6.5px] uppercase font-semibold tracking-wider text-slate-mist/80 text-center leading-tight">
          Awaiting
        </span>

        {/* Hover tooltip */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
          <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#D8CFB8] bg-[#222326] px-2 py-1 shadow-md border border-slate-mist/30">
            Awaiting Verification
          </span>
        </div>
      </div>
    );
  }

  const iconSrc = getSDGIconPath(sdg.id);
  const altText = `SDG ${sdg.id}: ${sdg.name}`;

  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -2 }}
      transition={{ type: "spring", stiffness: 450, damping: 20 }}
      className={`relative group inline-flex items-center justify-center rounded-none shadow-sm cursor-help select-none shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
      }}
      title={altText}
    >
      {hasError ? (
        /* Graceful fallback if image fails to load */
        <div
          className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#222326] border border-slate-300 dark:border-[#6F848F]/40 text-slate-700 dark:text-[#D8CFB8] text-center p-0.5 select-none"
          style={{ width: size, height: size }}
        >
          <span className="text-[7px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#6F848F] leading-none mb-0.5">
            SDG
          </span>
          <span className="text-xs font-black leading-none font-sans">
            {sdg.id}
          </span>
        </div>
      ) : (
        <Image
          src={iconSrc}
          alt={altText}
          width={size}
          height={size}
          className="w-full h-full object-contain pointer-events-none select-none"
          onError={() => setHasError(true)}
        />
      )}

      {/* Hover tooltip showing full goal name */}
      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-[9px] font-sans font-medium uppercase tracking-widest text-[#D8CFB8] bg-[#222326] px-2.5 py-1 shadow-xl border border-slate-mist/30">
          <span>SDG {sdg.id}: {sdg.name}</span>
        </div>
      </div>
    </motion.div>
  );
}
