"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

export interface VarnaScoreData {
  score: number;   // Overall Varna score (0–100)
  eScore: number;  // Environmental (0–100)
  sScore: number;  // Social (0–100)
  gScore: number;  // Governance (0–100)
  cScore: number;  // Cultural (0–100)
  supplierName?: string;
}

interface VarnaScoreHoverCardProps extends VarnaScoreData {
  children: ReactNode;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBarColor(value: number): string {
  if (value >= 70) return "#738678"; // sage-mineral — strong
  if (value >= 45) return "#6F848F"; // slate-mist — moderate
  return "#7A3F1E";                  // deep-clay — low / risk
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Low";
  return "Critical";
}

function getScoreLabelColor(score: number): string {
  if (score >= 60) return "text-sage-mineral";
  if (score >= 40) return "text-slate-mist";
  return "text-deep-clay";
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

  const CARD_HEIGHT = 380;
  const CARD_WIDTH = 340;

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Determine vertical placement
    const spaceBelow = viewportHeight - rect.bottom;
    const placement = spaceBelow < CARD_HEIGHT + 16 ? "above" : "below";

    const top =
      placement === "below"
        ? rect.bottom + 8
        : rect.top - CARD_HEIGHT - 8;

    // Center horizontally, clamped to viewport
    let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - CARD_WIDTH - 16));

    setPosition({ top, left, placement });
  }, []);

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

  const handlePointerDown = useCallback(() => {
    if (enterTimeout.current) {
      clearTimeout(enterTimeout.current);
      enterTimeout.current = null;
    }
  }, []);

  // Cleanup timeouts on unmount
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

  // Impact pillars
  const pillars = [
    { key: "E", label: "Environmental", value: eScore },
    { key: "S", label: "Social", value: sScore },
    { key: "G", label: "Governance", value: gScore },
    { key: "C", label: "Cultural", value: cScore },
  ];

  const slideDir = position.placement === "below" ? 6 : -6;

  return (
    <>
      {/* Trigger wrapper — no visual footprint */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
        className="inline-block cursor-default"
      >
        {children}
      </div>

      {/* Portal-rendered hover card */}
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
                {/* ── Card Shell ──────────────────────────────────────── */}
                <div
                  className="
                    bg-white dark:bg-carbon-ink
                    border border-slate-mist/30 dark:border-slate-mist/20
                    shadow-[0_8px_32px_rgba(47,60,82,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)]
                    p-6 font-sans select-none
                  "
                >
                  {/* ── Header ─────────────────────────────────────── */}
                  <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-mist/20 dark:border-midnight-blue">
                    <div>
                      <h4 className="text-sm font-serif font-light tracking-tighter text-carbon-ink dark:text-warm-stone leading-tight">
                        Varna Score Breakdown
                      </h4>
                      {supplierName && (
                        <p className="text-[10px] text-slate-mist dark:text-warm-stone/50 mt-0.5 font-light tracking-wide">
                          {supplierName}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-serif font-light tracking-tighter text-carbon-ink dark:text-warm-stone">
                        {score}
                      </span>
                      <span className={`text-[9px] font-semibold uppercase tracking-widest ${getScoreLabelColor(score)}`}>
                        {getScoreLabel(score)}
                      </span>
                    </div>
                  </div>

                  {/* ── Impact Section (50%) ────────────────────────── */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-carbon-ink dark:text-warm-stone/80">
                        Impact
                      </span>
                      <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-mist dark:text-warm-stone/40 bg-slate-mist/10 dark:bg-warm-stone/5 px-2 py-0.5">
                        50% Weight
                      </span>
                    </div>
                    <div className="space-y-2">
                      {pillars.map((p) => (
                        <div key={p.key} className="flex items-center gap-2.5">
                          <span className="text-[9px] w-20 text-slate-mist dark:text-warm-stone/60 font-light tracking-wide truncate">
                            {p.label}
                          </span>
                          <div className="flex-1 h-1.5 bg-warm-stone/20 dark:bg-black/25 overflow-hidden">
                            <motion.div
                              className="h-full"
                              style={{ backgroundColor: getBarColor(p.value) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${p.value}%` }}
                              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                          <span className="text-[9px] font-medium text-carbon-ink dark:text-warm-stone/80 tabular-nums w-7 text-right">
                            {p.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Readiness Section (30%) ─────────────────────── */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-carbon-ink dark:text-warm-stone/80">
                        Readiness
                      </span>
                      <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-mist dark:text-warm-stone/40 bg-slate-mist/10 dark:bg-warm-stone/5 px-2 py-0.5">
                        30% Weight
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] w-20 text-slate-mist dark:text-warm-stone/60 font-light tracking-wide truncate">
                        Mgmt & Certs
                      </span>
                      <div className="flex-1 h-1.5 bg-warm-stone/20 dark:bg-black/25 overflow-hidden">
                        <motion.div
                          className="h-full"
                          style={{ backgroundColor: getBarColor(readinessScore) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${readinessScore}%` }}
                          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span className="text-[9px] font-medium text-carbon-ink dark:text-warm-stone/80 tabular-nums w-7 text-right">
                        {readinessScore}
                      </span>
                    </div>
                  </div>

                  {/* ── Risk Section (20%) ──────────────────────────── */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-carbon-ink dark:text-warm-stone/80">
                        Risk
                      </span>
                      <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-mist dark:text-warm-stone/40 bg-slate-mist/10 dark:bg-warm-stone/5 px-2 py-0.5">
                        20% Weight
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] w-20 text-slate-mist dark:text-warm-stone/60 font-light tracking-wide truncate">
                        Compliance
                      </span>
                      <div className="flex-1 h-1.5 bg-warm-stone/20 dark:bg-black/25 overflow-hidden">
                        <motion.div
                          className="h-full"
                          style={{ backgroundColor: riskIsHigh ? "#7A3F1E" : "#738678" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - riskScore}%` }}
                          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span className={`text-[9px] font-medium tabular-nums w-7 text-right ${riskIsHigh ? "text-deep-clay" : "text-carbon-ink dark:text-warm-stone/80"}`}>
                        {100 - riskScore}
                      </span>
                    </div>
                  </div>

                  {/* ── Footer Note ─────────────────────────────────── */}
                  <div className="pt-4 border-t border-slate-mist/15 dark:border-midnight-blue/60">
                    <p className="text-[9px] italic text-slate-mist dark:text-warm-stone/40 font-light leading-relaxed">
                      Calculated using the Varna Framework 2.0. Intersection Suppliers receive a +5 bonus.
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
