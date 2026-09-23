"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Store } from "lucide-react";

export type LogoSize = "sm" | "md" | "lg";

export interface DetailItem {
  label: string;
  value: string | number | null | undefined;
}

export interface BrandLogoProps {
  src?: string | null;
  logoPath?: string | null;
  alt?: string;
  name?: string;
  size?: LogoSize;
  className?: string;
  interactive?: boolean; // Default true
  entityType?: "supplier" | "client";
  details?: Record<string, any> | DetailItem[];
}

function getInitials(name?: string): string {
  if (!name) return "VC";
  const lower = name.trim().toLowerCase();
  if (lower === "a dubai" || lower === "the astor dubai" || lower === "astor dubai") return "AD";
  const cleaned = name.replace(/^(the|an)\s+/i, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "VC";
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function getCleanDetails(
  details?: Record<string, any> | DetailItem[]
): { label: string; value: string | number }[] {
  if (!details) return [];
  const items: { label: string; value: string | number }[] = [];

  if (Array.isArray(details)) {
    details.forEach((item) => {
      if (
        item &&
        item.label &&
        item.value !== null &&
        item.value !== undefined &&
        item.value !== "" &&
        item.value !== "N/A"
      ) {
        items.push({ label: item.label, value: item.value });
      }
    });
  } else if (typeof details === "object") {
    Object.entries(details).forEach(([key, val]) => {
      if (
        val !== null &&
        val !== undefined &&
        val !== "" &&
        val !== "N/A" &&
        (!Array.isArray(val) || val.length > 0)
      ) {
        const displayVal = Array.isArray(val) ? val.join(", ") : String(val);
        if (displayVal.trim()) {
          items.push({ label: key, value: displayVal });
        }
      }
    });
  }

  return items;
}

/**
 * Single unified theme-safe BrandLogo ("logo chip") component with spring hover expansion
 * and dynamic, database-backed portal popover.
 */
export default function BrandLogo({
  src,
  logoPath,
  alt,
  name = "",
  size = "md",
  className = "",
  interactive = true,
  entityType = "supplier",
  details,
}: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const imageSrc = src || logoPath;
  const displayName = name || alt || "Enterprise Partner";

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = 300;
      const popoverHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceRight = window.innerWidth - rect.left;

      const placeAbove = spaceBelow < popoverHeight && rect.top > popoverHeight;
      const alignRight = spaceRight < popoverWidth;

      setCoords({
        top: placeAbove ? rect.top - 8 : rect.bottom + 8,
        left: alignRight ? Math.max(12, rect.right - popoverWidth) : Math.max(12, rect.left),
        placeAbove,
      });
    }
  }, []);

  const handleMouseEnter = () => {
    if (!interactive) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updateCoords();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    closeTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    updateCoords();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const show = isHovered || isOpen;
    if (!show) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsHovered(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsHovered(false);
      }
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
  }, [isHovered, isOpen, updateCoords]);

  const sizeClasses: Record<LogoSize, { container: string; img: string; text: string }> = {
    sm: {
      container: "h-9 sm:h-10 px-2.5 sm:px-3 min-w-[36px] max-w-[170px]",
      img: "h-full max-h-7 sm:max-h-8 w-auto object-contain text-[10px]",
      text: "text-xs font-semibold",
    },
    md: {
      container: "h-11 sm:h-12 px-3 sm:px-4 min-w-[44px] max-w-[220px]",
      img: "h-full max-h-8 sm:max-h-9 w-auto object-contain text-xs",
      text: "text-sm font-semibold",
    },
    lg: {
      container: "h-14 px-4 sm:px-5 min-w-[56px] max-w-[280px]",
      img: "h-full max-h-10 sm:max-h-11 w-auto object-contain text-sm",
      text: "text-base font-semibold",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const initials = getInitials(displayName);
  const cleanFields = getCleanDetails(details);
  const showPopover = (isHovered || isOpen) && interactive;

  return (
    <>
      {/* Trigger Chip Container with Spring Scale Motion */}
      <motion.div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        animate={{ scale: showPopover ? 1.4 : 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={`
          inline-flex items-center justify-center
          bg-white rounded-lg select-none shrink-0 z-10
          shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.35)]
          border border-black/5 dark:border-white/10
          transition-colors duration-200
          ${interactive ? "cursor-pointer" : ""}
          ${currentSize.container}
          ${className}
        `}
        title={interactive ? `${displayName} (Click or hover to inspect details)` : displayName}
      >
        {imageSrc && !hasError ? (
          <img
            src={imageSrc}
            alt={alt || displayName || "Brand Logo"}
            onError={() => setHasError(true)}
            className={`w-auto object-contain transition-opacity duration-200 ${currentSize.img}`}
          />
        ) : (
          <span className={`font-sans font-bold tracking-wider text-[#222326] ${currentSize.text}`}>
            {initials}
          </span>
        )}
      </motion.div>

      {/* Detail Popover Portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showPopover && (
              <motion.div
                ref={popoverRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                initial={{ opacity: 0, scale: 0.95, y: coords.placeAbove ? 8 : -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: coords.placeAbove ? 8 : -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  top: coords.placeAbove ? "auto" : `${coords.top}px`,
                  bottom: coords.placeAbove ? `${window.innerHeight - coords.top}px` : "auto",
                  left: `${coords.left}px`,
                }}
                className="z-[99999] w-[290px] sm:w-[320px] bg-[#18191D]/95 text-[#D8CFB8] border border-[#6F848F]/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-4 font-sans select-none overflow-hidden"
              >
                {/* Popover Header: Enlarged Logo + Entity Name & Close Button */}
                <div className="flex items-start justify-between gap-3 border-b border-[#6F848F]/20 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-black/10 shrink-0">
                      {imageSrc && !hasError ? (
                        <img
                          src={imageSrc}
                          alt={displayName}
                          className="h-8 max-w-[120px] w-auto object-contain"
                        />
                      ) : (
                        <span className="font-sans font-bold text-sm text-[#222326]">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-sans font-medium text-[#FAF6EE] leading-snug tracking-wide">
                        {displayName}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-[#6F848F] mt-0.5">
                        {entityType === "client" ? (
                          <>
                            <Building2 className="w-3 h-3 text-[#7A3F1E]" />
                            <span>Hotel Client</span>
                          </>
                        ) : (
                          <>
                            <Store className="w-3 h-3 text-[#738678]" />
                            <span>Enterprise Supplier</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      setIsHovered(false);
                    }}
                    className="text-[#6F848F] hover:text-[#FAF6EE] p-1 rounded-md transition-colors cursor-pointer shrink-0"
                    aria-label="Close popover"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Popover Content: Dynamic Key-Value Pairs */}
                {cleanFields.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {cleanFields.map((field, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs py-1 border-b border-[#6F848F]/10 last:border-0"
                      >
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#6F848F]">
                          {field.label}
                        </span>
                        <span className="font-medium text-[#D8CFB8] sm:text-right font-sans">
                          {field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs text-[#6F848F] font-light">
                    Verified Enterprise Entity
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
