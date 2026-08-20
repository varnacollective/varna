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

interface SpendByCategoryChartProps {
  data: CategorySpend[];
  delay?: number;
}

// Strict Brand Palette for Chart Segments
const CHART_COLORS = [
  "#7A3F1E", // deep-clay
  "#738678", // sage-mineral
  "#6F848F", // slate-mist
  "#2F3C52", // midnight-blue
  "#D8CFB8", // warm-stone
  "#A38A7D", // warm muted clay
  "#A2B0A6", // soft mineral green
  "#4A5D6B", // dark slate-mist
];

function formatCurrency(val: number): string {
  if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
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
    <div className="bg-[#E4DEC9] dark:bg-[#222326] border border-slate-mist/50 dark:border-midnight-blue p-3.5 shadow-md rounded-none text-carbon-ink dark:text-warm-stone font-sans text-xs">
      <p className="font-semibold mb-1 text-carbon-ink dark:text-warm-stone uppercase tracking-wider text-[9px]">
        {d.categoryName}
      </p>
      <p className="mt-1">
        Spend:{" "}
        <span className="font-semibold text-deep-clay dark:text-warm-stone">
          {formatCurrency(d.totalSpend)}
        </span>
      </p>
      <p className="mt-0.5">
        Orders:{" "}
        <span className="font-medium">{d.totalOrders}</span>
      </p>
    </div>
  );
}

export default function SpendByCategoryChart({
  data,
  delay = 0,
}: SpendByCategoryChartProps) {
  const totalSpend = data.reduce((sum, d) => sum + d.totalSpend, 0);

  return (
    <Card delay={delay} hoverEffect={false} className="p-8">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/50 mb-2 border-b border-slate-mist/20 dark:border-midnight-blue pb-3">
        Spend by Product Category
      </h3>
      <p className="text-3xl font-serif font-light text-deep-clay dark:text-warm-stone tracking-tighter mb-6 mt-2">
        {formatCurrency(totalSpend)}{" "}
        <span className="text-[10px] font-sans font-light uppercase tracking-wider text-slate-mist dark:text-warm-stone/50 ml-1">total spend</span>
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Donut chart */}
        <motion.div
          className="w-48 h-48 flex-shrink-0"
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
                cornerRadius={0} // Sharp geometric slices instead of rounded pills
                strokeWidth={1}
                stroke="#E4DEC9" // Match card background to appear separated geometrically
              >
                {data.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={CHART_COLORS[idx % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5 w-full max-h-48 overflow-y-auto pr-2">
          {data.map((cat, idx) => {
            const pct = ((cat.totalSpend / totalSpend) * 100).toFixed(1);
            return (
              <motion.div
                key={cat.categoryName}
                className="flex items-center gap-3 group cursor-default"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 + idx * 0.05 }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-none flex-shrink-0" // Sharp square
                  style={{
                    backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                  }}
                />
                <span className="text-[11px] text-slate-mist dark:text-warm-stone/80 flex-1 truncate font-light tracking-wide">
                  {cat.categoryName}
                </span>
                <span className="text-[11px] font-sans font-medium text-carbon-ink dark:text-warm-stone/80 tabular-nums tracking-wide">
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
