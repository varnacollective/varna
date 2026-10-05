"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CategorySpend, ProductSpendItem } from "@/lib/mock-data";

interface CategoryChartProps {
  categorySpend?: CategorySpend[] | any[];
  data?: any[];
  products?: ProductSpendItem[];
}

const BRAND_CHART_COLORS = [
  "#7A3F1E", // Deep clay
  "#6E8471", // Sage mineral
  "#6F8391", // Slate mist
  "#2B3A55", // Midnight blue
  "#9C7A58", // Warm clay
];

const DEFAULT_CATEGORY_ESG: Record<string, { E: number; S: number; G: number }> = {
  "Bathroom Amenities": { E: 32, S: 64, G: 82 },
  "Amenity Accessories": { E: 25, S: 59, G: 77 },
  "Disposables": { E: 46, S: 68, G: 78 },
  "Packaging": { E: 46, S: 68, G: 78 },
  "Spa & Wellness": { E: 40, S: 62, G: 74 },
  "Organic Toiletries": { E: 75, S: 80, G: 70 },
  "Artisan Ceramics": { E: 65, S: 70, G: 68 },
  "Handmade Soap": { E: 72, S: 76, G: 74 },
  "Eco-Packaging": { E: 68, S: 65, G: 62 },
};

const DEFAULT_CATEGORIES = [
  { category_name: "Bathroom Amenities", total_spend: 268000, total_orders: 1300, E: 32, S: 64, G: 82 },
  { category_name: "Amenity Accessories", total_spend: 33250, total_orders: 350, E: 25, S: 59, G: 77 },
  { category_name: "Disposables", total_spend: 7500, total_orders: 5000, E: 46, S: 68, G: 78 },
  { category_name: "Packaging", total_spend: 4400, total_orders: 2000, E: 46, S: 68, G: 78 },
];

function formatRowAmount(amountInr: number): string {
  if (amountInr <= 0) return "$0";
  const usd = amountInr >= 500 ? Math.round(amountInr / 83) : Math.round(amountInr);
  return `$${usd.toLocaleString("en-US")}`;
}

export default function CategoryChartV2({
  categorySpend,
  data,
  products,
}: CategoryChartProps) {
  const [activeToggle, setActiveToggle] = useState<"spend" | "impact">("spend");

  // Revert data keys: correctly read category_name and total_spend from data payload
  const categories = useMemo(() => {
    const rawList =
      categorySpend && categorySpend.length > 0
        ? categorySpend
        : data && data.length > 0
        ? data
        : DEFAULT_CATEGORIES;

    return rawList.map((cat: any, idx: number) => {
      const name: string =
        cat.category_name || cat.categoryName || cat.name || `Category ${idx + 1}`;
      const spend: number = Number(
        cat.total_spend ?? cat.totalSpend ?? cat.total_spend_inr_auto ?? cat.spend ?? 0
      );
      const orders: number = Number(
        cat.total_orders ?? cat.totalOrders ?? cat.total_units_auto ?? 0
      );
      const fallbackEsg = DEFAULT_CATEGORY_ESG[name] || { E: 65, S: 70, G: 75 };
      const E: number = Number(
        cat.E ?? cat.eScore ?? cat.e_score ?? cat.e_pillar_score ?? fallbackEsg.E
      );
      const S: number = Number(
        cat.S ?? cat.sScore ?? cat.s_score ?? cat.s_pillar_score ?? fallbackEsg.S
      );
      const G: number = Number(
        cat.G ?? cat.gScore ?? cat.g_score ?? cat.g_pillar_score ?? fallbackEsg.G
      );

      return {
        category_name: name,
        categoryName: name,
        total_spend: spend,
        totalSpend: spend,
        totalOrders: orders,
        E,
        S,
        G,
        color: BRAND_CHART_COLORS[idx % BRAND_CHART_COLORS.length],
      };
    });
  }, [categorySpend, data]);

  const totalSpend = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.total_spend, 0);
  }, [categories]);

  return (
    <div className="flex flex-col h-full">
      {/* 2. Toggle Controls: Hard-deleted Emissions; Renamed Score to 'Impact by Product' */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-black/5 dark:bg-white/5 w-fit">
        <button
          type="button"
          onClick={() => setActiveToggle("spend")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeToggle === "spend"
              ? "bg-white dark:bg-[#272C34] text-[#1F1B16] dark:text-[#F3EFE7] shadow-sm"
              : "text-[#6F6A61] dark:text-[#9A948A] hover:text-[#1F1B16] dark:hover:text-[#F3EFE7]"
          }`}
        >
          Spend by Product
        </button>
        <button
          type="button"
          onClick={() => setActiveToggle("impact")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeToggle === "impact"
              ? "bg-white dark:bg-[#272C34] text-[#1F1B16] dark:text-[#F3EFE7] shadow-sm"
              : "text-[#6F6A61] dark:text-[#9A948A] hover:text-[#1F1B16] dark:hover:text-[#F3EFE7]"
          }`}
        >
          Impact by Product
        </button>
      </div>

      {/* 1. Spend View: Restoring custom horizontal bars, $ dollar amounts, and % calculations */}
      {activeToggle === "spend" && (
        <div className="space-y-4">
          {/* 12px Segmented Horizontal Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/10 gap-1 my-2">
            {categories.map((cat) => {
              const pct = totalSpend > 0 ? (cat.total_spend / totalSpend) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={cat.category_name}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: cat.color,
                  }}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                  title={`${cat.category_name}: ${pct.toFixed(1)}% (${formatRowAmount(cat.total_spend)})`}
                />
              );
            })}
          </div>

          {/* Row List for All Categories with custom horizontal bars, $ dollar amounts, and % calculations */}
          <div className="space-y-3 mt-4">
            {categories.map((cat) => {
              const pctVal = totalSpend > 0 ? (cat.total_spend / totalSpend) * 100 : 0;
              const pctStr = pctVal % 1 === 0 ? pctVal.toString() : pctVal.toFixed(1);
              const isZero = cat.total_spend === 0;

              return (
                <div
                  key={cat.category_name}
                  className={`flex items-center justify-between text-[14px] sm:text-[15px] py-1 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0 ${
                    isZero ? "opacity-45" : "opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-[140px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-normal truncate">
                      {cat.category_name}
                    </span>
                  </div>

                  {/* Custom horizontal bar */}
                  <div className="hidden sm:block flex-1 max-w-[120px] mx-3">
                    <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pctVal}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[#6F6A61] dark:text-[#9A948A] font-normal text-sm tabular-nums">
                      {formatRowAmount(cat.total_spend)}
                    </span>
                    <span className="font-semibold text-[#1F1B16] dark:text-[#F3EFE7] min-w-[40px] text-right tabular-nums">
                      {pctStr}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Grouped E, S, G Impact Chart View */}
      {activeToggle === "impact" && (
        <div className="space-y-2">
          {/* Legend for E, S, G */}
          <div className="flex items-center justify-end gap-3 text-[11px] mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#4C7355]" />
              <span className="text-[#6F6A61] dark:text-[#9A948A] font-medium">E (Env)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#B85333]" />
              <span className="text-[#6F6A61] dark:text-[#9A948A] font-medium">S (Soc)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#36424A]" />
              <span className="text-[#6F6A61] dark:text-[#9A948A] font-medium">G (Gov)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categories}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
                barCategoryGap="25%"
                barGap={2}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: "#6F6A61" }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(0,0,0,0.08)" }}
                />
                <YAxis
                  type="category"
                  dataKey="category_name"
                  width={130}
                  tick={{ fontSize: 11, fontWeight: 500, fill: "#1F1B16" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-[#20242B] border border-black/10 dark:border-white/15 rounded-xl p-3 shadow-xl text-xs min-w-[190px] z-50">
                        <p className="font-semibold text-[#1F1B16] dark:text-[#F3EFE7] mb-2 text-xs border-b border-black/5 dark:border-white/10 pb-1.5">
                          {d.category_name}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm bg-[#4C7355]" />
                              <span className="text-[#6F6A61] dark:text-[#9A948A]">Environmental (E):</span>
                            </div>
                            <span className="font-bold text-[#4C7355] tabular-nums">{d.E}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm bg-[#B85333]" />
                              <span className="text-[#6F6A61] dark:text-[#9A948A]">Social (S):</span>
                            </div>
                            <span className="font-bold text-[#B85333] tabular-nums">{d.S}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm bg-[#36424A]" />
                              <span className="text-[#6F6A61] dark:text-[#9A948A]">Governance (G):</span>
                            </div>
                            <span className="font-bold text-[#36424A] dark:text-[#9BA9B4] tabular-nums">{d.G}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="E"
                  fill="#4C7355"
                  radius={[0, 3, 3, 0]}
                  maxBarSize={9}
                  name="Environmental"
                />
                <Bar
                  dataKey="S"
                  fill="#B85333"
                  radius={[0, 3, 3, 0]}
                  maxBarSize={9}
                  name="Social"
                />
                <Bar
                  dataKey="G"
                  fill="#36424A"
                  radius={[0, 3, 3, 0]}
                  maxBarSize={9}
                  name="Governance"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export { CategoryChartV2 };
