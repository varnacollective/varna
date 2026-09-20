"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Leaf, Trees } from "lucide-react";

interface CarbonRowV2Props {
  totalCO2eAvoidedKg?: number;
  targetCO2eKg?: number;
}

export default function CarbonRowV2({
  totalCO2eAvoidedKg = 2160,
  targetCO2eKg = 2640,
}: CarbonRowV2Props) {
  const kgPerTree = 22; // US EPA standard: 1 mature tree absorbs ~22 kg CO2e/year
  const treeCount = Math.round(totalCO2eAvoidedKg / kgPerTree); // 98 trees
  const targetTrees = Math.round(targetCO2eKg / kgPerTree); // 120 trees
  const remainingKg = Math.max(0, targetCO2eKg - totalCO2eAvoidedKg); // 480 kg
  const remainingTrees = Math.max(0, targetTrees - treeCount); // 22 trees
  const progressPct = Math.min(100, Math.round((totalCO2eAvoidedKg / targetCO2eKg) * 100)); // 82%

  // Build 120 tally marks array (30 cols x 4 rows)
  const tallyMarks = Array.from({ length: targetTrees }, (_, i) => ({
    id: i,
    isFilled: i < treeCount,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 7 Cols: Impact2 Visual Image Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-7
          rounded-[24px] overflow-hidden relative min-h-[380px]
          border border-black/[0.07] dark:border-white/[0.12] shadow-sm
          bg-[#1F1B16] group flex flex-col justify-between p-6 lg:p-8
        "
      >
        <Image
          src="/assets/Impact2.svg"
          alt="Bathroom shelf with amber bottles visual"
          fill
          className="object-cover rounded-[24px] object-[50%_45%] transition-transform duration-700 group-hover:scale-[1.03] dark:brightness-90"
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/30 pointer-events-none rounded-[24px]" />

        {/* Overlaid Top-Right Soft Wash Card with 3 Script Lines */}
        <div className="relative z-10 ml-auto p-5 rounded-[20px] bg-[#F4EACF]/90 dark:bg-[#2B2720]/90 backdrop-blur-md border border-[#E8DFC5] dark:border-[#F4EACF]/20 shadow-lg max-w-[320px] sm:max-w-[360px]">
          <div className="varna-script-text text-[#7D3F1E] dark:text-[#F1E6C8] text-2xl lg:text-[28px] leading-snug font-normal space-y-1">
            <p>Make impact measurable</p>
            <p>Make claims credible</p>
            <p>Make better procurement possible</p>
          </div>
        </div>
      </motion.div>

      {/* 5 Cols: Carbon Impact Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-5
          bg-white dark:bg-[#20242B]
          border border-black/[0.07] dark:border-white/[0.08]
          shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
          dark:shadow-none dark:border-t-white/[0.12]
          rounded-[24px] p-6 lg:p-8
          flex flex-col justify-between h-full w-full
          hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        "
      >
        <div>
          {/* Header Row */}
          <div className="pb-4 border-b border-black/[0.07] dark:border-white/[0.08]">
            <h2 className="text-xl lg:text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
              Carbon Impact
            </h2>
            <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] mt-1 font-normal">
              CO₂e emissions avoided through circular procurement
            </p>
          </div>

          {/* 2 Stat Blocks Side-by-Side */}
          <div className="grid grid-cols-2 gap-4 py-5 border-b border-black/[0.07] dark:border-white/[0.08]">
            {/* Stat Block 1: Emissions avoided */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0]">
                  <Leaf className="w-3.5 h-3.5" strokeWidth={1.8} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6F6A61] dark:text-[#9A948A]">
                  Emissions avoided
                </span>
              </div>
              <div className="text-2xl lg:text-3xl font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums flex items-baseline gap-1">
                <span>{totalCO2eAvoidedKg.toLocaleString("en-US")}</span>
                <span className="text-xs font-normal text-[#6F6A61] dark:text-[#9A948A]">KG</span>
              </div>
            </div>

            {/* Stat Block 2: Tree equivalent */}
            <div className="border-l border-black/[0.07] dark:border-white/[0.08] pl-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0]">
                  <Trees className="w-3.5 h-3.5" strokeWidth={1.8} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6F6A61] dark:text-[#9A948A]">
                  Tree equivalent
                </span>
              </div>
              <div className="text-2xl lg:text-3xl font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums">
                {treeCount}
              </div>
              <span className="text-[11px] text-[#6F6A61] dark:text-[#9A948A] font-normal block">
                mature trees a year
              </span>
            </div>
          </div>

          {/* Progress Row */}
          <div className="py-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#5B564E] dark:text-[#C2BCB0] font-medium">
                Progress to annual target
              </span>
              <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-semibold tabular-nums">
                {totalCO2eAvoidedKg.toLocaleString("en-US")} of {targetCO2eKg.toLocaleString("en-US")} kg ({progressPct}%)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-[#55705A] dark:bg-[#9DB4A0] rounded-full"
                style={{ width: `${progressPct}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Tally Array Surface Tile (30 cols x 4 rows = 120 single-tree marks) */}
          <div
            className="my-3 p-4 rounded-[18px] bg-[#F7F3EA] dark:bg-[#272C34] border border-black/5 dark:border-white/5"
            role="img"
            aria-label={`${treeCount} of ${targetTrees} carbon absorption tree marks filled`}
          >
            <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1">
              {tallyMarks.map((mark) => (
                <div
                  key={mark.id}
                  aria-hidden="true"
                  className={`
                    h-5 rounded-xs transition-colors duration-200
                    ${
                      mark.isFilled
                        ? "bg-[#55705A] dark:bg-[#9DB4A0]"
                        : "bg-black/10 dark:bg-white/10"
                    }
                  `}
                />
              ))}
            </div>

            {/* Legend & Attribution Row */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[11px] text-[#6F6A61] dark:text-[#9A948A] font-normal">
              <span className="truncate">
                Each mark = 1 mature tree (~22 kg CO₂e/yr · US EPA)
              </span>

              <div className="flex items-center gap-3 shrink-0 font-medium">
                <span className="flex items-center gap-1 text-[#55705A] dark:text-[#9DB4A0]">
                  <span className="w-2 h-2 rounded-2xs bg-[#55705A] dark:bg-[#9DB4A0]" />
                  Absorbed ({treeCount})
                </span>
                <span className="flex items-center gap-1 text-[#6F6A61] dark:text-[#9A948A]">
                  <span className="w-2 h-2 rounded-2xs bg-black/20 dark:bg-white/20" />
                  Remaining ({remainingTrees})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* D6 Pinned Target Remaining Footer */}
        <div className="pt-3 mt-4 border-t border-black/[0.07] dark:border-white/[0.08] text-xs text-[#6F6A61] dark:text-[#9A948A] font-medium flex items-center justify-between">
          <span>Target remaining</span>
          <span className="text-[#7D3F1E] dark:text-[#E07A57] font-semibold">
            {remainingKg} kg / {remainingTrees} trees remaining
          </span>
        </div>
      </motion.div>
    </div>
  );
}
