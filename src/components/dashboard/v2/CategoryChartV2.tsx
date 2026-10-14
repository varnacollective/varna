import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CalendarX } from "lucide-react";
import type { CategorySpend, ProductSpendItem } from "@/lib/mock-data";
import { useDateRange } from "@/context/DateRangeContext";

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
  "#9A4A2E", // Warm Terracotta
  "#3A5A40", // Botanical Sage
  "#6F8391", // Slate Mist
  "#D4C5A9", // Muted Champagne Gold
  "#1C1917", // Deep Espresso
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
 * Synchronized with CLIENT_ORDERS_LIST:
 * - #1: 18/01/2026 Kheoni Wooden Comb ₹26,000
 * - #2: 02/02/2026 UKHI Straws ₹33,450 & Bags ₹15,000
 * - #3: 14/03/2026 UKHI Straws ₹66,000 & Bags ₹30,000
 * - #4: 28/04/2026 Bare Necessities Conditioner ₹64,200
 * - #5: 12/05/2026 Bare Necessities Liquid Soap ₹78,500 ($946)
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
  {
    order_id: "ORD-005",
    sku_id: "SKU-001",
    product_name_auto: "Liquid Soap (Fresh Lime Shower Gel)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "12/05/2026",
    order_value_inr_auto: 78500,
    co2_reduction_pct: 95.8,
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
  {
    order_id: "ORD-004-X",
    sku_id: "SKU-003",
    product_name_auto: "Liquid Conditioner (Jojoba Aloevera)",
    category_auto: "Bathroom Amenities",
    enterprise_name_auto: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    order_date: "28/04/2026",
    order_value_inr_auto: 64200,
    co2_reduction_pct: 26.5,
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
    order_id: "ORD-001-KHEONI",
    sku_id: "SKU-012",
    product_name_auto: "Handcrafted Wooden Comb",
    category_auto: "Amenity Accessories",
    enterprise_name_auto: "Kheoni Ventures Pvt Ltd",
    order_date: "18/01/2026",
    order_value_inr_auto: 26000,
    co2_reduction_pct: 37.0,
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
    order_id: "ORD-004-COMB",
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
    order_id: "ORD-002-UKHI-STRAWS",
    sku_id: "SKU-005",
    product_name_auto: "Drinking Straws",
    category_auto: "Disposables",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "02/02/2026",
    order_value_inr_auto: 33450,
    co2_reduction_pct: 22.0,
  },
  {
    order_id: "ORD-001-STRAWS",
    sku_id: "SKU-005",
    product_name_auto: "Drinking Straws",
    category_auto: "Disposables",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "01/03/2026",
    order_value_inr_auto: 7500,
    co2_reduction_pct: 24.5,
  },
  {
    order_id: "ORD-003-UKHI-STRAWS",
    sku_id: "SKU-005",
    product_name_auto: "Drinking Straws",
    category_auto: "Disposables",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "14/03/2026",
    order_value_inr_auto: 66000,
    co2_reduction_pct: 25.0,
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
    order_id: "ORD-002-UKHI-BAGS",
    sku_id: "SKU-007",
    product_name_auto: "Garbage Bags (Flat)",
    category_auto: "Packaging",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "02/02/2026",
    order_value_inr_auto: 15000,
    co2_reduction_pct: 21.0,
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
    order_id: "ORD-001-BAGS",
    sku_id: "SKU-007",
    product_name_auto: "Garbage Bags (Flat)",
    category_auto: "Packaging",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "01/03/2026",
    order_value_inr_auto: 4400,
    co2_reduction_pct: 24.5,
  },
  {
    order_id: "ORD-003-UKHI-BAGS",
    sku_id: "SKU-007",
    product_name_auto: "Garbage Bags (Flat)",
    category_auto: "Packaging",
    enterprise_name_auto: "UKHI India Private Limited",
    order_date: "14/03/2026",
    order_value_inr_auto: 30000,
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
 * Safely parse date in DD/MM/YYYY, YYYY-MM-DD or standard string into a numeric timestamp
 */
export function parseDateToTime(dateStr: string): number {
  if (!dateStr) return 0;
  const cleanStr = String(dateStr).trim();
  const ddmmyyyyMatch = cleanStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = parseInt(ddmmyyyyMatch[3], 10);
    return new Date(year, month, day).getTime();
  }
  const yyyymmddMatch = cleanStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10);
    const month = parseInt(yyyymmddMatch[2], 10) - 1;
    const day = parseInt(yyyymmddMatch[3], 10);
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

function CustomSpendTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const usd = Math.round(value / 83);
    return (
      <div className="bg-white/95 dark:bg-[#1C1917]/95 border border-[#E8E3DA] dark:border-[#38312B] rounded-xl p-2.5 shadow-lg text-xs backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] font-medium mb-1">
          Order Date: {label}
        </p>
        <p className="font-serif text-sm font-medium text-[#1C1917] dark:text-[#F7F5F0] tabular-nums">
          ${usd.toLocaleString()} <span className="text-[11px] font-sans font-normal text-[#78716C] dark:text-[#A8A29E]">(₹{value.toLocaleString()})</span>
        </p>
      </div>
    );
  }
  return null;
}

function CustomCo2Tooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-white/95 dark:bg-[#1C1917]/95 border border-[#E8E3DA] dark:border-[#38312B] rounded-xl p-2.5 shadow-lg text-xs backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] font-medium mb-1">
          Order Date: {label}
        </p>
        <p className="font-serif text-sm font-medium text-[#3A5A40] dark:text-[#8EAF92] tabular-nums">
          {value}% <span className="text-[11px] font-sans font-normal text-[#78716C] dark:text-[#A8A29E]">CO₂ Reduction</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function CategoryChartV2({
  categorySpend,
  data,
  products,
  orderRegister,
}: CategoryChartProps) {
  const [activeToggle, setActiveToggle] = useState<"spend" | "co2">("spend");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const { state: dateState } = useDateRange();

  const startTime = useMemo(() => {
    return dateState.startDate ? new Date(dateState.startDate + "T00:00:00").getTime() : null;
  }, [dateState.startDate]);

  const endTime = useMemo(() => {
    return dateState.endDate ? new Date(dateState.endDate + "T23:59:59").getTime() : null;
  }, [dateState.endDate]);

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

  // Populate unique products dynamically from current data context
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

  // Derived currently selected product
  const currentSelectedProduct = useMemo(() => {
    if (selectedProduct && productOptions.some((p) => p.value === selectedProduct)) {
      return selectedProduct;
    }
    return productOptions[0]?.value || "";
  }, [selectedProduct, productOptions]);

  // Filter time-series data by product AND active date filter range
  const filteredTimeSeriesData = useMemo(() => {
    if (!currentSelectedProduct) return [];

    const matches = allOrderRegisterData.filter((row) => {
      const name = row.product_name_auto || row.product_name || "";
      const sku = row.sku_id || "";
      const isProductMatch = name === currentSelectedProduct || sku === currentSelectedProduct;
      if (!isProductMatch) return false;

      // Filter by active date range
      if (startTime || endTime) {
        const rowTime = parseDateToTime(row.order_date);
        if (rowTime > 0) {
          if (startTime && rowTime < startTime) return false;
          if (endTime && rowTime > endTime) return false;
        }
      }
      return true;
    });

    // Chronological sort using parsed timestamp
    const sorted = [...matches].sort((a, b) => {
      return parseDateToTime(a.order_date) - parseDateToTime(b.order_date);
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
  }, [allOrderRegisterData, currentSelectedProduct, startTime, endTime, selectedProduct]);

  return (
    <div className="flex flex-col h-full">
      {/* 1. Toggle Controls: Refined recessed pill container */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-[#F3F0EA] dark:bg-[#272C34] border border-[#E6E1D6] dark:border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setActiveToggle("spend")}
          className={`px-3.5 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer ${
            activeToggle === "spend"
              ? "bg-white dark:bg-[#1C1917] text-[#1C1917] dark:text-[#FAF8F5] shadow-xs font-semibold"
              : "text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF8F5] font-medium"
          }`}
        >
          Spend by Category
        </button>
        <button
          type="button"
          onClick={() => setActiveToggle("co2")}
          className={`px-3.5 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer ${
            activeToggle === "co2"
              ? "bg-white dark:bg-[#1C1917] text-[#1C1917] dark:text-[#FAF8F5] shadow-xs font-semibold"
              : "text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF8F5] font-medium"
          }`}
        >
          Product Trends & CO₂ Reduction
        </button>
      </div>

      {/* Spend View: Segmented horizontal bar, category rows with smooth transitions, and mini donut chart */}
      {activeToggle === "spend" && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          {/* Segmented Horizontal Bar with smooth CSS transitions */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#EFECE6] dark:bg-white/10 gap-1 my-2">
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
                  className="h-full transition-all duration-500 ease-out first:rounded-l-full last:rounded-r-full hover:opacity-90"
                  title={`${cat.category_name}: ${pct.toFixed(1)}% (${formatRowAmount(cat.total_spend)})`}
                />
              );
            })}
          </div>

          {/* 2-Column Layout: Left Category Rows, Right Mini Donut Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mt-2 flex-1">
            {/* Left: Category Rows aligned with subtle horizontal hairlines */}
            <div className="md:col-span-7 divide-y divide-[#F0EDE6] dark:divide-white/[0.06]">
              {categories.map((cat) => {
                const pctVal = totalSpend > 0 ? (cat.total_spend / totalSpend) * 100 : 0;
                const pctStr = pctVal % 1 === 0 ? pctVal.toString() : pctVal.toFixed(1);
                const isZero = cat.total_spend === 0;

                return (
                  <div
                    key={cat.category_name}
                    className={`flex items-center justify-between text-[14px] sm:text-[15px] py-2.5 transition-opacity duration-300 ${
                      isZero ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-[130px]">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[#1C1917] dark:text-[#F3EFE7] font-medium text-sm truncate">
                        {cat.category_name}
                      </span>
                    </div>

                    {/* Custom horizontal bar with smooth transitions */}
                    <div className="hidden sm:block flex-1 max-w-[110px] mx-2.5">
                      <div className="h-1.5 w-full bg-[#EFECE6] dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${pctVal}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[#78716C] dark:text-[#9A948A] font-normal text-xs sm:text-sm tabular-nums">
                        {formatRowAmount(cat.total_spend)}
                      </span>
                      <span className="font-semibold text-[#1C1917] dark:text-[#F3EFE7] min-w-[42px] text-right tabular-nums text-xs sm:text-sm">
                        {pctStr}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Mini Donut Chart in softly bordered card with smooth transitions */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#272C34] border border-[#ECE8DF] dark:border-white/[0.08] relative h-full min-h-[170px] shadow-xs">
              <div className="w-full h-32 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        totalSpend > 0
                          ? categories.filter((c) => c.total_spend > 0)
                          : [{ category_name: "Empty", total_spend: 1, color: "#E5E1D8" }]
                      }
                      dataKey="total_spend"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={52}
                      paddingAngle={totalSpend > 0 ? 3 : 0}
                      strokeWidth={1}
                      stroke="rgba(0,0,0,0.06)"
                      isAnimationActive={true}
                      animationDuration={600}
                    >
                      {(totalSpend > 0
                        ? categories.filter((c) => c.total_spend > 0)
                        : [{ color: "#E5E1D8" }]
                      ).map((entry, index) => (
                        <Cell key={`donut-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text inside mini donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F3EFE7] tracking-tight tabular-nums transition-all duration-300">
                    {formatRowAmount(totalSpend)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] font-medium">
                    Total
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] text-[#78716C] dark:text-[#A8A29E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3A5A40] dark:bg-[#9DB4A0]" />
                <span className="font-medium">Spend Distribution</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Product Trends & CO2 Emissions Time-Series View */}
      {activeToggle === "co2" && (
        <div className="space-y-3.5">
          {/* Action 2: Native <select> dropdown populated with unique products */}
          <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
            <label
              htmlFor="product-select"
              className="text-[11px] font-medium text-[#78716C] dark:text-[#A8A29E] flex items-center justify-between"
            >
              <span>Filter by Product / SKU:</span>
              <span className="text-[10px] text-[#9A4A2E] dark:text-[#E07A57] font-semibold tabular-nums">
                {filteredTimeSeriesData.length} recorded {filteredTimeSeriesData.length === 1 ? "order" : "orders"}
              </span>
            </label>
            <select
              id="product-select"
              value={currentSelectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full text-xs font-normal bg-white dark:bg-[#1D2127] border border-[#E8E3DA] dark:border-white/15 rounded-lg px-2.5 py-1.5 text-[#1C1917] dark:text-[#F3EFE7] focus:outline-none focus:ring-1 focus:ring-[#9A4A2E] dark:focus:ring-[#E07A57] cursor-pointer shadow-xs truncate"
            >
              {productOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white dark:bg-[#1D2127] text-[#1C1917] dark:text-[#F3EFE7]"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time-Series Area Charts with subtle gradient fills and custom tooltips */}
          {filteredTimeSeriesData.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-xl bg-[#FAF8F5] dark:bg-[#24201C] border border-[#E8E3DA] dark:border-white/[0.06] flex flex-col items-center justify-center my-2">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1C1917] border border-[#E8E3DA] dark:border-[#38312B] flex items-center justify-center text-[#78716C] dark:text-[#A8A29E] mb-2.5 shadow-xs">
                <CalendarX className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-[#1C1917] dark:text-[#F3EFE7]">
                No recorded orders in this period
              </p>
              <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-1 max-w-xs leading-relaxed">
                No transactions were recorded for this product between the active filter dates. Try selecting &quot;All time&quot; or expanding your date range.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Chart 1 (Spend vs Time): AreaChart with gradient fill and custom tooltip */}
              <div className="bg-[#FAF8F5] dark:bg-[#201C18] border border-[#ECE8DF] dark:border-white/[0.06] rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[11px] font-medium text-[#1C1917] dark:text-[#F3EFE7]">
                    Spend vs Time
                  </span>
                  <span className="text-[10px] text-[#9A4A2E] dark:text-[#E07A57] font-semibold">
                    Order Spend
                  </span>
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={filteredTimeSeriesData}
                      margin={{ top: 15, right: 15, bottom: 20, left: 15 }}
                    >
                      <defs>
                        <linearGradient id="spendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9A4A2E" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#9A4A2E" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6E1D6" vertical={false} />
                      <XAxis
                        dataKey="order_date"
                        tick={{ fontSize: 10, fill: "#78716C" }}
                        tickLine={false}
                        axisLine={{ stroke: "#E6E1D6" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#78716C" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 83).toLocaleString()}` : `$${v}`)}
                        width={46}
                      />
                      <Tooltip content={<CustomSpendTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="order_value_inr_auto"
                        name="Order Spend"
                        stroke="#9A4A2E"
                        strokeWidth={2}
                        fill="url(#spendAreaGrad)"
                        dot={{ r: 3.5, fill: "#9A4A2E" }}
                        activeDot={{ r: 5.5, fill: "#9A4A2E" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2 (CO2 Reduction vs Time): AreaChart with gradient fill and custom tooltip */}
              <div className="bg-[#FAF8F5] dark:bg-[#201C18] border border-[#ECE8DF] dark:border-white/[0.06] rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[11px] font-medium text-[#1C1917] dark:text-[#F3EFE7]">
                    CO₂ Reduction vs Time
                  </span>
                  <span className="text-[10px] text-[#3A5A40] dark:text-[#8EAF92] font-semibold">
                    Reduction %
                  </span>
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={filteredTimeSeriesData}
                      margin={{ top: 15, right: 15, bottom: 20, left: 15 }}
                    >
                      <defs>
                        <linearGradient id="co2AreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3A5A40" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#3A5A40" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6E1D6" vertical={false} />
                      <XAxis
                        dataKey="order_date"
                        tick={{ fontSize: 10, fill: "#78716C" }}
                        tickLine={false}
                        axisLine={{ stroke: "#E6E1D6" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tick={{ fontSize: 10, fill: "#78716C" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                        width={38}
                      />
                      <Tooltip content={<CustomCo2Tooltip />} />
                      <Area
                        type="monotone"
                        dataKey="co2_reduction_pct"
                        name="CO2 Reduction (%)"
                        stroke="#3A5A40"
                        strokeWidth={2}
                        fill="url(#co2AreaGrad)"
                        dot={{ r: 3.5, fill: "#3A5A40" }}
                        activeDot={{ r: 5.5, fill: "#3A5A40" }}
                      />
                    </AreaChart>
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
