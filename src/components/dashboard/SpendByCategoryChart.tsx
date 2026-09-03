"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CategorySpend } from "@/lib/mock-data";
import { PieChart as PieIcon } from "lucide-react";

interface SpendByCategoryChartProps {
  data: CategorySpend[];
  delay?: number;
}

// Strict Brand Palette for Chart Segments (Max 2–3 primary accents: Deep Clay, Sage Mineral, Slate Mist, Midnight Blue)
const BRAND_CHART_COLORS = [
  "#7A3F1E", // deep-clay
  "#738678", // sage-mineral
  "#6F848F", // slate-mist
  "#2F3C52", // midnight-blue
  "#B5AB94", // warm stone dark shade for clean segment distinction
];

function formatCurrency(val: number): string {
  if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `₹${Math.round(val / 1000)}K`;
  return `₹${val}`;
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: {
    categoryName: string;
    totalSpend: number;
    totalOrders: number;
    fill: string;
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#E4DEC9] dark:bg-[#272A30] border border-[#6F848F]/40 p-3 shadow-lg rounded-none text-[#222326] dark:text-[#D8CFB8] font-sans text-xs">
      <p className="font-semibold mb-1 text-[#222326] dark:text-[#D8CFB8] uppercase tracking-wider text-[9px]">
        {d.categoryName}
      </p>
      <p className="mt-1 text-[11px]">
        Spend:{" "}
        <span className="font-semibold text-[#7A3F1E] dark:text-[#D8CFB8]">
          {formatCurrency(d.totalSpend)}
        </span>
      </p>
      <p className="mt-0.5 text-[11px] text-[#6F848F]">
        Orders: <span className="font-medium text-[#222326] dark:text-[#D8CFB8]">{d.totalOrders}</span>
      </p>
    </div>
  );
}

export default function SpendByCategoryChart({
  data,
  delay = 0,
}: SpendByCategoryChartProps) {
  const totalSpend = data.reduce((sum, d) => sum + d.totalSpend, 0);

  // Empty state handling
  if (!data || data.length === 0 || totalSpend === 0) {
    return (
      <Card delay={delay} hoverEffect={false} className="p-8">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#D8CFB8]/60 mb-2 border-b border-[#6F848F]/20 dark:border-[#2F3C52] pb-3">
          Spend by Product Category
        </h3>
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#6F848F]/30 bg-[#DFD8C2]/20 dark:bg-[#222326]/40">
          <PieIcon className="w-8 h-8 text-[#6F848F]/60 mb-2" strokeWidth={1.5} />
          <p className="text-xs uppercase tracking-wider font-semibold text-[#6F848F]">
            Awaiting Procurement Category Data
          </p>
          <p className="text-[11px] text-[#6F848F]/80 font-light mt-1 max-w-xs">
            Category spend breakdowns will automatically populate upon catalog sync.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card delay={delay} hoverEffect={false} className="p-8">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#D8CFB8]/60 mb-2 border-b border-[#6F848F]/20 dark:border-[#2F3C52] pb-3">
        Spend by Product Category
      </h3>
      <p className="text-3xl font-serif font-light text-[#7A3F1E] dark:text-[#D8CFB8] tracking-tighter mb-6 mt-2">
        {formatCurrency(totalSpend)}{" "}
        <span className="text-[10px] font-sans font-light uppercase tracking-wider text-[#6F848F] dark:text-[#D8CFB8]/60 ml-1">
          total spend
        </span>
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Donut chart */}
        <motion.div
          className="w-48 h-48 flex-shrink-0 relative"
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="totalSpend"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                cornerRadius={0}
                strokeWidth={1}
                stroke="var(--card)"
              >
                {data.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={BRAND_CHART_COLORS[idx % BRAND_CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Legend in Avenir caption style */}
        <div className="flex-1 space-y-2.5 w-full max-h-48 overflow-y-auto pr-2">
          {data.map((cat, idx) => {
            const pct = Math.round((cat.totalSpend / totalSpend) * 100);
            return (
              <motion.div
                key={cat.categoryName}
                className="flex items-center gap-3 group cursor-default"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 + idx * 0.05 }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-none flex-shrink-0"
                  style={{
                    backgroundColor: BRAND_CHART_COLORS[idx % BRAND_CHART_COLORS.length],
                  }}
                />
                <span className="text-[11px] text-[#6F848F] dark:text-[#D8CFB8]/80 flex-1 truncate font-light tracking-wide">
                  {cat.categoryName}
                </span>
                <span className="text-[11px] font-sans font-medium text-[#222326] dark:text-[#D8CFB8]/90 tabular-nums tracking-wide">
                  {pct}%
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
