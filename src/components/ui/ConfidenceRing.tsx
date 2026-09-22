"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Clock } from "lucide-react";

export type EvidenceTier = "third-party" | "self-reported" | "proxy" | "pending";

interface ConfidenceRingProps {
  score: number; // 0 to 100 percentage
  size?: number;
  strokeWidth?: number;
  evidenceMultiplier?: number; // 1.00, 0.75, or 0.50
  status?: string;
  isPending?: boolean;
  className?: string;
}

export function getEvidenceMultiplier(score: number): {
  multiplier: number;
  tier: EvidenceTier;
  tierName: string;
  color: string;
} {
  if (score >= 70) {
    return {
      multiplier: 1.0,
      tier: "third-party",
      tierName: "Third-Party Verified",
      color: "#738678", // Sage Mineral
    };
  }
  if (score >= 40) {
    return {
      multiplier: 0.75,
      tier: "self-reported",
      tierName: "Self-Reported",
      color: "#6F848F", // Slate Mist
    };
  }
  if (score > 0) {
    return {
      multiplier: 0.5,
      tier: "proxy",
      tierName: "Proxy / Unverified",
      color: "#7A3F1E", // Deep Clay
    };
  }
  return {
    multiplier: 0.5,
    tier: "pending",
    tierName: "Awaiting Verification",
    color: "#6F848F", // Slate Mist
  };
}

export default function ConfidenceRing({
  score,
  size = 64,
  strokeWidth = 4.5,
  evidenceMultiplier,
  isPending = false,
  className = "",
}: ConfidenceRingProps) {
  const meta = getEvidenceMultiplier(score);
  const multiplier = evidenceMultiplier ?? meta.multiplier;
  const isAwaiting = isPending || (score === 0 && meta.tier === "pending");

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = isAwaiting ? 15 : Math.max(5, Math.min(100, score));
  const dashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`relative flex items-center justify-center select-none cursor-help ${className}`}
      style={{ width: size, height: size }}
      title={
        isAwaiting
          ? "Confidence: Awaiting verification audit"
          : `Evidence Confidence: ${score}% (${multiplier.toFixed(2)}× Multiplier · ${meta.tierName})`
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background ring track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-mist/20 dark:text-warm-stone/15"
          strokeWidth={strokeWidth}
        />

        {/* Dynamic Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={meta.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: isAwaiting ? circumference * 0.85 : dashoffset }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          strokeDashoffset={dashoffset}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        {isAwaiting ? (
          <>
            <Clock className="w-3.5 h-3.5 text-slate-mist mb-0.5" strokeWidth={1.5} />
            <span className="text-[6.5px] font-sans font-semibold uppercase tracking-wider text-slate-mist">
              Pending
            </span>
          </>
        ) : (
          <>
            <span className="text-xs font-sans font-medium text-carbon-ink dark:text-warm-stone tracking-tighter leading-none">
              {score}%
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}
