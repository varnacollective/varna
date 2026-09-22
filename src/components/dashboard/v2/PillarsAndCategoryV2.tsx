"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";
import ImpactPillars from "@/components/dashboard/ImpactPillars";
import type { CategorySpend } from "@/lib/mock-data";

interface PillarsAndCategoryV2Props {
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
  pillarBreakdown?: Record<string, any>;
  categorySpend: CategorySpend[];
}

const BRAND_CHART_COLORS = [
  "#7A3F1E", // deep-clay
  "#6E8471", // sage-mineral
  "#6F8391", // slate-mist
  "#2B3A55", // midnight-blue
  "#9C7A58", // warm clay tint
];

function formatLakhOrInr(val: number): string {
  const usd = val > 10000 ? Math.round(val / 83) : Math.round(val);
  return `$${usd.toLocaleString('en-US')}`;
}

function formatRowAmount(val: number): string {
  const usd = val > 10000 ? Math.round(val / 83) : Math.round(val);
  return `$${usd.toLocaleString('en-US')}`;
}

export default function PillarsAndCategoryV2({
  eScore,
  sScore,
  gScore,
  cScore,
  pillarBreakdown,
  categorySpend,
}: PillarsAndCategoryV2Props) {
  const totalCategorySpend = categorySpend.reduce((acc, cat) => acc + cat.totalSpend, 0);

  // D3 Derived Insight: Identify top category
  const topCategory = categorySpend.length > 0
    ? [...categorySpend].sort((a, b) => b.totalSpend - a.totalSpend)[0]
    : null;
  const topPct = topCategory && totalCategorySpend > 0 ? Math.round((topCategory.totalSpend / totalCategorySpend) * 100) : 0;
  const activeCatCount = categorySpend.filter((c) => c.totalSpend > 0).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 8 Cols: Visual Image + ESG Performance Pillars */}
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left ~30% of 8 cols: Visual Amenity Image Card (W7 & P1-6 fixed) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="
            md:col-span-4
            bg-white dark:bg-[#20242B]
            rounded-[24px] overflow-hidden
            border border-black/[0.07] dark:border-white/[0.08]
            shadow-sm min-h-[380px] relative group
          "
        >
          <Image
            src="/assets/Dashboard_visual_2.svg"
            alt="Artisanal Amenities Visual"
            fill
            className="object-cover rounded-[24px] object-[50%_60%] transition-transform duration-700 group-hover:scale-[1.03] dark:brightness-90"
          />
          <div className="absolute inset-0 bg-black/5 dark:bg-black/20 pointer-events-none rounded-[24px]" />
        </motion.div>

        {/* Right ~70% of 8 cols: ESG Pillars Card (NO NESTED DOUBLE FRAME - P1-7 fixed) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="
            md:col-span-8
            bg-white dark:bg-[#20242B]
            rounded-[24px] border border-black/[0.07] dark:border-white/[0.08]
            shadow-sm flex flex-col justify-between p-6 lg:p-7 min-h-[380px]
          "
        >
          {/* Header Row: Single Line Title + Nowrap Pill (P1-7 fixed) */}
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.07] dark:border-white/[0.08] gap-4">
            <div className="flex items-baseline gap-2 truncate">
              <h2 className="text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-[-0.01em] whitespace-nowrap">
                ESG Performance Pillars
              </h2>

            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6E8471]/15 dark:bg-[#9DB4A0]/20 text-[#55705A] dark:text-[#9DB4A0] text-xs font-medium whitespace-nowrap shrink-0">
              <Check className="w-3.5 h-3.5 text-[#55705A] dark:text-[#9DB4A0]" strokeWidth={2.5} />
              <span>Framework Calibrated</span>
            </div>
          </div>

          {/* Body: Circular Gauges Container (ImpactPillars renders circular RadialGauge SVGs) */}
          <div className="my-auto py-4">
            <ImpactPillars
              eScore={eScore}
              sScore={sScore}
              gScore={gScore}
              cScore={cScore}
              pillarBreakdown={pillarBreakdown}
            />
          </div>

          {/* Legend Row at Bottom Replacing Old Caption (W6 & P1-7 fixed) */}
          <div className="pt-4 border-t border-black/[0.07] dark:border-white/[0.08] flex items-center justify-between flex-wrap gap-2 text-[12px] text-[#6F6A61] dark:text-[#9A948A]">
            <span className="font-medium text-[#5B564E] dark:text-[#C2BCB0]">Performance Bands:</span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D97706]" /> Not Ready &lt;40
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C05621]" /> Foundational 40–54
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#A89C82]" /> Emerging 55–69
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#6F8391]" /> Advanced 70–84
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#55705A]" /> Leader 85+
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4 Cols: Spend by Product Category Card (W8 & P1-6 fixed) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-4
          bg-white dark:bg-[#20242B]
          rounded-[24px] border border-black/[0.07] dark:border-white/[0.08]
          shadow-sm flex flex-col justify-between p-6 lg:p-7 min-h-[380px]
        "
      >
        <div>
          <h2 className="text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-[-0.01em]">
            Spend by Product Category
          </h2>

          <div className="flex items-baseline gap-2 mt-2 mb-4">
            <span className="text-3xl lg:text-[36px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums" aria-label={`Total spend ${formatLakhOrInr(totalCategorySpend)}`}>
              {formatLakhOrInr(totalCategorySpend)}
            </span>
            <span className="text-xs font-semibold text-[#6F6A61] dark:text-[#9A948A] uppercase tracking-wider">
              TOTAL SPEND
            </span>
          </div>

          {/* 12px Segmented Horizontal Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/10 gap-1 my-4">
            {categorySpend.map((cat, idx) => {
              const pct = totalCategorySpend > 0 ? (cat.totalSpend / totalCategorySpend) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={cat.categoryName}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: BRAND_CHART_COLORS[idx % BRAND_CHART_COLORS.length],
                  }}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                  title={`${cat.categoryName}: ${pct.toFixed(1)}% (${formatRowAmount(cat.totalSpend)})`}
                />
              );
            })}
          </div>

          {/* Row List for ALL Categories (including 0% ones - P0-4 & W8 fixed) */}
          <div className="space-y-3 mt-4">
            {categorySpend.map((cat, idx) => {
              const pct = totalCategorySpend > 0 ? Math.round((cat.totalSpend / totalCategorySpend) * 100) : 0;
              const color = BRAND_CHART_COLORS[idx % BRAND_CHART_COLORS.length];
              const isZero = cat.totalSpend === 0;

              return (
                <div
                  key={cat.categoryName}
                  className={`flex items-center justify-between text-[15px] py-1 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0 ${isZero ? "opacity-45" : "opacity-100"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-normal">
                      {cat.categoryName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[#6F6A61] dark:text-[#9A948A] font-normal text-sm tabular-nums">
                      {formatRowAmount(cat.totalSpend)}
                    </span>
                    <span className="font-semibold text-[#1F1B16] dark:text-[#F3EFE7] min-w-[36px] text-right tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* D3 Pinned Footer Insight Tile (W8 & P1-6 fixed) */}
        {topCategory && (
          <div className="mt-6 pt-3 border-t border-black/[0.07] dark:border-white/[0.08] text-xs text-[#5B564E] dark:text-[#C2BCB0] flex items-center justify-between">
            <span className="font-medium text-[#7D3F1E] dark:text-[#E07A57]">
              Top category: {topCategory.categoryName} ({topPct}% of spend)
            </span>
            <span className="text-[#6F6A61] dark:text-[#9A948A] font-light">
              {activeCatCount} of {categorySpend.length} active
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
