"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import SupplierProfileCard from "./SupplierProfileCard";
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
  title = "Active Group Supplier Profiles",
  subtitle = "Detailed sustainability audits, official UN SDG badges, and evidence confidence gauges.",
}: SuppliersCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -520, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 520, behavior: "smooth" });
    }
  };

  return (
    <section className="space-y-6 relative w-full font-sans">
      {/* Carousel Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#EAE5DC] dark:border-[#8C9DA8]/20 pb-4 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5] uppercase tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] mt-1 font-light tracking-wide">
            {subtitle}
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 rounded-lg bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#1A1F26] dark:text-[#FAF8F5] hover:bg-[#B85333] hover:text-white dark:hover:bg-[#B85333] dark:hover:text-white flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 rounded-lg bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#1A1F26] dark:text-[#FAF8F5] hover:bg-[#B85333] hover:text-white dark:hover:bg-[#B85333] dark:hover:text-white flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 no-scrollbar pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full"
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

          return (
            <div
              key={supplier.enterprise_id || name}
              className="min-w-[90%] md:min-w-[62%] lg:min-w-[50%] snap-center shrink-0 flex"
            >
              <SupplierProfileCard
                name={name}
                legalName={name}
                logoPath={supplier.logo_path}
                location={
                  supplier.city
                    ? `${supplier.city}, ${supplier.state}`
                    : isUKHI
                    ? "Pune, Maharashtra"
                    : isBare
                    ? "Bengaluru, Karnataka"
                    : isKheoni
                    ? "Indore, Madhya Pradesh"
                    : "Karnataka, India"
                }
                dataTier={isVerified ? "verified" : "self-reported"}
                varnaScore={supplier.final_varna_score ?? (isUKHI ? 56 : isBare ? 78 : 42)}
                eScore={supplier.e_pillar_score ?? 60}
                sScore={supplier.s_pillar_score ?? 55}
                gScore={supplier.g_pillar_score ?? 50}
                cScore={supplier.c_pillar_score ?? 45}
                carbonScore={supplier.c_pillar_score ?? 45}
                skuCount={isUKHI ? 4 : 2}
                totalUnits={isUKHI ? 2400 : 1200}
                confidenceScore={confidencePct}
                confidenceColor={isVerified ? "#738678" : "#7A3F1E"}
                confidenceDasharray={`${confidencePct}, 100`}
                badges={supplier.badges || []}
                tags={[]}
                categoryBars={[
                  { label: "Environment", val: supplier.e_pillar_score ?? 60 },
                  { label: "Social", val: supplier.s_pillar_score ?? 55 },
                  { label: "Governance", val: supplier.g_pillar_score ?? 50 },
                  { label: "Carbon Impact", val: supplier.c_pillar_score ?? 45 },
                ]}
                barColorClass={isVerified ? "bg-[#738678]" : "bg-[#7A3F1E]"}
                sdgObjects={supplier.sdg_objects || []}
                liveConfidenceData={liveConfidenceData}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
