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
  isHero?: boolean;
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
  isHero = true,
}: KPICardProps) {
  const isVarnaScore = Boolean(varnaScoreData) || title.toLowerCase().includes("varna");

  return (
    <Card
      delay={delay}
      variant={isHero ? "hero" : "default"}
      className="group relative overflow-hidden"
      hoverEffect={true}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 pr-3">
          {/* Section label: small, muted, uppercase, wide tracking */}
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#6E7781] dark:text-[#9BA9B4] mb-2">
            {title}
          </p>

          {/* Monumental Hero Metric */}
          {varnaScoreData ? (
            <VarnaScoreHoverCard {...varnaScoreData}>
              <div className="text-4xl sm:text-5xl font-sans font-medium tracking-hero leading-none cursor-help text-gradient-clay my-1.5 inline-block">
                <AnimatedCounter
                  value={value}
                  prefix={prefix}
                  suffix={suffix}
                  decimals={decimals}
                  delay={delay + 0.1}
                />
              </div>
            </VarnaScoreHoverCard>
          ) : (
            <div className={`text-4xl sm:text-5xl font-sans font-medium tracking-hero leading-none my-1.5 ${
              isVarnaScore ? "text-gradient-clay" : "text-[#1A1F26] dark:text-[#FAF8F5]"
            }`}>
              <AnimatedCounter
                value={value}
                prefix={prefix}
                suffix={suffix}
                decimals={decimals}
                delay={delay + 0.1}
              />
            </div>
          )}

          {subtitle && (
            <p className="text-[11px] text-[#6E7781] dark:text-[#9BA9B4] mt-2.5 font-light leading-snug max-w-[260px]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Refined Soft-Filled Circular Badge */}
        <div
          className={`
            flex items-center justify-center
            w-11 h-11 rounded-full
            ${
              accentColor === "deep-clay" || isVarnaScore
                ? "bg-[#B85333]/10 dark:bg-[#C85D3B]/20 text-[#B85333] dark:text-[#E07555]"
                : accentColor === "sage-mineral"
                ? "bg-[#556B55]/12 dark:bg-[#7B9B7B]/20 text-[#556B55] dark:text-[#8AAE8A]"
                : "bg-[#6F848F]/12 dark:bg-[#8298A5]/20 text-[#6F848F] dark:text-[#9BB0BD]"
            }
            shadow-xs transition-transform duration-300
            group-hover:scale-110 flex-shrink-0
          `}
        >
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>
      </div>
    </Card>
  );
}
