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
      <div className="flex justify-between items-center mb-8 border-b border-[#6F848F]/20 dark:border-[#8C9DA8]/20 pb-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#8C9DA8]">
          ESG Performance Pillars · Real-time Gauges
        </h3>
        <span className="text-[9px] font-sans font-semibold uppercase tracking-widest text-[#738678] dark:text-[#8AA391] bg-[#738678]/10 dark:bg-[#829888]/15 px-2.5 py-0.5 rounded-full border border-[#738678]/25 dark:border-[#829888]/30">
          Framework Calibrated
        </span>
      </div>

      <div className={`grid ${gridCols} gap-8 justify-items-center`}>
        {visiblePillars.map((pillar) => {
          const originalIndex = PILLAR_CONFIG.findIndex((p) => p.key === pillar.key);
          const score = scores[originalIndex];
          const breakdown = pillarBreakdown?.[pillar.label] ?? PILLAR_CRITERIA_BREAKDOWN[pillar.label];
          const definition = PILLAR_DEFINITIONS[pillar.label];

          return (
            <div key={pillar.key} className="flex flex-col items-center gap-2">
              {/* Radial Gauge — hover shows sub-pillar breakdown */}
              <PillarBreakdownHoverCard
                pillarLabel={pillar.label}
                pillarScore={breakdown?.pillarScore ?? Math.round(score)}
                criteria={breakdown?.criteria ?? []}
                color={score >= 80 ? "#738678" : score >= 70 ? "#6F848F" : "#7A3F1E"}
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

              {/* Label — hover shows educational tooltip */}
              <PillarTooltip content={definition ?? pillar.label}>
                <span className="text-[11px] font-semibold text-[#222326] dark:text-[#FAF6EE] uppercase tracking-[0.18em] text-center cursor-help hover:text-[#7A3F1E] dark:hover:text-[#E89260] transition-colors duration-200 mt-1">
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
