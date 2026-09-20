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
import { ExternalLink, ShoppingBag, Quote } from "lucide-react";
import Link from "next/link";

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
}: SupplierCardV2Props) {
  const isUKHI = name.toLowerCase().includes("ukhi");
  const isBare = name.toLowerCase().includes("bare");
  const isKheoni = name.toLowerCase().includes("kheoni");

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
    ? "High-impact handloom textiles produced under strict fair-wage compliance and traditional artisan preservation."
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
    score: Math.round(varnaScore),
    eScore: Math.round(eScore),
    sScore: Math.round(sScore),
    gScore: Math.round(gScore),
    cScore: Math.round(cScore),
    supplierName: name,
  };

  const bandLabel = getBandLabel(varnaScore);

  // Certification Badges slicing (3 visible + "+N more" popover)
  const visibleBadges = badges.slice(0, 3);
  const hiddenBadges = badges.slice(3);

  return (
    <div
      className="
        varna-supplier-card-v2
        bg-white dark:bg-[#20242B]
        border border-black/[0.07] dark:border-white/[0.08]
        shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
        dark:shadow-none dark:border-t-white/[0.12]
        rounded-[24px] p-7 lg:p-8
        flex flex-col justify-between h-full w-full
        hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        relative overflow-visible
      "
    >

      {/* Top Header Row (Logo, Title, Score - P1-1, P1-3, P1-4 fixed) */}
      <div>
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-black/[0.07] dark:border-white/[0.08]">
          {/* Logo Tile + Title & Subtitle Stack */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {/* 72px White Logo Container */}
            <div className="w-[72px] h-[72px] rounded-[18px] bg-white dark:bg-white border border-black/10 shadow-xs flex items-center justify-center p-2.5 shrink-0">
              <BrandLogo
                logoPath={logoPath}
                alt={name}
                name={name}
                size="md"
                entityType="supplier"
              />
            </div>

            {/* Title & Subtitle Stack (No overlap! P1-4 fixed) */}
            <div className="flex flex-col min-w-0 pr-2">
              <h3 className="text-xl lg:text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-snug break-words">
                {name}
              </h3>
              <p className="text-xs lg:text-[13px] text-[#6F6A61] dark:text-[#9A948A] font-normal mt-1 leading-snug break-words">
                {!isDuplicateName && legalName ? `${legalName} • ${location}` : location}
              </p>
            </div>
          </div>

          {/* Varna Score Eyebrow & Display Block (Wrapped in VarnaScoreHoverCard, NO TRANSFORM! P1-4 fixed) */}
          <VarnaScoreHoverCard {...varnaScoreData}>
            <div className="flex flex-col items-end shrink-0 cursor-help group">
              <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#6F6A61] dark:text-[#9A948A] mb-0.5">
                VARNA SCORE
              </span>

              <div className="text-3xl lg:text-[40px] font-light text-[#7D3F1E] dark:text-[#E07A57] tracking-tight leading-none flex items-baseline tabular-nums">
                {varnaScore.toFixed(1)}
                <span className="text-sm font-normal text-[#7D3F1E]/70 dark:text-[#E07A57]/70 ml-0.5">
                  /100
                </span>
              </div>

              {/* D1 Band Rating Pill */}
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 text-[#7D3F1E] dark:text-[#E07A57] text-[11px] font-medium">
                {bandLabel}
              </div>
            </div>
          </VarnaScoreHoverCard>
        </div>

        {/* Stat Row: SKUs, Units, Evidence Confidence (3 Blocks with Hairlines) */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b border-black/[0.07] dark:border-white/[0.08] items-center text-center sm:text-left">
          {/* Block 1: SKUs sourced */}
          <div>
            <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block">
              SKUs sourced
            </span>
            <span className="text-xl lg:text-2xl font-light text-[#1F1B16] dark:text-[#F3EFE7] mt-0.5 block tabular-nums">
              {skuCount}
            </span>
          </div>

          {/* Block 2: Units ordered */}
          <div className="border-l border-black/[0.07] dark:border-white/[0.08] pl-4">
            <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block">
              Units ordered
            </span>
            <span className="text-xl lg:text-2xl font-light text-[#1F1B16] dark:text-[#F3EFE7] mt-0.5 block tabular-nums">
              {totalUnits.toLocaleString("en-US")}
            </span>
          </div>

          {/* Block 3: Evidence Confidence with Interactive Hover Card */}
          <div className="border-l border-black/[0.07] dark:border-white/[0.08] pl-4">
            <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block mb-1">
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
                <div className="flex items-center gap-2 cursor-help">
                  <ConfidenceRing score={confidencePct} size={32} strokeWidth={3.5} />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
                      {confidenceLevel}
                    </span>
                    <span className="text-[10px] text-[#6F6A61] dark:text-[#9A948A] font-light">
                      {confidencePct}% • 0.75×
                    </span>
                  </div>
                </div>
              </ConfidenceChecklistHoverCard>
            ) : (
              <div className="flex items-center gap-2">
                <ConfidenceRing score={confidencePct} size={32} strokeWidth={3.5} />
                <span className="text-sm font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
                  {confidenceLevel} ({confidencePct}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pillar Progress Bars (4 Rows in exact order with Per-Pillar Colors - Part 2 fixed) */}
        <div className="space-y-3.5 my-5">
          {bars.map((b) => {
            const pillarColor =
              b.label.includes("Env") ? "#55705A" :
              b.label.includes("Social") ? "#7D3F1E" :
              b.label.includes("Gov") ? "#6F8391" :
              "#2B3A55"; // Carbon Impact (light blue #8FA6D0 in dark)

            return (
              <div key={b.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5B564E] dark:text-[#C2BCB0] font-medium">
                    {b.label}
                  </span>
                  <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-semibold tabular-nums">
                    {b.val.toFixed(1)}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ backgroundColor: pillarColor, width: `${Math.min(100, Math.max(0, b.val))}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, b.val))}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* D4 Derived Insight: Strongest Pillar Chip */}
          <div className="pt-2 text-[11px] text-[#6F6A61] dark:text-[#9A948A] font-medium">
            Strongest pillar: <span className="text-[#7D3F1E] dark:text-[#E07A57]">{strongestPillarName} ({maxPillarVal.toFixed(1)}%)</span>
          </div>
        </div>

        {/* "In their words" Quote Block */}
        {quoteText && (
          <div className="my-4 p-4 rounded-2xl bg-[#F7F3EA] dark:bg-[#272C34] border border-black/5 dark:border-white/5 relative">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6F6A61] dark:text-[#9A948A] block mb-1">
              In their words
            </span>
            <p className="varna-quote-text text-[#7D3F1E] dark:text-[#F1E6C8] text-lg lg:text-[20px] leading-snug italic font-normal">
              &ldquo;{quoteText}&rdquo;
            </p>
          </div>
        )}

        {/* Certifications Row (Outlined Pills + "+N more" Popover - D6 fixed) */}
        {badges.length > 0 && (
          <div className="my-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6F6A61] dark:text-[#9A948A] block mb-2">
              Certifications & Badges
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              {visibleBadges.map((badge, idx) => {
                const label = typeof badge === "string" ? badge : badge.label;
                const cfg = getBadgeConfig(label);
                const IconComp = cfg.icon;

                return (
                  <div
                    key={idx}
                    className="
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                      border border-black/10 dark:border-white/15
                      bg-[#FAF8F4] dark:bg-[#272C34] text-xs font-normal
                      text-[#1F1B16] dark:text-[#F3EFE7] min-h-[36px]
                    "
                  >
                    <IconComp className="w-3.5 h-3.5 text-[#7D3F1E] dark:text-[#E07A57]" strokeWidth={1.8} />
                    <span>{label}</span>
                  </div>
                );
              })}

              {/* D6 Overflow Popover */}
              {hiddenBadges.length > 0 && (
                <BadgeOverflowPopoverV2 hiddenBadges={hiddenBadges} />
              )}
            </div>
          </div>
        )}

        {/* UN SDGs Row (Official Badges preserved - Constraint 4) */}
        {sdgObjects && sdgObjects.length > 0 && (
          <div className="my-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6F6A61] dark:text-[#9A948A] block mb-2">
              UN SDGs
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              {sdgObjects.map((sdg: any, idx: number) => (
                <SDGBadge
                  key={sdg.id || sdg.sdg_number || idx}
                  goalNumber={sdg.sdg_number ?? sdg.id ?? sdg.goalNumber ?? sdg.number}
                  isPrimary={sdg.is_primary ?? sdg.isStarred ?? sdg.isPrimary ?? false}
                  primaryNarrative={sdg.primary_narrative ?? sdg.narrative ?? null}
                  size={46}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Links (Pinned to Bottom with mt-auto) */}
      <div className="pt-4 mt-6 border-t border-black/[0.07] dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold">
        <button
          type="button"
          onClick={() => alert(`Viewing detailed Varna Scorecard for ${name}`)}
          className="text-[#7D3F1E] dark:text-[#E07A57] hover:underline underline-offset-4 flex items-center gap-1.5 cursor-pointer min-h-[44px] px-2 items-center"
        >
          <span>View Scorecard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <Link
          href="/dashboard?section=orders"
          className="text-[#7D3F1E] dark:text-[#E07A57] hover:underline underline-offset-4 flex items-center gap-1.5 cursor-pointer min-h-[44px] px-2 items-center"
        >
          <span>View Orders</span>
          <ShoppingBag className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
