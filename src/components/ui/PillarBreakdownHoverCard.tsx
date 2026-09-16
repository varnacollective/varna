"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { PillarCriterion } from "@/lib/mock-data";
import { POPOVER_ENTRANCE, EASE_SMOOTH, STAGGER_DELAY } from "@/lib/motion";

interface PillarBreakdownHoverCardProps {
  pillarLabel: string;
  pillarScore: number;
  criteria: PillarCriterion[];
  color: string;
  children: ReactNode;
}

function getBarColor(value: number): string {
  if (value >= 70) return "#738678"; // sage-mineral — strong
  if (value >= 40) return "#6F848F"; // slate-mist — moderate
  return "#7A3F1E";                  // deep-clay — weak
}

function getBarBadge(value: number) {
  if (value >= 70) return { label: "Strong", bg: "bg-sage-mineral/10", text: "text-sage-mineral", border: "border-sage-mineral/20" };
  if (value >= 40) return { label: "Moderate", bg: "bg-slate-mist/10", text: "text-slate-mist", border: "border-slate-mist/20" };
  return { label: "Weak", bg: "bg-deep-clay/10", text: "text-deep-clay", border: "border-deep-clay/20" };
}

export default function PillarBreakdownHoverCard({
  pillarLabel,
  pillarScore,
  criteria,
  color,
  children,
}: PillarBreakdownHoverCardProps) {
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

  const CARD_WIDTH = 340;
  const CARD_HEIGHT_ESTIMATE = Math.min(100 + criteria.length * 52, 500);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const placement = spaceBelow < CARD_HEIGHT_ESTIMATE + 16 ? "above" : "below";

    let top = placement === "below" ? rect.bottom + 10 : rect.top - CARD_HEIGHT_ESTIMATE - 10;
    top = Math.max(8, Math.min(top, viewportHeight - CARD_HEIGHT_ESTIMATE - 8));

    let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - CARD_WIDTH - 16));

    setPosition({ top, left, placement });
  }, [CARD_HEIGHT_ESTIMATE]);

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
                className="fixed z-[9999] pointer-events-auto"
                style={{ top: position.top, left: position.left, width: CARD_WIDTH }}
              >
                <div
                  className="
                    bg-white/95 dark:bg-carbon-ink/95 backdrop-blur-xl
                    border border-slate-mist/30 dark:border-slate-mist/20
                    shadow-[0_8px_40px_rgba(47,60,82,0.18)] dark:shadow-[0_12px_50px_rgba(0,0,0,0.55)]
                    font-sans select-none overflow-hidden
                  "
                >
                  {/* Colored top border */}
                  <div className="h-1 w-full" style={{ backgroundColor: color }} />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-mist/20 dark:border-midnight-blue">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <h4 className="text-base font-sans font-medium tracking-tight text-carbon-ink dark:text-warm-stone">
                          {pillarLabel}
                        </h4>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-sans font-medium tracking-tighter text-carbon-ink dark:text-warm-stone">
                          {pillarScore}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-slate-mist dark:text-warm-stone/40">
                          /100
                        </span>
                      </div>
                    </div>

                    {/* Criteria Rows */}
                    <div className="space-y-3.5">
                      {criteria.map((c, idx) => {
                        const barBadge = getBarBadge(c.score);
                        return (
                          <motion.div
                            key={c.name}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.35,
                              delay: idx * STAGGER_DELAY + 0.1,
                              ease: EASE_SMOOTH,
                            }}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] text-slate-mist dark:text-warm-stone/60 font-light tracking-wide leading-tight flex-1 mr-2">
                                {c.name}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-[10px] font-medium text-carbon-ink dark:text-warm-stone/80 tabular-nums font-mono">
                                  {c.score}
                                </span>
                                <span className={`text-[8px] font-semibold uppercase tracking-widest px-1.5 py-0.5 border ${barBadge.bg} ${barBadge.text} ${barBadge.border}`}>
                                  {c.weight}
                                </span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-warm-stone/20 dark:bg-black/25 overflow-hidden">
                              <motion.div
                                className="h-full rounded-r-sm"
                                style={{ backgroundColor: getBarColor(c.score) }}
                                initial={{ width: 0 }}
                                animate={{ width: `${c.score}%` }}
                                transition={{
                                  duration: 0.7,
                                  delay: idx * STAGGER_DELAY + 0.15,
                                  ease: EASE_SMOOTH,
                                }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: criteria.length * STAGGER_DELAY + 0.4, duration: 0.4 }}
                      className="pt-3 mt-4 border-t border-slate-mist/15 dark:border-midnight-blue/60"
                    >
                      <p className="text-[8px] italic text-slate-mist dark:text-warm-stone/40 font-light leading-relaxed">
                        Weighted sub-pillar breakdown · Varna Framework 2.0
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
