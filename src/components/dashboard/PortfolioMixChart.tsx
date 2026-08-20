"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TierData {
  tier: string;
  count: number;
  color: string;
}

interface PortfolioMixChartProps {
  data: TierData[];
  delay?: number;
}

// Brand specific color mappings for Supplier Tiers
const TIER_COLORS: Record<string, string> = {
  Platinum: "#7A3F1E", // deep-clay
  Gold: "#738678",     // sage-mineral
  Silver: "#6F848F",   // slate-mist
  Bronze: "#B5AB94",   // dark warm-stone for separation
};

interface TooltipPayload {
  name: string;
  value: number;
  payload: TierData;
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
    <div className="bg-[#E4DEC9] dark:bg-[#222326] border border-slate-mist/50 dark:border-midnight-blue p-3 shadow-md rounded-none text-carbon-ink dark:text-warm-stone font-sans text-xs">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-2.5 h-2.5 rounded-none"
          style={{ backgroundColor: TIER_COLORS[d.tier] || d.color }}
        />
        <p className="font-semibold text-carbon-ink dark:text-warm-stone uppercase tracking-wider text-[9px]">{d.tier} Tier</p>
      </div>
      <p>
        Suppliers:{" "}
        <span className="font-semibold text-deep-clay dark:text-warm-stone">{d.count}</span>
      </p>
    </div>
  );
}

export default function PortfolioMixChart({
  data,
  delay = 0,
}: PortfolioMixChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Normalize data with colors
  const chartData = data.map((d) => ({
    ...d,
    color: TIER_COLORS[d.tier] || d.color,
  }));

  return (
    <Card delay={delay} hoverEffect={false} className="p-8">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/50 mb-2 border-b border-slate-mist/20 dark:border-midnight-blue pb-3">
        Supplier Tier Distribution
      </h3>
      <p className="text-3xl font-serif font-light text-deep-clay dark:text-warm-stone tracking-tighter mb-6 mt-2">
        {total}{" "}
        <span className="text-[10px] font-sans font-light uppercase tracking-wider text-slate-mist dark:text-warm-stone/50 ml-1">total suppliers</span>
      </p>

      <motion.div
        className="h-48"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: delay + 0.2 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barCategoryGap="30%"
            margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
          >
            <XAxis
              dataKey="tier"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count" radius={[0, 0, 0, 0]} maxBarSize={40}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.tier}
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tier badges */}
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-mist/20 dark:border-midnight-blue">
        {chartData.map((d) => (
          <div key={d.tier} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-none flex-shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-[11px] font-light text-slate-mist dark:text-warm-stone/80 uppercase tracking-wider">
              {d.tier}: <span className="font-semibold text-carbon-ink dark:text-warm-stone">{d.count}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
