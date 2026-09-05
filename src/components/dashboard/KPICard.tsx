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
      {/* Subtle Background Watermark Icon for Material Depth */}
      <div className="absolute -right-4 -bottom-4 pointer-events-none select-none opacity-[0.06] dark:opacity-[0.04] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
        <Icon className="w-36 h-36 text-[#222326] dark:text-[#FAF6EE]" strokeWidth={1} />
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 pr-3">
          {/* Section label: small, muted, uppercase, wide tracking */}
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#8C9DA8] mb-2">
            {title}
          </p>

          {/* Monumental Hero Metric */}
          {varnaScoreData ? (
            <VarnaScoreHoverCard {...varnaScoreData}>
              <div className="text-4xl sm:text-5xl font-serif font-light tracking-hero leading-none cursor-help text-gradient-clay dark:text-gradient-gold my-1.5 inline-block">
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
            <div className={`text-4xl sm:text-5xl font-serif font-light tracking-hero leading-none my-1.5 ${
              isVarnaScore ? "text-gradient-clay dark:text-gradient-gold" : "text-[#222326] dark:text-[#FAF6EE]"
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
            <p className="text-[11px] text-[#6F848F] dark:text-[#8C9DA8] mt-2.5 font-light leading-snug max-w-[260px]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Refined Soft-Filled Circular Badge (Never a plain bordered square) */}
        <div
          className={`
            flex items-center justify-center
            w-11 h-11 rounded-full
            ${
              accentColor === "deep-clay" || isVarnaScore
                ? "bg-[#7A3F1E]/12 dark:bg-[#944D25]/25 text-[#7A3F1E] dark:text-[#FAF6EE]"
                : accentColor === "sage-mineral"
                ? "bg-[#738678]/15 dark:bg-[#829888]/25 text-[#738678] dark:text-[#FAF6EE]"
                : "bg-[#6F848F]/15 dark:bg-[#8298A5]/25 text-[#6F848F] dark:text-[#FAF6EE]"
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

