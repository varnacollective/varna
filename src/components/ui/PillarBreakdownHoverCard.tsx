"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { PillarCriterion } from "@/lib/mock-data";

interface PillarBreakdownHoverCardProps {
  pillarLabel: string;
  pillarScore: number;
  criteria: PillarCriterion[];
  color: string;
  children: ReactNode;
}

function getBarColor(value: number): string {
  if (value >= 70) return "#738678"; // sage-mineral
  if (value >= 45) return "#6F848F"; // slate-mist
  return "#7A3F1E";                  // deep-clay
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

  const CARD_WIDTH = 320;
  const CARD_HEIGHT_ESTIMATE = 60 + criteria.length * 40;

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const placement = spaceBelow < CARD_HEIGHT_ESTIMATE + 16 ? "above" : "below";

    const top =
      placement === "below"
        ? rect.bottom + 10
        : rect.top - CARD_HEIGHT_ESTIMATE - 10;

    let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - CARD_WIDTH - 16));

    setPosition({ top, left, placement });
  }, [CARD_HEIGHT_ESTIMATE]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    enterTimeout.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, 300);
  }, [calculatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (enterTimeout.current) {
      clearTimeout(enterTimeout.current);
      enterTimeout.current = null;
    }
    leaveTimeout.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (enterTimeout.current) clearTimeout(enterTimeout.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    };
  }, []);

  const slideDir = position.placement === "below" ? 6 : -6;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block cursor-help"
      >
        {children}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: slideDir }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: slideDir / 2 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 0.8,
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="fixed z-[9999] pointer-events-auto"
                style={{
                  top: position.top,
                  left: position.left,
                  width: CARD_WIDTH,
                }}
              >
                <div
                  className="
                    bg-white dark:bg-carbon-ink
                    border border-slate-mist/30 dark:border-slate-mist/20
                    shadow-[0_8px_32px_rgba(47,60,82,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)]
                    p-5 font-sans select-none
                  "
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-mist/20 dark:border-midnight-blue">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2 h-2 flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <h4 className="text-xs font-serif font-light tracking-tighter text-carbon-ink dark:text-warm-stone">
                        {pillarLabel}
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-serif font-light tracking-tighter text-carbon-ink dark:text-warm-stone">
                        {pillarScore}
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-slate-mist dark:text-warm-stone/40">
                        /100
                      </span>
                    </div>
                  </div>

                  {/* Criteria Rows */}
                  <div className="space-y-3">
                    {criteria.map((c, idx) => (
                      <div key={c.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-mist dark:text-warm-stone/60 font-light tracking-wide leading-tight flex-1 mr-2">
                            {c.name}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[9px] font-medium text-carbon-ink dark:text-warm-stone/80 tabular-nums">
                              {c.score}
                            </span>
                            <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-mist dark:text-warm-stone/40 bg-slate-mist/10 dark:bg-warm-stone/5 px-1.5 py-0.5">
                              {c.weight}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-warm-stone/20 dark:bg-black/25 overflow-hidden">
                          <motion.div
                            className="h-full"
                            style={{ backgroundColor: getBarColor(c.score) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${c.score}%` }}
                            transition={{
                              duration: 0.7,
                              delay: idx * 0.06 + 0.1,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 mt-3 border-t border-slate-mist/15 dark:border-midnight-blue/60">
                    <p className="text-[8px] italic text-slate-mist dark:text-warm-stone/40 font-light leading-relaxed">
                      Weighted sub-pillar breakdown · Varna Framework 2.0
                    </p>
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
