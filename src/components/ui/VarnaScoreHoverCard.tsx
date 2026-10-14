"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Leaf, Users, Shield, Palette, AlertTriangle, X } from "lucide-react";
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
  className?: string;
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
  className,
}: VarnaScoreHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "below" as "below" | "above" });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
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

  const handleClick = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      calculatePosition();
      setIsOpen(true);
    }
  }, [isOpen, calculatePosition]);

  // Click-outside and Escape key listener for accessible dismissal
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#B85333] focus-visible:ring-offset-2 rounded-xl transition-all ${className ?? "inline-block"}`}
        title="Click to view Sutra Verified Score breakdown"
      >
        {children}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 z-[9998] bg-black/25 backdrop-blur-xs"
                />
                <motion.div
                  ref={popoverRef}
                  {...POPOVER_ENTRANCE}
                  className="fixed z-[9999] pointer-events-auto transform-gpu will-change-transform"
                  style={{ top: position.top, left: position.left, width: CARD_WIDTH }}
                >
                  <div
                    className="
                      bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl
                      border border-[#E5DEC9] dark:border-white/10
                      shadow-2xl rounded-2xl
                      font-sans select-none overflow-hidden transform-gpu
                    "
                  >
                    {/* Colored top border */}
                    <div className="h-1 w-full" style={{ backgroundColor: band.color }} />

                    <div className="p-6">
                      {/* ── Header ─────────────────────────────────── */}
                      <div className="flex items-start justify-between mb-5 pb-4 border-b border-[#E8E3DA] dark:border-white/10">
                        <div>
                          <h4 className="text-xs font-sans font-semibold tracking-wider uppercase text-[#1C1917] dark:text-[#FAF8F5] leading-tight">
                            SUTRA VERIFIED SCORE
                          </h4>
                          <p className="text-[10px] text-[#8C827A] dark:text-warm-stone/50 mt-1 font-light tracking-wide">
                            {supplierName && supplierName !== "Portfolio Average" ? supplierName : "Simple arithmetic average across your active purchasing partners"}
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-baseline gap-0.5">
                              <CountUpNumber
                                value={score}
                                className="text-3xl font-serif font-light tracking-tight text-[#1C1917] dark:text-[#FAF8F5]"
                              />
                              <span className="text-xs font-normal text-[#8C827A] dark:text-warm-stone/60 ml-0.5">
                                / 100
                              </span>
                            </div>
                            <span className={`text-[8px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${band.bg} ${band.text} ${band.border}`}>
                              {band.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                            }}
                            className="p-1 rounded-md text-[#8C827A] hover:text-[#1C1917] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            aria-label="Close"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* ── Impact Section (50%) ────────────────────── */}
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <Leaf className="w-3.5 h-3.5 text-[#3A5A40]" strokeWidth={2} />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#1C1917] dark:text-warm-stone/80">
                              Impact
                            </span>
                          </div>
                          <span className="text-[9px] font-medium uppercase tracking-widest text-[#3A5A40] bg-[#3A5A40]/10 px-2 py-0.5 rounded-full border border-[#3A5A40]/20">
                            50% Weightage
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          {pillars.map((p, idx) => {
                            const PillarIcon = p.icon;
                            return (
                              <div key={p.key} className="flex items-center gap-2.5">
                                <PillarIcon className="w-3.5 h-3.5 flex-shrink-0 text-[#8C827A]" strokeWidth={1.5} />
                                <span className="text-[10px] w-[72px] text-[#57534E] dark:text-warm-stone/60 font-light tracking-wide truncate">
                                  {p.label}
                                </span>
                                <div className="flex-1 h-2 rounded-full bg-[#EFECE6] dark:bg-black/40 overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: getPillarBarColor(p.key) }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${p.value}%` }}
                                    transition={{ duration: 0.7, delay: idx * STAGGER_DELAY + 0.15, ease: EASE_SMOOTH }}
                                  />
                                </div>
                                <span className="text-[10px] font-medium text-[#1C1917] dark:text-warm-stone/80 tabular-nums w-7 text-right">
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
                            <Shield className="w-3.5 h-3.5 text-[#6F848F]" strokeWidth={2} />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#1C1917] dark:text-warm-stone/80">
                              Readiness
                            </span>
                          </div>
                          <span className="text-[9px] font-medium uppercase tracking-widest text-[#6F848F] bg-[#6F848F]/10 px-2 py-0.5 rounded-full border border-[#6F848F]/20">
                            30% Weightage
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <Shield className="w-3.5 h-3.5 flex-shrink-0 text-[#8C827A]" strokeWidth={1.5} />
                              <span className="text-[10px] text-[#57534E] dark:text-warm-stone/60 font-light tracking-wide leading-tight">
                                Management, certifications & documentation
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-[#1C1917] dark:text-warm-stone/80 tabular-nums w-7 text-right shrink-0">
                              {readinessScore}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#EFECE6] dark:bg-black/40 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
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
                            <AlertTriangle className="w-3.5 h-3.5 text-[#9A4A2E]" strokeWidth={2} />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#1C1917] dark:text-warm-stone/80">
                              Risk
                            </span>
                          </div>
                          <span className="text-[9px] font-medium uppercase tracking-widest text-[#9A4A2E] bg-[#9A4A2E]/10 px-2 py-0.5 rounded-full border border-[#9A4A2E]/20">
                            20% Weightage
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-[#8C827A]" strokeWidth={1.5} />
                          <span className="text-[10px] w-[72px] text-[#57534E] dark:text-warm-stone/60 font-light tracking-wide truncate">
                            Compliance
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-[#EFECE6] dark:bg-black/40 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: getPillarBarColor("S") }}
                              initial={{ width: 0 }}
                              animate={{ width: `${100 - riskScore}%` }}
                              transition={{ duration: 0.7, delay: 0.45, ease: EASE_SMOOTH }}
                            />
                          </div>
                          <span className={`text-[10px] font-medium tabular-nums w-7 text-right ${riskIsHigh ? "text-[#9A4A2E]" : "text-[#1C1917] dark:text-warm-stone/80"}`}>
                            {100 - riskScore}
                          </span>
                        </div>
                      </div>

                      {/* ── Footer Note ─────────────────────────────── */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="pt-4 border-t border-[#E8E3DA] dark:border-white/10"
                      >
                        <p className="text-[9px] italic text-[#8C827A] dark:text-warm-stone/40 font-light leading-relaxed">
                          Calculated using the Sutra Assessment Framework 2.0.
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
