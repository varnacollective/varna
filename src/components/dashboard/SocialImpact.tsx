"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Users, Heart } from "lucide-react";

interface SocialImpactProps {
  artisansSupported: number;
  womenWorkforcePercent: number;
  delay?: number;
}

export default function SocialImpact({
  artisansSupported,
  womenWorkforcePercent,
  delay = 0,
}: SocialImpactProps) {
  return (
    <Card
      delay={delay}
      hoverEffect={false}
      accentColor="deep-clay"
      className="p-8 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6 border-b border-slate-mist/25 dark:border-midnight-blue pb-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/50">
          Social & Cultural Impact
        </h3>
        {/* Subtle cursive accent */}
        <span className="font-accent text-lg text-deep-clay dark:text-warm-stone/70 select-none">
          artisan empowered community
        </span>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Artisans Supported */}
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
              <div className="text-2xl font-sans font-light tracking-tight text-carbon-ink dark:text-warm-stone">
                <AnimatedCounter
                  value={artisansSupported}
                  delay={delay + 0.25}
                />
              </div>
              <p className="text-[10px] text-slate-mist dark:text-warm-stone/50 font-light uppercase tracking-wider mt-0.5">Artisans Supported</p>
            </div>
          </motion.div>

          {/* Women Workforce */}
          <motion.div
            className="flex items-center gap-4 border border-slate-mist/20 dark:border-midnight-blue p-4 bg-warm-stone/20 dark:bg-black/10"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.25, duration: 0.5 }}
          >
            <div className="flex items-center justify-center w-11 h-11 border border-sage-mineral/35 bg-sage-mineral/10 text-sage-mineral">
              <Heart className="w-5 h-5 text-sage-mineral" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-sans font-light tracking-tight text-carbon-ink dark:text-warm-stone">
                <AnimatedCounter
                  value={womenWorkforcePercent}
                  delay={delay + 0.35}
                  decimals={1}
                  suffix="%"
                />
              </div>
              <p className="text-[10px] text-slate-mist dark:text-warm-stone/50 font-light uppercase tracking-wider mt-0.5">Women Workforce</p>
            </div>
          </motion.div>
        </div>

        {/* Women percentage bar - solid and geometric */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-slate-mist dark:text-warm-stone/50">
            <span>Gender representation</span>
            <span className="font-semibold text-carbon-ink dark:text-warm-stone">{womenWorkforcePercent}% women</span>
          </div>
          
          <div className="h-2 bg-warm-stone/30 dark:bg-black/20 rounded-none overflow-hidden border border-slate-mist/20 dark:border-midnight-blue">
            <motion.div
              className="h-full rounded-none bg-sage-mineral" // solid sage-mineral bar
              initial={{ width: 0 }}
              animate={{ width: `${womenWorkforcePercent}%` }}
              transition={{
                duration: 1.2,
                delay: delay + 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
