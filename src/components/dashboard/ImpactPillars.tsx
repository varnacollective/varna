"use client";

import Card from "@/components/ui/Card";
import RadialGauge from "@/components/ui/RadialGauge";
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
  { key: "E" as const, label: "Environmental" },
  { key: "S" as const, label: "Social" },
  { key: "G" as const, label: "Governance" },
  { key: "C" as const, label: "Cultural" },
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

  // Dynamic grid: 3 cols centered when Cultural hidden, 4 cols when shown
  const gridCols = showCultural
    ? "grid-cols-2 md:grid-cols-4"
    : "grid-cols-3";

  return (
    <Card delay={delay} variant="chart" hoverEffect={false} className="p-8">


      <div className={`varna-pillars-grid grid ${gridCols} gap-8 justify-items-center`}>
        {visiblePillars.map((pillar) => {
          const originalIndex = PILLAR_CONFIG.findIndex((p) => p.key === pillar.key);
          const score = scores[originalIndex];
          const breakdown = pillarBreakdown?.[pillar.label] ?? PILLAR_CRITERIA_BREAKDOWN[pillar.label];
          const definition = PILLAR_DEFINITIONS[pillar.label];

          const pillarColor =
            pillar.key === "E" ? "#4C7355" :
            pillar.key === "S" ? "#B85333" :
            pillar.key === "G" ? "#36424A" :
            "#7A3F1E";

          return (
            <div key={pillar.key} className="flex flex-col items-center gap-2">
              {/* Radial Gauge: hover shows sub-pillar breakdown */}
              <PillarBreakdownHoverCard
                pillarLabel={pillar.label}
                pillarKey={pillar.key}
                pillarScore={breakdown?.pillarScore ?? Math.round(score)}
                criteria={breakdown?.criteria ?? []}
                color={pillarColor}
              >
                <div className="cursor-help">
                  <RadialGauge
                    value={score}
                    size={124}
                    strokeWidth={10}
                    pillarKey={pillar.key}
                    delay={delay + 0.08 * originalIndex}
                  />
                </div>
              </PillarBreakdownHoverCard>

              {/* Label: hover shows educational tooltip */}
              <PillarTooltip content={definition ?? pillar.label}>
                <span className="text-[11px] font-semibold text-[#1A1F26] dark:text-[#FAF8F5] uppercase tracking-[0.18em] text-center cursor-help hover:text-[#B85333] dark:hover:text-[#E07555] transition-colors duration-200 mt-1">
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
