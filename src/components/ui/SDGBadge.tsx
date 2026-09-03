"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export interface SDGDefinition {
  id: number;
  name: string;
  shortLabel: string;
  color: string; // Official UN Hex
  textColor: string;
}

export const OFFICIAL_UN_SDGS: Record<number, SDGDefinition> = {
  1: { id: 1, name: "No Poverty", shortLabel: "No Poverty", color: "#E5243B", textColor: "#FFFFFF" },
  2: { id: 2, name: "Zero Hunger", shortLabel: "Zero Hunger", color: "#DDA63A", textColor: "#FFFFFF" },
  3: { id: 3, name: "Good Health & Well-being", shortLabel: "Good Health", color: "#4C9F38", textColor: "#FFFFFF" },
  4: { id: 4, name: "Quality Education", shortLabel: "Education", color: "#C5192D", textColor: "#FFFFFF" },
  5: { id: 5, name: "Gender Equality", shortLabel: "Gender Equality", color: "#FF3A21", textColor: "#FFFFFF" },
  6: { id: 6, name: "Clean Water & Sanitation", shortLabel: "Clean Water", color: "#26BDE2", textColor: "#FFFFFF" },
  7: { id: 7, name: "Affordable & Clean Energy", shortLabel: "Clean Energy", color: "#FCC30B", textColor: "#222326" },
  8: { id: 8, name: "Decent Work & Economic Growth", shortLabel: "Decent Work", color: "#A21942", textColor: "#FFFFFF" },
  9: { id: 9, name: "Industry, Innovation & Infrastructure", shortLabel: "Innovation", color: "#FD6925", textColor: "#FFFFFF" },
  10: { id: 10, name: "Reduced Inequalities", shortLabel: "Inequalities", color: "#DD1367", textColor: "#FFFFFF" },
  11: { id: 11, name: "Sustainable Cities & Communities", shortLabel: "Sustainable Cities", color: "#FD9D24", textColor: "#FFFFFF" },
  12: { id: 12, name: "Responsible Consumption & Production", shortLabel: "Consumption", color: "#BF8B2E", textColor: "#FFFFFF" },
  13: { id: 13, name: "Climate Action", shortLabel: "Climate Action", color: "#3F7E44", textColor: "#FFFFFF" },
  14: { id: 14, name: "Life Below Water", shortLabel: "Life In Water", color: "#0A97D9", textColor: "#FFFFFF" },
  15: { id: 15, name: "Life on Land", shortLabel: "Life On Land", color: "#56C02B", textColor: "#FFFFFF" },
  16: { id: 16, name: "Peace, Justice & Strong Institutions", shortLabel: "Peace & Justice", color: "#00689D", textColor: "#FFFFFF" },
  17: { id: 17, name: "Partnerships for the Goals", shortLabel: "Partnerships", color: "#19486A", textColor: "#FFFFFF" },
};

interface SDGBadgeProps {
  goalNumber?: number | string | null;
  size?: number; // default 48px
  isAwaitingVerification?: boolean;
  className?: string;
}

export default function SDGBadge({
  goalNumber,
  size = 46,
  isAwaitingVerification = false,
  className = "",
}: SDGBadgeProps) {
  const numericId = typeof goalNumber === "string" ? parseInt(goalNumber, 10) : goalNumber;
  const sdg = numericId && OFFICIAL_UN_SDGS[numericId] ? OFFICIAL_UN_SDGS[numericId] : null;

  // If no valid SDG or explicitly marked as awaiting verification:
  if (!sdg || isAwaitingVerification || goalNumber === "?" || goalNumber === null) {
    return (
      <div
        className={`relative group inline-flex flex-col items-center justify-center border border-slate-mist/35 bg-slate-mist/10 rounded-none cursor-help transition-all duration-200 hover:border-slate-mist/60 ${className}`}
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

  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -2 }}
      transition={{ type: "spring", stiffness: 450, damping: 20 }}
      className={`relative group inline-flex flex-col justify-between p-1.5 rounded-none shadow-sm cursor-help select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: sdg.color,
        color: sdg.textColor,
      }}
      title={`UN SDG ${sdg.id}: ${sdg.name}`}
    >
      {/* Top: Goal number */}
      <span className="text-[13px] font-black font-sans leading-none tracking-tighter drop-shadow-sm">
        {sdg.id}
      </span>

      {/* Bottom: Official short label */}
      <div className="text-[5.5px] font-bold uppercase tracking-wider leading-[1.05] opacity-95">
        {sdg.shortLabel}
      </div>

      {/* Hover tooltip showing full goal name */}
      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-[9px] font-sans font-medium uppercase tracking-widest text-[#D8CFB8] bg-[#222326] px-2.5 py-1 shadow-xl border border-slate-mist/30">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sdg.color }} />
          <span>SDG {sdg.id} · {sdg.name}</span>
        </div>
      </div>
    </motion.div>
  );
}
