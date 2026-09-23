"use client";

import { useState, useRef, useCallback, memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export interface SDGDefinition {
  id: number;
  name: string;
  shortLabel?: string;
  color?: string;
  textColor?: string;
}

export const OFFICIAL_UN_SDGS: Record<number, SDGDefinition> = {
  1: { id: 1, name: "No Poverty" },
  2: { id: 2, name: "Zero Hunger" },
  3: { id: 3, name: "Good Health and Well-being" },
  4: { id: 4, name: "Quality Education" },
  5: { id: 5, name: "Gender Equality" },
  6: { id: 6, name: "Clean Water and Sanitation" },
  7: { id: 7, name: "Affordable and Clean Energy" },
  8: { id: 8, name: "Decent Work and Economic Growth" },
  9: { id: 9, name: "Industry, Innovation and Infrastructure" },
  10: { id: 10, name: "Reduced Inequalities" },
  11: { id: 11, name: "Sustainable Cities and Communities" },
  12: { id: 12, name: "Responsible Consumption and Production" },
  13: { id: 13, name: "Climate Action" },
  14: { id: 14, name: "Life Below Water" },
  15: { id: 15, name: "Life on Land" },
  16: { id: 16, name: "Peace, Justice and Strong Institutions" },
  17: { id: 17, name: "Partnerships for the Goals" },
};

export function getSDGIconPath(goalNumber: number): string {
  const padded = String(goalNumber).padStart(2, "0");
  return `/logos/SDG/SDG_${padded}.png`;
}

interface SDGBadgeProps {
  goalNumber?: number | string | null;
  size?: number; // default 46px
  isAwaitingVerification?: boolean;
  isPrimary?: boolean;
  primaryNarrative?: string | null;
  className?: string;
}

const SDGBadge = memo(function SDGBadge({
  goalNumber,
  size = 46,
  isAwaitingVerification = false,
  isPrimary = false,
  primaryNarrative,
  className = "",
}: SDGBadgeProps) {
  const [hasError, setHasError] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{
    vertical: "top" | "bottom";
    horizontal: "center" | "left" | "right";
  }>({ vertical: "top", horizontal: "center" });

  const numericId = typeof goalNumber === "string" ? parseInt(goalNumber, 10) : goalNumber;
  const sdg = numericId && OFFICIAL_UN_SDGS[numericId] ? OFFICIAL_UN_SDGS[numericId] : null;

  const updatePlacement = useCallback(() => {
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();

    // Look for parent card boundary, falling back to viewport
    const cardEl =
      badgeRef.current.closest("[data-varna-card]") ||
      badgeRef.current.closest(".relative") ||
      badgeRef.current.parentElement;
    const cardRect = cardEl ? cardEl.getBoundingClientRect() : null;

    const boundLeft = Math.max(cardRect ? cardRect.left + 12 : 12, 12);
    const boundRight = Math.min(cardRect ? cardRect.right - 12 : window.innerWidth - 12, window.innerWidth - 12);

    const badgeCenter = rect.left + rect.width / 2;
    // Estimated half width of tooltip (max-w is ~220px)
    const approxHalfWidth = 110;

    let horizontal: "center" | "left" | "right" = "center";
    if (badgeCenter - approxHalfWidth < boundLeft) {
      horizontal = "left"; // Shift right: align left edge of tooltip with badge
    } else if (badgeCenter + approxHalfWidth > boundRight) {
      horizontal = "right"; // Shift left: align right edge of tooltip with badge
    }

    const boundTop = Math.max(cardRect ? cardRect.top + 10 : 10, 10);
    const spaceAbove = rect.top - boundTop;
    const boundBottom = Math.min(cardRect ? cardRect.bottom - 10 : window.innerHeight - 10, window.innerHeight - 10);
    const spaceBelow = boundBottom - rect.bottom;

    const vertical: "top" | "bottom" = spaceAbove < 60 && spaceBelow > spaceAbove ? "bottom" : "top";

    setPlacement({ vertical, horizontal });
  }, []);

  const horizontalClass =
    placement.horizontal === "left"
      ? "left-0 translate-x-0"
      : placement.horizontal === "right"
      ? "right-0 left-auto translate-x-0"
      : "left-1/2 -translate-x-1/2";

  const verticalClass =
    placement.vertical === "bottom"
      ? "top-full mt-2"
      : "bottom-full mb-2";

  // If no valid SDG or explicitly marked as awaiting verification:
  if (!sdg || isAwaitingVerification || goalNumber === "?" || goalNumber === null) {
    return (
      <div
        ref={badgeRef}
        onMouseEnter={updatePlacement}
        onFocus={updatePlacement}
        className={`relative group inline-flex flex-col items-center justify-center border border-slate-mist/35 bg-slate-mist/10 rounded-none cursor-help transition-all duration-200 hover:border-slate-mist/60 shrink-0 ${className}`}
        style={{ width: size, height: size }}
        title="SDG Alignment: Awaiting verification during assessment interval"
      >
        <Clock className="w-4 h-4 text-slate-mist/70 mb-0.5" strokeWidth={1.5} />
        <span className="text-[7.5px] uppercase font-semibold tracking-wider text-slate-mist/80 text-center leading-tight">
          Awaiting
        </span>

        {/* Hover tooltip */}
        <div
          className={`absolute ${verticalClass} ${horizontalClass} opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50`}
        >
          <div className="w-max max-w-[180px] sm:max-w-[200px] text-center px-2.5 py-1.5 shadow-xl border border-[#6F848F]/40 dark:border-[#8C9DA8]/30 bg-[#222326] text-[#D8CFB8]">
            <span className="text-[9.5px] font-sans font-medium uppercase tracking-wider leading-snug block whitespace-normal break-words">
              Awaiting Verification
            </span>
          </div>
        </div>
      </div>
    );
  }

  const iconSrc = getSDGIconPath(sdg.id);
  const altText = `SDG ${sdg.id}: ${sdg.name}${isPrimary ? " (Primary Goal)" : ""}`;

  return (
    <motion.div
      ref={badgeRef}
      onMouseEnter={updatePlacement}
      onFocus={updatePlacement}
      whileHover={{ scale: 1.08, y: -2 }}
      transition={{ type: "spring", stiffness: 450, damping: 20 }}
      className={`relative group inline-flex items-center justify-center rounded-none shadow-sm cursor-help select-none shrink-0 ${
        isPrimary ? "ring-2 ring-[#7A3F1E] dark:ring-[#D8CFB8] ring-offset-1 ring-offset-transparent" : ""
      } ${className}`}
      style={{
        width: size,
        height: size,
      }}
      title={altText}
    >
      {/* Primary indicator star badge */}
      {isPrimary && (
        <span
          className="absolute -top-1 -right-1 z-10 w-3.5 h-3.5 bg-[#7A3F1E] dark:bg-[#D8CFB8] text-[#D8CFB8] dark:text-[#18191D] rounded-full flex items-center justify-center text-[8px] font-bold shadow-xs"
          title="Primary SDG"
        >
          ★
        </span>
      )}

      {hasError ? (
        /* Graceful fallback if image fails to load */
        <div
          className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#222326] border border-slate-300 dark:border-[#6F848F]/40 text-slate-700 dark:text-[#D8CFB8] text-center p-0.5 select-none"
          style={{ width: size, height: size }}
        >
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#6F848F] leading-none mb-0.5">
            SDG
          </span>
          <span className="text-sm font-black leading-none font-sans">
            {sdg.id}
          </span>
        </div>
      ) : (
        <Image
          src={iconSrc}
          alt={altText}
          width={size}
          height={size}
          loading="lazy"
          className="w-full h-full object-contain pointer-events-none select-none"
          onError={() => setHasError(true)}
        />
      )}

      {/* Hover tooltip showing full goal name and narrative */}
      <div
        className={`absolute ${verticalClass} ${horizontalClass} opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50`}
      >
        <div className="w-max max-w-[220px] sm:max-w-[260px] text-center px-3 py-2 shadow-xl border border-[#6F848F]/40 dark:border-[#8C9DA8]/30 bg-[#222326] text-[#D8CFB8] rounded-sm">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider leading-snug block text-[#FAF6EE]">
            SDG {sdg.id}: {sdg.name} {isPrimary ? "(Primary)" : ""}
          </span>
          {primaryNarrative && (
            <span className="text-[9px] font-sans font-light italic leading-tight block mt-1 text-[#D8CFB8]/80 text-left">
              "{primaryNarrative}"
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default SDGBadge;
