"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface GroupOverallScorePopoverProps {
  score: number;
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
  className?: string;
  children: ReactNode;
}

const PILLAR_CONFIG = [
  {
    key: "E",
    label: "Environmental",
    color: "#4C7355",
    bgColor: "#4C7355",
    subText: "E1–E6",
  },
  {
    key: "S",
    label: "Social",
    color: "#B85333",
    bgColor: "#B85333",
    subText: "S1–S4",
  },
  {
    key: "G",
    label: "Governance",
    color: "#36424A",
    bgColor: "#36424A",
    subText: "G1–G3",
  },
  {
    key: "C",
    label: "Cultural",
    color: "#7A3F1E",
    bgColor: "#7A3F1E",
    subText: "C1–C3",
  },
] as const;

/** Get a tier label for a score */
function getTier(score: number): string {
  if (score >= 80) return "Leader";
  if (score >= 70) return "Advanced";
  if (score >= 50) return "Emerging";
  return "Foundational";
}

export default function GroupOverallScorePopover({
  score,
  eScore,
  sScore,
  gScore,
  cScore,
  className,
  children,
}: GroupOverallScorePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    placement: "below" as "below" | "above",
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const enterTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const CARD_WIDTH = 340;
  const CARD_HEIGHT_ESTIMATE = 340;

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const placement =
      spaceBelow < CARD_HEIGHT_ESTIMATE + 16 ? "above" : "below";

    let top =
      placement === "below"
        ? rect.bottom + 10
        : rect.top - CARD_HEIGHT_ESTIMATE - 10;
    top = Math.max(12, Math.min(top, viewportHeight - CARD_HEIGHT_ESTIMATE - 12));

    let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - CARD_WIDTH - 16));

    setPosition({ top, left, placement });
  }, []);

  const handleOpen = useCallback(() => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    enterTimeout.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, 150);
  }, [calculatePosition]);

  const handleClose = useCallback(() => {
    if (enterTimeout.current) {
      clearTimeout(enterTimeout.current);
      enterTimeout.current = null;
    }
    leaveTimeout.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  }, []);

  const handleClick = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      calculatePosition();
      setIsOpen(true);
    }
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    return () => {
      if (enterTimeout.current) clearTimeout(enterTimeout.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    };
  }, []);

  const pillars = [
    { ...PILLAR_CONFIG[0], score: eScore },
    { ...PILLAR_CONFIG[1], score: sScore },
    { ...PILLAR_CONFIG[2], score: gScore },
    { ...PILLAR_CONFIG[3], score: cScore },
  ];

  // Simple average (no documented weighting scheme at group level)
  const computedAvg = (eScore + sScore + gScore + cScore) / 4;

  return (
    <>
      <div
        ref={triggerRef}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Group average Sutra Verified Score ${score.toFixed(1)}, hover for pillar breakdown`}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`inline-block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#B85333] focus-visible:ring-offset-2 rounded-xl${className ? ` ${className}` : " w-full"}`}
      >
        {children}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: position.placement === "above" ? -6 : 6,
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: position.placement === "above" ? -4 : 4,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onMouseEnter={handleOpen}
                onMouseLeave={handleClose}
                role="tooltip"
                className="fixed z-[9999] pointer-events-auto transform-gpu will-change-transform"
                style={{ top: position.top, left: position.left, width: CARD_WIDTH }}
              >
                <div className="bg-white/95 dark:bg-[#1E2028]/95 backdrop-blur-xl border border-[#EAE5DC] dark:border-[#8C9DA8]/25 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden font-sans select-none transform-gpu">
                  {/* Accent top border — terracotta for overall score card */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: "#B85333" }} />

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#B85333]" />
                        <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#1A1F26] dark:text-[#FAF8F5]">
                          Group Score Breakdown
                        </h4>
                      </div>
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className="text-base font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                          {score.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-[#6E7781] dark:text-[#8C9DA8]">
                          /100
                        </span>
                      </div>
                    </div>

                    {/* Pillar Contribution Rows */}
                    <div className="space-y-2.5">
                      {pillars.map((pillar, idx) => {
                        const tier = getTier(pillar.score);
                        return (
                          <div key={pillar.key} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-sans">
                              <span className="text-[#1A1F26] dark:text-[#FAF8F5] font-medium flex items-center gap-1.5 truncate max-w-[250px]">
                                <span
                                  className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 shrink-0"
                                  style={{ color: pillar.color }}
                                >
                                  {pillar.key}
                                </span>
                                <span className="text-[11px] text-[#6E7781] dark:text-[#8C9DA8] font-normal truncate">
                                  — {pillar.label} ({pillar.subText}):
                                </span>
                              </span>
                              <span className="font-mono font-bold text-xs text-[#1A1F26] dark:text-[#FAF8F5] shrink-0 ml-2">
                                {pillar.score}
                              </span>
                            </div>
                            {/* Micro Progress Bar */}
                            <div className="h-1.5 w-full bg-[#FAF8F5] dark:bg-[#121316] rounded-full overflow-hidden border border-[#EAE5DC]/60 dark:border-[#8C9DA8]/15">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: pillar.color }}
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.min(100, Math.max(0, pillar.score))}%`,
                                }}
                                transition={{
                                  duration: 0.4,
                                  delay: idx * 0.07,
                                  ease: "easeOut",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="pt-2.5 mt-3 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 flex items-center justify-between text-[9px] font-mono text-[#6E7781] dark:text-[#8C9DA8]">
                      <span>Simple average across 4 pillars</span>
                      <span>Varna ESG Framework 2.0</span>
                    </div>
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
