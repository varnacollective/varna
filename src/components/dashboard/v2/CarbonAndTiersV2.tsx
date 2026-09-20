"use client";

import { motion } from "framer-motion";

interface CarbonAndTiersV2Props {
  totalCO2eAvoidedKg: number;
  totalSuppliers: number;
  tierDistribution: { tier: string; count: number; color: string }[];
}

// Fixed constant per EPA estimate: 1 tree absorbs ~22 kg CO2e per year
const KG_PER_TREE = 22;

const TIER_CONFIG = [
  { key: "Micro A", label: "Micro A", color: "#738678" },
  { key: "Micro B", label: "Micro B", color: "#7A3F1E" },
  { key: "Small", label: "Small", color: "#6F848F" },
  { key: "Medium", label: "Medium", color: "#2F3C52" },
];

export default function CarbonAndTiersV2({
  totalCO2eAvoidedKg,
  totalSuppliers,
  tierDistribution,
}: CarbonAndTiersV2Props) {
  // Tree calculation
  const treesEquivalent = Math.round(totalCO2eAvoidedKg / KG_PER_TREE);

  // Target CO2e threshold (e.g. 2,640 kg CO2e = 120 trees)
  const targetTrees = Math.max(treesEquivalent + 22, 120);
  const targetCO2e = targetTrees * KG_PER_TREE;
  const progressPercent = Math.min(100, Math.round((totalCO2eAvoidedKg / targetCO2e) * 100));

  // Tally marks: 1 mark per tree in targetTrees
  const tallyMarks = Array.from({ length: targetTrees }).map((_, idx) => ({
    id: idx,
    isFilled: idx < treesEquivalent,
  }));

  // Process supplier tier counts mapping
  const tierCounts: Record<string, number> = {
    "Micro A": 0,
    "Micro B": 0,
    Small: 0,
    Medium: 0,
  };

  tierDistribution.forEach((t) => {
    const name = t.tier;
    if (name.includes("Platinum") || name.includes("Micro A")) tierCounts["Micro A"] += t.count;
    else if (name.includes("Gold") || name.includes("Micro B")) tierCounts["Micro B"] += t.count;
    else if (name.includes("Silver") || name.includes("Small")) tierCounts["Small"] += t.count;
    else if (name.includes("Bronze") || name.includes("Medium")) tierCounts["Medium"] += t.count;
  });

  const totalTierCount = Object.values(tierCounts).reduce((a, b) => a + b, 0) || totalSuppliers || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 8 Cols: Carbon Impact Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-8
          bg-white dark:bg-[#1E2028]
          rounded-2xl border border-[#EAE5DC] dark:border-[#9BA9B4]/16
          shadow-sm flex flex-col justify-between p-6 sm:p-7 min-h-[380px]
        "
      >
        {/* Card Header */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6F848F] dark:text-[#8C9DA8]">
            Carbon Impact
          </h3>
          <p className="text-xs text-[#6F848F]/80 dark:text-[#9BA9B4]/80 font-light mt-0.5">
            CO₂e emissions avoided through circular procurement
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 items-center">
          {/* Left Column: Big Metrics */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <span className="text-[10px] text-[#6F848F] dark:text-[#8C9DA8] uppercase tracking-wider block font-semibold">
                CO₂e emissions avoided
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-light text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight">
                  {totalCO2eAvoidedKg.toLocaleString("en-US")}
                </span>
                <span className="text-sm font-light uppercase text-[#6F848F] dark:text-[#8C9DA8]">
                  KG
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#6F848F] dark:text-[#8C9DA8] uppercase tracking-wider block font-semibold">
                Tree equivalent
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-light text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight">
                  {treesEquivalent}
                </span>
                <span className="text-xs font-light text-[#6F848F] dark:text-[#8C9DA8]">
                  mature trees
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Progress & Tally Mark Array */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#6F848F] dark:text-[#8C9DA8] tracking-wider block">
                  Progress to annual target
                </span>
                <span className="text-xs text-[#6F848F] dark:text-[#9BA9B4] font-light">
                  {totalCO2eAvoidedKg.toLocaleString("en-US")} of {targetCO2e.toLocaleString("en-US")} kg CO₂e
                </span>
              </div>

              <span className="text-2xl sm:text-3xl font-light text-[#1A1F26] dark:text-[#FAF8F5]">
                {progressPercent}%
              </span>
            </div>

            {/* Tally Mark Array (1 mark per tree in target) */}
            <div className="flex flex-wrap gap-1 my-3 p-3 bg-[#FAF8F4] dark:bg-[#22242C] rounded-xl border border-[#EAE5DC]/80 dark:border-[#9BA9B4]/15">
              {tallyMarks.map((mark) => (
                <div
                  key={mark.id}
                  className={`
                    w-1.5 h-6 rounded-full transition-colors duration-300
                    ${mark.isFilled ? "bg-[#738678] dark:bg-[#8AA391]" : "bg-[#EAE5DC] dark:bg-[#343844]"}
                  `}
                  title={mark.isFilled ? `Tree #${mark.id + 1}: Absorbed` : `Target Tree #${mark.id + 1}`}
                />
              ))}
            </div>

            <p className="text-[10px] text-[#6F848F] dark:text-[#8C9DA8] font-light">
              Each mark is the CO₂e one mature tree absorbs in a year (about {KG_PER_TREE} kg)
            </p>
          </div>
        </div>
      </motion.div>

      {/* 4 Cols: Supplier Tier Distribution Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-4
          bg-white dark:bg-[#1E2028]
          rounded-2xl border border-[#EAE5DC] dark:border-[#9BA9B4]/16
          shadow-sm flex flex-col justify-between p-6 sm:p-7 min-h-[380px]
        "
      >
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6F848F] dark:text-[#8C9DA8]">
            Supplier Tier Distribution
          </h3>
          <p className="text-xs text-[#6F848F]/80 dark:text-[#9BA9B4]/80 font-light mt-0.5">
            Suppliers by enterprise size
          </p>

          <div className="flex items-baseline gap-2 my-3">
            <span className="text-3xl sm:text-4xl font-light text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight">
              {totalSuppliers}
            </span>
            <span className="text-[10px] font-semibold text-[#6F848F] dark:text-[#9BA9B4] uppercase tracking-wider">
              TOTAL SUPPLIERS
            </span>
          </div>

          {/* Full-width Segmented Horizontal Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#EAE5DC] dark:bg-[#252830] my-4 shadow-inner">
            {TIER_CONFIG.map((tier) => {
              const count = tierCounts[tier.key] || 0;
              const pct = (count / totalTierCount) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={tier.key}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: tier.color,
                  }}
                  className="h-full transition-all duration-500"
                  title={`${tier.label}: ${count} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>

          {/* Tier Row List (including 0s) */}
          <div className="space-y-3 mt-4">
            {TIER_CONFIG.map((tier) => {
              const count = tierCounts[tier.key] || 0;
              return (
                <div
                  key={tier.key}
                  className="flex items-center justify-between text-xs py-1 border-b border-[#EAE5DC]/60 dark:border-[#9BA9B4]/10 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: tier.color }}
                    />
                    <span className="text-[#1A1F26] dark:text-[#FAF8F5] font-light">
                      {tier.label}
                    </span>
                  </div>

                  <span className="font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
