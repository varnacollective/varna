"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Users, Scale } from "lucide-react";

export interface SupplierImpactData {
  name: string;
  womenPct: number;
  wageRatio: number;
}

interface SocialImpactProps {
  artisansSupported: number;
  womenWorkforcePercent: number;
  culturalScore?: number;
  wageRatio?: number;
  supplierImpactData?: SupplierImpactData[];
  delay?: number;
}

export default function SocialImpact({
  artisansSupported,
  womenWorkforcePercent,
  culturalScore = 0,
  wageRatio = 1.05,
  supplierImpactData = [],
  delay = 0,
}: SocialImpactProps) {
  const showCultural = culturalScore > 0;
  const headerTitle = showCultural ? "Social & Cultural Impact" : "Social Impact";

  return (
    <Card
      delay={delay}
      hoverEffect={false}
      accentColor="deep-clay"
      className="p-8 relative overflow-hidden flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-6 border-b border-slate-mist/25 dark:border-midnight-blue pb-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/50">
            {headerTitle}
          </h3>
          {/* Subtle cursive accent — only shown when Cultural data exists */}
          {showCultural && (
            <span className="font-accent text-lg text-deep-clay dark:text-warm-stone/70 select-none">
              artisan empowered community
            </span>
          )}
        </div>

        <div className="space-y-6">
          {/* Top metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Average Gender Representation (% Women) */}
            <motion.div
              className="flex items-center gap-4 border border-slate-mist/20 dark:border-midnight-blue p-4 bg-warm-stone/20 dark:bg-black/10"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.15, duration: 0.5 }}
            >
              <div className="flex items-center justify-center w-11 h-11 border border-deep-clay/35 bg-deep-clay/10 text-deep-clay">
                <Users className="w-5 h-5 text-deep-clay" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-2xl font-serif font-light tracking-tight text-carbon-ink dark:text-warm-stone">
                  {Math.round(womenWorkforcePercent)}%
                </div>
                <p className="text-[10px] text-slate-mist dark:text-warm-stone/50 font-light uppercase tracking-wider mt-0.5">
                  Women (Avg)
                </p>
              </div>
            </motion.div>

            {/* Average Wage Ratio */}
            <motion.div
              className="flex items-center gap-4 border border-slate-mist/20 dark:border-midnight-blue p-4 bg-warm-stone/20 dark:bg-black/10"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2, duration: 0.5 }}
            >
              <div className="flex items-center justify-center w-11 h-11 border border-sage-mineral/35 bg-sage-mineral/10 text-sage-mineral">
                <Scale className="w-5 h-5 text-sage-mineral" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-2xl font-serif font-light tracking-tight text-carbon-ink dark:text-warm-stone">
                  {wageRatio.toFixed(2)}
                  <span className="text-[10px] font-sans font-light text-slate-mist dark:text-warm-stone/50 ml-1">×</span>
                </div>
                <p className="text-[10px] text-slate-mist dark:text-warm-stone/50 font-light uppercase tracking-wider mt-0.5">
                  State Minimum Wage (Avg)
                </p>
              </div>
            </motion.div>

            {/* Artisans Supported (Only if showCultural) */}
            {showCultural && (
              <motion.div
                className="flex items-center gap-4 border border-slate-mist/20 dark:border-midnight-blue p-4 bg-warm-stone/20 dark:bg-black/10"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.25, duration: 0.5 }}
              >
                <div className="flex items-center justify-center w-11 h-11 border border-slate-mist/35 bg-slate-mist/10 text-slate-mist">
                  <Users className="w-5 h-5 text-slate-mist" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-2xl font-sans font-light tracking-tight text-carbon-ink dark:text-warm-stone">
                    <AnimatedCounter value={artisansSupported} delay={delay + 0.3} />
                  </div>
                  <p className="text-[10px] text-slate-mist dark:text-warm-stone/50 font-light uppercase tracking-wider mt-0.5">
                    Artisans Supported
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Gender Representation & Wage Ratio Lists */}
          {supplierImpactData && supplierImpactData.length > 0 && (
            <div className="mt-6 space-y-6">
              
              {/* Gender Representation individually */}
              <div>
                <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-slate-mist dark:text-warm-stone/50 mb-3 border-b border-slate-mist/10 pb-1">
                  <span>Gender Representation</span>
                </div>
                <div className="space-y-3">
                  {supplierImpactData.map((s, idx) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-mist dark:text-warm-stone/70">{s.name}</span>
                        <span className="font-semibold text-carbon-ink dark:text-warm-stone">{s.womenPct}% Women</span>
                      </div>
                      <div className="h-1.5 bg-warm-stone/30 dark:bg-black/20 rounded-none overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-none bg-sage-mineral"
                          initial={{ width: 0 }}
                          animate={{ width: `${s.womenPct}%` }}
                          transition={{ duration: 0.8, delay: delay + 0.3 + (idx * 0.1) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wage Ratio individually */}
              <div>
                <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-slate-mist dark:text-warm-stone/50 mb-3 border-b border-slate-mist/10 pb-1">
                  <span>Wages Ratio</span>
                </div>
                <div className="space-y-3">
                  {supplierImpactData.map((s, idx) => (
                    <div key={`wage-${s.name}`} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-mist dark:text-warm-stone/70">{s.name}</span>
                        <span className="font-semibold text-sage-mineral">{s.wageRatio.toFixed(2)}x Min Wage</span>
                      </div>
                      <div className="h-1.5 bg-warm-stone/30 dark:bg-black/20 rounded-none overflow-hidden relative">
                        {/* We use 2.0x as the max scale (100%) for visual representation */}
                        <motion.div
                          className="h-full rounded-none bg-deep-clay/80"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (s.wageRatio / 2) * 100)}%` }}
                          transition={{ duration: 0.8, delay: delay + 0.4 + (idx * 0.1) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
