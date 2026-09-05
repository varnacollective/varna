"use client";

import { useId } from "react";
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
    color: "#738678", // Sage Mineral
    badgeBg: "bg-sage-mineral/15",
    badgeText: "text-sage-mineral dark:text-[#8AA391]",
    badgeBorder: "border-sage-mineral/30",
  },
  Advanced: {
    name: "Advanced",
    range: "70–84",
    color: "#6F848F", // Slate Mist
    badgeBg: "bg-slate-mist/15",
    badgeText: "text-slate-mist dark:text-[#8CA2AE]",
    badgeBorder: "border-slate-mist/30",
  },
  Emerging: {
    name: "Emerging",
    range: "55–69",
    color: "#A89C82", // Deep Warm Stone tint for contrast
    badgeBg: "bg-warm-stone/25 dark:bg-warm-stone/15",
    badgeText: "text-[#5C5238] dark:text-warm-stone",
    badgeBorder: "border-warm-stone/40",
  },
  Foundational: {
    name: "Foundational",
    range: "40–54",
    color: "#7A3F1E", // Deep Clay
    badgeBg: "bg-deep-clay/15",
    badgeText: "text-deep-clay dark:text-[#C5774E]",
    badgeBorder: "border-deep-clay/30",
  },
  "Not Ready": {
    name: "Not Ready",
    range: "<40",
    color: "#7A3F1E", // Deep Clay alert
    badgeBg: "bg-deep-clay/20",
    badgeText: "text-deep-clay dark:text-[#E2895C]",
    badgeBorder: "border-deep-clay/40",
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

export default function RadialGauge({
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

  // Pillar-specific two-tone color gradient pairs from brand palette (brightened for dark mode vibrancy)
  const pillarGradients: Record<string, [string, string]> = {
    E: value >= 75 ? ["#829888", "#7D929E"] : ["#944D25", "#829888"], // Sage Mineral ↔ Deep Clay
    S: value >= 75 ? ["#944D25", "#7D929E"] : ["#944D25", "#3D4D68"], // Deep Clay ↔ Slate Mist
    G: ["#7D929E", "#3D4D68"],                                        // Slate Mist ↔ Midnight Blue
    C: ["#3D4D68", "#944D25"],                                        // Midnight Blue ↔ Deep Clay
    Overall: value >= 80 ? ["#829888", "#7D929E"] : ["#944D25", "#7D929E"],
  };

  const [colorStart, colorEnd] = pillarGradients[pillarKey] || ["#829888", "#944D25"];

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc angle: 260 degrees for gauge appearance
  const totalArc = 0.78 * circumference;
  const progressOffset = totalArc - (Math.min(100, Math.max(0, value)) / 100) * totalArc;

  return (
    <motion.div
      className="flex flex-col items-center gap-2.5"
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
            className="stroke-slate-mist/15 dark:stroke-[#8C9DA8]/15"
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

        {/* Center Content: Score number + Trend Delta */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <motion.span
            className="text-2xl font-serif text-carbon-ink dark:text-[#FAF6EE] font-light tracking-tighter"
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
                {delta > 0 ? `+${delta.toFixed(1)}` : delta < 0 ? `${delta.toFixed(1)}` : "—"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Performance Band Pill — Refined rounded-full chip with soft fill */}
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

