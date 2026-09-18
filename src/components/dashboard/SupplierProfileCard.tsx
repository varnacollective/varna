"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import type { DataTier } from "@/components/ui/DataTierBadge";
import VarnaScoreHoverCard from "@/components/ui/VarnaScoreHoverCard";
import SDGBadge from "@/components/ui/SDGBadge";
import ConfidenceRing from "@/components/ui/ConfidenceRing";
import ConfidenceChecklistHoverCard from "@/components/ui/ConfidenceChecklistHoverCard";
import type { SupplierConfidenceData } from "@/lib/mock-data";
import { SUPPLIER_CONFIDENCE_CHECKLISTS } from "@/lib/mock-data";
import {
  Leaf,
  CheckCircle2,
  Zap,
  Award,
  RefreshCw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import BrandLogo from "@/components/ui/BrandLogo";

export interface BadgeConfig {
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
}

export function getBadgeConfig(badgeText: string): BadgeConfig {
  const text = badgeText.toLowerCase();

  if (text.includes("peta") || text.includes("cruelty") || text.includes("vegan") || text.includes("ethical")) {
    return {
      icon: Leaf,
      bgClass: "bg-[#738678]",
      textClass: "text-[#E8E2D1]",
    };
  }

  if (text.includes("dpiit") || text.includes("startup") || text.includes("msme") || text.includes("udyam")) {
    return {
      icon: Zap,
      bgClass: "bg-[#7A3F1E]",
      textClass: "text-[#F3EFE0]",
    };
  }

  if (text.includes("refillable") || text.includes("refill") || text.includes("waste") || text.includes("circular")) {
    return {
      icon: RefreshCw,
      bgClass: "bg-[#2F3C52]",
      textClass: "text-[#D8CFB8]",
    };
  }

  if (text.includes("iso")) {
    return {
      icon: ShieldCheck,
      bgClass: "bg-[#6F848F]",
      textClass: "text-[#F3EFE0]",
    };
  }

  if (text.includes("material") || text.includes("innovation")) {
    return {
      icon: Award,
      bgClass: "bg-[#2F3C52]",
      textClass: "text-[#D8CFB8]",
    };
  }

  if (text.includes("women") || text.includes("craft") || text.includes("led")) {
    return {
      icon: CheckCircle2,
      bgClass: "bg-[#7A3F1E]",
      textClass: "text-[#F3EFE0]",
    };
  }

  return {
    icon: Award,
    bgClass: "bg-[#6F848F]",
    textClass: "text-[#F3EFE0]",
  };
}

export type SupplierBadgeItem = string | { label: string; [key: string]: any };

function BadgeOverflowPopover({
  hiddenBadges,
}: {
  hiddenBadges: SupplierBadgeItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: false,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverHeight = hiddenBadges.length * 36 + 40;
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < popoverHeight && rect.top > popoverHeight;

      setCoords({
        top: placeAbove ? rect.top - 8 : rect.bottom + 8,
        left: Math.min(Math.max(12, rect.left - 40), window.innerWidth - 240),
        placeAbove,
      });
    }
  }, [hiddenBadges.length]);

  const togglePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, updateCoords]);

  return (
    <div className="relative inline-block shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={togglePopover}
        onMouseEnter={() => {
          updateCoords();
          setIsOpen(true);
        }}
        className="h-6.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#6F848F]/25 dark:bg-[#D8CFB8]/20 text-[#222326] dark:text-[#D8CFB8] hover:bg-[#6F848F]/40 dark:hover:bg-[#D8CFB8]/30 transition-all flex items-center cursor-pointer shadow-xs active:scale-95 select-none"
        aria-expanded={isOpen}
      >
        +{hiddenBadges.length} MORE
      </button>

      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: coords.placeAbove ? "auto" : `${coords.top}px`,
              bottom: coords.placeAbove ? `${window.innerHeight - coords.top}px` : "auto",
              left: `${coords.left}px`,
            }}
            className="z-[9999] bg-[#222326] text-[#D8CFB8] dark:bg-[#1E2024] dark:text-[#E8E2D1] p-3.5 rounded-xl shadow-2xl border border-[#6F848F]/40 min-w-[200px] max-w-[280px] space-y-2 font-sans select-none animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#6F848F]/30 pb-1.5 mb-1">
              <span className="text-[9px] uppercase tracking-widest text-[#6F848F] dark:text-[#D8CFB8]/60 font-semibold">
                Additional Certifications
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#6F848F] hover:text-[#D8CFB8] text-xs p-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
              {hiddenBadges.map((badge, idx) => {
                const text = typeof badge === "string" ? badge : badge?.label || "";
                if (!text) return null;
                const { icon: Icon, bgClass, textClass } = getBadgeConfig(text);
                return (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${bgClass} ${textClass}`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {text}
                  </span>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export interface SupplierProfileCardProps {
  name: string;
  legalName: string;
  location: string;
  logoPath?: string;
  dataTier: DataTier;
  varnaScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  cScore?: number;
  carbonScore?: number;
  skuCount: number;
  totalUnits: number;
  confidenceScore: number;
  confidenceColor?: string;
  confidenceDasharray?: string;
  badges?: SupplierBadgeItem[];
  tags?: { icon: typeof ShieldCheck; label: string; colorClass: string }[];
  categoryBars: { label: string; val: number }[];
  barColorClass: string;
  quote?: string;
  description?: string;
  summary?: string;
  sdgIds?: number[];
  sdgObjects?: Array<{ sdg_number: number; is_primary?: boolean; primary_narrative?: string | null }>;
  liveConfidenceData?: Record<string, SupplierConfidenceData>;
}

export default function SupplierProfileCard({
  name,
  legalName,
  location,
  logoPath,
  dataTier,
  varnaScore,
  eScore,
  sScore,
  gScore,
  cScore = 0,
  carbonScore: carbonScoreProp,
  skuCount,
  totalUnits,
  confidenceScore,
  badges = [],
  tags = [],
  categoryBars,
  barColorClass,
  quote,
  summary,
  sdgIds = [],
  sdgObjects = [],
  liveConfidenceData,
}: SupplierProfileCardProps) {
  const carbonScore = carbonScoreProp ?? cScore ?? 0;

  const confidenceData =
    (liveConfidenceData && liveConfidenceData[name]) ||
    (liveConfidenceData &&
      Object.entries(liveConfidenceData).find(
        ([k]) =>
          k.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(k.toLowerCase())
      )?.[1]) ||
    SUPPLIER_CONFIDENCE_CHECKLISTS[name] ||
    Object.entries(SUPPLIER_CONFIDENCE_CHECKLISTS).find(
      ([k]) =>
        k.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(k.toLowerCase())
    )?.[1] ||
    null;

  const effectiveConfidence = confidenceData?.score ?? confidenceScore ?? 52;
  const isVerified = dataTier === "verified" || effectiveConfidence >= 60;

  const lowerName = name.toLowerCase();
  const quoteText =
    quote ||
    summary ||
    (lowerName.includes("bare")
      ? "Zero-waste personal care formulations with 100% circular packaging and ethically sourced botanicals."
      : lowerName.includes("kheoni")
      ? "Zero-chemical organic agricultural products supporting rural livelihoods and bio-diverse farming practices."
      : "High-impact handloom textiles produced under strict fair wage compliance and traditional artisan preservation.");

  const visibleBadges = badges.slice(0, 3);
  const hiddenBadges = badges.slice(3);

  const supplierDetails = {
    "Legal Entity": legalName && legalName !== name ? legalName : undefined,
    "Location": location,
    "Assessment Tier": dataTier === "verified" ? "Verified Enterprise" : "Self-Reported",
    "Varna Score": `${varnaScore} / 100`,
    "Data Confidence": `${confidenceScore}%`,
    "Sourced Portfolio": `${skuCount} SKUs (${totalUnits.toLocaleString()} Units)`,
    "Certifications": badges?.length ? badges.join(", ") : undefined,
  };

  return (
    <Card
      variant={isVerified ? "verified" : "default"}
      className="p-6 sm:p-7 h-[580px] w-full flex flex-col justify-between transition-all duration-300 relative font-sans"
      hoverEffect={true}
      data-varna-card="supplier-profile-card"
    >
      {/* Upper Content Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* 1. Header Block: Supplier Name + Status Badge & Varna Score */}
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 mb-1 min-w-0">
              <BrandLogo
                logoPath={logoPath}
                alt={name}
                name={name}
                size="sm"
                entityType="supplier"
                details={supplierDetails}
              />
              <h4 
                className="text-lg sm:text-xl font-sans text-[#222326] dark:text-[#FAF6EE] font-bold tracking-tight truncate"
                title={name}
              >
                {name}
              </h4>
            </div>
            {/* Subtitle: Legal Name • Location (Clean Ellipsis Overflow) */}
            <p className="text-xs text-[#6F848F] dark:text-[#8C9DA8] font-light truncate" title={`${legalName} • ${location}`}>
              {legalName} &bull; {location}
            </p>
          </div>

          {/* Top-Right: Varna Score */}
          <VarnaScoreHoverCard
            score={varnaScore}
            eScore={eScore}
            sScore={sScore}
            gScore={gScore}
            cScore={carbonScore}
            supplierName={name}
          >
            <motion.div
              className="flex flex-col items-center cursor-help select-none pl-2 shrink-0"
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <span className="text-2xl font-sans font-bold tracking-tighter text-[#7A3F1E] dark:text-[#FAF6EE]">
                {varnaScore}
              </span>
              <span className="text-[7px] font-sans font-semibold uppercase tracking-widest text-[#6F848F] dark:text-[#8C9DA8] mt-0.5">
                Varna Score
              </span>
            </motion.div>
          </VarnaScoreHoverCard>
        </div>

        {/* 2. Sourced Summary Line */}
        <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#738678] dark:text-[#8AA391] mb-3">
          Sourced {skuCount} SKUs | Units Ordered: {totalUnits.toLocaleString()}
        </div>

        {/* 3. Certification Badges (Wrapped nicely with distinct icons) */}
        {badges && badges.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4 h-7 shrink-0 relative">
            {visibleBadges.map((badge, idx) => {
              const text = typeof badge === "string" ? badge : badge?.label || "";
              if (!text) return null;
              const { icon: Icon, bgClass, textClass } = getBadgeConfig(text);
              return (
                <span
                  key={`${text}-${idx}`}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-xs inline-flex shrink-0 h-6.5 ${bgClass} ${textClass}`}
                  title={text}
                >
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[110px]">{text}</span>
                </span>
              );
            })}

            {hiddenBadges.length > 0 && (
              <BadgeOverflowPopover hiddenBadges={hiddenBadges} />
            )}
          </div>
        )}

        {/* 4. Unified E/S/G/C Progress Bars with Standard height & pillar token colors */}
        <div className="space-y-3 mb-3">
          {categoryBars.slice(0, 4).map((cat) => {
            const isEnv = cat.label.toLowerCase().includes("env");
            const isSoc = cat.label.toLowerCase().includes("soc");
            const isGov = cat.label.toLowerCase().includes("gov");

            const barColor = isEnv ? "#738678" : isSoc ? "#B85333" : isGov ? "#6F848F" : "#A89C82";

            return (
              <div key={cat.label} className="space-y-1 font-sans">
                <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-[#6F848F] dark:text-[#8C9DA8] font-medium">
                  <span>{cat.label}</span>
                  <span className="font-mono font-bold text-[#1A1F26] dark:text-[#FAF6EE]">{cat.val}%</span>
                </div>
                <div className="h-2 bg-[#6F848F]/15 dark:bg-[#18191D] rounded-full overflow-hidden border border-[#EAE5DC]/60 dark:border-[#8C9DA8]/15">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${cat.val}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Testimonial Quote Callout (CSS line-clamp-2 with title for non-truncated view) */}
        <div 
          className="bg-[#6F848F]/10 dark:bg-[#1A1D23] border-l-2 border-[#7A3F1E] dark:border-[#9E5528] px-3 py-2 rounded-r my-2 shrink-0"
          title={quoteText}
        >
          <p className="text-[11px] italic text-[#222326]/85 dark:text-[#FAF6EE]/90 line-clamp-2 leading-snug font-sans">
            "{quoteText}"
          </p>
        </div>
      </div>

      {/* 6. Footer Row: SDG Alignment Index + Evidence Quality Confidence Ring */}
      <div className="mt-auto pt-3 border-t border-[#6F848F]/20 dark:border-[#8C9DA8]/20 shrink-0 font-sans">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[9px] uppercase tracking-widest text-[#6F848F] dark:text-[#8C9DA8] font-semibold">
            SDG Alignment Index
          </p>
          <span className="text-[9px] uppercase tracking-widest text-[#6F848F] dark:text-[#8C9DA8] font-semibold">
            Evidence Quality
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 items-center">
            {sdgObjects && sdgObjects.length > 0 ? (
              sdgObjects.map((sdg, idx) => (
                <SDGBadge
                  key={`${name}-sdg-${sdg.sdg_number}-${idx}`}
                  goalNumber={sdg.sdg_number}
                  isPrimary={sdg.is_primary}
                  primaryNarrative={sdg.primary_narrative}
                  size={46}
                />
              ))
            ) : sdgIds && sdgIds.length > 0 ? (
              sdgIds.map((goalNum, idx) => (
                <SDGBadge
                  key={`${name}-sdg-${goalNum}-${idx}`}
                  goalNumber={goalNum}
                  size={46}
                />
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <SDGBadge key={i} isAwaitingVerification={true} size={46} />
              ))
            )}
          </div>

          <ConfidenceChecklistHoverCard
            supplierName={name}
            score={effectiveConfidence}
            totalConfirmed={
              confidenceData?.totalConfirmed ||
              `${confidenceData?.checklist?.filter((c: any) => c.score === 1).length || 0} tracked data points confirmed`
            }
            status={confidenceData?.status || (effectiveConfidence >= 60 ? "Verified" : "Self-Reported")}
            checklist={confidenceData?.checklist || []}
          >
            <div className="cursor-pointer flex-shrink-0 transition-transform duration-200 hover:scale-108">
              <ConfidenceRing
                score={effectiveConfidence}
                size={52}
                strokeWidth={4}
              />
            </div>
          </ConfidenceChecklistHoverCard>
        </div>
      </div>
    </Card>
  );
}

export const SupplierCard = SupplierProfileCard;
