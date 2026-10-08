"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import ImpactPillars from "@/components/dashboard/ImpactPillars";
import { SCORE_BANDS, PerformanceBandsLegend } from "@/components/ui/VarnaScoreBandScale";
import CategoryChartV2 from "./CategoryChartV2";
import type { CategorySpend, ProductSpendItem } from "@/lib/mock-data";
import { MOCK_PRODUCTS_LIST } from "@/lib/mock-data";

interface PillarsAndCategoryV2Props {
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
  pillarBreakdown?: Record<string, any>;
  categorySpend: CategorySpend[];
  products?: ProductSpendItem[];
  orderRegister?: any[];
}

export default function PillarsAndCategoryV2({
  eScore,
  sScore,
  gScore,
  cScore,
  pillarBreakdown,
  categorySpend,
  products,
  orderRegister,
}: PillarsAndCategoryV2Props) {
  // Action 1, 2, 3: Product-level mapping
  const effectiveProducts = useMemo(() => {
    if (products && products.length > 0) return products;
    return MOCK_PRODUCTS_LIST.filter((p) => p.clientId === "CLT001" || !p.clientId);
  }, [products]);

  const totalProductSpendInr = useMemo(() => {
    return effectiveProducts.reduce((sum, p) => sum + p.totalSpend, 0);
  }, [effectiveProducts]);

  const totalCategorySpendInr = categorySpend.reduce((acc, cat) => acc + cat.totalSpend, 0);
  const totalCategorySpendUsd = categorySpend.reduce((acc, cat) => acc + (cat.totalSpend > 0 ? Math.round(cat.totalSpend / 83) : 0), 0);

  // D3 Derived Insight: Identify top category
  const topCategory = categorySpend.length > 0
    ? [...categorySpend].sort((a, b) => b.totalSpend - a.totalSpend)[0]
    : null;
  const topPct = topCategory && totalCategorySpendInr > 0 ? (topCategory.totalSpend / totalCategorySpendInr * 100).toFixed(1) : "0";
  const activeCatCount = categorySpend.filter((c) => c.totalSpend > 0).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 items-stretch">
      {/* 2 of 5 Cols (~40%): ESG Performance Pillars Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="
          col-span-1 lg:col-span-2
          bg-white dark:bg-[#20242B]
          rounded-[24px] border border-black/[0.07] dark:border-white/[0.08]
          shadow-sm flex flex-col justify-between p-6 lg:p-7 min-h-[400px] h-full
        "
      >
        {/* Header Row */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.07] dark:border-white/[0.08] gap-4">
          <div className="flex items-baseline gap-2 truncate">
            <h2 className="text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-[-0.01em] whitespace-nowrap">
              ESG Performance Pillars
            </h2>
          </div>
        </div>

        {/* Body: Centered & Tightened Circular Gauges */}
        <div className="py-2 flex-1 flex flex-col justify-center">
          <ImpactPillars
            eScore={eScore}
            sScore={sScore}
            gScore={gScore}
            cScore={cScore}
            pillarBreakdown={pillarBreakdown}
            compact={true}
            gaugeSize={128}
          />
        </div>

        {/* Bottom: Segmented Score Chart mirroring the Sutra Verified Score card */}
        <div className="mt-4 pt-3 border-t border-black/[0.07] dark:border-white/[0.08]">
          {/* Performance Bands Legend aligned 1-to-1 in 5-columns directly over the 5 bar segments */}
          <PerformanceBandsLegend orientation="horizontal" className="mb-2" />

          {/* Segmented bar: completely uniform matching 5 columns */}
          <div className="w-full my-1 transform-gpu">
            <div className="w-full h-2.5 rounded-full overflow-hidden grid grid-cols-5 bg-black/5 dark:bg-white/10 relative p-0.5 gap-0.5">
              {SCORE_BANDS.map((band, idx) => (
                <div
                  key={band.id}
                  className={`h-full transition-opacity hover:opacity-90 ${
                    idx === 0 ? "rounded-l-full" : ""
                  } ${idx === SCORE_BANDS.length - 1 ? "rounded-r-full" : ""}`}
                  style={{ backgroundColor: band.color }}
                  title={`${band.name}: ${band.rangeLabel}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3 of 5 Cols (~60%): Category Level Metrics Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          col-span-1 lg:col-span-3
          bg-white dark:bg-[#20242B]
          rounded-[24px] border border-black/[0.07] dark:border-white/[0.08]
          shadow-sm flex flex-col justify-between p-6 lg:p-7 min-h-[400px] h-full
        "
      >
        <div className="flex-1 flex flex-col">
          <div className="pb-4 border-b border-black/[0.07] dark:border-white/[0.08] mb-3">
            <h2 className="text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-[-0.01em]">
              Category Level Metrics
            </h2>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl lg:text-[36px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums" aria-label={`Total spend $${totalCategorySpendUsd.toLocaleString('en-US')}`}>
                ${totalCategorySpendUsd.toLocaleString('en-US')}
              </span>
              <span className="text-xs font-semibold text-[#6F6A61] dark:text-[#9A948A] uppercase tracking-wider">
                SUSTAINABLE SPEND
              </span>
            </div>
          </div>

          {/* Horizontal Bar Chart with toggle & mini donut */}
          <div className="flex-1 flex flex-col justify-between min-h-[280px]">
            <CategoryChartV2 products={effectiveProducts} categorySpend={categorySpend} orderRegister={orderRegister} />
          </div>
        </div>

        {/* D3 Pinned Footer Insight Tile - Top Category */}
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
