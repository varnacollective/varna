"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface SpendCategoryItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const CATEGORY_DATA: SpendCategoryItem[] = [
  { name: "Organic Toiletries", value: 16800, percentage: 42, color: "#7D3F1E" }, // deep-clay
  { name: "Artisan Ceramics", value: 9600, percentage: 24, color: "#55705A" },   // sage-mineral
  { name: "Handmade Soap", value: 8000, percentage: 20, color: "#6F8391" },      // slate-mist
  { name: "Eco-Packaging", value: 5600, percentage: 14, color: "#2B3A55" },      // midnight-blue
];

function formatSpend(val: number): string {
  return `$${(val / 1000).toFixed(1)}K`;
}

export default function SpendByCategoryV2() {
  const totalSpendVal = CATEGORY_DATA.reduce((acc, cat) => acc + cat.value, 0);

  // D5 Derived Insight: Identify top category
  const topCategory = CATEGORY_DATA[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="
        w-full mb-8
        bg-white dark:bg-[#20242B]
        rounded-[24px] border border-black/[0.07] dark:border-white/[0.08]
        shadow-sm p-6 lg:p-8 flex flex-col justify-between
      "
    >
      {/* Header */}
      <div className="border-b border-black/[0.07] dark:border-white/[0.08] pb-4 mb-6">
        <h2 className="text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-[-0.01em]">
          Spend by Product Category
        </h2>
        <p className="text-sm text-[#6F6A61] dark:text-[#9A948A] font-normal mt-0.5">
          Capital distribution across verified ethical categories sourced from current suppliers.
        </p>
      </div>

      {/* Two-Column Layout (Donut + 2x2 Legend Grid) */}
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 my-auto">
        {/* Left: Donut Chart */}
        <div className="varna-donut-container relative w-64 h-64 sm:w-72 sm:h-72 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="supplier-v2-pie-glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1F1B16" floodOpacity="0.12" />
                </filter>
              </defs>
              <Pie
                data={CATEGORY_DATA}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={115}
                paddingAngle={3}
                cornerRadius={3}
                strokeWidth={0}
                filter="url(#supplier-v2-pie-glow)"
              >
                {CATEGORY_DATA.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Hole Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl lg:text-[36px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums">
              $40.0K
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#6F6A61] dark:text-[#9A948A] mt-1">
              TOTAL SPEND
            </span>
          </div>
        </div>

        {/* Right: 2x2 Legend Grid of Category Tiles */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {CATEGORY_DATA.map((cat) => (
            <div
              key={cat.name}
              className="
                flex items-center gap-3.5 p-4 rounded-2xl
                bg-[#F7F3EA] dark:bg-[#272C34]
                border border-black/[0.05] dark:border-white/[0.08]
                hover:border-[#7D3F1E]/30 transition-colors
              "
            >
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs"
                style={{ backgroundColor: cat.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1F1B16] dark:text-[#F3EFE7] font-medium truncate">
                  {cat.name}
                </p>
                <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] font-normal mt-0.5 tabular-nums">
                  {formatSpend(cat.value)} • {cat.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* D5 Pinned Footer Tile */}
      <div className="mt-6 pt-3 border-t border-black/[0.07] dark:border-white/[0.08] text-xs text-[#5B564E] dark:text-[#C2BCB0] flex items-center justify-between">
        <span className="font-medium text-[#7D3F1E] dark:text-[#E07A57]">
          Top category: {topCategory.name} ({formatSpend(topCategory.value)} • {topCategory.percentage}% of spend)
        </span>
        <span className="text-[#6F6A61] dark:text-[#9A948A]">
          4 ethical product categories
        </span>
      </div>
    </motion.div>
  );
}
