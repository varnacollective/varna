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
  iconColor?: string;
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
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-[#6F848F] dark:text-[#D8CFB8]/60 mb-2">
            {title}
          </p>
          {varnaScoreData ? (
            <VarnaScoreHoverCard {...varnaScoreData}>
              <div className="text-3xl sm:text-4xl font-serif font-light tracking-tighter text-[#222326] dark:text-[#D8CFB8] cursor-help">
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
            <div className="text-3xl sm:text-4xl font-serif font-light tracking-tighter text-[#222326] dark:text-[#D8CFB8]">
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
            <p className="text-[11px] text-[#6F848F] dark:text-[#D8CFB8]/50 mt-2 font-light leading-snug">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="
            flex items-center justify-center
            w-12 h-12 border border-[#6F848F]/30 dark:border-[#2F3C52]
            bg-[#DFD8C2]/40 dark:bg-[#222326]/60 text-[#7A3F1E] dark:text-[#D8CFB8]
            transition-transform duration-300
            group-hover:scale-105 rounded-none flex-shrink-0
          "
        >
          <Icon className="w-5 h-5 text-[#7A3F1E] dark:text-[#D8CFB8]" strokeWidth={1.5} />
        </div>
      </div>
    </Card>
  );
}
