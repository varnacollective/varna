"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Leaf, Users, Shield, Palette, AlertTriangle } from "lucide-react";
import { POPOVER_ENTRANCE, EASE_SMOOTH, STAGGER_DELAY } from "@/lib/motion";
import { getPerformanceBand } from "@/lib/motion";

// ── Types ────────────────────────────────────────────────────────────────────

export interface VarnaScoreData {
  score: number;
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
  supplierName?: string;
}

interface VarnaScoreHoverCardProps extends VarnaScoreData {
  children: ReactNode;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPillarBarColor(key: string): string {
  if (key === "E" || key.toLowerCase().includes("env")) return "#4C7355"; // Green
  if (key === "S" || key.toLowerCase().includes("soc")) return "#B85333"; // Red/Terracotta
  if (key === "G" || key.toLowerCase().includes("gov")) return "#36424A"; // Blue/Slate
  return "#7A3F1E"; // Cultural
}

const SECTION_ICONS = {
  impact: Leaf,
  readiness: Shield,
  risk: AlertTriangle,
} as const;

const PILLAR_ICONS = [Leaf, Users, Shield, Palette];

// ── Animated Count-Up ────────────────────────────────────────────────────────

function CountUpNumber({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(0, { stiffness: 50, damping: 30, duration: 800 });
  const display = useTransform(spring, (v) => (v % 1 === 0 ? Math.round(v).toString() : v.toFixed(1)));
  const [str, setStr] = useState(value % 1 === 0 ? value.toString() : value.toFixed(1));

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => setStr(String(v)));
    return unsub;
  }, [value, spring, display]);

  return <span className={className}>{str}</span>;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function VarnaScoreHoverCard({
  score,
  eScore,
  sScore,
  gScore,
  cScore,
  supplierName,
  children,
}: VarnaScoreHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "below" as "below" | "above" });
  const triggerRef = useRef<HTMLDivElement>(null);
  const enterTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const CARD_HEIGHT = 420;
  const CARD_WIDTH = 360;

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const placement = spaceBelow < CARD_HEIGHT + 16 ? "above" : "below";

    let top = placement === "below" ? rect.bottom + 8 : rect.top - CARD_HEIGHT - 8;
    top = Math.max(8, Math.min(top, viewportHeight - CARD_HEIGHT - 8));

    let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - CARD_WIDTH - 16));

    setPosition({ top, left, placement });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeout.current) { clearTimeout(leaveTimeout.current); leaveTimeout.current = null; }
    enterTimeout.current = setTimeout(() => { calculatePosition(); setIsOpen(true); }, 300);
  }, [calculatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (enterTimeout.current) { clearTimeout(enterTimeout.current); enterTimeout.current = null; }
    leaveTimeout.current = setTimeout(() => { setIsOpen(false); }, 150);
  }, []);

  const handleClick = useCallback(() => {
    if (isOpen) { setIsOpen(false); return; }
    calculatePosition();
    setIsOpen(true);
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    return () => {
      if (enterTimeout.current) clearTimeout(enterTimeout.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    };
  }, []);

  // Derived scores
  const readinessScore = Math.round((gScore + cScore) / 2);
  const riskScore = Math.round(100 - (eScore * 0.3 + sScore * 0.3 + gScore * 0.2 + cScore * 0.2));
  const riskIsHigh = riskScore > 50;
  const band = getPerformanceBand(score);

  const pillars = [
    { key: "E", label: "Environmental", value: eScore, icon: Leaf },
    { key: "S", label: "Social", value: sScore, icon: Users },
    { key: "G", label: "Governance", value: gScore, icon: Shield },
    { key: "C", label: "Cultural", value: cScore, icon: Palette },
  ];

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="inline-block cursor-help"
      >
        {children}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                {...POPOVER_ENTRANCE}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="fixed z-[9999] pointer-events-auto transform-gpu will-change-transform"
                style={{ top: position.top, left: position.left, width: CARD_WIDTH }}
              >
                <div
                  className="
                    bg-white/95 dark:bg-carbon-ink/95 backdrop-blur-xl
                    border border-slate-mist/30 dark:border-slate-mist/20
                    shadow-[0_8px_40px_rgba(47,60,82,0.18)] dark:shadow-[0_12px_50px_rgba(0,0,0,0.55)]
                    font-sans select-none overflow-hidden transform-gpu
                  "
                >
                  {/* Colored top border */}
                  <div className="h-1 w-full" style={{ backgroundColor: band.color }} />

                  <div className="p-6">
                    {/* ── Header ─────────────────────────────────── */}
                    <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-mist/20 dark:border-midnight-blue">
                      <div>
                        <h4 className="text-xs font-sans font-semibold tracking-wider uppercase text-carbon-ink dark:text-warm-stone leading-tight">
                          VARNA VERIFIED PARTNER SCORE
                        </h4>
                        <p className="text-[10px] text-slate-mist dark:text-warm-stone/50 mt-1 font-light tracking-wide">
                          {supplierName && supplierName !== "Portfolio Average" ? supplierName : "Weighted average across your verified suppliers"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-baseline gap-0.5">
                          <CountUpNumber
                            value={score}
                            className="text-3xl font-sans font-medium tracking-tighter text-carbon-ink dark:text-warm-stone"
                          />
                          <span className="text-xs font-normal text-slate-mist/80 dark:text-warm-stone/60 ml-0.5">
                            / 100
                          </span>
                        </div>
                        <span className={`text-[8px] font-semibold uppercase tracking-widest px-2 py-0.5 border ${band.bg} ${band.text} ${band.border}`}>
                          {band.name}
                        </span>
                      </div>
                    </div>

                    {/* ── Impact Section (50%) ────────────────────── */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <Leaf className="w-3 h-3 text-sage-mineral" strokeWidth={2} />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-carbon-ink dark:text-warm-stone/80">
                            Impact
                          </span>
                        </div>
                        <span className="text-[8px] font-semibold uppercase tracking-widest text-sage-mineral bg-sage-mineral/10 px-2 py-0.5 border border-sage-mineral/20">
                          50% Weightage
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {pillars.map((p, idx) => {
                          const PillarIcon = p.icon;
                          return (
                            <div key={p.key} className="flex items-center gap-2.5">
                              <PillarIcon className="w-3 h-3 flex-shrink-0 text-slate-mist/60" strokeWidth={1.5} />
                              <span className="text-[10px] w-[72px] text-slate-mist dark:text-warm-stone/60 font-light tracking-wide truncate">
                                {p.label}
                              </span>
                              <div className="flex-1 h-1.5 bg-warm-stone/20 dark:bg-black/25 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-r-sm"
                                  style={{ backgroundColor: getPillarBarColor(p.key) }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${p.value}%` }}
                                  transition={{ duration: 0.7, delay: idx * STAGGER_DELAY + 0.15, ease: EASE_SMOOTH }}
                                />
                              </div>
                              <span className="text-[10px] font-medium text-carbon-ink dark:text-warm-stone/80 tabular-nums font-mono w-7 text-right">
                                {p.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Readiness Section (30%) ─────────────────── */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-slate-mist" strokeWidth={2} />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-carbon-ink dark:text-warm-stone/80">
                            Readiness
                          </span>
                        </div>
                        <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-mist bg-slate-mist/10 px-2 py-0.5 border border-slate-mist/20">
                          30% Weightage
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <Shield className="w-3 h-3 flex-shrink-0 text-slate-mist/60" strokeWidth={1.5} />
                            <span className="text-[10px] text-slate-mist dark:text-warm-stone/60 font-light tracking-wide leading-tight">
                              Management, certifications & documentation
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-carbon-ink dark:text-warm-stone/80 tabular-nums font-mono w-7 text-right shrink-0">
                            {readinessScore}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-warm-stone/20 dark:bg-black/25 overflow-hidden">
                          <motion.div
                            className="h-full rounded-r-sm"
                            style={{ backgroundColor: getPillarBarColor("G") }}
                            initial={{ width: 0 }}
                            animate={{ width: `${readinessScore}%` }}
                            transition={{ duration: 0.7, delay: 0.35, ease: EASE_SMOOTH }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Risk Section (20%) ──────────────────────── */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-deep-clay" strokeWidth={2} />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-carbon-ink dark:text-warm-stone/80">
                            Risk
                          </span>
                        </div>
                        <span className="text-[8px] font-semibold uppercase tracking-widest text-deep-clay bg-deep-clay/10 px-2 py-0.5 border border-deep-clay/20">
                          20% Weightage
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0 text-slate-mist/60" strokeWidth={1.5} />
                        <span className="text-[10px] w-[72px] text-slate-mist dark:text-warm-stone/60 font-light tracking-wide truncate">
                          Compliance
                        </span>
                        <div className="flex-1 h-1.5 bg-warm-stone/20 dark:bg-black/25 overflow-hidden">
                          <motion.div
                            className="h-full rounded-r-sm"
                            style={{ backgroundColor: getPillarBarColor("S") }}
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - riskScore}%` }}
                            transition={{ duration: 0.7, delay: 0.45, ease: EASE_SMOOTH }}
                          />
                        </div>
                        <span className={`text-[10px] font-medium tabular-nums font-mono w-7 text-right ${riskIsHigh ? "text-deep-clay" : "text-carbon-ink dark:text-warm-stone/80"}`}>
                          {100 - riskScore}
                        </span>
                      </div>
                    </div>

                    {/* ── Footer Note ─────────────────────────────── */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      className="pt-4 border-t border-slate-mist/15 dark:border-midnight-blue/60"
                    >
                      <p className="text-[9px] italic text-slate-mist dark:text-warm-stone/40 font-light leading-relaxed">
                        Calculated using the Varna Framework 2.0.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
