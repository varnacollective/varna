"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, SortAsc, Filter, X, Map, List,
  MapPin, Search, ChevronDown
} from "lucide-react";
import TopBarV2 from "@/components/dashboard/v2/TopBarV2";
import FooterDisclaimerV2 from "@/components/dashboard/v2/FooterDisclaimerV2";
import SuppliersHeroV2 from "./SuppliersHeroV2";
import SuppliersKpiV2 from "./SuppliersKpiV2";
import SupplierCardV2 from "./SupplierCardV2";
import type { DashboardData, SupplierConfidenceData } from "@/lib/mock-data";
import { SUPPLIER_CONFIDENCE_CHECKLISTS, getClientLogoFallback } from "@/lib/mock-data";

// ─── Types ─────────────────────────────────────────────────────────────────
interface ClientSuppliersV2Props {
  suppliersData: any[];
  liveConfidenceData: Record<string, SupplierConfidenceData>;
  clientName?: string;
  industry?: string;
  logoPath?: string;
  dashboardData?: DashboardData | null;
}

type SortOption = "score_desc" | "score_asc" | "spend_desc" | "name_asc";
type ViewMode = "list" | "map";

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "score_desc", label: "Varna Score: High to Low" },
  { id: "score_asc", label: "Varna Score: Low to High" },
  { id: "spend_desc", label: "Spend: High to Low" },
  { id: "name_asc", label: "Name: A to Z" },
];

// Band mapping
function getVarnaBand(score: number): string {
  if (score >= 85) return "Leader";
  if (score >= 70) return "Advanced";
  if (score >= 55) return "Emerging";
  return "Foundational";
}

// ─── Map Pin Component (pure CSS, no map library needed) ────────────────────
// Using a react-simple-maps-style SVG approach but without external dependencies
function PartnerMapView({ suppliers, onPinClick }: {
  suppliers: any[];
  onPinClick: (supplier: any) => void;
}) {
  // Map of India state centroids (rough lat/lng -> SVG coordinates in a 500x560 box)
  const STATE_COORDS: Record<string, [number, number]> = {
    "Maharashtra": [220, 340],
    "Karnataka": [200, 390],
    "Tamil Nadu": [235, 420],
    "Rajasthan": [165, 220],
    "Gujarat": [130, 290],
    "Uttar Pradesh": [270, 230],
    "West Bengal": [355, 280],
    "Madhya Pradesh": [220, 285],
    "Haryana": [185, 195],
    "Kerala": [200, 445],
    "Tripura": [390, 280],
    "Uttarakhand": [220, 190],
    "Andhra Pradesh": [240, 390],
    "Bihar": [320, 245],
    "Jharkhand": [320, 290],
    "Odisha": [315, 340],
    "Punjab": [170, 175],
    "Himachal Pradesh": [200, 175],
  };

  const BAND_COLORS: Record<string, string> = {
    Leader: "#55705A",
    Advanced: "#7D3F1E",
    Emerging: "#6F8391",
    Foundational: "#9C7A58",
  };

  return (
    <div className="relative w-full">
      {/* India Map SVG background */}
      <div className="bg-[#F7F3EA] dark:bg-[#20242B] rounded-[24px] border border-black/[0.07] dark:border-white/[0.08] overflow-hidden min-h-[520px] relative">
        {/* Simplified India outline - just a rectangle placeholder with grid */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-[500px] mx-auto">
            {/* India shape hint */}
            <svg viewBox="0 0 500 560" className="w-full h-full opacity-10 dark:opacity-20">
              <path d="M120,60 L380,60 L420,120 L440,200 L400,300 L380,360 L340,420 L280,480 L240,520 L200,480 L160,420 L120,360 L80,280 L80,180 L100,120 Z" fill="#7D3F1E" />
            </svg>
            {/* Partner pins */}
            {suppliers.map((supplier, idx) => {
              const state = supplier.state || "Maharashtra";
              const coords = STATE_COORDS[state] || [240 + (idx * 20) % 60, 320 + (idx * 15) % 60];
              const band = getVarnaBand(supplier.varnaScore ?? supplier.final_varna_score ?? 72);
              const pinColor = BAND_COLORS[band] || "#7D3F1E";
              const spend = supplier.totalSpend ?? supplier.spend ?? 500000;
              const pinSize = Math.max(18, Math.min(38, 18 + (spend / 500000) * 8));

              return (
                <motion.button
                  key={supplier.enterprise_id || idx}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.08, type: "spring", damping: 14 }}
                  whileHover={{ scale: 1.25, zIndex: 20 }}
                  onClick={() => onPinClick(supplier)}
                  style={{
                    position: "absolute",
                    left: `${(coords[0] / 500) * 100}%`,
                    top: `${(coords[1] / 560) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className="group focus:outline-none z-10"
                  title={`${supplier.enterprise_name || supplier.name} — ${band} · Click to view profile`}
                >
                  <div
                    className="rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white dark:border-[#20242B] transition-all duration-200"
                    style={{
                      width: `${pinSize}px`,
                      height: `${pinSize}px`,
                      backgroundColor: pinColor,
                      fontSize: `${Math.max(8, pinSize * 0.3)}px`,
                    }}
                  >
                    {(supplier.enterprise_name || supplier.name || "?")[0]}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-xl bg-[#1F1B16] dark:bg-white text-white dark:text-[#1F1B16] text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                    <span className="block font-semibold">{supplier.enterprise_name || supplier.name}</span>
                    <span className="block text-[9px] opacity-70">{state} · Score: {supplier.varnaScore ?? supplier.final_varna_score ?? 72}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-[#1A1E26]/90 backdrop-blur-sm rounded-2xl p-3 border border-black/[0.07] dark:border-white/[0.08] shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6F6A61] dark:text-[#9A948A] mb-2">Score Band</p>
          <div className="space-y-1.5">
            {Object.entries(BAND_COLORS).map(([band, color]) => (
              <div key={band} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-[#5B564E] dark:text-[#C2BCB0] font-normal">{band}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map caption */}
        <div className="absolute bottom-4 right-4">
          <p className="text-[10px] text-[#9A948A] bg-white/80 dark:bg-[#1A1E26]/80 backdrop-blur-sm px-2 py-1 rounded-lg">
            Locations show registered office. Manufacturing locations coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Chip ────────────────────────────────────────────────────────────
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer
        ${active
          ? "bg-[#7D3F1E] border-[#7D3F1E] text-white dark:bg-[#E07A57] dark:border-[#E07A57]"
          : "bg-white dark:bg-[#20242B] border-black/[0.10] dark:border-white/[0.12] text-[#5B564E] dark:text-[#C2BCB0] hover:border-[#7D3F1E]/50 dark:hover:border-[#E07A57]/50"
        }
      `}
    >
      {label}
    </button>
  );
}

// ─── Sort Dropdown ──────────────────────────────────────────────────────────
function SortDropdown({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = SORT_OPTIONS.find((o) => o.id === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#20242B] border border-black/[0.10] dark:border-white/[0.12] text-[#5B564E] dark:text-[#C2BCB0] hover:border-[#7D3F1E]/50 dark:hover:border-[#E07A57]/50 transition-colors cursor-pointer"
      >
        <SortAsc className="w-3.5 h-3.5" />
        <span>{current?.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white dark:bg-[#20242B] border border-black/[0.10] dark:border-white/[0.12] rounded-2xl shadow-xl z-20 w-52 p-1.5 space-y-0.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${value === opt.id ? "bg-[#7D3F1E]/10 dark:bg-[#E07A57]/15 text-[#7D3F1E] dark:text-[#E07A57]" : "text-[#5B564E] dark:text-[#C2BCB0] hover:bg-black/5 dark:hover:bg-white/5"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
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
  const effectiveLogoPath = logoPath || dashboardData?.client?.logoPath || getClientLogoFallback(clientName);

  // ── Sort & Filter State ────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState<SortOption>("score_desc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterBand, setFilterBand] = useState<string[]>([]);
  const [filterState, setFilterState] = useState<string[]>([]);

  // ── Derive filter options from data ────────────────────────────────────────
  const allStates = useMemo(() => {
    const states = new Set<string>();
    suppliersData.forEach((s) => {
      const st = s.state || (s.enterprise_name?.toLowerCase().includes("ukhi") ? "Haryana" : s.enterprise_name?.toLowerCase().includes("bare") ? "Karnataka" : s.enterprise_name?.toLowerCase().includes("kheoni") ? "Madhya Pradesh" : "");
      if (st) states.add(st);
    });
    return Array.from(states).sort();
  }, [suppliersData]);

  // ── Filter & Sort pipeline ─────────────────────────────────────────────────
  const processedSuppliers = useMemo(() => {
    let result = [...suppliersData];

    // Apply band filter
    if (filterBand.length > 0) {
      result = result.filter((s) => {
        const score = s.final_varna_score ?? s.varnaScore ?? 72;
        return filterBand.includes(getVarnaBand(score));
      });
    }

    // Apply state filter
    if (filterState.length > 0) {
      result = result.filter((s) => {
        const st = s.state || (s.enterprise_name?.toLowerCase().includes("ukhi") ? "Haryana" : s.enterprise_name?.toLowerCase().includes("bare") ? "Karnataka" : "Madhya Pradesh");
        return filterState.includes(st);
      });
    }

    // Apply sort
    result.sort((a, b) => {
      const aScore = a.final_varna_score ?? a.varnaScore ?? 72;
      const bScore = b.final_varna_score ?? b.varnaScore ?? 72;
      const aSpend = a.totalSpend ?? a.spend ?? 0;
      const bSpend = b.totalSpend ?? b.spend ?? 0;
      const aName = (a.enterprise_name || a.name || "").toLowerCase();
      const bName = (b.enterprise_name || b.name || "").toLowerCase();

      switch (sortBy) {
        case "score_desc": return bScore - aScore;
        case "score_asc": return aScore - bScore;
        case "spend_desc": return bSpend - aSpend;
        case "name_asc": return aName.localeCompare(bName);
        default: return 0;
      }
    });

    return result;
  }, [suppliersData, filterBand, filterState, sortBy]);

  const totalFiltered = processedSuppliers.length;
  const totalAll = suppliersData.length;
  const hasActiveFilters = filterBand.length > 0 || filterState.length > 0;

  const clearFilters = () => {
    setFilterBand([]);
    setFilterState([]);
  };

  // ── Carousel logic ────────────────────────────────────────────────────────
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

  const totalPages = Math.max(1, Math.ceil(totalFiltered / cardsPerPage));

  const goToPage = (pageIndex: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll<HTMLElement>(".varna-partner-card-wrapper");
    if (!cards.length) return;
    const clampedPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
    const targetCardIndex = Math.min(clampedPage * cardsPerPage, cards.length - 1);
    const targetCard = cards[targetCardIndex];
    if (targetCard) {
      container.scrollTo({ left: targetCard.offsetLeft, behavior: "smooth" });
      setCurrentPage(clampedPage);
    }
  };

  const scrollLeft = () => goToPage(currentPage - 1);
  const scrollRight = () => goToPage(currentPage + 1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollLeft();
      if (e.key === "ArrowRight") scrollRight();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, cardsPerPage]);

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
      if (diff < minDiff) { minDiff = diff; closestIndex = idx; }
    });
    const page = Math.floor(closestIndex / currentCardsPerPage);
    setCurrentPage(Math.min(page, Math.max(1, Math.ceil(totalFiltered / currentCardsPerPage)) - 1));
  };

  const startCardIndex = currentPage * cardsPerPage + 1;
  const endCardIndex = Math.min(startCardIndex + cardsPerPage - 1, totalFiltered);
  const counterText = startCardIndex === endCardIndex ? `${startCardIndex} of ${totalFiltered}` : `${startCardIndex}–${endCardIndex} of ${totalFiltered}`;
  const canScrollPrev = currentPage > 0;
  const canScrollNext = currentPage < totalPages - 1;

  const varnaScoreData = {
    score: 75.3, eScore: 78, sScore: 76, gScore: 72, cScore: 74,
    supplierName: "Weighted average across your verified partners",
  };

  const BAND_OPTIONS = ["Leader", "Advanced", "Emerging", "Foundational"];

  return (
    <div className="client-suppliers-v2 w-full max-w-[1760px] mx-auto space-y-6 pb-32">
      {/* 1. Top Bar */}
      <TopBarV2
        clientName={clientName}
        industry={industry}
        logoPath={effectiveLogoPath}
        dashboardData={dashboardData}
      />

      {/* 2. Hero Banner */}
      <SuppliersHeroV2 dashboardData={dashboardData} />

      {/* 3. KPI Row */}
      <SuppliersKpiV2
        totalSuppliers={3}
        totalOrders={5}
        totalSpend={3773}
        avgVarnaScore={75.3}
        supplierNames={suppliersData.map((s) => s.enterprise_name || "")}
        varnaScoreData={varnaScoreData}
      />

      {/* 4. Active Partner Profiles */}
      <section className="space-y-5 relative">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-black/[0.07] dark:border-white/[0.08] pb-4 gap-4">
          <div>
            <h2 className="text-[28px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
              Active Partner Profiles
            </h2>
            <p className="text-sm text-[#6F6A61] dark:text-[#9A948A] font-normal mt-0.5">
              Scores, evidence confidence and certifications for each partner.
            </p>
          </div>

          {/* View Toggle + Navigation */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Showing X of Y */}
            <span className="text-xs font-medium text-[#6F6A61] dark:text-[#9A948A] tabular-nums">
              Showing {totalFiltered} of {totalAll} partners
            </span>

            {/* List / Map Toggle */}
            <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${viewMode === "list" ? "bg-white dark:bg-[#272C34] text-[#1F1B16] dark:text-[#F3EFE7] shadow-sm" : "text-[#6F6A61] dark:text-[#9A948A]"}`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${viewMode === "map" ? "bg-white dark:bg-[#272C34] text-[#1F1B16] dark:text-[#F3EFE7] shadow-sm" : "text-[#6F6A61] dark:text-[#9A948A]"}`}
              >
                <Map className="w-3.5 h-3.5" /> Map
              </button>
            </div>

            {/* Carousel nav (only in list mode) */}
            {viewMode === "list" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6F6A61] dark:text-[#9A948A] tabular-nums hidden sm:block">
                  {counterText}
                </span>
                <button type="button" onClick={scrollLeft} disabled={!canScrollPrev} className={`w-10 h-10 rounded-full border border-black/[0.08] dark:border-white/[0.14] bg-white dark:bg-[#20242B] text-[#5B564E] dark:text-[#C2BCB0] hover:bg-[#7D3F1E] hover:text-white hover:border-[#7D3F1E] dark:hover:bg-[#E07A57] dark:hover:text-white dark:hover:border-[#E07A57] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer ${!canScrollPrev ? "opacity-35 cursor-not-allowed" : ""}`} aria-label="Scroll left">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button type="button" onClick={scrollRight} disabled={!canScrollNext} className={`w-10 h-10 rounded-full border border-black/[0.08] dark:border-white/[0.14] bg-white dark:bg-[#20242B] text-[#5B564E] dark:text-[#C2BCB0] hover:bg-[#7D3F1E] hover:text-white hover:border-[#7D3F1E] dark:hover:bg-[#E07A57] dark:hover:text-white dark:hover:border-[#E07A57] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer ${!canScrollNext ? "opacity-35 cursor-not-allowed" : ""}`} aria-label="Scroll right">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Control Bar: Sort + Filter Chips ─────────────────────────────── */}
        <div className="flex flex-wrap items-start gap-3">
          {/* Sort dropdown */}
          <SortDropdown value={sortBy} onChange={setSortBy} />

          {/* Band filter chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A948A] flex items-center gap-1">
              <Filter className="w-3 h-3" /> Band:
            </span>
            {BAND_OPTIONS.map((band) => (
              <FilterChip
                key={band}
                label={band}
                active={filterBand.includes(band)}
                onClick={() => setFilterBand((prev) => prev.includes(band) ? prev.filter((b) => b !== band) : [...prev, band])}
              />
            ))}
          </div>

          {/* State filter chips */}
          {allStates.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A948A]">
                State:
              </span>
              {allStates.slice(0, 5).map((state) => (
                <FilterChip
                  key={state}
                  label={state}
                  active={filterState.includes(state)}
                  onClick={() => setFilterState((prev) => prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state])}
                />
              ))}
            </div>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#7D3F1E] dark:text-[#E07A57] border border-[#7D3F1E]/30 dark:border-[#E07A57]/30 hover:bg-[#7D3F1E]/10 dark:hover:bg-[#E07A57]/10 transition-colors"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Empty state ────────────────────────────────────────────────────── */}
        {totalFiltered === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-10 h-10 text-[#9A948A] mb-3" strokeWidth={1.5} />
            <p className="text-base font-medium text-[#5B564E] dark:text-[#C2BCB0]">No partners match your filters</p>
            <button onClick={clearFilters} className="mt-2 text-xs text-[#7D3F1E] dark:text-[#E07A57] underline">
              Clear all filters
            </button>
          </div>
        )}

        {/* ── Map View ─────────────────────────────────────────────────────── */}
        {viewMode === "map" && totalFiltered > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <PartnerMapView
              suppliers={processedSuppliers}
              onPinClick={(s) => {
                // Switch to list and highlight — for now just switch to list view
                setViewMode("list");
              }}
            />
          </motion.div>
        )}

        {/* ── List Carousel View ─────────────────────────────────────────────── */}
        {viewMode === "list" && totalFiltered > 0 && (
          <div className="w-full max-w-[1328px] mx-auto">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              tabIndex={0}
              role="region"
              aria-roledescription="carousel"
              aria-label="Active Partner Profiles"
              className="relative flex overflow-x-auto snap-x snap-mandatory gap-7 no-scrollbar pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus:outline-none focus:ring-2 focus:ring-[#7D3F1E]/30 rounded-[24px]"
            >
              {processedSuppliers.map((supplier) => {
                const name = supplier.enterprise_name || supplier.name;
                const isUKHI = name.toLowerCase().includes("ukhi");
                const isBare = name.toLowerCase().includes("bare");
                const isKheoni = name.toLowerCase().includes("kheoni");
                const confidenceEntry =
                  (liveConfidenceData && liveConfidenceData[name]) ||
                  SUPPLIER_CONFIDENCE_CHECKLISTS[name] ||
                  (isUKHI ? SUPPLIER_CONFIDENCE_CHECKLISTS["UKHI India Private Limited"] : null);
                const confidencePct = confidenceEntry?.score ?? supplier.confidence_pct ?? (isUKHI ? 63 : isBare ? 47 : isKheoni ? 24 : 50);
                const isVerified = confidencePct >= 60;
                const location = isBare ? "Bengaluru, Karnataka" : isUKHI ? "Faridabad, Haryana" : isKheoni ? "Indore, Madhya Pradesh" : supplier.city && supplier.state ? `${supplier.city}, ${supplier.state}` : "Bengaluru, Karnataka";
                const legalName = isBare ? "Bare Necessities Zero Waste Solutions Pvt. Ltd." : isUKHI ? "UKHI India Private Limited" : isKheoni ? "Kheoni Ventures Pvt Ltd" : name;

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
                      cScore={supplier.c_pillar_score ?? 0}
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

              {processedSuppliers.length % 2 !== 0 && (
                <div aria-hidden="true" className="hidden md:block w-full md:w-[calc((100%-28px)/2)] md:max-w-[650px] shrink-0 pointer-events-none opacity-0" />
              )}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <FooterDisclaimerV2 />
    </div>
  );
}
