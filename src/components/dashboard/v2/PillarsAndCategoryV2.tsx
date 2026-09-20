"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
  "#738678", // sage-mineral
  "#6F848F", // slate-mist
  "#2F3C52", // midnight-blue
  "#9C7A58", // warm clay tint
];

function formatLakhOrInr(val: number): string {
  if (val >= 100000) {
    return `INR ${(val / 100000).toFixed(2)} LAKH`;
  }
  if (val >= 1000) {
    return `INR ${Math.round(val / 1000)}K`;
  }
  return `INR ${val}`;
}

function formatRowAmount(val: number): string {
  if (val >= 100000) {
    return `INR ${(val / 100000).toFixed(2)} lakh`;
  }
  if (val >= 1000) {
    return `INR ${Math.round(val / 1000)}k`;
  }
  return `INR ${val}`;
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 8 Cols: Visual Image + ESG Performance Pillars */}
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left 4/12 of 8 cols: Visual Amenity Image Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="
            md:col-span-4
            bg-white dark:bg-[#1E2028]
            rounded-2xl overflow-hidden
            border border-[#EAE5DC] dark:border-[#9BA9B4]/16
            shadow-sm min-h-[380px] relative
          "
        >
          <Image
            src="/assets/Dashboard_visual_2.svg"
            alt="Artisanal Amenities Visual"
            fill
            className="object-cover rounded-2xl"
          />
        </motion.div>

        {/* Right 8/12 of 8 cols: ESG Pillars Card with Circular SVG Gauges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="
            md:col-span-8
            bg-white dark:bg-[#1E2028]
            rounded-2xl border border-[#EAE5DC] dark:border-[#9BA9B4]/16
            shadow-sm flex flex-col justify-between p-6 sm:p-7 min-h-[380px]
          "
        >
          {/* Render circular gauges inside ImpactPillars */}
          <div className="flex-1 flex flex-col justify-between">
            <ImpactPillars
              eScore={eScore}
              sScore={sScore}
              gScore={gScore}
              cScore={cScore}
              pillarBreakdown={pillarBreakdown}
            />
          </div>

          {/* Bottom threshold caption */}
          <p className="text-[10px] text-[#6F848F] dark:text-[#8C9DA8] font-light mt-4 pt-3 border-t border-[#EAE5DC] dark:border-[#9BA9B4]/15">
            Breaks in each pillar mark the band thresholds: Not Ready under 40, Foundational 40–54, Emerging 55–69, Advanced 70–84, Leader 85+.
          </p>
        </motion.div>
      </div>

      {/* 4 Cols: Spend by Product Category Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-4
          bg-white dark:bg-[#1E2028]
          rounded-2xl border border-[#EAE5DC] dark:border-[#9BA9B4]/16
          shadow-sm flex flex-col justify-between p-6 sm:p-7 min-h-[380px]
        "
      >
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6F848F] dark:text-[#8C9DA8] mb-1">
            Spend by Product Category
          </h3>

          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl sm:text-3xl font-light text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight">
              {formatLakhOrInr(totalCategorySpend)}
            </span>
            <span className="text-[10px] font-semibold text-[#6F848F] dark:text-[#9BA9B4] uppercase tracking-wider">
              TOTAL SPEND
            </span>
          </div>

          {/* Full-width Segmented Horizontal Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#EAE5DC] dark:bg-[#252830] my-4 shadow-inner">
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
                  className="h-full transition-all duration-500"
                  title={`${cat.categoryName}: ${pct.toFixed(1)}% (${formatRowAmount(cat.totalSpend)})`}
                />
              );
            })}
          </div>

          {/* Row List for ALL categories (including 0% ones) */}
          <div className="space-y-3 mt-4">
            {categorySpend.map((cat, idx) => {
              const pct = totalCategorySpend > 0 ? Math.round((cat.totalSpend / totalCategorySpend) * 100) : 0;
              const color = BRAND_CHART_COLORS[idx % BRAND_CHART_COLORS.length];

              return (
                <div
                  key={cat.categoryName}
                  className="flex items-center justify-between text-xs py-1 border-b border-[#EAE5DC]/60 dark:border-[#9BA9B4]/10 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[#1A1F26] dark:text-[#FAF8F5] font-light">
                      {cat.categoryName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[#6F848F] dark:text-[#8C9DA8] font-light text-[11px]">
                      {formatRowAmount(cat.totalSpend)}
                    </span>
                    <span className="font-medium text-[#1A1F26] dark:text-[#FAF8F5] min-w-[32px] text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
