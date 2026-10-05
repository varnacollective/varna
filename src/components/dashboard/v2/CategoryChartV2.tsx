"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, X, ChevronRight, Package, Tag, Building2, HelpCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CategorySpend, ProductSpendItem } from "@/lib/mock-data";
import { MOCK_PRODUCTS_LIST } from "@/lib/mock-data";

const BRAND_COLORS = [
  "#7A3F1E", "#6E8471", "#6F8391", "#2B3A55", "#9C7A58", "#5A6F5A", "#7D6B52", "#4A5F6A",
];

function getScoreBand(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Leader", color: "#55705A" };
  if (score >= 70) return { label: "Advanced", color: "#7D3F1E" };
  if (score >= 55) return { label: "Emerging", color: "#6F8391" };
  return { label: "Foundational", color: "#9C7A58" };
}

function formatInr(val: number): string {
  if (val >= 10000000) return `Rs.${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `Rs.${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `Rs.${(val / 1000).toFixed(0)}K`;
  return `Rs.${val.toLocaleString("en-IN")}`;
}

type Lens = "spend" | "score";

export interface DetailProductItem {
  skuId: string;
  productName: string;
  displayName: string;
  categoryName: string;
  supplierName: string;
  totalSpend: number;
  spendPct: number;
  varnaScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  totalUnits: number;
  color: string;
}

interface CategoryChartProps {
  products?: ProductSpendItem[];
  categorySpend?: CategorySpend[];
  suppliers?: any[];
}

function CustomBarTooltip({
  active,
  payload,
  lens,
}: {
  active?: boolean;
  payload?: any[];
  lens: Lens;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as DetailProductItem;
  if (!d) return null;

  return (
    <div className="bg-white dark:bg-[#20242B] border border-black/10 dark:border-white/15 rounded-xl p-3 shadow-xl text-xs min-w-[200px] z-50">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/5 dark:bg-white/10 text-[#7D3F1E] dark:text-[#E07A57]">
          {d.skuId}
        </span>
        <span className="text-[10px] text-[#6F6A61] dark:text-[#9A948A] truncate max-w-[120px]">
          {d.categoryName}
        </span>
      </div>
      <p className="font-semibold text-[#1F1B16] dark:text-[#F3EFE7] mb-2 text-xs leading-snug">
        {d.productName}
      </p>

      {lens === "spend" ? (
        <div className="space-y-1 pt-1 border-t border-black/5 dark:border-white/10">
          <p className="text-[#6F6A61] dark:text-[#9A948A] flex justify-between">
            <span>Order Value:</span>
            <span className="font-semibold text-[#7D3F1E] dark:text-[#E07A57]">
              {formatInr(d.totalSpend)}
            </span>
          </p>
          <p className="text-[#6F6A61] dark:text-[#9A948A] flex justify-between">
            <span>Share of Spend:</span>
            <span className="font-medium text-[#1F1B16] dark:text-[#F3EFE7]">
              {d.spendPct.toFixed(1)}%
            </span>
          </p>
          <p className="text-[#6F6A61] dark:text-[#9A948A] flex justify-between">
            <span>Volume Ordered:</span>
            <span className="font-medium text-[#1F1B16] dark:text-[#F3EFE7]">
              {d.totalUnits.toLocaleString("en-IN")} units
            </span>
          </p>
        </div>
      ) : (
        <div className="space-y-1 pt-1 border-t border-black/5 dark:border-white/10">
          <p className="text-[#6F6A61] dark:text-[#9A948A] flex justify-between">
            <span>Product Score:</span>
            <span className="font-semibold text-[#7D3F1E] dark:text-[#E07A57]">
              {d.varnaScore.toFixed(1)} / 100
            </span>
          </p>
          <p className="text-[#6F6A61] dark:text-[#9A948A] flex justify-between">
            <span>Rating Band:</span>
            <span className="font-medium text-[#1F1B16] dark:text-[#F3EFE7]">
              {getScoreBand(d.varnaScore).label}
            </span>
          </p>
          <p className="text-[#6F6A61] dark:text-[#9A948A] flex justify-between">
            <span>Producer:</span>
            <span className="font-medium text-[#1F1B16] dark:text-[#F3EFE7] truncate max-w-[110px]">
              {d.supplierName}
            </span>
          </p>
        </div>
      )}
      <p className="text-[#9A948A] dark:text-[#6F6A61] mt-2 text-[10px] flex items-center gap-1 border-t border-black/5 dark:border-white/5 pt-1">
        <ChevronRight className="w-3 h-3" /> Click bar for full SKU impact details
      </p>
    </div>
  );
}

function DetailPanel({
  item,
  onClose,
}: {
  item: DetailProductItem | null;
  onClose: () => void;
}) {
  if (!item) return null;
  const band = getScoreBand(item.varnaScore);

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/25 dark:bg-black/40 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] bg-white dark:bg-[#1A1E26] border-l border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-black/[0.07] dark:border-white/[0.08] sticky top-0 bg-white dark:bg-[#1A1E26] z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#7D3F1E]/10 dark:bg-[#E07A57]/15 text-[#7D3F1E] dark:text-[#E07A57] border border-[#7D3F1E]/20">
                    {item.skuId}
                  </span>
                  <span className="text-xs text-[#6F6A61] dark:text-[#9A948A] flex items-center gap-1 font-medium">
                    <Tag className="w-3 h-3" /> {item.categoryName}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#1F1B16] dark:text-[#F3EFE7] leading-tight">
                  {item.productName}
                </h3>
                <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] font-normal mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.supplierName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#6F6A61] dark:text-[#9A948A] transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Spend Metric Card */}
              <div className="bg-[#F7F3EA] dark:bg-[#20242B] rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6F6A61] dark:text-[#9A948A] mb-1">
                  Total Order Value
                </p>
                <p className="text-3xl font-light text-[#1F1B16] dark:text-[#F3EFE7] tabular-nums">
                  {formatInr(item.totalSpend)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 flex-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.spendPct}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#1F1B16] dark:text-[#F3EFE7] tabular-nums">
                    {item.spendPct.toFixed(1)}% of total spend
                  </span>
                </div>
              </div>

              {/* Product Impact Score (Spend-Weighted) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6F6A61] dark:text-[#9A948A]">
                    Product Impact Score
                  </p>
                  <span className="text-[10px] text-[#9A948A]">Spend-Weighted</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-light tabular-nums" style={{ color: band.color }}>
                    {item.varnaScore.toFixed(1)}
                  </div>
                  <div>
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${band.color}18`,
                        color: band.color,
                        border: `1px solid ${band.color}30`,
                      }}
                    >
                      {band.label}
                    </span>
                    <p className="text-xs text-[#9A948A] mt-1">/ 100 benchmark</p>
                  </div>
                </div>
              </div>

              {/* ESG Pillar Breakdown for Product */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6F6A61] dark:text-[#9A948A] mb-3">
                  ESG Pillar Contributions
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Environmental", value: item.eScore, color: "#4C7355" },
                    { label: "Social", value: item.sScore, color: "#B85333" },
                    { label: "Governance", value: item.gScore, color: "#36424A" },
                  ].map((pillar) => (
                    <div key={pillar.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#5B564E] dark:text-[#C2BCB0] font-medium">
                          {pillar.label}
                        </span>
                        <span className="text-xs font-semibold text-[#1F1B16] dark:text-[#F3EFE7] tabular-nums">
                          {pillar.value.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: pillar.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.max(0, pillar.value))}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volume & Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F7F3EA] dark:bg-[#20242B] rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[#9A948A] mb-1">
                    Units Procured
                  </p>
                  <p className="text-xl font-light text-[#1F1B16] dark:text-[#F3EFE7] tabular-nums">
                    {item.totalUnits.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-[#F7F3EA] dark:bg-[#20242B] rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[#9A948A] mb-1">
                    Supplier Standing
                  </p>
                  <p className="text-xl font-light tabular-nums" style={{ color: band.color }}>
                    {band.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/[0.07] dark:border-white/[0.08]">
              <p className="text-[11px] text-[#9A948A] dark:text-[#6F6A61] font-normal text-center">
                Product score reflects verified supplier performance weighted by procurement order volume.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function CategoryChartV2({
  products,
  categorySpend = [],
}: CategoryChartProps) {
  const [lens, setLens] = useState<Lens>("spend");
  const [selectedItem, setSelectedItem] = useState<DetailProductItem | null>(null);
  const [showEmissionsTooltip, setShowEmissionsTooltip] = useState(false);

  // Group or map data at the individual product (SKU) level
  const rawProducts: ProductSpendItem[] = useMemo(() => {
    if (products && products.length > 0) return products;
    return MOCK_PRODUCTS_LIST.filter((p) => p.clientId === "CLT001" || !p.clientId);
  }, [products]);

  const totalSpend = useMemo(() => {
    return rawProducts.reduce((sum, p) => sum + p.totalSpend, 0);
  }, [rawProducts]);

  // Transform each SKU into chart item with Spend or Impact Score
  const chartData: DetailProductItem[] = useMemo(() => {
    return rawProducts
      .filter((p) => p.totalSpend > 0)
      .map((p, idx) => {
        const spendPct = totalSpend > 0 ? (p.totalSpend / totalSpend) * 100 : 0;
        // Clean display name for Y-axis (shortened product title)
        const cleanName = p.productName
          .replace(/\s*\([^)]*\)/g, "") // remove parenthetical like "(Fresh Lime Shower Gel)"
          .trim();
        const displayName = cleanName.length > 20 ? cleanName.slice(0, 18) + "..." : cleanName;

        return {
          skuId: p.skuId,
          productName: p.productName,
          displayName,
          categoryName: p.categoryName,
          supplierName: p.supplierName,
          totalSpend: p.totalSpend,
          spendPct,
          varnaScore: p.varnaScore,
          eScore: p.eScore ?? 65,
          sScore: p.sScore ?? 70,
          gScore: p.gScore ?? 75,
          totalUnits: p.totalUnits,
          color: BRAND_COLORS[idx % BRAND_COLORS.length],
        };
      })
      .sort((a, b) =>
        lens === "spend" ? b.totalSpend - a.totalSpend : b.varnaScore - a.varnaScore
      );
  }, [rawProducts, totalSpend, lens]);

  const handleBarClick = useCallback((data: any) => {
    if (data?.activePayload?.[0]?.payload) {
      setSelectedItem(data.activePayload[0].payload as DetailProductItem);
    }
  }, []);

  const isEmpty = chartData.length === 0 || totalSpend === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 text-center">
        <BarChart2 className="w-8 h-8 text-[#6F6A61] dark:text-[#9A948A] mb-2" strokeWidth={1.5} />
        <p className="text-sm text-[#6F6A61] dark:text-[#9A948A]">No product orders recorded</p>
        <p className="text-xs text-[#9A948A] mt-1">Product metrics will populate once orders are synced.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Toggle Controls */}
        <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-black/5 dark:bg-white/5 w-fit">
          <button
            type="button"
            onClick={() => setLens("spend")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              lens === "spend"
                ? "bg-white dark:bg-[#272C34] text-[#1F1B16] dark:text-[#F3EFE7] shadow-sm"
                : "text-[#6F6A61] dark:text-[#9A948A] hover:text-[#1F1B16] dark:hover:text-[#F3EFE7]"
            }`}
          >
            Spend by Product
          </button>
          <button
            type="button"
            onClick={() => setLens("score")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              lens === "score"
                ? "bg-white dark:bg-[#272C34] text-[#1F1B16] dark:text-[#F3EFE7] shadow-sm"
                : "text-[#6F6A61] dark:text-[#9A948A] hover:text-[#1F1B16] dark:hover:text-[#F3EFE7]"
            }`}
          >
            Score by Product
          </button>

          {/* Inactive Emissions Button with Accessible Click Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmissionsTooltip((prev) => !prev)}
              aria-label="Emissions by product (pending)"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#9A948A] dark:text-[#6F6A61] hover:text-[#1F1B16] dark:hover:text-white transition-colors cursor-pointer opacity-70 flex items-center gap-1"
            >
              Emissions
              <HelpCircle className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showEmissionsTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-[#1F1B16] dark:bg-[#F3EFE7] text-white dark:text-[#1F1B16] text-[10px] font-medium whitespace-nowrap z-20 shadow-lg"
                >
                  Coming soon - carbon data pending
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Horizontal Bar Chart (Individual Products) */}
        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 75, left: 0, bottom: 0 }}
              onClick={handleBarClick}
              style={{ cursor: "pointer" }}
            >
              <XAxis
                type="number"
                domain={[0, lens === "spend" ? Math.max(...chartData.map((d) => d.totalSpend), 1) : 100]}
                hide
              />
              <YAxis
                type="category"
                dataKey="displayName"
                width={135}
                tick={{ fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomBarTooltip lens={lens} />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar
                dataKey={lens === "spend" ? "totalSpend" : "varnaScore"}
                radius={[0, 6, 6, 0]}
                maxBarSize={18}
                label={{
                  position: "right",
                  fontSize: 11,
                  fontWeight: 600,
                  formatter: (val: any) =>
                    val != null
                      ? lens === "spend"
                        ? formatInr(Number(val))
                        : `${Number(val).toFixed(1)}`
                      : "",
                }}
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={`cell-${entry.skuId}-${idx}`}
                    fill={entry.color}
                    opacity={selectedItem && selectedItem.skuId !== entry.skuId ? 0.45 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Click indicator */}
        <p className="text-[10px] text-[#9A948A] dark:text-[#6F6A61] mt-2 flex items-center gap-1">
          <ChevronRight className="w-3 h-3" /> Click any product bar to see SKU details & sustainability metrics
        </p>
      </div>

      {/* Slide-out Product Detail Drawer */}
      <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
