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
import { SUPPLIER_CONFIDENCE_CHECKLISTS, getClientLogoFallback } from "@/lib/mock-data";

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
  clientName = "The Astor Dubai",
  industry = "Luxury Hospitality",
  logoPath,
  dashboardData,
}: ClientSuppliersV2Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(2);
  const totalSuppliers = suppliersData.length || 3;
  const effectiveLogoPath = logoPath || dashboardData?.client?.logoPath || getClientLogoFallback(clientName);

  // Derive cardsPerPage dynamically based on the container width
  useEffect(() => {
    const updateCardsPerPage = () => {
      if (!scrollContainerRef.current) return;
      const width = scrollContainerRef.current.clientWidth;
      setCardsPerPage(width < 768 ? 1 : 2);
    };

    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalSuppliers / cardsPerPage));

  const goToPage = (pageIndex: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll<HTMLElement>(".varna-partner-card-wrapper");
    if (!cards.length) return;

    const clampedPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
    const targetCardIndex = Math.min(clampedPage * cardsPerPage, cards.length - 1);
    const targetCard = cards[targetCardIndex];

    if (targetCard) {
      container.scrollTo({
        left: targetCard.offsetLeft,
        behavior: "smooth",
      });
      setCurrentPage(clampedPage);
    }
  };

  const scrollLeft = () => {
    goToPage(currentPage - 1);
  };

  const scrollRight = () => {
    goToPage(currentPage + 1);
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollLeft();
      if (e.key === "ArrowRight") scrollRight();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, cardsPerPage]);

  // Update carousel index indicator on scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll<HTMLElement>(".varna-partner-card-wrapper");
    if (!cards.length) return;

    const scrollLeft = container.scrollLeft;
    const currentCardsPerPage = container.clientWidth < 768 ? 1 : 2;

    let closestIndex = 0;
    let minDiff = Infinity;
    cards.forEach((card, idx) => {
      const diff = Math.abs(card.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    const page = Math.floor(closestIndex / currentCardsPerPage);
    const totalP = Math.max(1, Math.ceil(totalSuppliers / currentCardsPerPage));
    setCurrentPage(Math.min(page, totalP - 1));
  };

  const startCardIndex = currentPage * cardsPerPage + 1;
  const endCardIndex = Math.min(startCardIndex + cardsPerPage - 1, totalSuppliers);
  const counterText =
    startCardIndex === endCardIndex
      ? `${startCardIndex} of ${totalSuppliers}`
      : `${startCardIndex}–${endCardIndex} of ${totalSuppliers}`;
  const canScrollPrev = currentPage > 0;
  const canScrollNext = currentPage < totalPages - 1;

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
        logoPath={effectiveLogoPath}
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

          {/* Carousel Counter & Navigation Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6F6A61] dark:text-[#9A948A] tabular-nums">
              {counterText}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollLeft}
                disabled={!canScrollPrev}
                className={`
                  w-11 h-11 rounded-full
                  border border-black/[0.08] dark:border-white/[0.14]
                  bg-white dark:bg-[#20242B] text-[#5B564E] dark:text-[#C2BCB0]
                  hover:bg-[#7D3F1E] hover:text-white hover:border-[#7D3F1E]
                  dark:hover:bg-[#E07A57] dark:hover:text-white dark:hover:border-[#E07A57]
                  flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer
                  ${!canScrollPrev ? "opacity-35 cursor-not-allowed hover:bg-white hover:text-[#5B564E] hover:border-black/[0.08] dark:hover:bg-[#20242B] dark:hover:text-[#C2BCB0] dark:hover:border-white/[0.14]" : ""}
                `}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                disabled={!canScrollNext}
                className={`
                  w-11 h-11 rounded-full
                  border border-black/[0.08] dark:border-white/[0.14]
                  bg-white dark:bg-[#20242B] text-[#5B564E] dark:text-[#C2BCB0]
                  hover:bg-[#7D3F1E] hover:text-white hover:border-[#7D3F1E]
                  dark:hover:bg-[#E07A57] dark:hover:text-white dark:hover:border-[#E07A57]
                  flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer
                  ${!canScrollNext ? "opacity-35 cursor-not-allowed hover:bg-white hover:text-[#5B564E] hover:border-black/[0.08] dark:hover:bg-[#20242B] dark:hover:text-[#C2BCB0] dark:hover:border-white/[0.14]" : ""}
                `}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Up Responsive Scroll Carousel Track (Constrained to 1328px and centered at track level) */}
        <div className="w-full max-w-[1328px] mx-auto">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Active Partner Profiles"
            className="
              relative flex overflow-x-auto snap-x snap-mandatory gap-7 no-scrollbar pb-6
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
                      { label: "Carbon Impact", val: supplier.c_pillar_score ?? 45 },
                    ]}
                    sdgObjects={supplier.sdg_objects || []}
                    liveConfidenceData={liveConfidenceData}
                    scoresSummary={supplier.scores_summary}
                  />
                </div>
              );
            })}

            {/* Trailing spacer so an odd final card (e.g. 5th card) lands cleanly on the left slot without cut-offs */}
            {suppliersData.length % 2 !== 0 && (
              <div
                aria-hidden="true"
                className="hidden md:block w-full md:w-[calc((100%-28px)/2)] md:max-w-[650px] shrink-0 pointer-events-none opacity-0"
              />
            )}
          </div>
        </div>
      </section>

      {/* 6. Spend by Product Category (S7 & D5) */}


      {/* 7. Footer Disclaimer (S8) */}
      <FooterDisclaimerV2 />
    </div>
  );
}
