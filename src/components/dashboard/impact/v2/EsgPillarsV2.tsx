"use client";

import { motion } from "framer-motion";
import RadialGauge from "@/components/ui/RadialGauge";
import PillarBreakdownHoverCard from "@/components/ui/PillarBreakdownHoverCard";
import { Check } from "lucide-react";
import { PILLAR_CRITERIA_BREAKDOWN } from "@/lib/mock-data";

interface EsgPillarsV2Props {
  eScore?: number;
  sScore?: number;
  gScore?: number;
  pillarBreakdown?: Record<string, any>;
  womenWorkforcePercent?: number;
}

function getBandLabel(score: number): { label: string; bg: string; text: string; border: string } {
  if (score >= 85) return { label: "Leader", bg: "bg-[#55705A]/15 dark:bg-[#9DB4A0]/20", text: "text-[#55705A] dark:text-[#9DB4A0]", border: "border-[#55705A]/30" };
  if (score >= 70) return { label: "Advanced", bg: "bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20", text: "text-[#7D3F1E] dark:text-[#E07A57]", border: "border-[#7D3F1E]/30" };
  if (score >= 55) return { label: "Emerging", bg: "bg-[#6F8391]/15 dark:bg-[#93A9B8]/20", text: "text-[#6F8391] dark:text-[#93A9B8]", border: "border-[#6F8391]/30" };
  if (score >= 40) return { label: "Foundational", bg: "bg-black/10 dark:bg-white/10", text: "text-[#5B564E] dark:text-[#C2BCB0]", border: "border-black/20" };
  return { label: "Not Ready", bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400", border: "border-red-500/30" };
}

function getNextBandDistance(score: number): string | null {
  if (score < 40) return `${(40 - score).toFixed(1)} points to Foundational`;
  if (score < 55) return `${(55 - score).toFixed(1)} points to Emerging`;
  if (score < 70) return `${(70 - score).toFixed(1)} points to Advanced`;
  if (score < 85) return `${(85 - score).toFixed(1)} points to Leader`;
  return null;
}

const PILLARS_DATA = [
  {
    key: "E" as const,
    label: "Environmental",
    def: "Covers resource use, carbon intensity, material sustainability and circular product packaging.",
  },
  {
    key: "S" as const,
    label: "Social",
    def: "Covers employment quality, fair living wages, gender inclusion and artisan welfare.",
  },
  {
    key: "G" as const,
    label: "Governance",
    def: "Covers statutory registration, certifications, compliance and business ethics.",
  },
];

export default function EsgPillarsV2({
  eScore = 73.5,
  sScore = 77.2,
  gScore = 81.6,
  pillarBreakdown,
  womenWorkforcePercent = 78,
}: EsgPillarsV2Props) {
  const scores: Record<string, number> = {
    Environmental: eScore,
    Social: sScore,
    Governance: gScore,
  };

  // Determine highest scoring pillar for D3 insight
  let highestPillarName = "Governance";
  let highestScoreVal = 0;
  Object.entries(scores).forEach(([name, val]) => {
    if (val > highestScoreVal) {
      highestScoreVal = val;
      highestPillarName = name;
    }
  });

  return (
    <div className="mb-6 space-y-4">
      {/* Slim Section Header Row */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-black/[0.07] dark:border-white/[0.08]">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl lg:text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
            ESG Performance Pillars
          </h2>
          <span className="text-xs text-[#6F6A61] dark:text-[#9A948A] font-normal hidden sm:inline">
            Real-time calibrated gauges
          </span>
        </div>

        {/* Framework Calibrated Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 text-[#55705A] dark:text-[#9DB4A0] text-xs font-medium whitespace-nowrap shrink-0 border border-[#55705A]/25 dark:border-[#9DB4A0]/30">
          <Check className="w-3.5 h-3.5 text-[#55705A] dark:text-[#9DB4A0]" strokeWidth={2.5} />
          <span>Framework Calibrated</span>
        </div>
      </div>

      {/* 3 Pillar Cards Grid (4 cols each) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PILLARS_DATA.map((p, idx) => {
          const score = scores[p.label] || 70;
          const band = getBandLabel(score);
          const nextBandText = getNextBandDistance(score); // D2
          const breakdown = pillarBreakdown?.[p.label] ?? PILLAR_CRITERIA_BREAKDOWN[p.label];
          const isHighest = p.label === highestPillarName;

          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="
                varna-pillar-card-v2
                bg-white dark:bg-[#20242B]
                border border-black/[0.07] dark:border-white/[0.08]
                shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
                dark:shadow-none dark:border-t-white/[0.12]
                rounded-[24px] p-6 lg:p-7
                flex flex-col justify-between h-full w-full
                hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
                relative overflow-visible
              "
            >
              <div>
                {/* Header Row: Pillar Name + Band Pill */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-black/[0.07] dark:border-white/[0.08]">
                  <h3 className="text-xl font-medium text-[#1F1B16] dark:text-[#F3EFE7]">
                    {p.label}
                  </h3>

                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${band.bg} ${band.text} ${band.border}`}>
                    {band.label}
                  </div>
                </div>

                {/* Circular Gauge Block (Wrapped in PillarBreakdownHoverCard) */}
                <div className="py-6 flex flex-col items-center justify-center">
                  <PillarBreakdownHoverCard
                    pillarLabel={p.label}
                    pillarScore={breakdown?.pillarScore ?? Math.round(score)}
                    criteria={breakdown?.criteria ?? []}
                    color={score >= 80 ? "#738678" : score >= 70 ? "#6F848F" : "#7A3F1E"}
                  >
                    <div className="cursor-help transition-transform duration-200 hover:scale-[1.02]">
                      <RadialGauge
                        value={score}
                        size={176}
                        strokeWidth={12}
                        pillarKey={p.key}
                      />
                    </div>
                  </PillarBreakdownHoverCard>

                  {/* D1 Slim 6px 5-Segment Band Scale */}
                  <div className="w-full max-w-[200px] mt-5" aria-hidden="true">
                    <div className="flex items-center gap-1 h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 p-0.5 relative">
                      <div className="h-full w-[40%] bg-[#7A3F1E]/40 rounded-l-full" />
                      <div className="h-full w-[15%] bg-[#6F8391]/40" />
                      <div className="h-full w-[15%] bg-[#6E8471]/40" />
                      <div className="h-full w-[15%] bg-[#7D3F1E]/40" />
                      <div className="h-full w-[15%] bg-[#55705A]/40 rounded-r-full" />

                      {/* Score Marker */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#7D3F1E] dark:bg-[#E07A57] border-2 border-white dark:border-[#20242B] shadow-xs"
                        style={{ left: `${Math.min(95, Math.max(5, score))}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-[#6F6A61] dark:text-[#9A948A] mt-1 font-mono">
                      <span>0</span>
                      <span>40</span>
                      <span>55</span>
                      <span>70</span>
                      <span>85</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>

                {/* Description & D3 Derived Sentences */}
                <div className="space-y-1.5 pt-2 text-xs lg:text-[13px] text-[#5B564E] dark:text-[#C2BCB0] font-normal leading-relaxed">
                  <p>{p.def}</p>

                  {p.label === "Social" && (
                    <p className="text-[#55705A] dark:text-[#9DB4A0] font-medium">
                      Women make up {womenWorkforcePercent}% of supplier workforces.
                    </p>
                  )}

                  {isHighest && (
                    <p className="text-[#7D3F1E] dark:text-[#E07A57] font-medium">
                      Your strongest pillar ({score.toFixed(1)}).
                    </p>
                  )}
                </div>
              </div>

              {/* D2 Next Band Distance Footer */}
              {nextBandText && (
                <div className="pt-3 mt-4 border-t border-black/[0.07] dark:border-white/[0.08] text-[11px] text-[#6F6A61] dark:text-[#9A948A] font-medium">
                  {nextBandText}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
