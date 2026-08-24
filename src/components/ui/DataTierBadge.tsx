"use client";

import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export type DataTier = "verified" | "self-reported" | "lapsed";

interface DataTierBadgeProps {
  tier: DataTier;
  className?: string;
}

// ── Config ───────────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<
  DataTier,
  {
    label: string;
    icon: typeof ShieldCheck;
    wrapperClass: string;
    iconClass: string;
  }
> = {
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    wrapperClass:
      "bg-sage-mineral/10 dark:bg-sage-mineral/10 text-sage-mineral border-sage-mineral/20",
    iconClass: "text-sage-mineral fill-sage-mineral/20",
  },
  "self-reported": {
    label: "Self-reported",
    icon: ShieldQuestion,
    wrapperClass:
      "bg-slate-mist/10 dark:bg-slate-mist/10 text-slate-mist border-slate-mist/20",
    iconClass: "text-slate-mist",
  },
  lapsed: {
    label: "Lapsed",
    icon: ShieldAlert,
    wrapperClass:
      "bg-deep-clay/10 dark:bg-deep-clay/10 text-deep-clay border-deep-clay/20",
    iconClass: "text-deep-clay",
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function DataTierBadge({ tier, className = "" }: DataTierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        text-[8px] font-semibold uppercase tracking-[0.15em]
        border rounded-none
        ${config.wrapperClass}
        ${className}
      `}
    >
      <Icon className={`w-2.5 h-2.5 ${config.iconClass}`} strokeWidth={2} />
      {config.label}
    </span>
  );
}
