"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { TreePine, Leaf, Wind, CheckCircle2 } from "lucide-react";

interface CarbonImpactProps {
  totalCO2eAvoidedKg: number;
  delay?: number;
}

export default function CarbonImpact({
  totalCO2eAvoidedKg,
  delay = 0,
}: CarbonImpactProps) {
  // 1 tree absorbs ~22 kg CO2 per year (EPA estimate)
  const treesEquivalent = Math.round(totalCO2eAvoidedKg / 22);

  // Icon array data-viz configuration:
  // Target threshold represents the annual client procurement sequestration goal (e.g. 120 trees)
  const targetTrees = Math.max(treesEquivalent + 22, 120);
  const totalIcons = 40; // 4 rows of 10
  const treesPerIcon = targetTrees / totalIcons; // e.g. 3 trees per icon
  const filledIconsCount = Math.min(totalIcons, Math.max(1, Math.round(treesEquivalent / treesPerIcon)));

  const iconArray = Array.from({ length: totalIcons }).map((_, idx) => ({
    id: idx,
    isFilled: idx < filledIconsCount,
    treeMilestone: Math.round((idx + 1) * treesPerIcon),
  }));

  const completionPercent = Math.min(100, Math.round((treesEquivalent / targetTrees) * 100));

  return (
    <Card
      delay={delay}
      variant="chart"
      hoverEffect={false}
      className="p-8 relative overflow-hidden"
    >
      {/* Header */}
      <div className="mb-6 border-b border-[#6F848F]/20 dark:border-[#2F3C52]/70 pb-3 relative z-10">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#8C9DA8]">
          Carbon Footprint Impact · Sequestration Array
        </h3>
        <p className="text-[11px] text-[#222326]/75 dark:text-[#8C9DA8] font-light mt-0.5">
          Verified CO₂e emissions avoided through circular procurement
        </p>
      </div>

      {/* Main Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
        {/* Net CO2e Avoided */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-[#DFD8C2]/40 dark:bg-[#1A1C22]/80 border border-[#6F848F]/15 dark:border-[#8C9DA8]/15 shadow-elevation-low">
          <motion.div
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#738678]/15 dark:bg-[#738678]/25 text-[#738678] dark:text-[#8AA391] shadow-xs flex-shrink-0"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.4 }}
          >
            <Leaf className="w-5 h-5 text-[#738678] dark:text-[#8AA391]" strokeWidth={1.5} />
          </motion.div>
          <div>
            <div className="text-3xl font-serif font-light tracking-hero text-[#222326] dark:text-[#FAF6EE]">
              <AnimatedCounter
                value={totalCO2eAvoidedKg}
                delay={delay + 0.15}
                suffix=" kg"
              />
            </div>
            <p className="text-[10px] text-[#6F848F] dark:text-[#8C9DA8] uppercase tracking-wider font-light mt-0.5">
              Emissions Avoided
            </p>
          </div>
        </div>

        {/* Tree Absorption Equivalent */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-[#DFD8C2]/40 dark:bg-[#1A1C22]/80 border border-[#6F848F]/15 dark:border-[#8C9DA8]/15 shadow-elevation-low">
          <motion.div
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#738678]/15 dark:bg-[#738678]/25 text-[#738678] dark:text-[#8AA391] shadow-xs flex-shrink-0"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.25, duration: 0.4 }}
          >
            <TreePine className="w-5 h-5 text-[#738678] dark:text-[#8AA391]" strokeWidth={1.5} />
          </motion.div>
          <div>
            <div className="text-3xl font-serif font-light tracking-hero text-[#738678] dark:text-[#8AA391]">
              <AnimatedCounter value={treesEquivalent} delay={delay + 0.3} />
              <span className="text-xs font-sans font-light uppercase tracking-wider text-[#6F848F] dark:text-[#8C9DA8] ml-1.5">
                trees
              </span>
            </div>
            <p className="text-[10px] text-[#6F848F] dark:text-[#8C9DA8] uppercase tracking-wider font-light mt-0.5">
              Ecological Absorption
            </p>
          </div>
        </div>
      </div>

      {/* Structured Icon-Array Data Visualization */}
      <div className="bg-[#DFD8C2]/50 dark:bg-[#1C1F26] p-5 rounded-lg border border-[#6F848F]/20 dark:border-[#8C9DA8]/20 shadow-elevation-low relative z-10">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#6F848F]/20 dark:border-[#8C9DA8]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#222326] dark:text-[#FAF6EE]">
              Sequestration Progress Array
            </span>
            <span className="text-[9px] text-[#6F848F] font-light">
              ({treesEquivalent} of {targetTrees} trees targeted)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[9px] uppercase tracking-wider text-[#6F848F]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#738678]" />
              <span>Absorbed ({filledIconsCount * Math.round(treesPerIcon)}t)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 border border-[#6F848F]/50 bg-transparent" />
              <span>Target Capacity</span>
            </div>
          </div>
        </div>

        {/* The Tree Grid Matrix: 10 columns × 4 rows */}
        <div className="grid grid-cols-10 gap-2.5 sm:gap-3 py-2">
          {iconArray.map((icon, idx) => (
            <motion.div
              key={icon.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: delay + 0.3 + idx * 0.015,
                duration: 0.3,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.25, y: -2 }}
              className="relative group flex items-center justify-center cursor-help py-1"
              title={`Milestone ~${icon.treeMilestone} mature trees (${icon.isFilled ? "Achieved" : "Target Capacity"})`}
            >
              {icon.isFilled ? (
                <div className="relative">
                  <TreePine
                    className="w-5 h-5 text-[#738678] fill-[#738678]/40 stroke-[1.8] drop-shadow-sm transition-transform"
                  />
                  {/* Glowing micro-dot for latest filled milestone */}
                  {idx === filledIconsCount - 1 && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#738678] rounded-full animate-ping" />
                  )}
                </div>
              ) : (
                <TreePine
                  className="w-5 h-5 text-[#6F848F]/40 stroke-[1.2] fill-transparent hover:text-[#6F848F]/80 transition-colors"
                />
              )}

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
                <span className="text-[8px] font-sans font-medium uppercase tracking-widest text-[#D8CFB8] bg-[#222326] px-2 py-0.5 border border-[#6F848F]/30">
                  {icon.isFilled ? `✓ Achieved: ~${icon.treeMilestone} trees` : `Target: ~${icon.treeMilestone} trees`}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer info & absorption benchmark */}
        <div className="mt-4 pt-3 border-t border-[#6F848F]/15 flex justify-between items-center text-[9px] text-[#6F848F] font-light">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#738678]" />
            <span>1 mature tree absorbs ~22 kg CO₂e / year (US EPA standard)</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-[#6F848F]/60" />
            <span className="font-semibold text-[#738678]">{completionPercent}%</span>
            <span>of annual absorption target</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
