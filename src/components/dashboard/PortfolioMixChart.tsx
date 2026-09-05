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
  CartesianGrid,
  LabelList,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface TierData {
  tier: string;
  count: number;
  color: string;
}

interface PortfolioMixChartProps {
  data: TierData[];
  delay?: number;
}

// Varna MSME Tier mapping: old tier names → new MSME tier names
const TIER_RENAME: Record<string, string> = {
  Platinum: "Micro A",
  Gold: "Micro B",
  Silver: "Small",
  Bronze: "Medium",
};

// Strict Brand specific color mappings for MSME Tiers (Sage Mineral, Deep Clay, Slate Mist, Midnight Blue)
const TIER_COLORS: Record<string, string> = {
  "Micro A": "#738678",  // sage-mineral (top tier)
  "Micro B": "#7A3F1E",  // deep-clay
  Small: "#6F848F",      // slate-mist
  Medium: "#2F3C52",     // midnight-blue
};

// Tier → Supplier brand names (assessment data)
const TIER_BRANDS: Record<string, string[]> = {
  "Micro A": ["Kheoni Ventures Pvt Ltd"],
  "Micro B": ["Bare Necessities"],
  Small: ["UKHI India Private Limited"],
  Medium: [],
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
  const brands = TIER_BRANDS[d.tier] || [];

  return (
    <div className="bg-[#E4DEC9] dark:bg-[#22252B] border border-[#6F848F]/30 dark:border-[#8C9DA8]/25 p-4 shadow-elevation-high dark:shadow-elevation-dark-high rounded-lg font-sans text-xs min-w-[200px] z-50">
      {/* Tier Header */}
      <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-[#6F848F]/20 dark:border-[#8C9DA8]/15">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs"
          style={{ backgroundColor: TIER_COLORS[d.tier] || d.color }}
        />
        <p className="font-semibold text-[#222326] dark:text-[#FAF6EE] uppercase tracking-wider text-[10px]">
          {d.tier} Tier
        </p>
        <span className="ml-auto text-[#6F848F] dark:text-[#8C9DA8] tabular-nums font-light text-[11px]">
          {d.count} supplier{d.count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Brand list */}
      {brands.length > 0 ? (
        <div className="space-y-1.5">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7A3F1E] dark:bg-[#FAF6EE]/70 flex-shrink-0" />
              <span className="text-[#222326] dark:text-[#FAF6EE]/90 font-light tracking-wide text-[10px]">
                {brand}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#6F848F] dark:text-[#8C9DA8] italic font-light text-[10px]">
          No suppliers in this tier
        </p>
      )}
    </div>
  );
}

export default function PortfolioMixChart({
  data,
  delay = 0,
}: PortfolioMixChartProps) {
  const baseTiers = [
    { tier: "Micro A", count: 0 },
    { tier: "Micro B", count: 0 },
    { tier: "Small", count: 0 },
    { tier: "Medium", count: 0 },
  ];

  const remappedInput = (data || []).map((d) => ({
    ...d,
    tier: TIER_RENAME[d.tier] || d.tier,
  }));

  const remappedData = baseTiers.map((base) => {
    const found = remappedInput.find((d) => d.tier === base.tier);
    return found ? { ...base, count: found.count } : base;
  });

  const total = remappedData.reduce((sum, d) => sum + d.count, 0);

  const chartData = remappedData.map((d) => ({
    ...d,
    color: TIER_COLORS[d.tier] || "#6F848F",
  }));

  if (total === 0) {
    return (
      <Card delay={delay} variant="chart" hoverEffect={false} className="p-8">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#8C9DA8] mb-2 border-b border-[#6F848F]/20 dark:border-[#8C9DA8]/20 pb-3">
          Supplier Tier Distribution
        </h3>
        <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#6F848F]/30 bg-[#DFD8C2]/20 dark:bg-[#222326]/40">
          <BarChart3 className="w-8 h-8 text-[#6F848F]/60 mb-2" strokeWidth={1.5} />
          <p className="text-xs uppercase tracking-wider font-semibold text-[#6F848F]">
            No Suppliers Audited Yet
          </p>
          <p className="text-[11px] text-[#6F848F]/80 font-light mt-1 max-w-xs">
            Tier classifications will show when suppliers complete initial onboarding.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card delay={delay} variant="chart" hoverEffect={false} className="p-8">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#8C9DA8] mb-2 border-b border-[#6F848F]/20 dark:border-[#8C9DA8]/20 pb-3">
        Supplier Tier Distribution
      </h3>
      <p className="text-3xl sm:text-4xl font-serif font-light text-[#7A3F1E] dark:text-[#FAF6EE] tracking-hero mb-6 mt-2">
        {total}{" "}
        <span className="text-[10px] font-sans font-light uppercase tracking-wider text-[#6F848F] dark:text-[#8C9DA8] ml-1.5">
          total suppliers
        </span>
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
            barCategoryGap="32%"
            margin={{ top: 18, right: 10, bottom: 0, left: -20 }}
          >
            {/* Barely-there subtle gridlines */}
            <CartesianGrid
              vertical={false}
              stroke="#6F848F"
              strokeOpacity={0.12}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="tier"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6F848F", fontSize: 10, letterSpacing: "0.08em" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6F848F", fontSize: 10 }}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(111, 132, 143, 0.08)" }}
              wrapperStyle={{ zIndex: 50 }}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              isAnimationActive={true}
              animationBegin={200}
              animationDuration={900}
              className="transition-all duration-200 hover:opacity-90"
            >
              <LabelList
                dataKey="count"
                position="top"
                fill="#6F848F"
                fontSize={11}
                offset={6}
                formatter={(val: any) => (Number(val) > 0 ? Number(val) : "")}
              />
              {chartData.map((entry) => (
                <Cell key={entry.tier} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tier badges with circular colored dots */}
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-[#6F848F]/20 dark:border-[#2F3C52]">
        {chartData.map((d) => (
          <div key={d.tier} className="flex items-center gap-2 p-1 rounded hover:bg-[#6F848F]/10 dark:hover:bg-[#D8CFB8]/5 transition-colors">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-[11px] font-light text-[#6F848F] dark:text-[#D8CFB8]/80 uppercase tracking-wider">
              {d.tier}: <span className="font-semibold text-[#222326] dark:text-[#D8CFB8]">{d.count}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

