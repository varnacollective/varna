"use client";

import React, { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, SlidersHorizontal, Users } from "lucide-react";
import SupplierCardV2 from "@/components/dashboard/suppliers/v2/SupplierCardV2";
import type { SupplierConfidenceData } from "@/lib/mock-data";
import { SUPPLIER_CONFIDENCE_CHECKLISTS } from "@/lib/mock-data";

interface SuppliersCarouselProps {
  suppliersData: any[];
  liveConfidenceData?: Record<string, SupplierConfidenceData>;
  title?: string;
  subtitle?: string;
}

export default function SuppliersCarousel({
  suppliersData,
  liveConfidenceData = {},
  title = "Active Group Partner Profiles",
  subtitle = "Detailed sustainability audits, official UN SDG badges, and evidence confidence gauges.",
}: SuppliersCarouselProps) {
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollPos = container.scrollLeft;
      const cardWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).offsetWidth + 24 : 450;
      const idx = Math.round(scrollPos / cardWidth);
      setActiveIndex(Math.min(Math.max(0, idx), suppliersData.length - 1));
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -460, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 460, behavior: "smooth" });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only act on horizontal swipes (angle < 45 degrees)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) scrollRight();
      else scrollLeft();
    }
  };

  return (
    <section className="space-y-6 relative w-full font-sans">
      {/* Carousel Controls & View Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#EAE5DC] dark:border-[#8C9DA8]/20 pb-4 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5] uppercase tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] mt-1 font-light tracking-wide">
            {subtitle}
          </p>
        </div>

        {/* View Mode Toggle & Navigation Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20">
            <button
              onClick={() => setViewMode("carousel")}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "carousel"
                  ? "bg-[#B85333] text-white shadow-xs"
                  : "text-[#6E7781] dark:text-[#8C9DA8] hover:text-[#1A1F26] dark:hover:text-[#FAF8F5]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Carousel</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#B85333] text-white shadow-xs"
                  : "text-[#6E7781] dark:text-[#8C9DA8] hover:text-[#1A1F26] dark:hover:text-[#FAF8F5]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>

          {/* Nav Buttons (Carousel mode only) */}
          {viewMode === "carousel" && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={scrollLeft}
                className="w-9 h-9 rounded-lg bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#1A1F26] dark:text-[#FAF8F5] hover:bg-[#B85333] hover:text-white dark:hover:bg-[#B85333] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="w-9 h-9 rounded-lg bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#1A1F26] dark:text-[#FAF8F5] hover:bg-[#B85333] hover:text-white dark:hover:bg-[#B85333] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Content: Carousel vs Grid */}
      {viewMode === "carousel" ? (
        <div className="space-y-4">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-6 no-scrollbar pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full"
          >
            {suppliersData.map((supplier) => {
              const name = supplier.enterprise_name;
              const isUKHI = name.toLowerCase().includes("ukhi");
              const isBare = name.toLowerCase().includes("bare");
              const isKheoni = name.toLowerCase().includes("kheoni");

              const confidenceEntry =
                (liveConfidenceData && liveConfidenceData[name]) ||
                SUPPLIER_CONFIDENCE_CHECKLISTS[name] ||
                (isUKHI ? SUPPLIER_CONFIDENCE_CHECKLISTS["UKHI India Private Limited"] : null);

              const confidencePct =
                confidenceEntry?.score ??
                supplier.confidence_pct ??
                (isUKHI ? 63 : isBare ? 47 : isKheoni ? 24 : 50);

              const isVerified = confidencePct >= 60;

              const location =
                isBare
                  ? "Bengaluru, Karnataka"
                  : isUKHI
                  ? "Faridabad, Haryana"
                  : isKheoni
                  ? "Indore, Madhya Pradesh"
                  : supplier.city && supplier.state
                  ? `${supplier.city}, ${supplier.state}`
                  : "Bengaluru, Karnataka";

              const legalName =
                supplier.legal_name ||
                (isBare
                  ? "Bare Necessities Zero Waste Solutions Pvt. Ltd."
                  : isUKHI
                  ? "UKHI India Private Limited"
                  : isKheoni
                  ? "Kheoni Ventures Pvt Ltd"
                  : name);

              return (
                <div
                  key={supplier.enterprise_id || name}
                  className="varna-partner-card-wrapper w-full md:w-[calc((100%-28px)/2)] md:max-w-[650px] snap-start shrink-0 flex items-stretch"
                >
                  <SupplierCardV2
                    name={name}
                    legalName={legalName}
                    enterpriseId={supplier.enterprise_id}
                    logoPath={supplier.logo_path}
                    location={location}
                    varnaScore={supplier.final_varna_score ?? (isUKHI ? 56 : isBare ? 78 : 42)}
                    eScore={supplier.e_pillar_score ?? 60}
                    sScore={supplier.s_pillar_score ?? 55}
                    gScore={supplier.g_pillar_score ?? 50}
                    cScore={supplier.c_pillar_score ?? 45}
                    carbonScore={supplier.c_pillar_score ?? 45}
                    skuCount={isUKHI ? 4 : 2}
                    totalUnits={isUKHI ? 2400 : 1200}
                    confidenceScore={confidencePct}
                    confidenceColor={isVerified ? "#55705A" : "#7D3F1E"}
                    badges={supplier.badges || []}
                    categoryBars={[
                      { label: "Environmental", val: supplier.e_pillar_score ?? 60 },
                      { label: "Social", val: supplier.s_pillar_score ?? 55 },
                      { label: "Governance", val: supplier.g_pillar_score ?? 50 },
                      { label: "Carbon Impact", val: supplier.c_pillar_score ?? 0 },
                    ]}
                    sdgObjects={supplier.sdg_objects || []}
                    liveConfidenceData={liveConfidenceData}
                    scoresSummary={supplier.scores_summary}
                  />
                </div>
              );
            })}
          </div>

          {/* Active Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {suppliersData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                      left: idx * 480,
                      behavior: "smooth",
                    });
                  }
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeIndex === idx
                    ? "w-6 bg-[#B85333]"
                    : "w-2 bg-[#EAE5DC] dark:bg-[#8C9DA8]/30 hover:bg-[#B85333]/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Accessible Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 w-full">
          {suppliersData.map((supplier) => {
            const name = supplier.enterprise_name;
            const isUKHI = name.toLowerCase().includes("ukhi");
            const isBare = name.toLowerCase().includes("bare");
            const isKheoni = name.toLowerCase().includes("kheoni");

            const confidenceEntry =
              (liveConfidenceData && liveConfidenceData[name]) ||
              SUPPLIER_CONFIDENCE_CHECKLISTS[name] ||
              (isUKHI ? SUPPLIER_CONFIDENCE_CHECKLISTS["UKHI India Private Limited"] : null);

            const confidencePct =
              confidenceEntry?.score ??
              supplier.confidence_pct ??
              (isUKHI ? 63 : isBare ? 47 : isKheoni ? 24 : 50);

            const isVerified = confidencePct >= 60;

            const location =
              isBare
                ? "Bengaluru, Karnataka"
                : isUKHI
                ? "Faridabad, Haryana"
                : isKheoni
                ? "Indore, Madhya Pradesh"
                : supplier.city && supplier.state
                ? `${supplier.city}, ${supplier.state}`
                : "Bengaluru, Karnataka";

            const legalName =
              supplier.legal_name ||
              (isBare
                ? "Bare Necessities Zero Waste Solutions Pvt. Ltd."
                : isUKHI
                ? "UKHI India Private Limited"
                : isKheoni
                ? "Kheoni Ventures Pvt Ltd"
                : name);

            return (
              <div
                key={supplier.enterprise_id || name}
                className="varna-partner-card-wrapper w-full flex items-stretch"
              >
                <SupplierCardV2
                  name={name}
                  legalName={legalName}
                  enterpriseId={supplier.enterprise_id}
                  logoPath={supplier.logo_path}
                  location={location}
                  varnaScore={supplier.final_varna_score ?? (isUKHI ? 56 : isBare ? 78 : 42)}
                  eScore={supplier.e_pillar_score ?? 60}
                  sScore={supplier.s_pillar_score ?? 55}
                  gScore={supplier.g_pillar_score ?? 50}
                  cScore={supplier.c_pillar_score ?? 45}
                  carbonScore={supplier.c_pillar_score ?? 0}
                  skuCount={isUKHI ? 4 : 2}
                  totalUnits={isUKHI ? 2400 : 1200}
                  confidenceScore={confidencePct}
                  confidenceColor={isVerified ? "#55705A" : "#7D3F1E"}
                  badges={supplier.badges || []}
                  categoryBars={[
                    { label: "Environmental", val: supplier.e_pillar_score ?? 60 },
                    { label: "Social", val: supplier.s_pillar_score ?? 55 },
                    { label: "Governance", val: supplier.g_pillar_score ?? 50 },
                    { label: "Carbon Impact", val: supplier.c_pillar_score ?? 0 },
                  ]}
                  sdgObjects={supplier.sdg_objects || []}
                  liveConfidenceData={liveConfidenceData}
                  scoresSummary={supplier.scores_summary}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
