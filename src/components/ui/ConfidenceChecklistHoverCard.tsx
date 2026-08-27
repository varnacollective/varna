"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Minus } from "lucide-react";
import type { ConfidenceChecklistItem, ConfidenceStatus } from "@/lib/mock-data";

interface ConfidenceChecklistHoverCardProps {
  supplierName: string;
  score: number;
  totalConfirmed: string;
  status: string;
  checklist: ConfidenceChecklistItem[];
  children: ReactNode;
}

// Status visual config matching the spec exactly
const STATUS_CONFIG: Record<
  ConfidenceStatus,
  {
    icon: typeof CheckCircle2;
    color: string;       // icon / accent color
    bgClass: string;     // row background highlight
    textClass: string;   // label text color
    label: string;
  }
> = {
  verified: {
    icon: CheckCircle2,
    color: "#738678",     // sage-mineral
    bgClass: "bg-sage-mineral/5 dark:bg-sage-mineral/5",
    textClass: "text-carbon-ink dark:text-warm-stone",
    label: "Verified",
  },
  partial: {
    icon: AlertTriangle,
    color: "#7A3F1E",     // deep-clay
    bgClass: "bg-deep-clay/5 dark:bg-deep-clay/5",
    textClass: "text-carbon-ink dark:text-warm-stone/80",
    label: "Partial",
  },
  lapsed: {
    icon: AlertTriangle,
    color: "#7A3F1E",     // deep-clay
    bgClass: "bg-deep-clay/5 dark:bg-deep-clay/5",
    textClass: "text-carbon-ink dark:text-warm-stone/80",
    label: "Lapsed",
  },
  missing: {
    icon: Minus,
    color: "#6F848F",     // slate-mist
    bgClass: "",
    textClass: "text-slate-mist dark:text-warm-stone/50",
    label: "Missing",
  },
};

function getStatusBadgeClass(status: string): string {
  if (status === "Verified") return "bg-sage-mineral/15 text-sage-mineral border-sage-mineral/20";
  if (status === "Early Stage") return "bg-deep-clay/15 text-deep-clay border-deep-clay/20";
  return "bg-slate-mist/15 text-slate-mist border-slate-mist/20";
}

export default function ConfidenceChecklistHoverCard({
  supplierName,
  score,
  totalConfirmed,
  status,
  checklist,
  children,
}: ConfidenceChecklistHoverCardProps) {
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

  const CARD_WIDTH = 360;
  // Cap the height estimate so the card never exceeds viewport; checklist scrolls internally
  const MAX_CARD_HEIGHT = 480;
  const CARD_HEIGHT_ESTIMATE = Math.min(120 + checklist.length * 36, MAX_CARD_HEIGHT);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const placement = spaceBelow < CARD_HEIGHT_ESTIMATE + 16 ? "above" : "below";

    let top =
      placement === "below"
        ? rect.bottom + 10
        : rect.top - CARD_HEIGHT_ESTIMATE - 10;

    // Clamp so the card never goes off-screen vertically
    top = Math.max(8, Math.min(top, viewportHeight - CARD_HEIGHT_ESTIMATE - 8));

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
        onPointerDown={() => {
          if (enterTimeout.current) {
            clearTimeout(enterTimeout.current);
            enterTimeout.current = null;
          }
        }}
        className="inline-block cursor-default"
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
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <h4 className="text-sm font-serif font-light tracking-tighter text-carbon-ink dark:text-warm-stone leading-tight">
                        Confidence Verification
                      </h4>
                      <p className="text-[10px] text-slate-mist dark:text-warm-stone/50 mt-0.5 font-light tracking-wide">
                        {supplierName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xl font-serif font-light tracking-tighter text-carbon-ink dark:text-warm-stone">
                        {score}%
                      </span>
                      <span
                        className={`text-[8px] font-semibold uppercase tracking-widest px-2 py-0.5 border ${getStatusBadgeClass(status)}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Summary line */}
                  <p className="text-[9px] text-slate-mist dark:text-warm-stone/50 font-light mb-4 pb-3 border-b border-slate-mist/20 dark:border-midnight-blue">
                    {totalConfirmed}
                  </p>

                  {/* Checklist — scrollable when many items */}
                  <div className="space-y-0.5 max-h-[260px] overflow-y-auto scrollbar-thin">
                    {checklist.map((item, idx) => {
                      const config = STATUS_CONFIG[item.status];
                      const Icon = config.icon;

                      return (
                        <motion.div
                          key={item.item}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: idx * 0.04 + 0.1,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={`flex items-center gap-3 px-2.5 py-2 ${config.bgClass}`}
                        >
                          <Icon
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: config.color }}
                            strokeWidth={2}
                          />
                          <span className={`text-[10px] font-light tracking-wide flex-1 ${config.textClass}`}>
                            {item.item}
                          </span>
                          <span
                            className="text-[9px] font-semibold tabular-nums flex-shrink-0 min-w-[28px] text-right"
                            style={{ color: config.color }}
                          >
                            {Math.round(item.score * 100)}
                          </span>
                          <span
                            className="text-[8px] font-semibold uppercase tracking-widest flex-shrink-0"
                            style={{ color: config.color }}
                          >
                            {config.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 mt-3 border-t border-slate-mist/15 dark:border-midnight-blue/60">
                    <p className="text-[8px] italic text-slate-mist dark:text-warm-stone/40 font-light leading-relaxed">
                      Data points tracked against 18 verifiable indicators · Varna Trust Protocol
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
