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
    name: "Leader",
    range: "85–100",
    color: "#3A5A40",  // Botanical Sage
    badgeBg: "bg-[#3A5A40]/10 dark:bg-[#7B9B7B]/20",
    badgeText: "text-[#3A5A40] dark:text-[#8AAE8A]",
    badgeBorder: "border-[#3A5A40]/25 dark:border-[#7B9B7B]/35",
  },
  Advanced: {
    name: "Advanced",
    range: "70–84",
    color: "#5B7594",  // Slate Navy
    badgeBg: "bg-[#5B7594]/10 dark:bg-[#5B7594]/20",
    badgeText: "text-[#2B3A55] dark:text-[#8AAEC6]",
    badgeBorder: "border-[#5B7594]/25",
  },
  Emerging: {
    name: "Emerging",
    range: "55–69",
    color: "#6E7781",  // Warm Slate
    badgeBg: "bg-[#6E7781]/10 dark:bg-[#6E7781]/15",
    badgeText: "text-[#57534E] dark:text-[#9BA9B4]",
    badgeBorder: "border-[#6E7781]/25",
  },
  Foundational: {
    name: "Foundational",
    range: "40–54",
    color: "#9A4A2E",  // Warm Terracotta
    badgeBg: "bg-[#9A4A2E]/10 dark:bg-[#C85D3B]/20",
    badgeText: "text-[#9A4A2E] dark:text-[#E07555]",
    badgeBorder: "border-[#9A4A2E]/25",
  },
  "Not Ready": {
    name: "Not Ready",
    range: "<40",
    color: "#9A4A2E",  // Warm Terracotta alert
    badgeBg: "bg-[#9A4A2E]/10 dark:bg-[#C85D3B]/25",
    badgeText: "text-[#9A4A2E] dark:text-[#E8856A]",
    badgeBorder: "border-[#9A4A2E]/25",
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
  strokeWidth = 7,
  label,
  delta,
  delay = 0,
  pillarKey = "E",
}: RadialGaugeProps) {
  const gradientId = useId();
  const bandKey = getPerformanceBand(value);
  const band = PERFORMANCE_BANDS[bandKey];

  // Standardized ESG Pillar colors
  // Environmental: Green (#3A5A40) | Social: Terracotta (#9A4A2E) | Governance: Slate (#36424A) | Cultural: Warm Clay (#7A3F1E)
  const pillarGradients: Record<string, [string, string]> = {
    E: ["#3A5A40", "#3A5A40"], // Environmental - Botanical Sage
    S: ["#9A4A2E", "#9A4A2E"], // Social - Warm Terracotta
    G: ["#36424A", "#36424A"], // Governance - Slate
    C: ["#7A3F1E", "#7A3F1E"], // Cultural - Warm Clay
    Overall: ["#3A5A40", "#36424A"],
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
            <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={colorStart} floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-[#EFECE6] dark:stroke-[#9BA9B4]/15"
            strokeWidth={strokeWidth}
            strokeDasharray={`${totalArc} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Animated Gauge Arc with Soft Drop Shadow */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
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

        {/* Center Content: Score number in editorial serif or NA in muted stone */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${delta !== undefined ? "pt-2" : ""}`}>
          <motion.span
            className="text-2xl font-serif text-[#1C1917] dark:text-[#FAF8F5] font-light tracking-tight tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.4, duration: 0.4 }}
          >
            {value === 0 ? (
              <span className="text-xl font-sans text-[#A8A29E] font-light">NA</span>
            ) : (
              Math.round(value)
            )}
          </motion.span>

          {/* Delta indicator */}
          {delta !== undefined && (
            <div className="flex items-center gap-0.5 mt-0.5">
              {delta > 0 ? (
                <TrendingUp className="w-2.5 h-2.5 text-[#3A5A40]" />
              ) : delta < 0 ? (
                <TrendingDown className="w-2.5 h-2.5 text-[#9A4A2E]" />
              ) : (
                <Minus className="w-2.5 h-2.5 text-slate-mist" />
              )}
              <span
                className={`text-[8px] font-sans font-semibold tracking-wide ${
                  delta > 0
                    ? "text-[#3A5A40]"
                    : delta < 0
                    ? "text-[#9A4A2E]"
                    : "text-slate-mist"
                }`}
              >
                {delta > 0 ? `+${delta.toFixed(1)}` : delta < 0 ? `${delta.toFixed(1)}` : "N/A"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Performance Band Pill: Minimalist micro-pill per requirement */}
      <div className="flex flex-col items-center gap-1">
        <span
          className={`
            text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full font-medium shadow-xs border
            ${value === 0 ? "bg-[#FAF8F5] dark:bg-white/10 text-[#A8A29E] border-[#E8E3DA] dark:border-white/15" : `${band.badgeBg} ${band.badgeText} ${band.badgeBorder}`}
          `}
          title={value === 0 ? "To Be Assessed" : `Framework Band: ${band.name} (${band.range})`}
        >
          {value === 0 ? "NOT READY" : band.name}
        </span>

        {label && (
          <span className="text-[10px] font-semibold text-[#8C827A] dark:text-warm-stone/60 uppercase tracking-[0.16em] text-center mt-0.5">
            {label}
          </span>
        )}
      </div>
    </motion.div>
  );
}

const RadialGauge = memo(RadialGaugeComponent);
export default RadialGauge;

