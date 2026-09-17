// ─────────────────────────────────────────────────────────────────────────────
// Shared Motion Constants: Varna Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 300, damping: 30 };
export const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };
export const EASE_SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const POPOVER_ENTRANCE = {
  initial: { opacity: 0, scale: 0.96, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: 2 },
  transition: { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.6 },
};

export const DRAWER_TRANSITION = {
  type: "spring" as const,
  stiffness: 350,
  damping: 35,
  mass: 0.8,
};

export const STAGGER_DELAY = 0.05; // 50ms between items
export const STAGGER_FAST = 0.03;  // 30ms for dense lists (checklist rows)

export const SIGNATURE_GRADIENT = "linear-gradient(135deg, #7A3F1E, #2F3C52)";

/** Count-up duration for hero numbers (ms) */
export const COUNT_UP_DURATION = 800;

/** Performance band mapping (mirrors RadialGauge.tsx PERFORMANCE_BANDS) */
export function getPerformanceBand(score: number) {
  if (score >= 85) return { name: "Leader", color: "#738678", bg: "bg-sage-mineral/15", text: "text-sage-mineral", border: "border-sage-mineral/30" };
  if (score >= 70) return { name: "Advanced", color: "#6F848F", bg: "bg-slate-mist/15", text: "text-slate-mist", border: "border-slate-mist/30" };
  if (score >= 55) return { name: "Emerging", color: "#A89C82", bg: "bg-warm-stone/25", text: "text-[#5C5238] dark:text-warm-stone", border: "border-warm-stone/40" };
  if (score >= 40) return { name: "Foundational", color: "#7A3F1E", bg: "bg-deep-clay/15", text: "text-deep-clay", border: "border-deep-clay/30" };
  return { name: "Not Ready", color: "#7A3F1E", bg: "bg-deep-clay/20", text: "text-deep-clay", border: "border-deep-clay/40" };
}
