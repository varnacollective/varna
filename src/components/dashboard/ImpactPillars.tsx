"use client";

import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import PillarTooltip from "@/components/ui/PillarTooltip";
import PillarBreakdownHoverCard from "@/components/ui/PillarBreakdownHoverCard";
import {
  PILLAR_DEFINITIONS,
  PILLAR_CRITERIA_BREAKDOWN,
} from "@/lib/mock-data";

interface ImpactPillarsProps {
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
  pillarBreakdown?: Record<string, any>;
  delay?: number;
}

const PILLAR_CONFIG = [
  { key: "E", label: "Environmental" },
  { key: "S", label: "Social" },
  { key: "G", label: "Governance" },
  { key: "C", label: "Cultural" },
];

export default function ImpactPillars({
  eScore,
  sScore,
  gScore,
  cScore,
  pillarBreakdown,
  delay = 0,
}: ImpactPillarsProps) {
  const scores = [eScore, sScore, gScore, cScore];

  // If Cultural score is 0, filter it out
  const showCultural = cScore > 0;
  const visiblePillars = showCultural
    ? PILLAR_CONFIG
    : PILLAR_CONFIG.filter((p) => p.key !== "C");

  // Dynamically compute the color using our brand palette
  const getPillarColor = (score: number) => {
    if (score >= 80) return "#738678"; // (sage-mineral) sustainability positive indicators
    if (score >= 75) return "#6F848F"; // (slate-mist) moderate
    return "#7A3F1E";                  // (deep-clay) warning / highlight accents
  };

  // Dynamic grid: 3 cols centered when Cultural hidden, 4 cols when shown
  const gridCols = showCultural
    ? "grid-cols-2 md:grid-cols-4"
    : "grid-cols-3";

  return (
    <Card delay={delay} hoverEffect={false} className="p-8">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/50 mb-8 border-b border-slate-mist/20 dark:border-midnight-blue pb-3">
        ESG Performance Pillars
      </h3>
      <div className={`grid ${gridCols} gap-6 justify-items-center`}>
        {visiblePillars.map((pillar) => {
          const originalIndex = PILLAR_CONFIG.findIndex((p) => p.key === pillar.key);
          const score = scores[originalIndex];
          const pillarColor = getPillarColor(score);
          const breakdown = pillarBreakdown?.[pillar.label] ?? PILLAR_CRITERIA_BREAKDOWN[pillar.label];
          const definition = PILLAR_DEFINITIONS[pillar.label];

          return (
            <div key={pillar.key} className="flex flex-col items-center gap-3">
              {/* Score Ring — hover shows sub-pillar breakdown */}
              <PillarBreakdownHoverCard
                pillarLabel={pillar.label}
                pillarScore={breakdown?.pillarScore ?? Math.round(score)}
                criteria={breakdown?.criteria ?? []}
                color={pillarColor}
              >
                <ProgressRing
                  value={score}
                  color={pillarColor}
                  label=""
                  delay={delay + 0.08 * originalIndex}
                  size={110}
                  strokeWidth={6}
                />
              </PillarBreakdownHoverCard>

              {/* Label — hover shows educational tooltip */}
              <PillarTooltip content={definition ?? pillar.label}>
                <span className="text-[10px] font-semibold text-slate-mist dark:text-warm-stone/60 uppercase tracking-[0.2em] text-center cursor-help hover:text-carbon-ink dark:hover:text-warm-stone transition-colors duration-200">
                  {pillar.label}
                </span>
              </PillarTooltip>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
