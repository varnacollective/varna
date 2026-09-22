"use client";

export interface ScoreBand {
  id: string;
  name: string;
  rangeLabel: string;
  minScore: number;
  maxScore: number;
  color: string;
  activeTextColor: string;
}

export const SCORE_BANDS: ScoreBand[] = [
  {
    id: "Not Ready",
    name: "Not Ready",
    rangeLabel: "<40",
    minScore: 0,
    maxScore: 39.999,
    color: "#B85333", // Terracotta Red-Orange (Needs Work)
    activeTextColor: "text-[#B85333] dark:text-[#E8856A]",
  },
  {
    id: "Foundational",
    name: "Foundational",
    rangeLabel: "40–54",
    minScore: 40,
    maxScore: 54.999,
    color: "#D97706", // Warm Amber
    activeTextColor: "text-[#D97706] dark:text-[#F59E0B]",
  },
  {
    id: "Emerging",
    name: "Emerging",
    rangeLabel: "55–69",
    minScore: 55,
    maxScore: 69.999,
    color: "#8C7F6B", // Neutral Warm Stone
    activeTextColor: "text-[#786C58] dark:text-[#C5BBA8]",
  },
  {
    id: "Advanced",
    name: "Advanced",
    rangeLabel: "70–84",
    minScore: 70,
    maxScore: 84.999,
    color: "#5B7594", // Slate Navy
    activeTextColor: "text-[#3E526A] dark:text-[#8AAEC6]",
  },
  {
    id: "Leader",
    name: "Leader",
    rangeLabel: "85+",
    minScore: 85,
    maxScore: 100,
    color: "#556B55", // Sage Olive / Green (Leader)
    activeTextColor: "text-[#47574B] dark:text-[#8AAE8A]",
  },
];

export function getActiveBandId(score: number): string {
  if (score >= 85) return "Leader";
  if (score >= 70) return "Advanced";
  if (score >= 55) return "Emerging";
  if (score >= 40) return "Foundational";
  return "Not Ready";
}

/**
 * Maps score (0..100) across 5 equal 20% grid columns:
 * - Not Ready (0..40 score -> 0%..20% bar width)
 * - Foundational (40..55 score -> 20%..40% bar width)
 * - Emerging (55..70 score -> 40%..60% bar width)
 * - Advanced (70..85 score -> 60%..80% bar width)
 * - Leader (85..100 score -> 80%..100% bar width)
 */
export function getScorePositionPercent(score: number): number {
  const clamped = Math.min(100, Math.max(0, score));
  if (clamped < 40) {
    return (clamped / 40) * 20;
  } else if (clamped < 55) {
    return 20 + ((clamped - 40) / 15) * 20;
  } else if (clamped < 70) {
    return 40 + ((clamped - 55) / 15) * 20;
  } else if (clamped < 85) {
    return 60 + ((clamped - 70) / 15) * 20;
  } else {
    return 80 + ((clamped - 85) / 15) * 20;
  }
}

interface VarnaScoreBandScaleProps {
  score: number;
  className?: string;
}

export default function VarnaScoreBandScale({ score, className = "" }: VarnaScoreBandScaleProps) {
  const activeBandId = getActiveBandId(score);
  const positionPercent = getScorePositionPercent(score);

  return (
    <div className={`w-full my-1 space-y-1 ${className}`}>
      {/* Marker Pin above bar */}
      <div className="relative w-full h-3">
        <div
          className="absolute -top-0.5 flex flex-col items-center -translate-x-1/2 z-20 transition-all duration-300 pointer-events-none"
          style={{ left: `${positionPercent}%` }}
          title={`Current Score: ${score.toFixed(1)}`}
        >
          <span className="text-[10px] leading-none text-[#7D3F1E] dark:text-[#E07A57] font-bold select-none">
            ▼
          </span>
        </div>
      </div>

      {/* 5 Equal-Width Segments in a 5-Column Grid */}
      <div className="w-full h-2.5 rounded-full overflow-hidden grid grid-cols-5 bg-black/5 dark:bg-white/10 relative p-0.5 gap-0.5">
        {SCORE_BANDS.map((band, idx) => (
          <div
            key={band.id}
            className={`h-full transition-opacity hover:opacity-90 ${
              idx === 0 ? "rounded-l-full" : ""
            } ${idx === SCORE_BANDS.length - 1 ? "rounded-r-full" : ""}`}
            style={{ backgroundColor: band.color }}
            title={`${band.name}: ${band.rangeLabel}`}
          />
        ))}

        {/* Solid Vertical Marker Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#1F1B16] dark:bg-white shadow-sm -ml-0.5 rounded-full z-10 pointer-events-none"
          style={{ left: `${positionPercent}%` }}
        />
      </div>

      {/* 5-Column Non-Overlapping Grid Legend */}
      <div className="grid grid-cols-5 w-full pt-1 px-0.5 gap-0.5">
        {SCORE_BANDS.map((band) => {
          const isActive = band.id === activeBandId;
          return (
            <div
              key={band.id}
              className="min-w-0 flex flex-col items-center justify-start text-center overflow-hidden px-0.5"
            >
              <span
                className={`
                  block w-full text-center leading-[1.15] tracking-tight select-none
                  break-words overflow-wrap-anywhere
                  ${
                    isActive
                      ? `font-bold ${band.activeTextColor} underline decoration-2 underline-offset-4`
                      : "font-medium text-[#6F6A61] dark:text-[#9A948A] opacity-75 hover:opacity-100"
                  }
                `}
                style={{
                  fontSize: "clamp(9px, 2.2vw, 11px)",
                  maxWidth: "100%",
                }}
                title={`${band.name} (${band.rangeLabel})`}
              >
                {band.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
