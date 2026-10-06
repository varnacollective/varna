"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, SortAsc, Filter, X, Map, List,
  MapPin, Search, ChevronDown, Check
} from "lucide-react";
import dynamic from "next/dynamic";
import TopBarV2 from "@/components/dashboard/v2/TopBarV2";
import FooterDisclaimerV2 from "@/components/dashboard/v2/FooterDisclaimerV2";
import SuppliersHeroV2 from "./SuppliersHeroV2";
import SuppliersKpiV2 from "./SuppliersKpiV2";
import SupplierCardV2 from "./SupplierCardV2";
import type { DashboardData, SupplierConfidenceData } from "@/lib/mock-data";
import { SUPPLIER_CONFIDENCE_CHECKLISTS, getClientLogoFallback } from "@/lib/mock-data";

const RealPartnerMapView = dynamic(
  () => import("./RealPartnerMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] md:h-[580px] rounded-[24px] bg-[#F7F3EA] dark:bg-[#1A1E26] border border-black/[0.07] dark:border-white/[0.08] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs text-[#6F6A61] dark:text-[#9A948A] font-medium">
          <span className="w-4 h-4 rounded-full border-2 border-[#7D3F1E] dark:border-[#E07A57] border-t-transparent animate-spin" />
          <span>Loading OpenStreetMap...</span>
        </div>
      </div>
    ),
  }
);

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

const BAND_COLORS: Record<string, string> = {
  Leader: "#55705A",
  Advanced: "#7D3F1E",
  Emerging: "#6F8391",
  Foundational: "#9C7A58",
};

interface FilterOption {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

// ─── MakeMyTrip-Style MultiSelect Dropdown ──────────────────────────────────
function MultiSelectDropdown({
  labelPrefix,
  options,
  selected,
  onChange,
  icon: Icon,
}: {
  labelPrefix: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  icon?: any;
}) {
  const [open, setOpen] = useState(false);
  const [staged, setStaged] = useState<string[]>(selected);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStaged(selected);
  }, [selected, open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isFiltered = selected.length > 0;

  let triggerLabel = `${labelPrefix}: All`;
  if (selected.length === 1) {
    triggerLabel = `${labelPrefix}: ${selected[0]}`;
  } else if (selected.length > 1) {
    triggerLabel = `${labelPrefix} (${selected.length})`;
  }

  const handleToggle = (id: string) => {
    setStaged((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onChange(staged);
    setOpen(false);
  };

  const handleClear = () => {
    setStaged([]);
    onChange([]);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border
          ${isFiltered
            ? "bg-[#7D3F1E]/10 dark:bg-[#E07A57]/15 border-[#7D3F1E] dark:border-[#E07A57] text-[#7D3F1E] dark:text-[#E07A57] font-semibold shadow-xs"
            : "bg-white dark:bg-[#20242B] border-black/[0.10] dark:border-white/[0.12] text-[#5B564E] dark:text-[#C2BCB0] hover:border-[#7D3F1E]/50 dark:hover:border-[#E07A57]/50"
          }
        `}
      >
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
        <span>{triggerLabel}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white dark:bg-[#20242B] border border-black/[0.10] dark:border-white/[0.12] rounded-2xl shadow-xl z-40 w-64 p-3.5 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-xs font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
              Filter by {labelPrefix}
            </span>
            {staged.length > 0 && (
              <span className="text-[11px] font-medium text-[#7D3F1E] dark:text-[#E07A57]">
                {staged.length} selected
              </span>
            )}
          </div>

          {/* Options Checklist */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {options.map((opt) => {
              const checked = staged.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors text-xs select-none ${
                    checked
                      ? "bg-[#7D3F1E]/8 dark:bg-[#E07A57]/12 text-[#1F1B16] dark:text-[#F3EFE7] font-medium"
                      : "text-[#5B564E] dark:text-[#C2BCB0] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggle(opt.id)}
                      className="w-3.5 h-3.5 rounded accent-[#7D3F1E] dark:accent-[#E07A57] cursor-pointer"
                    />
                    {opt.color && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    <span>{opt.label}</span>
                  </div>
                  {opt.count !== undefined && (
                    <span className="text-[11px] text-[#9A948A] tabular-nums font-normal">
                      {opt.count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08] gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-[#6F6A61] dark:text-[#9A948A] hover:text-[#7D3F1E] dark:hover:text-[#E07A57] px-2 py-1 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-[#7D3F1E] dark:bg-[#E07A57] text-white shadow-xs hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
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
  const [filterCountry, setFilterCountry] = useState<string>("India");

  // ── Derive filter options from data ────────────────────────────────────────
  const allStates = useMemo(() => {
    const states = new Set<string>();
    suppliersData.forEach((s) => {
      const st = s.state || (s.enterprise_name?.toLowerCase().includes("ukhi") ? "Haryana" : s.enterprise_name?.toLowerCase().includes("bare") ? "Karnataka" : s.enterprise_name?.toLowerCase().includes("kheoni") ? "Madhya Pradesh" : "");
      if (st) states.add(st);
    });
    return Array.from(states).sort();
  }, [suppliersData]);

  const BAND_OPTIONS = ["Leader", "Advanced", "Emerging", "Foundational"];

  const bandOptions = useMemo(() => {
    return BAND_OPTIONS.map((band) => {
      const count = suppliersData.filter((s) => {
        const score = s.final_varna_score ?? s.varnaScore ?? 72;
        return getVarnaBand(score) === band;
      }).length;
      return {
        id: band,
        label: band,
        count,
        color: BAND_COLORS[band],
      };
    });
  }, [suppliersData]);

  const stateOptions = useMemo(() => {
    return allStates.map((st) => {
      const count = suppliersData.filter((s) => {
        const stateName = s.state || (s.enterprise_name?.toLowerCase().includes("ukhi") ? "Haryana" : s.enterprise_name?.toLowerCase().includes("bare") ? "Karnataka" : "Madhya Pradesh");
        return stateName === st;
      }).length;
      return {
        id: st,
        label: st,
        count,
      };
    });
  }, [allStates, suppliersData]);

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

        {/* ── Control Bar: Sort + MultiSelect Dropdowns (MakeMyTrip-Style) ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. Sort dropdown */}
          <SortDropdown value={sortBy} onChange={setSortBy} />

          {/* 2. Band dropdown */}
          <MultiSelectDropdown
            labelPrefix="Band"
            options={bandOptions}
            selected={filterBand}
            onChange={setFilterBand}
            icon={Filter}
          />

          {/* 3. State dropdown */}
          {allStates.length > 0 && (
            <MultiSelectDropdown
              labelPrefix="State"
              options={stateOptions}
              selected={filterState}
              onChange={setFilterState}
              icon={MapPin}
            />
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#7D3F1E] dark:text-[#E07A57] border border-[#7D3F1E]/30 dark:border-[#E07A57]/30 hover:bg-[#7D3F1E]/10 dark:hover:bg-[#E07A57]/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
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

        {/* ── Map View (Genuine Leaflet + OSM) ───────────────────────────────── */}
        {viewMode === "map" && totalFiltered > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <RealPartnerMapView
              suppliers={processedSuppliers}
              allSuppliers={suppliersData}
              selectedCountry={filterCountry}
              onCountryChange={setFilterCountry}
              onPinClick={(s) => {
                setViewMode("list");
                setTimeout(() => {
                  const card = document.getElementById(`partner-card-${s.enterprise_id || s.name}`);
                  if (card) {
                    card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                  }
                }, 150);
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
                    id={`partner-card-${supplier.enterprise_id || name}`}
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
