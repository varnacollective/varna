"use client";

import Card from "@/components/ui/Card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import VarnaScoreHoverCard, { type VarnaScoreData } from "@/components/ui/VarnaScoreHoverCard";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: LucideIcon;
  iconColor?: string; // Kept for backwards compatibility but styled brand-forward
  accentColor?: "none" | "deep-clay" | "sage-mineral" | "slate-mist" | "midnight-blue";
  delay?: number;
  subtitle?: string;
  varnaScoreData?: VarnaScoreData;
}

export default function KPICard({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  icon: Icon,
  accentColor = "none",
  delay = 0,
  subtitle,
  varnaScoreData,
}: KPICardProps) {
  return (
    <Card delay={delay} accentColor={accentColor} className="group" hoverEffect={true}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/60 mb-2">
            {title}
          </p>
          {varnaScoreData ? (
            <VarnaScoreHoverCard {...varnaScoreData}>
              <div className="text-3xl font-sans font-light tracking-tight text-carbon-ink dark:text-warm-stone cursor-help">
                <AnimatedCounter
                  value={value}
                  prefix={prefix}
                  suffix={suffix}
                  decimals={decimals}
                  delay={delay + 0.15}
                />
              </div>
            </VarnaScoreHoverCard>
          ) : (
            <div className="text-3xl font-sans font-light tracking-tight text-carbon-ink dark:text-warm-stone">
              <AnimatedCounter
                value={value}
                prefix={prefix}
                suffix={suffix}
                decimals={decimals}
                delay={delay + 0.15}
              />
            </div>
          )}
          {subtitle && (
            <p className="text-[11px] text-slate-mist/95 dark:text-warm-stone/50 mt-2 font-light">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="
            flex items-center justify-center
            w-11 h-11 border border-slate-mist/30 dark:border-midnight-blue
            bg-warm-stone/30 dark:bg-black/20 text-deep-clay dark:text-warm-stone
            transition-transform duration-300
            group-hover:scale-105 rounded-none
          "
        >
          <Icon className="w-5 h-5 text-deep-clay dark:text-warm-stone" strokeWidth={1.5} />
        </div>
      </div>
    </Card>
  );
}
