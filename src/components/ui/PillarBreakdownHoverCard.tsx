"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import { getSubCriteriaForPillar, type SubCriterionItem } from "@/lib/sub-criteria-labels";

export const SUTRA_FRAMEWORK_DATA = {
  Environmental: [
    { id: "carbon", title: "Carbon Impact", question: "How much carbon goes into making one unit?", why: "Shows if switching truly cuts carbon, and feeds your Scope 3.", check: "Materials and manufacturing energy, raw material to factory gate, against the conventional alternative." },
    { id: "material", title: "Material Sustainability", question: "What is the product actually made of?", why: "Most of a product's impact is set by its materials.", check: "Share of bio-based, recycled or regenerative inputs versus virgin synthetics, and chemical safety compliance." },
    { id: "circularity", title: "Circularity", question: "What happens to it after use?", why: "Keeps what your guests use out of landfill.", check: "Compostability test reports, take-back or refill schemes, and design for reuse." },
    { id: "water", title: "Water Management", question: "Is water used and released responsibly?", why: "Protects water in regions already under stress.", check: "Water use records, treatment before discharge, and steps taken to reduce use." },
    { id: "pollution", title: "Pollution Control", question: "Is it free of harmful substances?", why: "Keeps harmful chemicals away from guests and workers.", check: "Restricted-substance compliance, effluent treatment and waste handling." },
    { id: "packaging", title: "Packaging", question: "How much packaging is used, and where does it go?", why: "Cuts the waste your property handles every day.", check: "Packaging weight per unit, material type, recyclability and refill formats." }
  ],
  Social: [
    { id: "employment", title: "Employment & livelihood", question: "Does the business create meaningful work?", why: "Your spend sustains real livelihoods, often rural.", check: "Jobs supported, with attention to rural and district-level employment." },
    { id: "gender", title: "Gender inclusion", question: "Do women share in the work and the ownership?", why: "Directs your spend toward women's economic inclusion.", check: "Workforce gender split, and women-led or women-owned status." },
    { id: "wages", title: "Fair wages & conditions", question: "Are workers paid fairly, on clear terms?", why: "No one in your supply chain is underpaid.", check: "Wages against state minimums, and written employment contracts." },
    { id: "health", title: "Health, safety & wellbeing", question: "Are workers protected on the job?", why: "Protects the people making what you buy.", check: "ESI coverage, safety systems and injury records." }
  ],
  Governance: [
    { id: "legal", title: "Legal & regulatory compliance", question: "Is the business properly registered and licensed?", why: "Lowers supply and reputational risk for your property.", check: "Incorporation, GST, Udyam and product licences, and that each one is still valid." },
    { id: "ethics", title: "Business ethics", question: "Has the business committed to ethical conduct?", why: "Holds the partner accountable for how it operates.", check: "A signed supplier code of conduct, and any audited ethics assessments." },
    { id: "sourcing", title: "Responsible sourcing", question: "Does it know where its own materials come from?", why: "Extends responsibility deeper into your supply chain.", check: "Sourcing policies and raw-material traceability." }
  ]
};

export interface PillarBreakdownHoverCardProps {
  pillarLabel: string;
  pillarScore?: number | null;
  pillarKey?: "E" | "S" | "G" | "C";
  color?: string;
  items?: SubCriterionItem[];
  criteria?: Array<{ name: string; score: number | null | undefined; weight?: string }>;
  scores?: Record<string, number | undefined | null>;
  className?: string;
  disableScale?: boolean;
  children: ReactNode;
}

export default function PillarBreakdownHoverCard({
  pillarLabel,
  pillarScore,
  pillarKey,
  color,
  items: directItems,
  criteria,
  scores,
  className,
  disableScale = false,
  children,
}: PillarBreakdownHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "below" as "below" | "above" });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const activeColor =
    pillarKey === "E" || pillarLabel.toLowerCase().includes("env") ? "#4C7355" :
    pillarKey === "S" || pillarLabel.toLowerCase().includes("soc") ? "#B85333" :
    pillarKey === "G" || pillarLabel.toLowerCase().includes("gov") ? "#36424A" :
    color || "#7A3F1E";

  const normalizedPillar =
    pillarKey === "E" || pillarLabel.toLowerCase().includes("env") ? "Environmental" :
    pillarKey === "S" || pillarLabel.toLowerCase().includes("soc") ? "Social" :
    pillarKey === "G" || pillarLabel.toLowerCase().includes("gov") ? "Governance" :
    null;

  const sutraList = normalizedPillar ? SUTRA_FRAMEWORK_DATA[normalizedPillar] : [];

  const itemsToDisplay: SubCriterionItem[] = directItems ?? 
    (pillarKey && scores ? getSubCriteriaForPillar(pillarKey, scores) : []) ??
    (criteria ? criteria.map(c => ({ code: c.name.slice(0, 3).toUpperCase(), name: c.name, score: c.score, color: activeColor })) : []);

  // Fallback if criteria passed directly
  const finalItems: SubCriterionItem[] = itemsToDisplay.length > 0
    ? itemsToDisplay
    : (criteria ? criteria.map((c) => ({ code: c.name.slice(0, 3).toUpperCase(), name: c.name, score: c.score, color: activeColor })) : []);

  const isPillarScored = pillarScore !== null && pillarScore !== undefined && !isNaN(Number(pillarScore));

  const CARD_WIDTH = 380;
  const CARD_HEIGHT_ESTIMATE = Math.min(120 + finalItems.length * 56, 520);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const placement = spaceBelow < CARD_HEIGHT_ESTIMATE + 16 ? "above" : "below";

    let top = placement === "below" ? rect.bottom + 10 : rect.top - CARD_HEIGHT_ESTIMATE - 10;
    top = Math.max(12, Math.min(top, viewportHeight - CARD_HEIGHT_ESTIMATE - 12));

    let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - CARD_WIDTH - 16));

    setPosition({ top, left, placement });
  }, [CARD_HEIGHT_ESTIMATE]);

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

  const defaultTriggerClasses = `inline-block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#B85333] focus-visible:ring-offset-2 rounded-xl transition-all duration-200 ${disableScale ? "" : "hover:scale-[1.02]"}`;

  return (
    <>
      <div
        ref={triggerRef}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${pillarLabel} pillar score ${isPillarScored ? pillarScore : "not yet scored"}, click to inspect sub-criteria breakdown`}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={className || defaultTriggerClasses}
      >
        {children}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, scale: 0.95, y: position.placement === "above" ? -6 : 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: position.placement === "above" ? -4 : 4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                role="dialog"
                aria-label={`${pillarLabel} Breakdown`}
                className="fixed z-[9999] pointer-events-auto transform-gpu will-change-transform max-h-[85vh] flex flex-col"
                style={{ top: position.top, left: position.left, width: CARD_WIDTH, maxWidth: "calc(100vw - 32px)" }}
              >
                <div
                  className="
                    bg-white/95 dark:bg-[#1E2028]/95 backdrop-blur-xl
                    border border-[#EAE5DC] dark:border-[#8C9DA8]/25
                    shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.6)]
                    rounded-xl overflow-hidden font-sans select-none transform-gpu max-h-[85vh] flex flex-col
                  "
                >
                  {/* Accent Top Border */}
                  <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: activeColor }} />

                  <div className="p-4 overflow-y-auto max-h-[calc(85vh-10px)]">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: activeColor }}
                        />
                        <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#1A1F26] dark:text-[#FAF8F5]">
                          {pillarLabel} Breakdown
                        </h4>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-baseline gap-1 font-mono">
                          {isPillarScored ? (
                            <>
                              <span className="text-base font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                                {Number(pillarScore) % 1 === 0 ? Number(pillarScore) : Number(pillarScore).toFixed(1)}
                              </span>
                              <span className="text-[10px] text-[#6E7781] dark:text-[#8C9DA8]">
                                /100
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-[#8C9DA8] font-normal italic font-sans">
                              Not yet scored
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                          }}
                          className="p-1 rounded-md text-[#6E7781] hover:text-[#1A1F26] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                          aria-label="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sub-Criteria Accordion Rows */}
                    <div className="space-y-2">
                      {finalItems.map((item, idx) => {
                        const isScored = item.score !== null && item.score !== undefined && !isNaN(Number(item.score));
                        const numScore = isScored ? Number(item.score) : 0;
                        const formattedScore = isScored
                          ? (numScore % 1 === 0 ? numScore : numScore.toFixed(1))
                          : "Not yet scored";

                        const sutraEntry = sutraList.find((s) => {
                          const sTitle = s.title.toLowerCase();
                          const iName = item.name.toLowerCase();
                          return (
                            iName.includes(s.id.toLowerCase()) ||
                            iName.includes(sTitle) ||
                            sTitle.includes(iName) ||
                            iName.includes(sTitle.split(" ")[0])
                          );
                        }) || sutraList[idx];

                        const rowKey = item.code || sutraEntry?.id || String(idx);
                        const isExpanded = expandedRow === rowKey;

                        return (
                          <div
                            key={rowKey}
                            className="p-2 rounded-lg transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] border border-transparent hover:border-black/[0.04] dark:hover:border-white/[0.05]"
                          >
                            <div className="flex items-center justify-between text-xs font-sans gap-2">
                              <span className="text-[#1A1F26] dark:text-[#FAF8F5] font-medium flex items-center gap-1.5 truncate flex-1 min-w-0">
                                <span
                                  className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 shrink-0"
                                  style={{ color: activeColor }}
                                >
                                  {item.code}
                                </span>
                                <span className="text-[11px] text-[#6E7781] dark:text-[#8C9DA8] font-normal truncate">
                                  — {item.name}:
                                </span>
                              </span>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono font-bold text-xs text-[#1A1F26] dark:text-[#FAF8F5]">
                                  {isScored ? (
                                    formattedScore
                                  ) : (
                                    <span className="text-[10px] font-normal text-[#6E7781] dark:text-[#8C9DA8] italic font-sans">
                                      Not yet scored
                                    </span>
                                  )}
                                </span>

                                {/* + / - Icon Accordion Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedRow(isExpanded ? null : rowKey);
                                  }}
                                  className={`
                                    w-5 h-5 rounded flex items-center justify-center transition-colors
                                    ${isExpanded 
                                      ? "bg-black/10 dark:bg-white/20 text-[#1A1F26] dark:text-white" 
                                      : "text-[#6E7781] dark:text-[#8C9DA8] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#1A1F26] dark:hover:text-white"
                                    }
                                  `}
                                  aria-expanded={isExpanded}
                                  aria-label={isExpanded ? `Collapse ${item.name} details` : `Expand ${item.name} details`}
                                >
                                  {isExpanded ? (
                                    <Minus className="w-3.5 h-3.5" />
                                  ) : (
                                    <Plus className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Micro Progress Bar */}
                            <div className="h-1.5 w-full bg-[#FAF8F5] dark:bg-[#121316] rounded-full overflow-hidden border border-[#EAE5DC]/60 dark:border-[#8C9DA8]/15 mt-1.5">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: activeColor }}
                                initial={{ width: 0 }}
                                animate={{ width: isScored ? `${Math.min(100, Math.max(0, numScore))}%` : "0%" }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                              />
                            </div>

                            {/* Dropdown block when expanded: Question, WHY IT MATTERS, WE CHECK */}
                            <AnimatePresence>
                              {isExpanded && sutraEntry && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden mt-2 pt-2 pb-1 border-t border-dashed border-[#EAE5DC] dark:border-[#8C9DA8]/20 space-y-2 text-left"
                                >
                                  {/* Question (italicized) */}
                                  <p className="italic text-xs text-[#1A1F26] dark:text-[#FAF8F5] leading-relaxed">
                                    &ldquo;{sutraEntry.question}&rdquo;
                                  </p>

                                  {/* WHY IT MATTERS */}
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#7A3F1E] dark:text-[#D4AF37] block">
                                      WHY IT MATTERS
                                    </span>
                                    <p className="text-[11px] text-[#5B564E] dark:text-[#C2BCB0] leading-normal font-sans">
                                      {sutraEntry.why}
                                    </p>
                                  </div>

                                  {/* WE CHECK */}
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#7A3F1E] dark:text-[#D4AF37] block">
                                      WE CHECK
                                    </span>
                                    <p className="text-[11px] text-[#5B564E] dark:text-[#C2BCB0] leading-normal font-sans">
                                      {sutraEntry.check}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="pt-2.5 mt-3 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 flex items-center justify-between text-[9px] font-mono text-[#6E7781] dark:text-[#8C9DA8]">
                      <span>Varna ESG Framework 2.0</span>
                      <span>{finalItems.length} Sub-criteria</span>
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
