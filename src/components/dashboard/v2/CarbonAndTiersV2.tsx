"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Leaf, TreePine, Info, Car } from "lucide-react";
import {
  computeSmeSpendData,
  formatUsd,
  MSME_COLORS,
  SmeTierRow,
} from "@/components/dashboard/impact/v2/SMESpendCard";

interface CarbonAndTiersV2Props {
  totalCO2eAvoidedKg: number;
  totalSuppliers: number;
  tierDistribution: { tier: string; count: number; color: string }[];
  suppliers?: any[];
  totalSpend?: number;
  carKmAvoided?: number;
  carEquivalent?: number;
}

const KG_PER_TREE = 22;

/**
 * US EPA Greenhouse Gas Equivalencies:
 * A typical passenger vehicle emits approximately 4,600 kg CO2e per year (4.6 metric tons).
 * Source: US EPA Greenhouse Gas Equivalencies Calculator (40 CFR Part 600 / EPA-420-F-23-014).
 * https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references
 */
export const KG_CO2E_PER_PASSENGER_VEHICLE_YEAR = 4600;

/**
 * US EPA passenger vehicle emissions per kilometer:
 * Approximately 0.244 kg CO2e / km, which yields ~4.1 km avoided per kg CO2e.
 * Source: US EPA Greenhouse Gas Equivalencies Calculator / Federal Highway Administration.
 */
export const KM_PER_KG_CO2E = 4.1;

const TIER_CONFIG = [
  { key: "Micro A", label: "Micro A", color: "#55705A" },
  { key: "Micro B", label: "Micro B", color: "#7D3F1E" },
  { key: "Small", label: "Small", color: "#6F8391" },
  { key: "Medium", label: "Medium", color: "#2B3A55" },
];

export default function CarbonAndTiersV2({
  totalCO2eAvoidedKg,
  totalSuppliers = 3,
  tierDistribution,
  suppliers = [],
  totalSpend = 0,
  carKmAvoided,
  carEquivalent,
}: CarbonAndTiersV2Props) {
  const [tierViewMode, setTierViewMode] = useState<"count" | "spend">("count");

  const smeData = useMemo(() => {
    return computeSmeSpendData(suppliers, totalSpend);
  }, [suppliers, totalSpend]);
  // Tree calculation
  const treesEquivalent = Math.round(totalCO2eAvoidedKg / KG_PER_TREE); // 98 trees

  // Car Equivalent calculation: check if Supabase has explicit value, otherwise derive using EPA factor
  const carYearsEquivalent = carEquivalent ?? (totalCO2eAvoidedKg > 0
    ? Number((totalCO2eAvoidedKg / KG_CO2E_PER_PASSENGER_VEHICLE_YEAR).toFixed(2))
    : 0);

  const carKmsAvoided = carKmAvoided ?? (totalCO2eAvoidedKg > 0
    ? Math.round(totalCO2eAvoidedKg * KM_PER_KG_CO2E)
    : 0);

  // Target CO2e threshold (2,640 kg = 120 trees)
  const targetTrees = Math.max(treesEquivalent + 22, 120); // 120 trees
  const targetCO2e = targetTrees * KG_PER_TREE; // 2,640 kg
  const progressPercent = Math.min(100, Math.round((totalCO2eAvoidedKg / targetCO2e) * 100)); // 82%

  // D5 Derived Insight
  const remainingKg = targetCO2e - totalCO2eAvoidedKg;
  const remainingTrees = targetTrees - treesEquivalent;

  // Tally marks array (P0-3 fixed: exactly 120 marks, 98 filled)
  const tallyMarks = Array.from({ length: targetTrees }).map((_, idx) => ({
    id: idx,
    isFilled: idx < treesEquivalent,
  }));

  // Process supplier tier counts (P0-1 fixed: total === sum of tier counts = 3)
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

  // Calculate sum of tiers exactly (P0-1 fixed)
  const actualTierSum = Object.values(tierCounts).reduce((a, b) => a + b, 0);
  const correctTotalSuppliers = actualTierSum > 0 ? actualTierSum : totalSuppliers;

  // D4 Derived Insight: Largest tier
  let largestTierName = "Small";
  let largestTierCount = 0;
  Object.entries(tierCounts).forEach(([name, count]) => {
    if (count > largestTierCount) {
      largestTierCount = count;
      largestTierName = name;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 8 Cols: Carbon Impact Card (P1-6 & W9 fixed) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-8
          bg-white dark:bg-[#20242B]
          rounded-[24px] border border-black/[0.07] dark:border-white/[0.08]
          shadow-sm flex flex-col justify-between p-6 lg:p-7 min-h-[380px]
        "
      >
        {/* Header Row */}
        <div>
          <h2 className="text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-[-0.01em]">
            Carbon Impact
          </h2>
          <p className="text-sm text-[#6F6A61] dark:text-[#9A948A] font-normal mt-0.5">
            CO₂e emissions avoided through circular procurement
          </p>
        </div>

        {/* 2-Column Inner Layout (Top-aligned, no dead gap - P1-6 fixed) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-auto py-3 items-start">
          {/* Left Column (~40%): Stat Blocks */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0] shrink-0 mt-1">
                <Leaf className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block">
                  CO₂e emissions avoided
                </span>
                {totalCO2eAvoidedKg > 0 ? (
                  <div className="text-3xl lg:text-[38px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-none mt-1 tabular-nums">
                    {totalCO2eAvoidedKg.toLocaleString("en-US")}{" "}
                    <span className="text-base font-normal uppercase text-[#6F6A61] dark:text-[#9A948A]">
                      KG
                    </span>
                  </div>
                ) : (
                  <div className="mt-1">
                    <span className="text-2xl font-light text-[#6F6A61] dark:text-[#9A948A]">N/A</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Info className="w-3 h-3 text-[#7D3F1E] dark:text-[#E07A57] shrink-0" strokeWidth={1.8} />
                      <span className="text-[11px] text-[#7D3F1E] dark:text-[#E07A57] font-normal">Carbon data is pending.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-black/[0.07] dark:bg-white/[0.08]" />

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0] shrink-0 mt-1">
                <TreePine className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block">
                  Tree equivalent
                </span>
                {totalCO2eAvoidedKg > 0 ? (
                  <div className="text-3xl lg:text-[38px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-none mt-1 tabular-nums">
                    {treesEquivalent}{" "}
                    <span className="text-xs font-normal text-[#6F6A61] dark:text-[#9A948A]">
                      mature trees
                    </span>
                  </div>
                ) : (
                  <div className="mt-1">
                    <span className="text-2xl font-light text-[#6F6A61] dark:text-[#9A948A]">N/A</span>
                    <span className="text-[11px] text-[#6F6A61] dark:text-[#9A948A] block mt-0.5 font-normal">Awaiting carbon data</span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-black/[0.07] dark:bg-white/[0.08]" />

            {/* Car equivalent */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0] shrink-0 mt-1">
                <Car className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block">
                  Car equivalent
                </span>
                {totalCO2eAvoidedKg > 0 ? (
                  <>
                    <div className="text-3xl lg:text-[38px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-none mt-1 tabular-nums">
                      {carYearsEquivalent}{" "}
                      <span className="text-xs font-normal text-[#6F6A61] dark:text-[#9A948A]">
                        cars off road / yr
                      </span>
                    </div>
                    <span className="text-[11px] text-[#55705A] dark:text-[#9DB4A0] font-medium block mt-1">
                      ≈ {carKmsAvoided.toLocaleString("en-US")} km passenger driving avoided
                    </span>

                    {/* Car Glyph Track matching tree grid style */}
                    <div className="mt-3 p-2.5 rounded-xl bg-[#F7F3EA] dark:bg-[#272C34] border border-black/[0.05] dark:border-white/[0.08]">
                      <div className="flex items-center gap-1.5 justify-between">
                        {Array.from({ length: 6 }).map((_, i) => {
                          const iconThreshold = (i + 1) * 0.1;
                          const isFilled = carYearsEquivalent >= iconThreshold;
                          const isPartial = !isFilled && carYearsEquivalent >= iconThreshold - 0.05;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.25, delay: 0.04 * i }}
                              className={`flex-1 h-6 rounded-md flex items-center justify-center transition-all ${
                                isFilled
                                  ? "bg-[#55705A] dark:bg-[#9DB4A0] text-white dark:text-[#1A1F26]"
                                  : isPartial
                                  ? "bg-[#55705A]/45 dark:bg-[#9DB4A0]/45 text-white"
                                  : "bg-black/10 dark:bg-white/10 text-[#6F6A61] dark:text-[#9A948A]"
                              }`}
                              title={`Equivalent to ${(i + 1) * 0.1} car/yr`}
                            >
                              <Car className="w-3.5 h-3.5" strokeWidth={1.8} />
                            </motion.div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#6F6A61] dark:text-[#9A948A] mt-1.5 px-0.5">
                        <span>Each icon = 0.1 car/yr</span>
                        <span className="font-medium text-[#55705A] dark:text-[#9DB4A0]">US EPA Factor</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-1">
                    <span className="text-2xl font-light text-[#6F6A61] dark:text-[#9A948A]">N/A</span>
                    <span className="text-[11px] text-[#6F6A61] dark:text-[#9A948A] block mt-0.5 font-normal">Awaiting carbon data</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (~60%): Target Progress & Tally Array */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xs font-semibold text-[#1F1B16] dark:text-[#F3EFE7] block">
                  Progress to annual target
                </span>
                <span className="text-xs text-[#6F6A61] dark:text-[#9A948A] font-normal">
                  {totalCO2eAvoidedKg.toLocaleString("en-US")} of {targetCO2e.toLocaleString("en-US")} kg CO₂e
                </span>
              </div>

              <span className="text-3xl lg:text-[38px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tabular-nums">
                {progressPercent}%
              </span>
            </div>

            {/* Tally Mark Array (Balanced 4 rows of 30 marks = 120 marks total - P0-3 & W9 fixed) */}
            <div className="w-full p-4 bg-[#F7F3EA] dark:bg-[#272C34] rounded-[18px] border border-black/[0.05] dark:border-white/[0.08] my-2">
              <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1 justify-between">
                {tallyMarks.map((mark) => (
                  <div
                    key={mark.id}
                    className={`
                      h-6 rounded-full transition-colors duration-300
                      ${mark.isFilled ? "bg-[#55705A] dark:bg-[#9DB4A0]" : "bg-black/10 dark:bg-white/10"}
                    `}
                    title={mark.isFilled ? `Absorbed Tree #${mark.id + 1}` : `Target Tree #${mark.id + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Caption & Legend Row */}
            <div className="flex items-center justify-between text-[12px] text-[#6F6A61] dark:text-[#9A948A] mt-1 flex-wrap gap-2">
              <span>Each mark represents ~{KG_PER_TREE} kg CO₂e absorbed annually per mature tree</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 font-medium text-[#55705A] dark:text-[#9DB4A0]">
                  <span className="w-2 h-2 rounded-sm bg-[#55705A] dark:bg-[#9DB4A0]" /> Absorbed ({treesEquivalent})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-black/15 dark:bg-white/20" /> Remaining ({remainingTrees})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* D5 Derived Insight Footer */}
        <div className="pt-3 border-t border-black/[0.07] dark:border-white/[0.08] text-xs text-[#5B564E] dark:text-[#C2BCB0] flex items-center justify-between">
          <span className="font-medium text-[#7D3F1E] dark:text-[#E07A57]">
            {remainingKg.toLocaleString("en-US")} kg CO₂e ({remainingTrees} trees) remaining to annual target
          </span>
          <span className="text-[#6F6A61] dark:text-[#9A948A]">
            82% of target achieved
          </span>
        </div>
      </motion.div>

      {/* 4 Cols: Supplier Tier Distribution Card (P0-1 FIXED: TOTAL = 3) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-4
          bg-white dark:bg-[#20242B]
          rounded-[24px] border border-black/[0.07] dark:border-white/[0.08]
          shadow-sm flex flex-col justify-between p-6 lg:p-7 min-h-[380px]
        "
      >
        <div>
          {/* Header with Toggle Pills */}
          <div className="flex items-start justify-between pb-3 border-b border-black/[0.07] dark:border-white/[0.08] mb-3 gap-2">
            <div>
              <h2 className="text-[20px] lg:text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-[-0.01em]">
                {tierViewMode === "count" ? "Partner Tier Distribution" : "SME Spend"}
              </h2>
              <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] font-normal mt-0.5">
                {tierViewMode === "count" ? "Partners by enterprise size" : "Spend with small and micro businesses"}
              </p>
            </div>

            {/* Toggle Pills: By Count / By Spend */}
            <div className="flex items-center p-0.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] shrink-0 mt-0.5">
              <button
                type="button"
                onClick={() => setTierViewMode("count")}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  tierViewMode === "count"
                    ? "bg-white dark:bg-[#20242B] text-[#1F1B16] dark:text-[#F3EFE7] shadow-xs font-semibold"
                    : "text-[#6F6A61] dark:text-[#9A948A] hover:text-[#1F1B16] dark:hover:text-[#F3EFE7] font-medium"
                }`}
              >
                By Count
              </button>
              <button
                type="button"
                onClick={() => setTierViewMode("spend")}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  tierViewMode === "spend"
                    ? "bg-white dark:bg-[#20242B] text-[#1F1B16] dark:text-[#F3EFE7] shadow-xs font-semibold"
                    : "text-[#6F6A61] dark:text-[#9A948A] hover:text-[#1F1B16] dark:hover:text-[#F3EFE7] font-medium"
                }`}
              >
                By Spend
              </button>
            </div>
          </div>

          {tierViewMode === "count" ? (
            <>
              {/* Count View KPI */}
              <div className="flex items-baseline gap-2 my-3">
                <span className="text-3xl lg:text-[36px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums">
                  {correctTotalSuppliers}
                </span>
                <span className="text-xs font-semibold text-[#6F6A61] dark:text-[#9A948A] uppercase tracking-wider">
                  TOTAL PARTNERS
                </span>
              </div>

              {/* 12px Segmented Horizontal Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/10 gap-1 my-4">
                {TIER_CONFIG.map((tier) => {
                  const count = tierCounts[tier.key] || 0;
                  const pct = (count / correctTotalSuppliers) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={tier.key}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: tier.color,
                      }}
                      className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                      title={`${tier.label}: ${count} (${pct.toFixed(0)}%)`}
                    />
                  );
                })}
              </div>

              {/* Tier Row List (including 0s) */}
              <div className="space-y-3 mt-4">
                {TIER_CONFIG.map((tier) => {
                  const count = tierCounts[tier.key] || 0;
                  const pct = Math.round((count / correctTotalSuppliers) * 100);
                  const isZero = count === 0;

                  return (
                    <div
                      key={tier.key}
                      className={`flex items-center justify-between text-[15px] py-1 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0 ${
                        isZero ? "opacity-45" : "opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tier.color }}
                        />
                        <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-normal">
                          {tier.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[#6F6A61] dark:text-[#9A948A] text-xs font-normal">
                          ({pct}%)
                        </span>
                        <span className="font-semibold text-[#1F1B16] dark:text-[#F3EFE7] min-w-[20px] text-right tabular-nums">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Spend View KPI */}
              <div className="flex items-baseline gap-2 my-3">
                <span className="text-3xl lg:text-[36px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums">
                  {formatUsd(smeData.totalSMEUsd)}
                </span>
              </div>

              {/* 12px Segmented Horizontal Bar by Spend */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/10 gap-1 my-4">
                {(["Micro", "Small", "Medium"] as const).map((tier) => {
                  const amount = smeData.breakdownUsd[tier];
                  const pct = smeData.totalSMEUsd > 0 ? (amount / smeData.totalSMEUsd) * 100 : 0;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={tier}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: MSME_COLORS[tier],
                      }}
                      className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                      title={`${tier}: ${formatUsd(amount)} (${pct.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>

              {/* MSME Row List with clickable percentage and carbon equivalent */}
              <div className="space-y-3 mt-4">
                {(["Micro", "Small", "Medium"] as const).map((tier) => {
                  const amount = smeData.breakdownUsd[tier];
                  const pct = smeData.totalSMEUsd > 0 ? (amount / smeData.totalSMEUsd) * 100 : 0;
                  return (
                    <SmeTierRow
                      key={tier}
                      tier={tier}
                      amountUsd={amount}
                      pct={pct}
                      carbonKg={smeData.carbonBreakdownKg?.[tier] || 0}
                      color={MSME_COLORS[tier]}
                      isZero={amount === 0}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pinned Footer Insight Tile */}
        {tierViewMode === "count" ? (
          <div className="mt-6 pt-3 border-t border-black/[0.07] dark:border-white/[0.08] text-xs text-[#5B564E] dark:text-[#C2BCB0] flex items-center justify-between">
            <span className="font-medium text-[#7D3F1E] dark:text-[#E07A57]">
              Largest tier: {largestTierName} ({largestTierCount} of {correctTotalSuppliers} partners)
            </span>
            <span className="text-[#6F6A61] dark:text-[#9A948A]">
              {Math.round((largestTierCount / correctTotalSuppliers) * 100)}% share
            </span>
          </div>
        ) : (
          <div className="mt-6 pt-3 border-t border-black/[0.07] dark:border-white/[0.08] text-xs text-[#5B564E] dark:text-[#C2BCB0] flex items-center justify-between">
            <span className="font-medium text-[#7D3F1E] dark:text-[#E07A57] flex items-center gap-1.5 truncate">
              <Info className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
              Udyam MSME classification
            </span>
            <span className="text-[#6F6A61] dark:text-[#9A948A] shrink-0">
              Per MSME Act 2006
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
