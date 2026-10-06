"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ImpactPillars from "@/components/dashboard/ImpactPillars";
import VarnaScoreBandScale, { SCORE_BANDS, getActiveBandId } from "@/components/ui/VarnaScoreBandScale";
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
}

const BRAND_CHART_COLORS = [
  "#7A3F1E", // deep-clay
  "#6E8471", // sage-mineral
  "#6F8391", // slate-mist
  "#2B3A55", // midnight-blue
  "#9C7A58", // warm clay tint
];

function formatLakhOrInr(val: number): string {
  const usd = val > 0 ? Math.round(val / 83) : 0;
  return `$${usd.toLocaleString('en-US')}`;
}

function formatRowAmount(val: number): string {
  const usd = val > 0 ? Math.round(val / 83) : 0;
  return `$${usd.toLocaleString('en-US')}`;
}

export default function PillarsAndCategoryV2({
  eScore,
  sScore,
  gScore,
  cScore,
  pillarBreakdown,
  categorySpend,
  products,
}: PillarsAndCategoryV2Props) {
  // Action 1, 2, 3: Product-level mapping
  const effectiveProducts = useMemo(() => {
    if (products && products.length > 0) return products;
    return MOCK_PRODUCTS_LIST.filter((p) => p.clientId === "CLT001" || !p.clientId);
  }, [products]);

  const totalProductSpendInr = useMemo(() => {
    return effectiveProducts.reduce((sum, p) => sum + p.totalSpend, 0);
  }, [effectiveProducts]);

  const totalSpendUsd = totalProductSpendInr > 0 ? Math.round(totalProductSpendInr / 83) : 0;

  const topProduct = useMemo(() => {
    if (!effectiveProducts.length) return null;
    return [...effectiveProducts].sort((a, b) => b.totalSpend - a.totalSpend)[0];
  }, [effectiveProducts]);

  const topProductPct = totalProductSpendInr > 0 && topProduct
    ? Math.round((topProduct.totalSpend / totalProductSpendInr) * 100)
    : 0;
  const totalCategorySpendInr = categorySpend.reduce((acc, cat) => acc + cat.totalSpend, 0);
  const totalCategorySpendUsd = categorySpend.reduce((acc, cat) => acc + (cat.totalSpend > 0 ? Math.round(cat.totalSpend / 83) : 0), 0);

  // D3 Derived Insight: Identify top category
  const topCategory = categorySpend.length > 0
    ? [...categorySpend].sort((a, b) => b.totalSpend - a.totalSpend)[0]
    : null;
  const topPct = topCategory && totalCategorySpendInr > 0 ? (topCategory.totalSpend / totalCategorySpendInr * 100).toFixed(1) : "0";
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
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
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
            shadow-sm flex flex-col justify-between p-4 lg:p-5
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

          {/* Body: Circular Gauges */}
          <div className="my-auto py-3">
            <ImpactPillars
              eScore={eScore}
              sScore={sScore}
              gScore={gScore}
              cScore={cScore}
              pillarBreakdown={pillarBreakdown}
            />
          </div>

          {/* Bottom: Segmented Score Chart mirroring the Sutra Verified Score card */}
          {(() => {
            const avgScore = (eScore + sScore + gScore + cScore) / 4;
            const activeBandId = getActiveBandId(avgScore);
            return (
              <div className="pt-3 border-t border-black/[0.07] dark:border-white/[0.08]">
                {/* Horizontal legend */}
                <div className="flex flex-row items-center justify-between w-full gap-x-4 gap-y-1 flex-wrap text-[11px] sm:text-xs mb-2">
                  {SCORE_BANDS.map((band) => {
                    const isActive = activeBandId === band.id;
                    return (
                      <div
                        key={band.id}
                        className={`flex items-center gap-1.5 transition-all shrink-0 ${
                          isActive
                            ? "font-bold text-[#1F1B16] dark:text-[#F3EFE7] underline decoration-2 underline-offset-2"
                            : "text-[#6F6A61] dark:text-[#9A948A]"
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: band.color }}
                        />
                        <span className="whitespace-nowrap">
                          {band.name} {band.rangeLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Segmented bar */}
                <div className="w-full">
                  <VarnaScoreBandScale score={avgScore} legendOrientation="none" />
                </div>
              </div>
            );
          })()}
        </motion.div>
      </div>

      {/* 4 Cols: Spend by Product Card (W8 & P1-6 fixed) */}
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
          <div className="pb-4 border-b border-black/[0.07] dark:border-white/[0.08] mb-4">
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

          {/* Horizontal Bar Chart with toggle */}
          <div className="flex-1 min-h-[280px]">
            <CategoryChartV2 products={effectiveProducts} categorySpend={categorySpend} />
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
