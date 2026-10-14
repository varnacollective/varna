"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Scale, Filter, RotateCcw, ChevronDown } from "lucide-react";

export interface SupplierImpactData {
  name: string;
  womenPct: number;
  wageRatio: number;
  tier?: string;
  enterpriseId?: string;
}

interface SocialImpactV2Props {
  artisansSupported: number;
  womenWorkforcePercent: number;
  wageRatio?: number;
  supplierImpactData?: SupplierImpactData[];
}

export default function SocialImpactV2({
  artisansSupported,
  womenWorkforcePercent: defaultWomenPct,
  wageRatio: defaultWageRatio = 1.05,
  supplierImpactData = [],
}: SocialImpactV2Props) {
  // Filters state
  const [countFilter, setCountFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("value-desc");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const totalPartners = supplierImpactData.length;

  // Partner count options: Top 5, 10, 15, 20 up to total partners, plus All
  const countOptions = useMemo(() => {
    const steps = [5, 10, 15, 20];
    const valid = steps.filter((s) => s < totalPartners);
    const opts = valid.map((s) => ({ value: String(s), label: `Top ${s}` }));
    opts.push({ value: "all", label: `All (${totalPartners})` });
    return opts;
  }, [totalPartners]);

  const isFiltered = countFilter !== "all" || sortOption !== "value-desc" || tierFilter !== "all";

  const handleResetFilters = () => {
    setCountFilter("all");
    setSortOption("value-desc");
    setTierFilter("all");
  };

  // Filtered & sorted data
  const filteredData = useMemo(() => {
    let result = [...supplierImpactData];

    // 1. Tier filter
    if (tierFilter !== "all") {
      result = result.filter((s) => {
        const t = (s.tier || "").toLowerCase();
        return t.includes(tierFilter.toLowerCase());
      });
    }

    // 2. Sort
    result.sort((a, b) => {
      if (sortOption === "value-desc") return b.womenPct - a.womenPct;
      if (sortOption === "value-asc") return a.womenPct - b.womenPct;
      if (sortOption === "wage-desc") return b.wageRatio - a.wageRatio;
      if (sortOption === "wage-asc") return a.wageRatio - b.wageRatio;
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });

    // 3. Count limit
    if (countFilter !== "all") {
      const limit = parseInt(countFilter, 10);
      if (!isNaN(limit) && limit > 0) {
        result = result.slice(0, limit);
      }
    }

    return result;
  }, [supplierImpactData, countFilter, sortOption, tierFilter]);

  const filteredCount = filteredData.length;

  // Dynamically derived metrics for filtered set
  const filteredAvgWomen = useMemo(() => {
    if (filteredCount === 0) return defaultWomenPct;
    const sum = filteredData.reduce((acc, s) => acc + s.womenPct, 0);
    return Math.round(sum / filteredCount);
  }, [filteredData, filteredCount, defaultWomenPct]);

  const filteredAvgWageRatio = useMemo(() => {
    if (filteredCount === 0) return defaultWageRatio;
    const sum = filteredData.reduce((acc, s) => acc + s.wageRatio, 0);
    return sum / filteredCount;
  }, [filteredData, filteredCount, defaultWageRatio]);

  const allSameRatio = useMemo(() => {
    return (
      filteredCount > 0 &&
      filteredData.every((s) => Math.abs(s.wageRatio - filteredData[0].wageRatio) < 0.001)
    );
  }, [filteredData, filteredCount]);

  const wageCaption = allSameRatio
    ? `Same multiple at all ${filteredCount} enterprises`
    : `Average multiplier across ${filteredCount} enterprises`;

  const maxWageRatio = Math.max(1.5, ...filteredData.map((s) => s.wageRatio), 1.5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="
        w-full mb-6
        bg-white dark:bg-[#1C1917]
        rounded-2xl border border-[#E8E3DA] dark:border-[#2E2823]
        shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)] p-6 lg:p-8 flex flex-col justify-between min-h-[460px]
      "
    >
      {/* Header and Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-[#F0EDE6] dark:border-[#2A241F]">
        <div>
          <h2 className="text-xl lg:text-[22px] font-serif font-normal text-[#1C1917] dark:text-[#F7F5F0] tracking-tight">
            Social Livelihood Impact
          </h2>
          <p className="text-xs text-[#78716C] dark:text-[#A8A29E] font-normal mt-0.5">
            Women&apos;s employment and wages at your partner enterprises
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Partner Count Filter */}
          <div className="relative inline-flex items-center">
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[#78716C] dark:text-[#A8A29E] mr-1.5 hidden sm:inline">
              Show:
            </span>
            <select
              value={countFilter}
              aria-label="Filter partner count"
              onChange={(e) => setCountFilter(e.target.value)}
              className="appearance-none bg-[#F7F5F0] dark:bg-[#2A241F] text-[#1C1917] dark:text-[#F7F5F0] pl-3 pr-7 py-1.5 rounded-lg border border-[#E8E3DA] dark:border-[#38312B] font-medium focus:outline-none focus:ring-1 focus:ring-[#1C1917] cursor-pointer"
            >
              {countOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#78716C] dark:text-[#A8A29E] absolute right-2 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative inline-flex items-center">
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[#78716C] dark:text-[#A8A29E] mr-1.5 hidden sm:inline">
              Sort:
            </span>
            <select
              value={sortOption}
              aria-label="Sort partner data"
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none bg-[#F7F5F0] dark:bg-[#2A241F] text-[#1C1917] dark:text-[#F7F5F0] pl-3 pr-7 py-1.5 rounded-lg border border-[#E8E3DA] dark:border-[#38312B] font-medium focus:outline-none focus:ring-1 focus:ring-[#1C1917] cursor-pointer"
            >
              <option value="value-desc">Women %: High → Low</option>
              <option value="value-asc">Women %: Low → High</option>
              <option value="wage-desc">Wage: High → Low</option>
              <option value="wage-asc">Wage: Low → High</option>
              <option value="name-asc">Name: A → Z</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#78716C] dark:text-[#A8A29E] absolute right-2 pointer-events-none" />
          </div>

          {/* Tier Filter */}
          <div className="relative inline-flex items-center">
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[#78716C] dark:text-[#A8A29E] mr-1.5 hidden sm:inline">
              Tier:
            </span>
            <select
              value={tierFilter}
              aria-label="Filter by partner enterprise tier"
              onChange={(e) => setTierFilter(e.target.value)}
              className="appearance-none bg-[#F7F5F0] dark:bg-[#2A241F] text-[#1C1917] dark:text-[#F7F5F0] pl-3 pr-7 py-1.5 rounded-lg border border-[#E8E3DA] dark:border-[#38312B] font-medium focus:outline-none focus:ring-1 focus:ring-[#1C1917] cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="Micro A">Micro A</option>
              <option value="Micro B">Micro B</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#78716C] dark:text-[#A8A29E] absolute right-2 pointer-events-none" />
          </div>

          {/* Reset Filters Link */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#9A4A2E] dark:text-[#E07A57] hover:bg-[#9A4A2E]/10 dark:hover:bg-[#E07A57]/15 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Column Layout (~30/35/35) or Empty State */}
      {filteredCount === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center my-auto">
          <div className="w-12 h-12 rounded-full bg-[#9A4A2E]/10 dark:bg-[#E07A57]/10 flex items-center justify-center text-[#9A4A2E] dark:text-[#E07A57] mb-3">
            <Filter className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-base font-medium text-[#1C1917] dark:text-[#F7F5F0]">
            No partners match these filters
          </p>
          <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1 max-w-sm">
            Try adjusting your tier selection or partner count limit to see impact metrics.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-1.5 text-xs font-medium text-[#9A4A2E] dark:text-[#E07A57] bg-[#9A4A2E]/10 dark:bg-[#E07A57]/15 hover:bg-[#9A4A2E]/20 rounded-lg transition-colors cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6 my-auto items-start">
          {/* Column 1 (~30% / 4 cols): Stat Blocks */}
          <div className="md:col-span-4 space-y-6 flex flex-col justify-center pr-2">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#9A4A2E]/10 dark:bg-[#9A4A2E]/20 flex items-center justify-center text-[#9A4A2E] dark:text-[#E07A57] shrink-0 mt-0.5">
                <Users className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#78716C] dark:text-[#A8A29E] block">
                  Women in the workforce
                </span>
                <div className="font-serif text-3xl lg:text-[42px] font-light text-[#1C1917] dark:text-[#F7F5F0] tracking-tight leading-none mt-1.5 tabular-nums transition-all duration-200">
                  {filteredAvgWomen}%
                </div>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] font-normal mt-1.5">
                  Average of {filteredCount} partner {filteredCount === 1 ? "enterprise" : "enterprises"}
                  {artisansSupported > 0 ? ` (${artisansSupported} artisans supported)` : ""}
                </p>
              </div>
            </div>

            <div className="h-px bg-[#F0EDE6] dark:bg-[#2A241F]" />

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#3A5A40]/10 dark:bg-[#3A5A40]/25 flex items-center justify-center text-[#3A5A40] dark:text-[#729B79] shrink-0 mt-0.5">
                <Scale className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#78716C] dark:text-[#A8A29E] block">
                  Wage vs statutory minimum
                </span>
                <div className="font-serif text-3xl lg:text-[42px] font-light text-[#1C1917] dark:text-[#F7F5F0] tracking-tight leading-none mt-1.5 tabular-nums transition-all duration-200">
                  {filteredAvgWageRatio.toFixed(2)}×
                </div>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] font-normal mt-1.5">
                  {wageCaption}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2 (~35% / 4 cols): Women Employed by Enterprise */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0EDE6] dark:border-[#2A241F]">
              <span className="text-xs font-medium text-[#1C1917] dark:text-[#F7F5F0]">
                Women employed, by enterprise
              </span>
              <span className="text-xs font-normal text-[#78716C] dark:text-[#A8A29E] tabular-nums">
                Average {filteredAvgWomen}%
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {filteredData.map((supplier) => (
                  <motion.div
                    key={supplier.enterpriseId || supplier.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-[#FAF8F5] dark:hover:bg-white/[0.03] p-1.5 rounded-md transition-colors -mx-1.5 space-y-1.5 cursor-default"
                  >
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span
                        className="text-[#1C1917] dark:text-[#F7F5F0] font-normal truncate"
                        title={supplier.name}
                      >
                        {supplier.name}
                      </span>
                      <span className="font-medium text-[#1C1917] dark:text-[#F7F5F0] shrink-0 tabular-nums">
                        {supplier.womenPct}%
                      </span>
                    </div>
                    {/* Sleeker 6px Rounded Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[#F0EDE6] dark:bg-[#2A241F] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#9A4A2E] dark:bg-[#C27D60] transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, supplier.womenPct))}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 3 (~35% / 4 cols): Wage Multiple vs Statutory Minimum */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0EDE6] dark:border-[#2A241F]">
              <span className="text-xs font-medium text-[#1C1917] dark:text-[#F7F5F0]">
                Wage multiple vs statutory minimum
              </span>
              <span className="text-xs font-normal text-[#78716C] dark:text-[#A8A29E] tabular-nums">
                {allSameRatio ? "benchmark multiplier" : `Avg ${filteredAvgWageRatio.toFixed(2)}× benchmark`}
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {filteredData.map((supplier) => {
                  const ratioPct = Math.min(100, Math.max(10, (supplier.wageRatio / maxWageRatio) * 100));
                  return (
                    <motion.div
                      key={supplier.enterpriseId || supplier.name}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-[#FAF8F5] dark:hover:bg-white/[0.03] p-1.5 rounded-md transition-colors -mx-1.5 space-y-1.5 cursor-default"
                    >
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span
                          className="text-[#1C1917] dark:text-[#F7F5F0] font-normal truncate"
                          title={supplier.name}
                        >
                          {supplier.name}
                        </span>
                        <span className="font-medium text-[#1C1917] dark:text-[#F7F5F0] shrink-0 tabular-nums">
                          {supplier.wageRatio.toFixed(2)}×
                        </span>
                      </div>
                      {/* Sleeker 6px Rounded Bar with Baseline Indicator */}
                      <div className="w-full h-1.5 rounded-full bg-[#F0EDE6] dark:bg-[#2A241F] overflow-hidden relative">
                        <div
                          className="h-full rounded-full bg-[#3A5A40] dark:bg-[#729B79] transition-all duration-300 ease-out"
                          style={{ width: `${ratioPct}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

