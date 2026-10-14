"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, TreePine, Info, Car, Pencil } from "lucide-react";
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

  // Target CO2e user editable state with localStorage persistence
  const [targetCo2Input, setTargetCo2Input] = useState<string>("2640");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("varna_target_co2");
      if (saved) {
        setTargetCo2Input(saved);
      }
    }
  }, []);

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetCo2Input(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("varna_target_co2", val);
    }
  };

  const parsedTarget = Number(targetCo2Input);
  const targetCO2e = !isNaN(parsedTarget) && parsedTarget > 0 ? parsedTarget : 2640;

  const smeData = useMemo(() => {
    return computeSmeSpendData(suppliers, totalSpend);
  }, [suppliers, totalSpend]);

  // Tree calculations
  const treesEquivalent = Math.round(totalCO2eAvoidedKg / KG_PER_TREE); // 98 trees
  const targetTrees = Math.ceil(targetCO2e / KG_PER_TREE);
  const remainingTrees = Math.max(0, targetTrees - treesEquivalent);
  const remainingKg = Math.max(0, targetCO2e - totalCO2eAvoidedKg);
  const progressPercent = Math.min(100, Math.round((totalCO2eAvoidedKg / targetCO2e) * 100));

  // Car Equivalent calculation: check if Supabase has explicit value, otherwise derive using EPA factor
  const carYearsEquivalent =
    carEquivalent ??
    (totalCO2eAvoidedKg > 0
      ? Number((totalCO2eAvoidedKg / KG_CO2E_PER_PASSENGER_VEHICLE_YEAR).toFixed(2))
      : 0);

  const carKmsAvoided =
    carKmAvoided ??
    (totalCO2eAvoidedKg > 0 ? Math.round(totalCO2eAvoidedKg * KM_PER_KG_CO2E) : 0);

  // Fixed 120-pill matrix representing target ratio
  const TOTAL_GRID_NODES = 120;
  const filledNodesCount = Math.min(
    TOTAL_GRID_NODES,
    Math.round((progressPercent / 100) * TOTAL_GRID_NODES)
  );

  const tallyMarks = useMemo(() => {
    return Array.from({ length: TOTAL_GRID_NODES }).map((_, idx) => ({
      id: idx,
      isFilled: idx < filledNodesCount,
    }));
  }, [filledNodesCount]);

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
      {/* 8 Cols: Carbon Impact Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-8
          bg-white dark:bg-[#20242B]
          rounded-[24px] border border-[#E8E3DA] dark:border-white/[0.08]
          shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)]
          flex flex-col justify-between p-6 lg:p-7 min-h-[380px]
        "
      >
        {/* Header Row */}
        <div>
          <h2 className="text-[20px] lg:text-[22px] font-serif font-medium text-[#1C1917] dark:text-[#F3EFE7] tracking-tight">
            Carbon Impact
          </h2>
          <p className="text-sm text-[#8C827A] dark:text-[#9A948A] font-normal mt-0.5">
            Estimated CO₂e avoided via circular procurement · Partial coverage (3 of 10 partners verified)
          </p>
        </div>

        {/* 2-Column Inner Layout with clean vertical rhythm */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-auto py-3 items-start">
          {/* Left Column: Stat Blocks Elevated Cards */}
          <div className="md:col-span-5 flex flex-col gap-3.5 justify-between">
            {/* 1. CO2E Avoided */}
            <div className="bg-[#FAF8F5] dark:bg-[#252A32] border border-[#ECE8DF] dark:border-white/[0.08] rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#EBF0EC] dark:bg-[#3A5A40]/30 flex items-center justify-center text-[#3A5A40] dark:text-[#9DB4A0] shrink-0 mt-0.5">
                  <Leaf className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#8C827A] dark:text-[#9A948A] block">
                    CO₂e emissions avoided
                  </span>
                  {totalCO2eAvoidedKg > 0 ? (
                    <div className="text-2xl lg:text-3xl font-serif font-light text-[#1C1917] dark:text-[#F3EFE7] tracking-tight leading-none mt-1 tabular-nums">
                      {totalCO2eAvoidedKg.toLocaleString("en-US")}{" "}
                      <span className="text-xs font-sans font-normal uppercase text-[#8C827A] dark:text-[#9A948A]">
                        KG
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <span className="text-xl font-light text-[#8C827A] dark:text-[#9A948A]">N/A</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Info className="w-3 h-3 text-[#9A4A2E] dark:text-[#E07A57] shrink-0" strokeWidth={1.8} />
                        <span className="text-[11px] text-[#9A4A2E] dark:text-[#E07A57] font-normal">Carbon data is pending.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Tree Equivalent */}
            <div className="bg-[#FAF8F5] dark:bg-[#252A32] border border-[#ECE8DF] dark:border-white/[0.08] rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#EBF0EC] dark:bg-[#3A5A40]/30 flex items-center justify-center text-[#3A5A40] dark:text-[#9DB4A0] shrink-0 mt-0.5">
                  <TreePine className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#8C827A] dark:text-[#9A948A] block">
                    Tree equivalent
                  </span>
                  {totalCO2eAvoidedKg > 0 ? (
                    <div className="text-2xl lg:text-3xl font-serif font-light text-[#1C1917] dark:text-[#F3EFE7] tracking-tight leading-none mt-1 tabular-nums">
                      {treesEquivalent}{" "}
                      <span className="text-xs font-sans font-normal text-[#8C827A] dark:text-[#9A948A]">
                        mature trees
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <span className="text-xl font-light text-[#8C827A] dark:text-[#9A948A]">N/A</span>
                      <span className="text-[11px] text-[#8C827A] dark:text-[#9A948A] block mt-0.5 font-normal">Awaiting carbon data</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Car Equivalent */}
            <div className="bg-[#FAF8F5] dark:bg-[#252A32] border border-[#ECE8DF] dark:border-white/[0.08] rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#EBF0EC] dark:bg-[#3A5A40]/30 flex items-center justify-center text-[#3A5A40] dark:text-[#9DB4A0] shrink-0 mt-0.5">
                  <Car className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#8C827A] dark:text-[#9A948A] block">
                    Car equivalent
                  </span>
                  {totalCO2eAvoidedKg > 0 ? (
                    <>
                      <div className="text-2xl lg:text-3xl font-serif font-light text-[#1C1917] dark:text-[#F3EFE7] tracking-tight leading-none mt-1 tabular-nums">
                        {carYearsEquivalent}{" "}
                        <span className="text-xs font-sans font-normal text-[#8C827A] dark:text-[#9A948A]">
                          cars off road / yr
                        </span>
                      </div>
                      <span className="text-[11px] text-[#3A5A40] dark:text-[#9DB4A0] font-medium block mt-1">
                        ≈ {carKmsAvoided.toLocaleString("en-US")} km passenger driving avoided
                      </span>

                      {/* Car Glyph Track */}
                      <div className="mt-2.5 p-2.5 rounded-lg bg-white/70 dark:bg-[#1D2128] border border-[#ECE8DF] dark:border-white/[0.08]">
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
                                className={`flex-1 h-5 rounded flex items-center justify-center transition-all ${
                                  isFilled
                                    ? "bg-[#3A5A40] dark:bg-[#9DB4A0] text-white dark:text-[#1A1F26]"
                                    : isPartial
                                    ? "bg-[#3A5A40]/45 dark:bg-[#9DB4A0]/45 text-white"
                                    : "bg-black/10 dark:bg-white/10 text-[#6F6A61] dark:text-[#9A948A]"
                                }`}
                                title={`Equivalent to ${(i + 1) * 0.1} car/yr`}
                              >
                                <Car className="w-3 h-3" strokeWidth={1.8} />
                              </motion.div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#8C827A] dark:text-[#9A948A] mt-1.5 px-0.5">
                          <span>Each icon = 0.1 car/yr</span>
                          <span className="font-medium text-[#3A5A40] dark:text-[#9DB4A0]">US EPA Factor</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mt-1">
                      <span className="text-xl font-light text-[#8C827A] dark:text-[#9A948A]">N/A</span>
                      <span className="text-[11px] text-[#8C827A] dark:text-[#9A948A] block mt-0.5 font-normal">Awaiting carbon data</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Target Progress & Matrix */}
          <div className="md:col-span-7 flex flex-col justify-between">
            {/* Header Area with Target Input and Percentage */}
            <div className="flex items-start sm:items-baseline justify-between gap-3 mb-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#1C1917] dark:text-[#F3EFE7] block">
                  Progress to annual target
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#8C827A] dark:text-[#9A948A] font-normal mt-1.5 flex-wrap">
                  <span>{totalCO2eAvoidedKg.toLocaleString("en-US")} of</span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={targetCo2Input}
                      onChange={handleTargetChange}
                      aria-label="Target CO₂e in kilograms"
                      className="bg-[#FAF8F5] dark:bg-[#252A32] text-[#1C1917] dark:text-[#F3EFE7] border border-[#D6CFC2] dark:border-white/20 focus:border-[#3A5A40] focus:ring-1 focus:ring-[#3A5A40] focus:outline-none rounded-lg pl-2.5 pr-6 py-1 text-sm font-semibold tabular-nums w-28 transition-all"
                    />
                    <Pencil className="w-3 h-3 text-[#8C827A] dark:text-[#9A948A] absolute right-2 pointer-events-none opacity-60" />
                  </div>
                  <span>kg CO₂e</span>
                </div>
              </div>

              <span className="text-3xl lg:text-[38px] font-serif font-light text-[#1C1917] dark:text-[#F3EFE7] tabular-nums shrink-0">
                {progressPercent}%
              </span>
            </div>

            {/* High-Impact Progress Bar directly below header */}
            <div className="w-full bg-[#EAE6DE] dark:bg-white/10 h-2.5 rounded-full overflow-hidden my-2.5">
              <div
                className="bg-gradient-to-r from-[#3A5A40] to-[#588157] h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Tree Absorption Matrix Container */}
            <div className="w-full p-4 sm:p-5 bg-[#FAF8F5] dark:bg-[#252A32] rounded-2xl border border-[#E6E1D6] dark:border-white/[0.08] shadow-inner my-2">
              <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1 justify-between">
                {tallyMarks.map((mark) => (
                  <div
                    key={mark.id}
                    className={`
                      h-5 sm:h-6 rounded-full transition-all duration-500 ease-out
                      ${mark.isFilled ? "bg-[#3A5A40] dark:bg-[#9DB4A0]" : "bg-black/10 dark:bg-white/10"}
                    `}
                    title={mark.isFilled ? `Absorbed Node #${mark.id + 1}` : `Target Node #${mark.id + 1}`}
                  />
                ))}
              </div>

              {/* Caption & Legend Row */}
              <div className="flex items-center justify-between text-[11px] sm:text-[12px] text-[#8C827A] dark:text-[#9A948A] mt-3 pt-2.5 border-t border-[#ECE8DF] dark:border-white/[0.06] flex-wrap gap-2">
                <span>Each mark represents ~{KG_PER_TREE} kg CO₂e absorbed annually per mature tree</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1 font-medium text-[#3A5A40] dark:text-[#9DB4A0]">
                    <span className="w-2 h-2 rounded-sm bg-[#3A5A40] dark:bg-[#9DB4A0]" /> Absorbed ({treesEquivalent})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-black/15 dark:bg-white/20" /> Remaining ({remainingTrees})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* D5 Derived Insight Footer */}
        <div className="pt-3 border-t border-[#F0EDE6] dark:border-white/[0.08]">
          <div className="text-xs text-[#57534E] dark:text-[#C2BCB0] flex items-center justify-between flex-wrap gap-1">
            <span className="font-medium text-[#9A4A2E] dark:text-[#E07A57]">
              {remainingKg.toLocaleString("en-US")} kg CO₂e ({remainingTrees} trees) remaining to annual target
            </span>
            <span className="text-[#8C827A] dark:text-[#9A948A] tabular-nums">
              {progressPercent}% of target achieved
            </span>
          </div>
          <p className="text-[10px] text-[#A8A29E] mt-1 leading-tight font-normal">
            Estimated from circular procurement baseline · Partial coverage: 3 purchasing partners verified (remaining 7 directory partners pending full lifecycle LCA disclosures). EPA factor: 22 kg CO₂e/tree/yr.
          </p>
        </div>
      </motion.div>

      {/* 4 Cols: Supplier Tier Distribution Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-4
          bg-white dark:bg-[#1C1917]
          rounded-2xl border border-[#E8E3DA] dark:border-[#2E2823]
          shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)] flex flex-col justify-between p-6 lg:p-7 min-h-[400px]
        "
      >
        <div className="flex-1 flex flex-col">
          {/* Header with Toggle Pills */}
          <div className="flex items-start justify-between pb-3.5 border-b border-[#F0EDE6] dark:border-[#2A241F] mb-3 gap-2">
            <div>
              <h2 className="font-serif text-xl lg:text-[22px] font-normal text-[#1C1917] dark:text-[#F7F5F0] tracking-tight">
                {tierViewMode === "count" ? "Partner Tier Distribution" : "SME Spend"}
              </h2>
              <p className="text-xs text-[#78716C] dark:text-[#A8A29E] font-normal mt-0.5">
                {tierViewMode === "count" ? "Partners by enterprise size" : "Spend with small and micro businesses"}
              </p>
            </div>

            {/* Toggle Pills: By Count / By Spend */}
            <div className="flex items-center p-1 rounded-xl bg-[#F3F0EA] dark:bg-[#2A241F] border border-[#E8E3DA] dark:border-[#38312B] shrink-0 mt-0.5">
              <button
                type="button"
                onClick={() => setTierViewMode("count")}
                className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  tierViewMode === "count"
                    ? "bg-white dark:bg-[#1C1917] text-[#1C1917] dark:text-[#F7F5F0] shadow-xs font-medium"
                    : "text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F7F5F0] font-normal"
                }`}
              >
                By Count
              </button>
              <button
                type="button"
                onClick={() => setTierViewMode("spend")}
                className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  tierViewMode === "spend"
                    ? "bg-white dark:bg-[#1C1917] text-[#1C1917] dark:text-[#F7F5F0] shadow-xs font-medium"
                    : "text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F7F5F0] font-normal"
                }`}
              >
                By Spend
              </button>
            </div>
          </div>

          {tierViewMode === "count" ? (
            <div className="flex-1 flex flex-col justify-between">
              {/* Count View KPI */}
              <div className="flex items-baseline gap-2 my-2">
                <span className="font-serif text-3xl lg:text-[38px] font-light text-[#1C1917] dark:text-[#F7F5F0] tracking-tight tabular-nums">
                  {correctTotalSuppliers}
                </span>
                <span className="text-[11px] font-medium text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider">
                  TOTAL PARTNERS
                </span>
              </div>

              {/* 10px Segmented Horizontal Bar */}
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-[#F0EDE6] dark:bg-[#2A241F] gap-1 my-3">
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

              {/* Tier Row List (including 0s) - evenly spaced */}
              <div className="flex-1 flex flex-col justify-around py-2 min-h-[160px]">
                {TIER_CONFIG.map((tier) => {
                  const count = tierCounts[tier.key] || 0;
                  const pct = Math.round((count / correctTotalSuppliers) * 100);
                  const isZero = count === 0;

                  return (
                    <div
                      key={tier.key}
                      className={`flex items-center justify-between text-sm py-2 border-b border-[#F0EDE6] dark:border-[#2A241F] last:border-0 ${
                        isZero ? "opacity-40" : "opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: tier.color }}
                        />
                        <span className="text-[#1C1917] dark:text-[#F7F5F0] font-normal">
                          {tier.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[#78716C] dark:text-[#A8A29E] text-xs font-normal tabular-nums">
                          ({pct}%)
                        </span>
                        <span className="font-medium text-[#1C1917] dark:text-[#F7F5F0] min-w-[20px] text-right tabular-nums">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              {/* Spend View KPI */}
              <div className="flex items-baseline gap-2 my-2">
                <span className="font-serif text-3xl lg:text-[38px] font-light text-[#1C1917] dark:text-[#F7F5F0] tracking-tight tabular-nums">
                  {formatUsd(smeData.totalSMEUsd)}
                </span>
                <span className="text-[11px] font-medium text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider">
                  SME PROCUREMENT
                </span>
              </div>

              {/* 10px Segmented Horizontal Bar by Spend */}
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-[#F0EDE6] dark:bg-[#2A241F] gap-1 my-3">
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
              <div className="flex-1 flex flex-col justify-around py-2 min-h-[160px]">
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
            </div>
          )}
        </div>

        {/* Pinned Footer Insight Tile */}
        {tierViewMode === "count" ? (
          <div className="mt-4 pt-3 border-t border-[#F0EDE6] dark:border-[#2A241F] text-xs text-[#57534E] dark:text-[#D6D3D1] flex items-center justify-between">
            <span className="font-medium text-[#9A4A2E] dark:text-[#E07A57]">
              Largest tier: {largestTierName} ({largestTierCount} of {correctTotalSuppliers} partners)
            </span>
            <span className="text-[#78716C] dark:text-[#A8A29E] tabular-nums">
              {Math.round((largestTierCount / correctTotalSuppliers) * 100)}% share
            </span>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-[#F0EDE6] dark:border-[#2A241F] text-xs text-[#57534E] dark:text-[#D6D3D1] flex items-center justify-between">
            <span className="font-medium text-[#9A4A2E] dark:text-[#E07A57] flex items-center gap-1.5 truncate">
              <Info className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
              Udyam MSME classification
            </span>
            <span className="text-[#78716C] dark:text-[#A8A29E] shrink-0">
              Per MSME Act 2006
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
