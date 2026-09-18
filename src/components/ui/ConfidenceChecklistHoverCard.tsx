"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { CheckCircle2, AlertTriangle, Minus, X, ShieldCheck } from "lucide-react";
import type { ConfidenceChecklistItem, ConfidenceStatus } from "@/lib/mock-data";
import { DRAWER_TRANSITION, STAGGER_FAST, EASE_SMOOTH } from "@/lib/motion";

interface ConfidenceChecklistHoverCardProps {
  supplierName: string;
  score: number;
  totalConfirmed: string;
  status?: string;
  checklist: ConfidenceChecklistItem[];
  children: ReactNode;
}

// Status visual config
const STATUS_CONFIG: Record<
  ConfidenceStatus,
  {
    icon: typeof CheckCircle2;
    color: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
    label: string;
  }
> = {
  verified: {
    icon: CheckCircle2,
    color: "#738678",
    pillBg: "bg-sage-mineral/15",
    pillText: "text-sage-mineral",
    pillBorder: "border-sage-mineral/30",
    label: "Verified",
  },
  partial: {
    icon: AlertTriangle,
    color: "#6F848F",
    pillBg: "bg-slate-mist/15",
    pillText: "text-slate-mist",
    pillBorder: "border-slate-mist/30",
    label: "Partial",
  },
  lapsed: {
    icon: AlertTriangle,
    color: "#7A3F1E",
    pillBg: "bg-deep-clay/15",
    pillText: "text-deep-clay",
    pillBorder: "border-deep-clay/30",
    label: "Lapsed",
  },
  missing: {
    icon: Minus,
    color: "#6F848F",
    pillBg: "bg-slate-mist/10",
    pillText: "text-slate-mist",
    pillBorder: "border-slate-mist/20",
    label: "Missing",
  },
};

// Animated ring for the drawer header
function DrawerConfidenceRing({ score, size = 80 }: { score: number; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(5, Math.min(100, score));
  const dashoffset = circumference - (progress / 100) * circumference;

  const ringColor = score >= 70 ? "#738678" : score >= 40 ? "#6F848F" : "#7A3F1E";

  // Animated count-up
  const springVal = useSpring(0, { stiffness: 50, damping: 30, duration: 800 });
  const displayVal = useTransform(springVal, (v) => Math.round(v));
  const [countStr, setCountStr] = useState("0");

  useEffect(() => {
    springVal.set(score);
    const unsub = displayVal.on("change", (v) => setCountStr(String(v)));
    return unsub;
  }, [score, springVal, displayVal]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-mist/20 dark:text-warm-stone/15"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 1.2, ease: EASE_SMOOTH, delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-sans font-medium text-carbon-ink dark:text-warm-stone tracking-tighter leading-none">
          {countStr}%
        </span>
        <span className="text-[7px] font-sans uppercase tracking-widest text-slate-mist dark:text-warm-stone/60 mt-0.5">
          Confidence
        </span>
      </div>
    </div>
  );
}

export default function ConfidenceChecklistHoverCard({
  supplierName,
  score,
  totalConfirmed,
  status: _status,
  checklist,
  children,
}: ConfidenceChecklistHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Trigger: hover or click to open drawer */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => setIsOpen(true)}
        className="inline-block cursor-pointer transition-transform duration-200 hover:scale-105 group"
        title="Click or hover to inspect confidence verification"
      >
        {children}
      </div>

      {/* Drawer portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Scrim overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-carbon-ink/25 dark:bg-black/40 backdrop-blur-sm z-[9998]"
                />

                {/* Drawer panel */}
                <motion.div
                  initial={{ x: 420 }}
                  animate={{ x: 0 }}
                  exit={{ x: 420 }}
                  transition={DRAWER_TRANSITION}
                  className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] z-[9999] flex flex-col
                    bg-white dark:bg-carbon-ink
                    border-l border-slate-mist/30 dark:border-slate-mist/20
                    shadow-[-8px_0_40px_rgba(47,60,82,0.15)] dark:shadow-[-8px_0_40px_rgba(0,0,0,0.5)]
                    font-sans select-none"
                >
                  {/* Colored top accent */}
                  <div
                    className="h-1 w-full flex-shrink-0"
                    style={{ background: score >= 70 ? "#738678" : score >= 40 ? "#6F848F" : "#7A3F1E" }}
                  />

                  {/* Header */}
                  <div className="px-6 pt-6 pb-5 border-b border-slate-mist/20 dark:border-midnight-blue flex-shrink-0">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className="w-4 h-4 text-slate-mist" strokeWidth={1.5} />
                          <h3 className="text-sm font-sans font-medium tracking-tight text-carbon-ink dark:text-warm-stone">
                            Confidence Verification
                          </h3>
                        </div>
                        <p className="text-xs text-carbon-ink dark:text-warm-stone font-light tracking-tight">
                          {supplierName}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 text-slate-mist hover:text-carbon-ink dark:hover:text-warm-stone transition-colors cursor-pointer"
                        aria-label="Close drawer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Ring + Confirmation Summary */}
                    <div className="flex items-center gap-5">
                      <DrawerConfidenceRing score={score} size={80} />
                      <div>
                        <p className="text-[11px] text-slate-mist dark:text-warm-stone/70 font-light">
                          {totalConfirmed}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Checklist: scrollable with fade masks */}
                  <div className="flex-1 overflow-hidden relative">
                    {/* Top fade mask */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white dark:from-carbon-ink to-transparent z-10 pointer-events-none" />
                    {/* Bottom fade mask */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-carbon-ink to-transparent z-10 pointer-events-none" />

                    <div className="h-full overflow-y-auto px-6 py-4 space-y-1 scrollbar-thin">
                      {checklist && checklist.length > 0 ? (
                        checklist.map((item, idx) => {
                          const statusKey = (item.status || "missing").toLowerCase() as ConfidenceStatus;
                          const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.missing;
                          const Icon = config.icon;
                          const scoreFormatted = (item.score ?? 0).toFixed(2);

                          return (
                            <motion.div
                              key={`${item.item}-${idx}`}
                              initial={{ opacity: 0, x: 16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.35,
                                delay: idx * STAGGER_FAST + 0.15,
                                ease: EASE_SMOOTH,
                              }}
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-mist/5 dark:hover:bg-warm-stone/5 transition-colors"
                            >
                              <Icon
                                className="w-3.5 h-3.5 flex-shrink-0"
                                style={{ color: config.color }}
                                strokeWidth={2}
                              />
                              <span className="text-[11px] font-light tracking-wide flex-1 text-carbon-ink dark:text-warm-stone/90 leading-snug">
                                {item.item}
                              </span>
                              <span
                                className="text-[10px] font-semibold tabular-nums font-mono flex-shrink-0 min-w-[34px] text-right"
                                style={{ color: config.color }}
                              >
                                {scoreFormatted}
                              </span>
                              <span
                                className={`text-[8px] font-semibold uppercase tracking-widest flex-shrink-0 px-1.5 py-0.5 border ${config.pillBg} ${config.pillText} ${config.pillBorder}`}
                              >
                                {config.label}
                              </span>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                          <ShieldCheck className="w-10 h-10 text-slate-mist/40 mb-3" strokeWidth={1.5} />
                          <p className="text-xs font-sans font-medium text-carbon-ink dark:text-warm-stone">
                            Verification Data Not Yet Submitted
                          </p>
                          <p className="text-[10px] text-slate-mist dark:text-warm-stone/50 font-light mt-1 max-w-[240px]">
                            Detailed evidence checklist indicators for {supplierName} are awaiting verification audit documents.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (checklist?.length || 1) * STAGGER_FAST + 0.3, duration: 0.4 }}
                    className="px-6 py-4 border-t border-slate-mist/15 dark:border-midnight-blue/60 flex-shrink-0"
                  >
                    <p className="text-[9px] italic text-slate-mist dark:text-warm-stone/40 font-light leading-relaxed">
                      Data points tracked against 18 verifiable indicators · Varna Trust Protocol
                    </p>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
