"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { TreePine, Leaf, Wind } from "lucide-react";

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

  return (
    <Card
      delay={delay}
      hoverEffect={false}
      accentColor="sage-mineral"
      className="p-8 relative overflow-hidden"
    >
      {/* Structural left-aligned layout */}
      <div className="flex justify-between items-start mb-4 border-b border-slate-mist/25 dark:border-midnight-blue pb-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/50">
          Carbon Footprint Impact
        </h3>
        {/* Subtle cursive accent */}
        <span className="font-accent text-lg text-deep-clay dark:text-warm-stone/70 select-none">
          climate positive target
        </span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <motion.div
          className="flex items-center justify-center w-12 h-12 border border-sage-mineral/30 bg-sage-mineral/10 text-sage-mineral"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.4 }}
        >
          <Leaf className="w-5 h-5 text-sage-mineral" strokeWidth={1.5} />
        </motion.div>
        <div>
          <div className="text-3xl font-sans font-light tracking-tight text-carbon-ink dark:text-warm-stone">
            <AnimatedCounter
              value={totalCO2eAvoidedKg}
              delay={delay + 0.15}
              suffix=" kg"
            />
          </div>
          <p className="text-xs text-slate-mist dark:text-warm-stone/50 mt-0.5 font-light">
            Net CO₂e emissions avoided
          </p>
        </div>
      </div>

      {/* Tree equivalency visual */}
      <div className="bg-warm-stone/20 dark:bg-black/10 rounded-none p-5 border border-slate-mist/20 dark:border-midnight-blue">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-10 h-10 border border-sage-mineral/20 bg-sage-mineral/5">
            <TreePine className="w-5 h-5 text-sage-mineral" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-slate-mist dark:text-warm-stone/50 font-light">Equivalent ecological absorption</p>
            <p className="text-xl font-serif font-light text-sage-mineral tracking-tight mt-0.5">
              <AnimatedCounter
                value={treesEquivalent}
                delay={delay + 0.3}
              />{" "}
              <span className="text-xs font-sans font-light uppercase tracking-wider text-sage-mineral/80 ml-1">
                mature trees
              </span>
            </p>
          </div>
        </div>

        {/* Animated tree row using brand sage-mineral color */}
        <div className="flex items-end gap-1.5 mt-4 border-t border-slate-mist/10 pt-4 overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: delay + 0.4 + i * 0.04,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <TreePine
                className="text-sage-mineral/30 hover:text-sage-mineral/70 transition-colors duration-300 cursor-help"
                style={{
                  width: 14 + (i % 3) * 3,
                  height: 16 + (i % 4) * 4,
                }}
                strokeWidth={1.2}
              />
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 1.2 }}
            className="flex-shrink-0"
          >
            <Wind className="w-3.5 h-3.5 text-slate-mist/50 ml-2" strokeWidth={1} />
          </motion.div>
        </div>
      </div>
    </Card>
  );
}
