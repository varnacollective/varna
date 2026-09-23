"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import VarnaScoreHoverCard, { type VarnaScoreData } from "@/components/ui/VarnaScoreHoverCard";
import SDGBadge from "@/components/ui/SDGBadge";
import ConfidenceRing from "@/components/ui/ConfidenceRing";
import ConfidenceChecklistHoverCard from "@/components/ui/ConfidenceChecklistHoverCard";
import type { SupplierConfidenceData } from "@/lib/mock-data";
import { SUPPLIER_CONFIDENCE_CHECKLISTS } from "@/lib/mock-data";
import BrandLogo from "@/components/ui/BrandLogo";
import { getBadgeConfig, type SupplierBadgeItem } from "@/components/dashboard/SupplierProfileCard";
import { ExternalLink, ShoppingBag, Quote, FileText } from "lucide-react";
import Link from "next/link";
import { getPartnerReportUrl } from "@/lib/partner-reports";
import PillarBreakdownHoverCard from "@/components/ui/PillarBreakdownHoverCard";
import { getPartnerPillarBreakdown } from "@/lib/sub-criteria-labels";

interface SupplierCardV2Props {
  name: string;
  legalName?: string;
  logoPath?: string;
  location?: string;
  varnaScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
  carbonScore: number;
  skuCount?: number;
  totalUnits?: number;
  confidenceScore?: number;
  confidenceColor?: string;
  confidenceDasharray?: string;
  badges?: SupplierBadgeItem[];
  categoryBars?: { label: string; val: number }[];
  sdgObjects?: any[];
  liveConfidenceData?: Record<string, SupplierConfidenceData>;
  enterpriseId?: string;
  reportUrl?: string | null;
  scoresSummary?: Record<string, any>;
}

function getBandLabel(score: number): string {
  if (score >= 85) return "Leader";
  if (score >= 70) return "Advanced";
  if (score >= 55) return "Emerging";
  if (score >= 40) return "Foundational";
  return "Not Ready";
}

function getConfidenceLevelWord(score: number): string {
  if (score >= 60) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

// Badge Overflow Popover (D6) using React Portal
function BadgeOverflowPopoverV2({ hiddenBadges }: { hiddenBadges: SupplierBadgeItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePopover = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={togglePopover}
        className="
          px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15
          bg-[#F7F3EA] dark:bg-[#272C34] text-[#5B564E] dark:text-[#C2BCB0]
          hover:border-[#7D3F1E]/40 text-xs font-semibold tracking-wide
          transition-colors cursor-pointer min-h-[36px] inline-flex items-center
        "
      >
        +{hiddenBadges.length} more
      </button>

      {isOpen && mounted && createPortal(
        <div
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          className="fixed z-[9999] bg-white dark:bg-[#20242B] border border-black/10 dark:border-white/15 p-4 rounded-2xl shadow-xl w-64 text-left font-sans"
        >
          <p className="text-xs uppercase tracking-wider font-semibold text-[#6F6A61] dark:text-[#9A948A] mb-2.5">
            Additional Certifications
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {hiddenBadges.map((badge, idx) => {
              const label = typeof badge === "string" ? badge : badge.label;
              return (
                <div key={idx} className="text-xs text-[#1F1B16] dark:text-[#F3EFE7] font-normal py-1 border-b border-black/5 dark:border-white/5 last:border-0">
                  • {label}
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function SupplierCardV2({
  name,
  legalName,
  logoPath,
  location = "Karnataka, India",
  varnaScore,
  eScore,
  sScore,
  gScore,
  cScore,
  carbonScore,
  skuCount = 2,
  totalUnits = 1200,
  confidenceScore = 63,
  confidenceColor = "#55705A",
  badges = [],
  categoryBars,
  sdgObjects = [],
  liveConfidenceData,
  enterpriseId,
  reportUrl,
  scoresSummary,
}: SupplierCardV2Props) {
  const isUKHI = name.toLowerCase().includes("ukhi");
  const isBare = name.toLowerCase().includes("bare");
  const isKheoni = name.toLowerCase().includes("kheoni");

  // Resolve full-screen PDF report URL for this partner
  const resolvedReportUrl =
    reportUrl !== undefined
      ? reportUrl
      : getPartnerReportUrl({ name, legalName, enterpriseId });

  // Determine if title equals legal name to avoid duplication (P1-3 fixed)
  const isDuplicateName = legalName && legalName.trim().toLowerCase() === name.trim().toLowerCase();

  // Confidence checklist lookup
  const confidenceEntry =
    (liveConfidenceData && liveConfidenceData[name]) ||
    SUPPLIER_CONFIDENCE_CHECKLISTS[name] ||
    (isUKHI ? SUPPLIER_CONFIDENCE_CHECKLISTS["UKHI India Private Limited"] : null);

  const confidencePct = confidenceEntry?.score ?? confidenceScore;
  const confidenceLevel = getConfidenceLevelWord(confidencePct);

  // Quote text
  const quoteText = isBare
    ? "Zerowaste personal care formulations with 100% circular packaging and ethically sourced botanicals."
    : isUKHI
      ? "Ethically sourced natural ingredients produced under strict fair-wage compliance."
      : isKheoni
        ? "Forest-first organic wellness formulations directly sustaining indigenous tribal collection communities."
        : null;

  // Category bars dataset (Pillar colors)
  const bars = categoryBars || [
    { label: "Environmental", val: eScore },
    { label: "Social", val: sScore },
    { label: "Governance", val: gScore },
    { label: "Carbon Impact", val: carbonScore || cScore },
  ];

  // D4 Derived Insight: Strongest pillar
  let strongestPillarName = "Governance";
  let maxPillarVal = 0;
  bars.forEach((b) => {
    if (b.val > maxPillarVal) {
      maxPillarVal = b.val;
      strongestPillarName = b.label;
    }
  });

  const varnaScoreData: VarnaScoreData = {
    score: varnaScore,
    eScore: Math.round(eScore),
    sScore: Math.round(sScore),
    gScore: Math.round(gScore),
    cScore: Math.round(cScore),
    supplierName: name,
  };

  const bandLabel = getBandLabel(varnaScore);

  // Fallback badges array if props empty (ensures UKHI certificate count is accurately bound)
  const effectiveBadges =
    badges && badges.length > 0
      ? badges
      : isUKHI
        ? ["DPIIT Startup", "Refillable Format", "ISO 14001", "GST Registered"]
        : isBare
          ? ["Cruelty-Free (PETA)", "DPIIT Startup", "Refillable Format", "ISO 14001"]
          : ["DPIIT Startup", "Refillable Format"];

  // Certification Badges slicing (3 visible + "+N more" popover)
  const visibleBadges = effectiveBadges.slice(0, 3);
  const hiddenBadges = effectiveBadges.slice(3);

  const isInProgressSupplier =
    name.toLowerCase().includes("greensole") ||
    name.toLowerCase().includes("marikar") ||
    (legalName && (legalName.toLowerCase().includes("greensole") || legalName.toLowerCase().includes("marikar")));

  return (
    <div
      className="
        varna-supplier-card-v2
        bg-white dark:bg-[#20242B]
        border border-black/[0.07] dark:border-white/[0.08]
        shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
        dark:shadow-none dark:border-t-white/[0.12]
        rounded-[24px] p-5 lg:p-6
        flex flex-col justify-between h-full w-full
        hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        relative overflow-visible
      "
    >

      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-black/[0.07] dark:border-white/[0.08]">
          {/* Logo Tile + Title & Subtitle Stack */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Standardized 56px (w-14 h-14) White Logo Container */}
            <div className="w-14 h-14 rounded-lg border border-gray-200 bg-white flex items-center justify-center p-1 overflow-hidden shrink-0">
              <BrandLogo
                logoPath={logoPath}
                alt={name}
                name={name}
                size="sm"
                entityType="supplier"
              />
            </div>

            {/* Title & Subtitle Stack */}
            <div className="flex flex-col min-w-0 pr-2">
              <div className="flex items-center flex-wrap">
                <h3 className="text-lg lg:text-xl font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-snug break-words">
                  {name}
                </h3>
                {isInProgressSupplier && (
                  <span className="bg-[#EBE6DA] text-[#717882] dark:bg-white/10 dark:text-[#9A948A] text-xs px-2 py-1 rounded-full ml-3 font-normal whitespace-nowrap border border-black/5 dark:border-white/10">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] font-normal mt-0.5 leading-snug break-words">
                {!isDuplicateName && legalName ? `${legalName} • ${location}` : location}
              </p>
            </div>
          </div>

          {/* Varna Score Eyebrow & Display Block */}
          <VarnaScoreHoverCard {...varnaScoreData}>
            <div className="flex flex-col items-end shrink-0 cursor-help group">
              <span className="text-[9px] uppercase tracking-[0.16em] font-semibold text-[#6F6A61] dark:text-[#9A948A] mb-0.5">
                VARNA SCORE
              </span>

              <div className="text-2xl lg:text-[34px] font-light text-[#7D3F1E] dark:text-[#E07A57] tracking-tight leading-none flex items-baseline tabular-nums">
                {varnaScore.toFixed(1)}
                <span className="text-xs font-normal text-[#7D3F1E]/70 dark:text-[#E07A57]/70 ml-0.5">
                  /100
                </span>
              </div>

              {/* D1 Band Rating Pill */}
              <div className="mt-1 px-2 py-0.5 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 text-[#7D3F1E] dark:text-[#E07A57] text-[10px] font-medium">
                {bandLabel}
              </div>
            </div>
          </VarnaScoreHoverCard>
        </div>

        {/* Stat Row: SKUs, Units, Evidence Confidence */}
        <div className="grid grid-cols-3 gap-3 py-3 border-b border-black/[0.07] dark:border-white/[0.08] items-center text-center sm:text-left">
          {/* Block 1: SKUs sourced */}
          <div>
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block">
              SKUs sourced
            </span>
            <span className="text-lg lg:text-xl font-light text-[#1F1B16] dark:text-[#F3EFE7] mt-0.5 block tabular-nums">
              {skuCount}
            </span>
          </div>

          {/* Block 2: Units ordered */}
          <div className="border-l border-black/[0.07] dark:border-white/[0.08] pl-3">
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block">
              Units ordered
            </span>
            <span className="text-lg lg:text-xl font-light text-[#1F1B16] dark:text-[#F3EFE7] mt-0.5 block tabular-nums">
              {totalUnits.toLocaleString("en-US")}
            </span>
          </div>

          {/* Block 3: Simplified Clean Evidence Confidence Widget */}
          <div className="border-l border-black/[0.07] dark:border-white/[0.08] pl-3 flex flex-col items-center sm:items-start justify-center">
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block mb-1">
              Evidence confidence
            </span>

            {confidenceEntry ? (
              <ConfidenceChecklistHoverCard
                supplierName={name}
                score={confidenceEntry.score}
                totalConfirmed={confidenceEntry.totalConfirmed}
                status={confidenceEntry.status}
                checklist={confidenceEntry.checklist}
              >
                <div className="cursor-help group inline-block">
                  <ConfidenceRing score={confidencePct} size={64} strokeWidth={4.5} />
                </div>
              </ConfidenceChecklistHoverCard>
            ) : (
              <div className="inline-block">
                <ConfidenceRing score={confidencePct} size={64} strokeWidth={4.5} />
              </div>
            )}
          </div>
        </div>

        {/* Pillar Progress Bars with Hover Breakdown */}
        <div className="space-y-2.5 my-4">
          {bars.map((b) => {
            const pillarColor =
              b.label.includes("Env") ? "#4C7355" :
                b.label.includes("Social") ? "#B85333" :
                  b.label.includes("Gov") ? "#36424A" :
                    "#7A3F1E";

            const breakdown = getPartnerPillarBreakdown(b.label, scoresSummary, enterpriseId || name);
            const effectivePillarScore = breakdown.pillarScore ?? (b.val !== null && b.val !== undefined && !isNaN(b.val) ? b.val : null);

            return (
              <PillarBreakdownHoverCard
                key={b.label}
                pillarLabel={b.label}
                pillarScore={effectivePillarScore}
                color={pillarColor}
                items={breakdown.items}
                disableScale={true}
                className="w-full block cursor-help outline-none group/pillar rounded-lg p-1 -m-1 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5B564E] dark:text-[#C2BCB0] font-medium group-hover/pillar:text-[#1F1B16] dark:group-hover/pillar:text-white transition-colors">
                      {b.label}
                    </span>
                    <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-semibold tabular-nums">
                      {b.val !== null && b.val !== undefined && !isNaN(b.val) ? b.val.toFixed(1) : "—"}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ backgroundColor: pillarColor, width: `${Math.min(100, Math.max(0, b.val || 0))}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, b.val || 0))}%` }}
                    />
                  </div>
                </div>
              </PillarBreakdownHoverCard>
            );
          })}

          {/* Strongest Pillar Chip */}
          <div className="pt-1 text-[11px] text-[#6F6A61] dark:text-[#9A948A] font-medium">
            Strongest pillar: <span className="text-[#7D3F1E] dark:text-[#E07A57]">{strongestPillarName} ({maxPillarVal.toFixed(1)})</span>
          </div>
        </div>

        {/* "In their words" Quote Block */}
        {quoteText && (
          <div className="my-3 p-3.5 rounded-xl bg-[#F7F3EA] dark:bg-[#272C34] border border-black/5 dark:border-white/5 relative">
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6F6A61] dark:text-[#9A948A] block mb-0.5">
              In their words
            </span>
            <p className="varna-quote-text text-[#7D3F1E] dark:text-[#F1E6C8] text-base lg:text-[17px] leading-snug italic font-normal">
              &ldquo;{quoteText}&rdquo;
            </p>
          </div>
        )}

        {/* Certifications Row */}
        {(effectiveBadges.length > 0 || resolvedReportUrl) && (
          <div className="my-3">
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6F6A61] dark:text-[#9A948A] block mb-1.5">
              Certifications & Badges
            </span>

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                {visibleBadges.map((badge, idx) => {
                  const label = typeof badge === "string" ? badge : badge.label;
                  const cfg = getBadgeConfig(label);
                  const IconComp = cfg.icon;

                  return (
                    <div
                      key={idx}
                      className="
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                        border border-black/10 dark:border-white/15
                        bg-[#FAF8F4] dark:bg-[#272C34] text-[11px] font-normal
                        text-[#1F1B16] dark:text-[#F3EFE7] min-h-[30px]
                      "
                    >
                      <IconComp className="w-3 h-3 text-[#7D3F1E] dark:text-[#E07A57]" strokeWidth={1.8} />
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* View Scorecard Full-Screen Report Button */}
              {resolvedReportUrl && (
                <a
                  href={resolvedReportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                    border border-[#7D3F1E]/30 dark:border-[#E07A57]/35
                    bg-[#7D3F1E]/[0.06] hover:bg-[#7D3F1E] hover:text-white hover:border-[#7D3F1E]
                    dark:bg-[#E07A57]/10 dark:hover:bg-[#E07A57] dark:hover:text-white dark:hover:border-[#E07A57]
                    text-[#7D3F1E] dark:text-[#E07A57]
                    text-[11px] font-semibold tracking-wide
                    transition-all duration-150 shadow-xs cursor-pointer min-h-[30px]
                    group/scorecard
                  "
                  title={`View ${name} Scorecard (PDF)`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#7D3F1E] dark:text-[#E07A57] group-hover/scorecard:text-white transition-colors" strokeWidth={1.8} />
                  <span>View Scorecard</span>
                  <ExternalLink className="w-3 h-3 text-[#7D3F1E]/70 dark:text-[#E07A57]/70 group-hover/scorecard:text-white transition-colors" strokeWidth={1.8} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* UN SDGs Row */}
        {sdgObjects && sdgObjects.length > 0 && (
          <div className="my-3">
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6F6A61] dark:text-[#9A948A] block mb-1.5">
              UN SDGs
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {sdgObjects.map((sdg: any, idx: number) => (
                <SDGBadge
                  key={sdg.id || sdg.sdg_number || idx}
                  goalNumber={sdg.sdg_number ?? sdg.id ?? sdg.goalNumber ?? sdg.number}
                  isPrimary={sdg.is_primary ?? sdg.isStarred ?? sdg.isPrimary ?? false}
                  primaryNarrative={sdg.primary_narrative ?? sdg.narrative ?? null}
                  size={38}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
