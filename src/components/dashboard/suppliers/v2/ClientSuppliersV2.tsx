"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TopBarV2 from "@/components/dashboard/v2/TopBarV2";
import FooterDisclaimerV2 from "@/components/dashboard/v2/FooterDisclaimerV2";
import SuppliersHeroV2 from "./SuppliersHeroV2";
import SuppliersKpiV2 from "./SuppliersKpiV2";
import SupplierCardV2 from "./SupplierCardV2";
import type { DashboardData, SupplierConfidenceData } from "@/lib/mock-data";
import { SUPPLIER_CONFIDENCE_CHECKLISTS } from "@/lib/mock-data";

interface ClientSuppliersV2Props {
  suppliersData: any[];
  liveConfidenceData: Record<string, SupplierConfidenceData>;
  clientName?: string;
  industry?: string;
  logoPath?: string;
  dashboardData?: DashboardData | null;
}

export default function ClientSuppliersV2({
  suppliersData = [],
  liveConfidenceData = {},
  clientName = "A Dubai",
  industry = "Luxury Hospitality",
  logoPath,
  dashboardData,
}: ClientSuppliersV2Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(1);
  const totalSuppliers = suppliersData.length || 3;

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

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollLeft();
      if (e.key === "ArrowRight") scrollRight();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update carousel index indicator on scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const progress = scrollLeft / maxScroll;
    const activeIndex = Math.min(totalSuppliers, Math.max(1, Math.round(progress * (totalSuppliers - 1)) + 1));
    setCarouselIndex(activeIndex);
  };

  const supplierNames = suppliersData.map((s) => s.enterprise_name || "");

  const varnaScoreData = {
    score: 75.3,
    eScore: 78,
    sScore: 76,
    gScore: 72,
    cScore: 74,
    supplierName: "Weighted average across your verified partners",
  };

  return (
    <div className="client-suppliers-v2 w-full max-w-[1760px] mx-auto space-y-6 pb-32">
      {/* 1. Top Bar (S1) */}
      <TopBarV2
        clientName={clientName}
        industry={industry}
        logoPath={logoPath}
        dashboardData={dashboardData}
      />

      {/* 2. Hero Banner (S2) */}
      <SuppliersHeroV2
        dashboardData={dashboardData}
      />

      {/* 3. KPI Row (S3) */}
      <SuppliersKpiV2
        totalSuppliers={3}
        totalOrders={5}
        totalSpend={3773}
        avgVarnaScore={75.3}
        supplierNames={supplierNames}
        varnaScoreData={varnaScoreData}
      />



      {/* 5. Active Partner Profiles Header (S5) */}
      <section className="space-y-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-black/[0.07] dark:border-white/[0.08] pb-4 gap-4">
          <div>
            <h2 className="text-[28px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
              Active Partner Profiles
            </h2>
            <p className="text-sm text-[#6F6A61] dark:text-[#9A948A] font-normal mt-0.5">
              Scores, evidence confidence and certifications for each partner.
            </p>
          </div>

          {/* Carousel Counter & Navigation Buttons (S5 fixed) */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6F6A61] dark:text-[#9A948A] tabular-nums">
              {carouselIndex}–{Math.min(carouselIndex + 1, totalSuppliers)} of {totalSuppliers}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollLeft}
                className="
                  w-11 h-11 rounded-full
                  border border-black/[0.08] dark:border-white/[0.14]
                  bg-white dark:bg-[#20242B] text-[#5B564E] dark:text-[#C2BCB0]
                  hover:bg-[#7D3F1E] hover:text-white hover:border-[#7D3F1E]
                  dark:hover:bg-[#E07A57] dark:hover:text-white dark:hover:border-[#E07A57]
                  flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer
                "
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="
                  w-11 h-11 rounded-full
                  border border-black/[0.08] dark:border-white/[0.14]
                  bg-white dark:bg-[#20242B] text-[#5B564E] dark:text-[#C2BCB0]
                  hover:bg-[#7D3F1E] hover:text-white hover:border-[#7D3F1E]
                  dark:hover:bg-[#E07A57] dark:hover:text-white dark:hover:border-[#E07A57]
                  flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer
                "
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Up Responsive Scroll Carousel (S6 fixed: Equal heights, 2-up on desktop, 1-up on mobile) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Active Partner Profiles"
          className="
            flex overflow-x-auto snap-x snap-mandatory gap-6 no-scrollbar pb-6
            [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
            focus:outline-none focus:ring-2 focus:ring-[#7D3F1E]/30 rounded-[24px]
          "
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

            const confidencePct = confidenceEntry?.score ?? supplier.confidence_pct ?? (isUKHI ? 63 : isBare ? 47 : isKheoni ? 24 : 50);
            const isVerified = confidencePct >= 60;

            const location = isBare
              ? "Bengaluru, Karnataka"
              : isUKHI
              ? "Faridabad, Haryana"
              : isKheoni
              ? "Indore, Madhya Pradesh"
              : supplier.city && supplier.state
              ? `${supplier.city}, ${supplier.state}`
              : "Bengaluru, Karnataka";

            const legalName = isBare
              ? "Bare Necessities Zero Waste Solutions Pvt. Ltd."
              : isUKHI
              ? "UKHI India Private Limited"
              : isKheoni
              ? "Kheoni Ventures Pvt Ltd"
              : name;

            return (
              <div
                key={supplier.enterprise_id || name}
                className="min-w-[100%] md:min-w-[49%] lg:min-w-[49%] snap-center shrink-0 flex items-stretch"
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
                    { label: "Carbon Impact", val: supplier.c_pillar_score ?? 45 },
                  ]}
                  sdgObjects={supplier.sdg_objects || []}
                  liveConfidenceData={liveConfidenceData}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Spend by Product Category (S7 & D5) */}


      {/* 7. Footer Disclaimer (S8) */}
      <FooterDisclaimerV2 />
    </div>
  );
}
