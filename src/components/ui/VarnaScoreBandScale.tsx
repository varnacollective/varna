"use client";

export interface ScoreBand {
  id: string;
  name: string;
  rangeLabel: string;
  minScore: number;
  maxScore: number;
  widthPercent: number;
  color: string;
  activeTextColor: string;
}

/**
 * Single source of truth for Varna Performance Band Scoring Config
 * Not Ready: <40
 * Foundational: 40–54
 * Emerging: 55–69
 * Advanced: 70–84
 * Leader: 85+
 */
export const SCORE_BANDS: ScoreBand[] = [
  {
    id: "Not Ready",
    name: "Not Ready",
    rangeLabel: "<40",
    minScore: 0,
    maxScore: 39.999,
    widthPercent: 40,
    color: "#B85333", // Terracotta Red-Orange (Needs Work)
    activeTextColor: "text-[#B85333] dark:text-[#E8856A]",
  },
  {
    id: "Foundational",
    name: "Foundational",
    rangeLabel: "40–54",
    minScore: 40,
    maxScore: 54.999,
    widthPercent: 15,
    color: "#D97706", // Warm Amber
    activeTextColor: "text-[#D97706] dark:text-[#F59E0B]",
  },
  {
    id: "Emerging",
    name: "Emerging",
    rangeLabel: "55–69",
    minScore: 55,
    maxScore: 69.999,
    widthPercent: 15,
    color: "#8C7F6B", // Neutral Warm Stone
    activeTextColor: "text-[#786C58] dark:text-[#C5BBA8]",
  },
  {
    id: "Advanced",
    name: "Advanced",
    rangeLabel: "70–84",
    minScore: 70,
    maxScore: 84.999,
    widthPercent: 15,
    color: "#5B7594", // Slate Navy
    activeTextColor: "text-[#3E526A] dark:text-[#8AAEC6]",
  },
  {
    id: "Leader",
    name: "Leader",
    rangeLabel: "85+",
    minScore: 85,
    maxScore: 100,
    widthPercent: 15,
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

interface VarnaScoreBandScaleProps {
  score: number;
  className?: string;
}

export default function VarnaScoreBandScale({ score, className = "" }: VarnaScoreBandScaleProps) {
  const activeBandId = getActiveBandId(score);
  const clampedScore = Math.min(100, Math.max(0, score));

  return (
    <div className={`w-full my-1 space-y-1 ${className}`}>
      {/* Marker Pin above bar */}
      <div className="relative w-full h-3">
        <div
          className="absolute -top-0.5 flex flex-col items-center -translate-x-1/2 z-20 transition-all duration-300 pointer-events-none"
          style={{ left: `${clampedScore}%` }}
          title={`Current Score: ${score.toFixed(1)}`}
        >
          <span className="text-[10px] leading-none text-[#7D3F1E] dark:text-[#E07A57] font-bold select-none">
            ▼
          </span>
        </div>
      </div>

      {/* 5 Distinct Colored Segments */}
      <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/10 relative p-0.5 gap-0.5">
        {SCORE_BANDS.map((band, idx) => (
          <div
            key={band.id}
            className={`h-full transition-opacity hover:opacity-90 ${
              idx === 0 ? "rounded-l-full" : ""
            } ${idx === SCORE_BANDS.length - 1 ? "rounded-r-full" : ""}`}
            style={{ width: `${band.widthPercent}%`, backgroundColor: band.color }}
            title={`${band.name}: ${band.rangeLabel}`}
          />
        ))}

        {/* Solid Vertical Marker Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#1F1B16] dark:bg-white shadow-sm -ml-0.5 rounded-full z-10 pointer-events-none"
          style={{ left: `${clampedScore}%` }}
        />
      </div>

      {/* Band Scale Legend: Desktop/Tablet 1-Line Layout */}
      <div className="hidden sm:flex w-full justify-between items-center px-0.5 pt-0.5">
        {SCORE_BANDS.map((band) => {
          const isActive = band.id === activeBandId;
          return (
            <div
              key={band.id}
              className="flex justify-center items-center text-center px-0.5"
              style={{ width: `${band.widthPercent}%` }}
            >
              <span
                className={`transition-all duration-200 select-none ${
                  isActive
                    ? `font-bold text-[11px] sm:text-[11.5px] ${band.activeTextColor} underline decoration-2 underline-offset-4`
                    : "font-medium text-[10.5px] sm:text-[11px] text-[#6F6A61] dark:text-[#9A948A] opacity-70 hover:opacity-100"
                }`}
                title={`${band.name} (${band.rangeLabel})`}
              >
                {band.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Band Scale Legend: Mobile Narrow 2-Line Layout (3 + 2) */}
      <div className="flex sm:hidden flex-col gap-1 w-full px-0.5 pt-0.5 text-[11px]">
        {/* Row 1: Not Ready, Foundational, Emerging */}
        <div className="flex w-full items-center justify-between">
          {SCORE_BANDS.slice(0, 3).map((band) => {
            const isActive = band.id === activeBandId;
            const width = band.id === "Not Ready" ? "40%" : "30%";
            return (
              <div
                key={band.id}
                className="flex justify-center items-center text-center px-0.5"
                style={{ width }}
              >
                <span
                  className={`transition-all duration-200 select-none ${
                    isActive
                      ? `font-bold ${band.activeTextColor} underline decoration-2 underline-offset-4`
                      : "font-medium text-[#6F6A61] dark:text-[#9A948A] opacity-70 hover:opacity-100"
                  }`}
                  title={`${band.name} (${band.rangeLabel})`}
                >
                  {band.name}
                </span>
              </div>
            );
          })}
        </div>
        {/* Row 2: Advanced, Leader */}
        <div className="flex w-full items-center justify-between">
          <div className="w-[40%]" /> {/* Spacer aligning with Not Ready segment */}
          {SCORE_BANDS.slice(3, 5).map((band) => {
            const isActive = band.id === activeBandId;
            return (
              <div
                key={band.id}
                className="flex justify-center items-center text-center px-0.5 w-[30%]"
              >
                <span
                  className={`transition-all duration-200 select-none ${
                    isActive
                      ? `font-bold ${band.activeTextColor} underline decoration-2 underline-offset-4`
                      : "font-medium text-[#6F6A61] dark:text-[#9A948A] opacity-70 hover:opacity-100"
                  }`}
                  title={`${band.name} (${band.rangeLabel})`}
                >
                  {band.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
