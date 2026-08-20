"use client";

import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";

interface ImpactPillarsProps {
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
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
  delay = 0,
}: ImpactPillarsProps) {
  const scores = [eScore, sScore, gScore, cScore];

  // Dynamically compute the color using our brand palette
  const getPillarColor = (score: number) => {
    if (score >= 80) return "#738678"; // (sage-mineral) sustainability positive indicators
    if (score >= 75) return "#6F848F"; // (slate-mist) moderate
    return "#7A3F1E";                  // (deep-clay) warning / highlight accents
  };

  return (
    <Card delay={delay} hoverEffect={false} className="p-8">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/50 mb-8 border-b border-slate-mist/20 dark:border-midnight-blue pb-3">
        ESG Performance Pillars
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {PILLAR_CONFIG.map((pillar, i) => (
          <ProgressRing
            key={pillar.key}
            value={scores[i]}
            color={getPillarColor(scores[i])}
            label={pillar.label}
            delay={delay + 0.08 * i}
            size={110}
            strokeWidth={6}
          />
        ))}
      </div>
    </Card>
  );
}
