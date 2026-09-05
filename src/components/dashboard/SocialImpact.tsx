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
  const headerTitle = showCultural ? "Social & Cultural Livelihood Impact" : "Social Livelihood Impact";

  return (
    <Card
      delay={delay}
      variant="chart"
      hoverEffect={false}
      className="p-8 relative overflow-hidden flex flex-col justify-between"
    >
      {/* Subtle Background Artisan Watermark */}
      <div className="absolute -right-8 -bottom-8 pointer-events-none select-none opacity-[0.05] dark:opacity-[0.04]">
        <Users className="w-52 h-52 text-[#7A3F1E]" strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6 border-b border-[#6F848F]/20 dark:border-[#2F3C52]/70 pb-3">
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#8C9DA8]">
              {headerTitle}
            </h3>
            <p className="text-[11px] text-[#222326]/75 dark:text-[#8C9DA8] font-light mt-0.5">
              Empowering artisanal communities through direct procurement
            </p>
          </div>
          {/* Subtle cursive accent sparingly used */}
          {showCultural && (
            <span className="font-accent text-lg text-[#7A3F1E] dark:text-[#FAF6EE]/80 select-none">
              fair craft livelihood
            </span>
          )}
        </div>

        <div className="space-y-6">
          {/* Top metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Average Gender Representation (% Women) */}
            <motion.div
              className="flex items-center gap-4 p-4 rounded-lg bg-[#DFD8C2]/40 dark:bg-[#1A1C22]/80 border border-[#6F848F]/15 dark:border-[#8C9DA8]/15 shadow-elevation-low"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.15, duration: 0.5 }}
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#7A3F1E]/15 dark:bg-[#944D25]/25 text-[#7A3F1E] dark:text-[#FAF6EE] shadow-xs flex-shrink-0">
                <Users className="w-5 h-5 text-[#7A3F1E] dark:text-[#FAF6EE]" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-2xl font-serif font-light tracking-hero text-[#222326] dark:text-[#FAF6EE]">
                  {Math.round(womenWorkforcePercent)}%
                </div>
                <p className="text-[9px] text-[#6F848F] dark:text-[#8C9DA8] font-light uppercase tracking-wider mt-0.5">
                  Women Workforce
                </p>
              </div>
            </motion.div>

            {/* Average Wage Ratio */}
            <motion.div
              className="flex items-center gap-4 p-4 rounded-lg bg-[#DFD8C2]/40 dark:bg-[#1A1C22]/80 border border-[#6F848F]/15 dark:border-[#8C9DA8]/15 shadow-elevation-low"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2, duration: 0.5 }}
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#738678]/15 dark:bg-[#829888]/25 text-[#738678] dark:text-[#8AA391] shadow-xs flex-shrink-0">
                <Scale className="w-5 h-5 text-[#738678] dark:text-[#8AA391]" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-2xl font-serif font-light tracking-hero text-[#222326] dark:text-[#FAF6EE]">
                  {wageRatio.toFixed(2)}
                  <span className="text-[10px] font-sans font-light text-[#6F848F] dark:text-[#8C9DA8] ml-1">×</span>
                </div>
                <p className="text-[9px] text-[#6F848F] dark:text-[#8C9DA8] font-light uppercase tracking-wider mt-0.5">
                  Min Wage Ratio
                </p>
              </div>
            </motion.div>

            {/* Artisans Supported (Only if showCultural) */}
            {showCultural && (
              <motion.div
                className="flex items-center gap-4 p-4 rounded-lg bg-[#DFD8C2]/40 dark:bg-[#1A1C22]/80 border border-[#6F848F]/15 dark:border-[#8C9DA8]/15 shadow-elevation-low"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.25, duration: 0.5 }}
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#6F848F]/15 dark:bg-[#8298A5]/25 text-[#6F848F] dark:text-[#FAF6EE] shadow-xs flex-shrink-0">
                  <Users className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-2xl font-serif font-light tracking-hero text-[#222326] dark:text-[#FAF6EE]">
                    <AnimatedCounter value={artisansSupported} delay={delay + 0.3} />
                  </div>
                  <p className="text-[9px] text-[#6F848F] dark:text-[#8C9DA8] font-light uppercase tracking-wider mt-0.5">
                    Artisans Supported
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Gender Representation & Wage Ratio Lists */}
          {supplierImpactData && supplierImpactData.length > 0 && (
            <div className="mt-6 space-y-6 pt-2">
              {/* Gender Representation individually */}
              <div>
                <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-[#6F848F] dark:text-[#8C9DA8] mb-3 border-b border-[#6F848F]/15 dark:border-[#8C9DA8]/15 pb-1">
                  <span>Gender Inclusion by Enterprise</span>
                  <span className="text-[9px] lowercase font-light text-[#6F848F] dark:text-[#8C9DA8]">% women employed</span>
                </div>
                <div className="space-y-3">
                  {supplierImpactData.map((s, idx) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#6F848F] dark:text-[#8C9DA8] font-light">{s.name}</span>
                        <span className="font-semibold text-[#222326] dark:text-[#FAF6EE]">{Math.round(s.womenPct)}%</span>
                      </div>
                      <div className="h-1.5 bg-[#6F848F]/20 dark:bg-[#18191D] rounded-none overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-none bg-[#738678] dark:bg-[#829888]"
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
                <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-[#6F848F] dark:text-[#8C9DA8] mb-3 border-b border-[#6F848F]/15 dark:border-[#8C9DA8]/15 pb-1">
                  <span>Living Wages Multiple vs Statutory Minimum</span>
                  <span className="text-[9px] lowercase font-light text-[#6F848F] dark:text-[#8C9DA8]">benchmark multiplier</span>
                </div>
                <div className="space-y-3">
                  {supplierImpactData.map((s, idx) => (
                    <div key={`wage-${s.name}`} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#6F848F] dark:text-[#8C9DA8] font-light">{s.name}</span>
                        <span className="font-semibold text-[#7A3F1E] dark:text-[#E89260]">{s.wageRatio.toFixed(2)}× Min Wage</span>
                      </div>
                      <div className="h-1.5 bg-[#6F848F]/20 dark:bg-[#18191D] rounded-none overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-none bg-[#7A3F1E] dark:bg-[#944D25]"
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
