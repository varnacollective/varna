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
  cScore?: number;
  pillarBreakdown?: Record<string, any>;
  delay?: number;
}

const PILLAR_CONFIG = [
  { key: "E" as const, label: "Environmental", color: "#4C7355" },
  { key: "S" as const, label: "Social", color: "#B85333" },
  { key: "G" as const, label: "Governance", color: "#36424A" },
];

export default function ImpactPillars({
  eScore,
  sScore,
  gScore,
  pillarBreakdown,
  delay = 0,
}: ImpactPillarsProps) {
  const scores: Record<string, number> = {
    Environmental: eScore,
    Social: sScore,
    Governance: gScore,
  };

  return (
    <Card delay={delay} variant="chart" hoverEffect={false} className="p-8">
      {/* Accommodates exactly 3 ESG pillars evenly distributed and centered */}
      <div className="varna-pillars-grid grid grid-cols-3 gap-8 justify-items-center w-full">
        {PILLAR_CONFIG.map((pillar, idx) => {
          const score = scores[pillar.label] ?? 0;
          const breakdown = pillarBreakdown?.[pillar.label] ?? PILLAR_CRITERIA_BREAKDOWN[pillar.label];
          const definition = PILLAR_DEFINITIONS[pillar.label];

          return (
            <div key={pillar.key} className="flex flex-col items-center gap-2">
              {/* Radial Gauge: hover shows sub-pillar breakdown */}
              <PillarBreakdownHoverCard
                pillarLabel={pillar.label}
                pillarKey={pillar.key}
                pillarScore={breakdown?.pillarScore ?? Math.round(score)}
                criteria={breakdown?.criteria ?? []}
                color={pillar.color}
              >
                <div className="cursor-help">
                  <RadialGauge
                    value={score}
                    size={124}
                    strokeWidth={10}
                    pillarKey={pillar.key}
                    delay={delay + 0.08 * idx}
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
