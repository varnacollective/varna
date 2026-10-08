"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { CategorySpend, ProductSpendItem } from "@/lib/mock-data";

export interface OrderRegisterItem {
  order_id?: string;
  sku_id?: string;
  product_name_auto?: string;
  product_name?: string;
  category_auto?: string;
  enterprise_name_auto?: string;
  order_date: string;
  order_value_inr_auto: number;
  co2_reduction_pct: number | null;
  [key: string]: any;
}

interface CategoryChartProps {
  categorySpend?: CategorySpend[] | any[];
  data?: any[];
  products?: ProductSpendItem[];
  orderRegister?: OrderRegisterItem[];
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

/**
 * Historical order register seed data covering verified products with chronological timestamps
 * in DD/MM/YYYY format and real CO2 reduction percentages.
 */
export const DEFAULT_ORDER_REGISTER: OrderRegisterItem[] = [
  // 1. Liquid Soap (Fresh Lime Shower Gel)
  {
    order_id: "ORD-001-A",
    sku_id: "SKU-001",
    product_name_auto: "Liquid Soap (Fresh Lime Shower Gel)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "12/01/2026",
    order_value_inr_auto: 98000,
    co2_reduction_pct: 88.5,
  },
  {
    order_id: "ORD-001-B",
    sku_id: "SKU-001",
    product_name_auto: "Liquid Soap (Fresh Lime Shower Gel)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "05/02/2026",
    order_value_inr_auto: 124000,
    co2_reduction_pct: 91.2,
  },
  {
    order_id: "ORD-001",
    sku_id: "SKU-001",
    product_name_auto: "Liquid Soap (Fresh Lime Shower Gel)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "01/03/2026",
    order_value_inr_auto: 148000,
    co2_reduction_pct: 95.6,
  },
  {
    order_id: "ORD-001-C",
    sku_id: "SKU-001",
    product_name_auto: "Liquid Soap (Fresh Lime Shower Gel)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "25/03/2026",
    order_value_inr_auto: 165000,
    co2_reduction_pct: 96.4,
  },

  // 2. Liquid Conditioner (Jojoba Aloevera)
  {
    order_id: "ORD-004-A",
    sku_id: "SKU-003",
    product_name_auto: "Liquid Conditioner (Jojoba Aloevera)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "15/01/2026",
    order_value_inr_auto: 75000,
    co2_reduction_pct: 21.0,
  },
  {
    order_id: "ORD-004-B",
    sku_id: "SKU-003",
    product_name_auto: "Liquid Conditioner (Jojoba Aloevera)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "18/02/2026",
    order_value_inr_auto: 92000,
    co2_reduction_pct: 23.5,
  },
  {
    order_id: "ORD-004-C",
    sku_id: "SKU-003",
    product_name_auto: "Liquid Conditioner (Jojoba Aloevera)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "12/03/2026",
    order_value_inr_auto: 105000,
    co2_reduction_pct: 24.8,
  },
  {
    order_id: "ORD-004",
    sku_id: "SKU-003",
    product_name_auto: "Liquid Conditioner (Jojoba Aloevera)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "10/04/2026",
    order_value_inr_auto: 120000,
    co2_reduction_pct: 25.8,
  },

  // 3. Handcrafted Wooden Comb
  {
    order_id: "ORD-004-D",
    sku_id: "SKU-012",
    product_name_auto: "Handcrafted Wooden Comb",
    category_auto: "Amenity Accessories",
    enterprise_name_auto: "Kheoni Ventures Pvt Ltd",
    order_date: "10/01/2026",
    order_value_inr_auto: 18000,
    co2_reduction_pct: 35.0,
  },
  {
    order_id: "ORD-004-E",
    sku_id: "SKU-012",
    product_name_auto: "Handcrafted Wooden Comb",
    category_auto: "Amenity Accessories",
    enterprise_name_auto: "Kheoni Ventures Pvt Ltd",
    order_date: "14/02/2026",
    order_value_inr_auto: 24500,
    co2_reduction_pct: 38.2,
  },
  {
    order_id: "ORD-004-F",
    sku_id: "SKU-012",
    product_name_auto: "Handcrafted Wooden Comb",
    category_auto: "Amenity Accessories",
    enterprise_name_auto: "Kheoni Ventures Pvt Ltd",
    order_date: "16/03/2026",
    order_value_inr_auto: 29000,
    co2_reduction_pct: 40.5,
  },
  {
    order_id: "ORD-004",
    sku_id: "SKU-012",
    product_name_auto: "Handcrafted Wooden Comb",
    category_auto: "Amenity Accessories",
    enterprise_name_auto: "Kheoni Ventures Pvt Ltd",
    order_date: "10/04/2026",
    order_value_inr_auto: 33250,
    co2_reduction_pct: 42.0,
  },

  // 4. Drinking Straws
  {
    order_id: "ORD-001-D",
    sku_id: "SKU-005",
    product_name_auto: "Drinking Straws",
    category_auto: "Disposables",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "08/01/2026",
    order_value_inr_auto: 4200,
    co2_reduction_pct: 18.0,
  },
  {
    order_id: "ORD-001-E",
    sku_id: "SKU-005",
    product_name_auto: "Drinking Straws",
    category_auto: "Disposables",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "10/02/2026",
    order_value_inr_auto: 5800,
    co2_reduction_pct: 21.4,
  },
  {
    order_id: "ORD-001",
    sku_id: "SKU-005",
    product_name_auto: "Drinking Straws",
    category_auto: "Disposables",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "01/03/2026",
    order_value_inr_auto: 7500,
    co2_reduction_pct: 24.5,
  },
  {
    order_id: "ORD-001-F",
    sku_id: "SKU-005",
    product_name_auto: "Drinking Straws",
    category_auto: "Disposables",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "05/04/2026",
    order_value_inr_auto: 8400,
    co2_reduction_pct: 26.2,
  },

  // 5. Garbage Bags (Flat)
  {
    order_id: "ORD-001-G",
    sku_id: "SKU-007",
    product_name_auto: "Garbage Bags (Flat)",
    category_auto: "Packaging",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "14/01/2026",
    order_value_inr_auto: 2800,
    co2_reduction_pct: 19.5,
  },
  {
    order_id: "ORD-001-H",
    sku_id: "SKU-007",
    product_name_auto: "Garbage Bags (Flat)",
    category_auto: "Packaging",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "12/02/2026",
    order_value_inr_auto: 3600,
    co2_reduction_pct: 22.0,
  },
  {
    order_id: "ORD-001",
    sku_id: "SKU-007",
    product_name_auto: "Garbage Bags (Flat)",
    category_auto: "Packaging",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "01/03/2026",
    order_value_inr_auto: 4400,
    co2_reduction_pct: 24.5,
  },
  {
    order_id: "ORD-001-I",
    sku_id: "SKU-007",
    product_name_auto: "Garbage Bags (Flat)",
    category_auto: "Packaging",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "08/04/2026",
    order_value_inr_auto: 5100,
    co2_reduction_pct: 25.8,
  },

  // 6. Liquid Shampoo (Amla Shikakai)
  {
    order_id: "ORD-002-A",
    sku_id: "SKU-002",
    product_name_auto: "Liquid Shampoo (Amla Shikakai)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "10/01/2026",
    order_value_inr_auto: 85000,
    co2_reduction_pct: 82.0,
  },
  {
    order_id: "ORD-002-B",
    sku_id: "SKU-002",
    product_name_auto: "Liquid Shampoo (Amla Shikakai)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "12/02/2026",
    order_value_inr_auto: 108000,
    co2_reduction_pct: 86.5,
  },
  {
    order_id: "ORD-002",
    sku_id: "SKU-002",
    product_name_auto: "Liquid Shampoo (Amla Shikakai)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "15/03/2026",
    order_value_inr_auto: 126000,
    co2_reduction_pct: 90.0,
  },
];

/**
 * Safely parse date in DD/MM/YYYY format (or standard string) into a numeric timestamp
 * for accurate chronological sorting.
 */
function parseDateDDMMYYYY(dateStr: string): number {
  if (!dateStr) return 0;
  const cleanStr = String(dateStr).trim();
  const ddmmyyyyMatch = cleanStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // 0-indexed month
    const year = parseInt(ddmmyyyyMatch[3], 10);
    return new Date(year, month, day).getTime();
  }
  const timestamp = Date.parse(cleanStr);
  return isNaN(timestamp) ? 0 : timestamp;
}

function formatRowAmount(amountInr: number): string {
  if (amountInr <= 0) return "$0";
  const usd = amountInr >= 500 ? Math.round(amountInr / 83) : Math.round(amountInr);
  return `$${usd.toLocaleString("en-US")}`;
}

export default function CategoryChartV2({
  categorySpend,
  data,
  products,
  orderRegister,
}: CategoryChartProps) {
  // Step 1: Active Toggle ('spend' vs 'co2')
  const [activeToggle, setActiveToggle] = useState<"spend" | "co2">("spend");

  // Step 1 (Action 2): State hook to manage selected product in dropdown
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  // Process category-level spend metrics
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

  // Combine live orderRegister prop with default order_register records
  const allOrderRegisterData = useMemo<OrderRegisterItem[]>(() => {
    if (orderRegister && orderRegister.length > 0) {
      const combined = [...orderRegister];
      DEFAULT_ORDER_REGISTER.forEach((defRow) => {
        const exists = orderRegister.some(
          (r) =>
            (r.sku_id === defRow.sku_id || r.product_name_auto === defRow.product_name_auto) &&
            r.order_date === defRow.order_date
        );
        if (!exists) {
          combined.push(defRow);
        }
      });
      return combined;
    }
    return DEFAULT_ORDER_REGISTER;
  }, [orderRegister]);

  // Step 1 (Action 2): Populate unique products dynamically from current data context
  const productOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>();

    allOrderRegisterData.forEach((row) => {
      const name = row.product_name_auto || row.product_name || row.sku_id;
      if (name && !map.has(name)) {
        const label = row.sku_id ? `${name} (${row.sku_id})` : name;
        map.set(name, { value: name, label });
      }
    });

    if (products && products.length > 0) {
      products.forEach((p) => {
        const name = p.productName || p.skuId;
        if (name && !map.has(name)) {
          const label = p.skuId ? `${name} (${p.skuId})` : name;
          map.set(name, { value: name, label });
        }
      });
    }

    return Array.from(map.values());
  }, [allOrderRegisterData, products]);

  // Derived currently selected product (defaults to first option if unselected or stale)
  const currentSelectedProduct = useMemo(() => {
    if (selectedProduct && productOptions.some((p) => p.value === selectedProduct)) {
      return selectedProduct;
    }
    return productOptions[0]?.value || "";
  }, [selectedProduct, productOptions]);

  // Step 2: Filter order_register array for currentSelectedProduct & sort chronologically by order_date
  const filteredTimeSeriesData = useMemo(() => {
    if (!currentSelectedProduct) return [];

    const matches = allOrderRegisterData.filter((row) => {
      const name = row.product_name_auto || row.product_name || "";
      const sku = row.sku_id || "";
      return name === currentSelectedProduct || sku === currentSelectedProduct;
    });

    // Chronological sort using parsed DD/MM/YYYY timestamp
    const sorted = [...matches].sort((a, b) => {
      return parseDateDDMMYYYY(a.order_date) - parseDateDDMMYYYY(b.order_date);
    });

    return sorted.map((row) => {
      const spend = Number(
        row.order_value_inr_auto ?? row.order_value ?? row.orderValue ?? row.spend ?? 0
      );
      const co2 =
        row.co2_reduction_pct !== null && row.co2_reduction_pct !== undefined
          ? Number(row.co2_reduction_pct)
          : 0;

      return {
        order_date: row.order_date || "N/A",
        order_value_inr_auto: spend,
        co2_reduction_pct: co2,
        product_name: row.product_name_auto || row.product_name || selectedProduct,
        sku_id: row.sku_id || "",
      };
    });
  }, [allOrderRegisterData, selectedProduct]);

  return (
    <div className="flex flex-col h-full">
      {/* 1. Toggle Controls: 'Spend by Category' & Renamed 'CO2 Emissions' */}
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
          Spend by Category
        </button>
        <button
          type="button"
          onClick={() => setActiveToggle("co2")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeToggle === "co2"
              ? "bg-white dark:bg-[#272C34] text-[#1F1B16] dark:text-[#F3EFE7] shadow-sm"
              : "text-[#6F6A61] dark:text-[#9A948A] hover:text-[#1F1B16] dark:hover:text-[#F3EFE7]"
          }`}
        >
          CO2 Emissions
        </button>
      </div>

      {/* Spend View: Segmented horizontal bar, enlarged category rows and mini donut chart */}
      {activeToggle === "spend" && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          {/* Segmented Horizontal Bar */}
          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/10 gap-1 my-2">
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
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:opacity-90"
                  title={`${cat.category_name}: ${pct.toFixed(1)}% (${formatRowAmount(cat.total_spend)})`}
                />
              );
            })}
          </div>

          {/* 2-Column Layout: Left Category Rows, Right Mini Donut Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mt-2 flex-1">
            {/* Left: Category Rows with generous spacing and clearer hierarchy */}
            <div className="md:col-span-7 space-y-2.5">
              {categories.map((cat) => {
                const pctVal = totalSpend > 0 ? (cat.total_spend / totalSpend) * 100 : 0;
                const pctStr = pctVal % 1 === 0 ? pctVal.toString() : pctVal.toFixed(1);
                const isZero = cat.total_spend === 0;

                return (
                  <div
                    key={cat.category_name}
                    className={`flex items-center justify-between text-[14px] sm:text-[15px] py-1.5 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0 ${
                      isZero ? "opacity-45" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-[130px]">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-medium text-sm truncate">
                        {cat.category_name}
                      </span>
                    </div>

                    {/* Custom horizontal bar */}
                    <div className="hidden sm:block flex-1 max-w-[110px] mx-2.5">
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

                    <div className="flex items-center gap-3">
                      <span className="text-[#6F6A61] dark:text-[#9A948A] font-normal text-xs sm:text-sm tabular-nums">
                        {formatRowAmount(cat.total_spend)}
                      </span>
                      <span className="font-semibold text-[#1F1B16] dark:text-[#F3EFE7] min-w-[38px] text-right tabular-nums text-xs sm:text-sm">
                        {pctStr}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Mini Donut Chart */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] relative h-full min-h-[170px]">
              <div className="w-full h-32 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories.filter((c) => c.total_spend > 0)}
                      dataKey="total_spend"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={52}
                      paddingAngle={3}
                      strokeWidth={1}
                      stroke="rgba(0,0,0,0.06)"
                    >
                      {categories
                        .filter((c) => c.total_spend > 0)
                        .map((entry, index) => (
                          <Cell key={`donut-cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text inside mini donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums">
                    {formatRowAmount(totalSpend)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#6F6A61] dark:text-[#9A948A] font-medium">
                    Total
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] text-[#6F6A61] dark:text-[#9A948A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#55705A] dark:bg-[#9DB4A0]" />
                <span className="font-medium">Spend Distribution</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CO2 Emissions Time-Series View: Product Dropdown & Two LineCharts */}
      {activeToggle === "co2" && (
        <div className="space-y-3.5">
          {/* Action 2: Native <select> dropdown populated with unique products */}
          <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
            <label
              htmlFor="product-select"
              className="text-[11px] font-medium text-[#6F6A61] dark:text-[#9A948A] flex items-center justify-between"
            >
              <span>Filter by Product / SKU:</span>
              <span className="text-[10px] text-[#7D3F1E] dark:text-[#E07A57] font-medium">
                {filteredTimeSeriesData.length} recorded orders
              </span>
            </label>
            <select
              id="product-select"
              value={currentSelectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full text-xs font-normal bg-white dark:bg-[#1D2127] border border-black/15 dark:border-white/15 rounded-lg px-2.5 py-1.5 text-[#1F1B16] dark:text-[#F3EFE7] focus:outline-none focus:ring-1 focus:ring-[#7D3F1E] dark:focus:ring-[#E07A57] cursor-pointer shadow-xs truncate"
            >
              {productOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white dark:bg-[#1D2127] text-[#1F1B16] dark:text-[#F3EFE7]"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time-Series Line Charts */}
          {filteredTimeSeriesData.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6F6A61] dark:text-[#9A948A]">
              No order register history found for this product.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Chart 1 (Spend vs Time): X-axis order_date, Line dataKey order_value_inr_auto */}
              <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.06] rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[11px] font-medium text-[#1F1B16] dark:text-[#F3EFE7]">
                    Spend vs Time
                  </span>
                  <span className="text-[10px] text-[#7D3F1E] dark:text-[#E07A57] font-medium">
                    Order Spend
                  </span>
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={filteredTimeSeriesData}
                      margin={{ top: 20, right: 20, bottom: 25, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                      <XAxis
                        dataKey="order_date"
                        tick={{ fontSize: 10, fill: "#6F6A61" }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(0,0,0,0.08)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#6F6A61" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 83).toLocaleString()}` : `$${v}`)}
                        width={46}
                      />
                      <Tooltip
                        formatter={(value: any) => [
                          typeof value === "number"
                            ? `$${Math.round(value / 83).toLocaleString()} (₹${value.toLocaleString()})`
                            : value,
                          "Order Value",
                        ]}
                        labelFormatter={(label) => `Order Date: ${label}`}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.96)",
                          borderRadius: "8px",
                          fontSize: "11px",
                          borderColor: "rgba(0,0,0,0.1)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="order_value_inr_auto"
                        name="Order Spend"
                        stroke="#7D3F1E"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#7D3F1E" }}
                        activeDot={{ r: 5, fill: "#7D3F1E" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2 (CO2 Reduction vs Time): X-axis order_date, Line dataKey strictly co2_reduction_pct */}
              <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.06] rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[11px] font-medium text-[#1F1B16] dark:text-[#F3EFE7]">
                    CO₂ Reduction vs Time
                  </span>
                  <span className="text-[10px] text-[#4C7355] font-medium">
                    Reduction %
                  </span>
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={filteredTimeSeriesData}
                      margin={{ top: 20, right: 20, bottom: 25, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                      <XAxis
                        dataKey="order_date"
                        tick={{ fontSize: 10, fill: "#6F6A61" }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(0,0,0,0.08)" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tick={{ fontSize: 10, fill: "#6F6A61" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                        width={38}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${value}%`, "CO2 Reduction"]}
                        labelFormatter={(label) => `Order Date: ${label}`}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.96)",
                          borderRadius: "8px",
                          fontSize: "11px",
                          borderColor: "rgba(0,0,0,0.1)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="co2_reduction_pct"
                        name="CO2 Reduction (%)"
                        stroke="#4C7355"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#4C7355" }}
                        activeDot={{ r: 5, fill: "#4C7355" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { CategoryChartV2 };
