"use client";

import { useId, memo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type PerformanceBand = "Leader" | "Advanced" | "Emerging" | "Foundational" | "Not Ready";

export interface BandConfig {
  name: string;
  range: string;
  color: string;      // Primary stroke / text hex
  badgeBg: string;    // Pill background class
  badgeText: string;  // Pill text class
  badgeBorder: string; // Pill border class
}

export const PERFORMANCE_BANDS: Record<PerformanceBand, BandConfig> = {
  Leader: {
    name: "Varna Leader",
    range: "85–100",
    color: "#556B55",  // Sage Olive
    badgeBg: "bg-[#556B55]/12 dark:bg-[#7B9B7B]/20",
    badgeText: "text-[#556B55] dark:text-[#8AAE8A]",
    badgeBorder: "border-[#556B55]/30 dark:border-[#7B9B7B]/35",
  },
  Advanced: {
    name: "Advanced",
    range: "70–84",
    color: "#5B7594",  // Slate Navy
    badgeBg: "bg-[#5B7594]/12 dark:bg-[#5B7594]/20",
    badgeText: "text-[#2A3644] dark:text-[#8AAEC6]",
    badgeBorder: "border-[#5B7594]/30",
  },
  Emerging: {
    name: "Emerging",
    range: "55–69",
    color: "#6E7781",  // Warm Slate
    badgeBg: "bg-[#6E7781]/10 dark:bg-[#6E7781]/15",
    badgeText: "text-[#4A5560] dark:text-[#9BA9B4]",
    badgeBorder: "border-[#6E7781]/30",
  },
  Foundational: {
    name: "Foundational",
    range: "40–54",
    color: "#B85333",  // Terracotta
    badgeBg: "bg-[#B85333]/10 dark:bg-[#C85D3B]/20",
    badgeText: "text-[#B85333] dark:text-[#E07555]",
    badgeBorder: "border-[#B85333]/30",
  },
  "Not Ready": {
    name: "Not Ready",
    range: "<40",
    color: "#B85333",  // Terracotta alert
    badgeBg: "bg-[#B85333]/15 dark:bg-[#C85D3B]/25",
    badgeText: "text-[#B85333] dark:text-[#E8856A]",
    badgeBorder: "border-[#B85333]/40",
  },
};

export function getPerformanceBand(score: number): PerformanceBand {
  if (score >= 85) return "Leader";
  if (score >= 70) return "Advanced";
  if (score >= 55) return "Emerging";
  if (score >= 40) return "Foundational";
  return "Not Ready";
}

interface RadialGaugeProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  delta?: number; // Optional trend e.g. +2.4 or -1.1
  delay?: number;
  pillarKey?: "E" | "S" | "G" | "C" | "Overall";
}

function RadialGaugeComponent({
  value,
  size = 124,
  strokeWidth = 10,
  label,
  delta,
  delay = 0,
  pillarKey = "E",
}: RadialGaugeProps) {
  const gradientId = useId();
  const bandKey = getPerformanceBand(value);
  const band = PERFORMANCE_BANDS[bandKey];

  // Standardized ESG Pillar colors
  // Environmental: Green (#4C7355) | Social: Red/Terracotta (#B85333) | Governance: Blue/Slate (#36424A)
  const pillarGradients: Record<string, [string, string]> = {
    E: ["#4C7355", "#4C7355"], // Environmental - Green
    S: ["#B85333", "#B85333"], // Social - Red/Terracotta
    G: ["#36424A", "#36424A"], // Governance - Blue/Slate
    C: ["#7A3F1E", "#7A3F1E"], // Cultural - Warm Clay
    Overall: ["#4C7355", "#36424A"],
  };

  const [colorStart, colorEnd] = pillarGradients[pillarKey] || ["#829888", "#944D25"];

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc angle: 260 degrees for gauge appearance
  const totalArc = 0.78 * circumference;
  const progressOffset = totalArc - (Math.min(100, Math.max(0, value)) / 100) * totalArc;

  return (
    <motion.div
      className="flex flex-col items-center gap-2.5 transform-gpu will-change-transform"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-[230deg]"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorStart} />
              <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
            <filter id={`${gradientId}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={colorStart} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-[#EAE5DC] dark:stroke-[#9BA9B4]/15"
            strokeWidth={strokeWidth}
            strokeDasharray={`${totalArc} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Animated Gauge Arc with Ambient Glow */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth + 1}
            strokeLinecap="round"
            strokeDasharray={`${totalArc} ${circumference}`}
            filter={`url(#${gradientId}-glow)`}
            initial={{ strokeDashoffset: totalArc }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{
              duration: 1.1,
              delay: delay + 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </svg>

        {/* Center Content: Score number + optional Trend Delta */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${delta !== undefined ? "pt-2" : ""}`}>
          <motion.span
            className="text-2xl font-sans text-[#1A1F26] dark:text-[#FAF8F5] font-medium tracking-tighter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.4, duration: 0.4 }}
          >
            {Math.round(value)}
          </motion.span>

          {/* Delta indicator */}
          {delta !== undefined && (
            <div className="flex items-center gap-0.5 mt-0.5">
              {delta > 0 ? (
                <TrendingUp className="w-2.5 h-2.5 text-sage-mineral" />
              ) : delta < 0 ? (
                <TrendingDown className="w-2.5 h-2.5 text-deep-clay" />
              ) : (
                <Minus className="w-2.5 h-2.5 text-slate-mist" />
              )}
              <span
                className={`text-[8px] font-sans font-semibold tracking-wide ${
                  delta > 0
                    ? "text-sage-mineral"
                    : delta < 0
                    ? "text-deep-clay"
                    : "text-slate-mist"
                }`}
              >
                {delta > 0 ? `+${delta.toFixed(1)}` : delta < 0 ? `${delta.toFixed(1)}` : "N/A"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Performance Band Pill: Refined rounded-full chip with soft fill */}
      <div className="flex flex-col items-center gap-1">
        <span
          className={`
            px-2.5 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-[0.14em] shadow-xs
            ${band.badgeBg} ${band.badgeText} border ${band.badgeBorder}
          `}
          title={`Framework Band: ${band.name} (${band.range})`}
        >
          {band.name}
        </span>

        {label && (
          <span className="text-[10px] font-semibold text-slate-mist dark:text-warm-stone/60 uppercase tracking-[0.16em] text-center mt-0.5">
            {label}
          </span>
        )}
      </div>
    </motion.div>
  );
}

const RadialGauge = memo(RadialGaugeComponent);
export default RadialGauge;

