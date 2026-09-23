"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Award,
  Sparkles,
  Download,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface PropertyItem {
  clientId: string;
  clientName: string;
  propertyType: string;
  city: string;
  country: string;
  varnaScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
  totalSpendInr: number;
  totalOrders: number;
  co2eAvoidedKg: number;
  treesEquivalent: number;
  activeSuppliers: number;
  varnaLeaders: number;
}

const DEFAULT_PROPERTIES: PropertyItem[] = [
  {
    clientId: "CLT-001",
    clientName: "A Dubai",
    propertyType: "Luxury Hotel",
    city: "Dubai",
    country: "UAE",
    varnaScore: 84.5,
    eScore: 82.0,
    sScore: 88.5,
    gScore: 85.0,
    cScore: 82.5,
    totalSpendInr: 25000000,
    totalOrders: 5,
    co2eAvoidedKg: 2160,
    treesEquivalent: 98,
    activeSuppliers: 4,
    varnaLeaders: 2,
  },
  {
    clientId: "CLT-004",
    clientName: "Meridian Grand Palm",
    propertyType: "Luxury Resort",
    city: "Goa",
    country: "India",
    varnaScore: 81.2,
    eScore: 78.5,
    sScore: 84.0,
    gScore: 82.0,
    cScore: 80.5,
    totalSpendInr: 22800000,
    totalOrders: 6,
    co2eAvoidedKg: 1940,
    treesEquivalent: 88,
    activeSuppliers: 3,
    varnaLeaders: 2,
  },
  {
    clientId: "CLT-002",
    clientName: "Six Senses The Palm",
    propertyType: "Luxury Resort",
    city: "Dubai",
    country: "UAE",
    varnaScore: 78.9,
    eScore: 81.0,
    sScore: 76.5,
    gScore: 80.0,
    cScore: 78.0,
    totalSpendInr: 19600000,
    totalOrders: 4,
    co2eAvoidedKg: 1820,
    treesEquivalent: 83,
    activeSuppliers: 3,
    varnaLeaders: 1,
  },
  {
    clientId: "CLT-005",
    clientName: "Meridian Oceanview Resort",
    propertyType: "Resort",
    city: "Kochi",
    country: "India",
    varnaScore: 74.3,
    eScore: 72.0,
    sScore: 75.5,
    gScore: 76.0,
    cScore: 73.5,
    totalSpendInr: 16800000,
    totalOrders: 4,
    co2eAvoidedKg: 1540,
    treesEquivalent: 70,
    activeSuppliers: 3,
    varnaLeaders: 1,
  },
  {
    clientId: "CLT-003",
    clientName: "The Dorchester Dubai",
    propertyType: "Luxury Hotel",
    city: "Dubai",
    country: "UAE",
    varnaScore: 71.8,
    eScore: 69.5,
    sScore: 74.0,
    gScore: 72.5,
    cScore: 71.0,
    totalSpendInr: 15600000,
    totalOrders: 3,
    co2eAvoidedKg: 1410,
    treesEquivalent: 64,
    activeSuppliers: 2,
    varnaLeaders: 1,
  },
  {
    clientId: "CLT-006",
    clientName: "Meridian Heritage Suites",
    propertyType: "Boutique Hotel",
    city: "Jaipur",
    country: "India",
    varnaScore: 68.4,
    eScore: 65.0,
    sScore: 72.5,
    gScore: 68.0,
    cScore: 68.0,
    totalSpendInr: 13440000,
    totalOrders: 3,
    co2eAvoidedKg: 1280,
    treesEquivalent: 58,
    activeSuppliers: 3,
    varnaLeaders: 1,
  },
  {
    clientId: "CLT-007",
    clientName: "Meridian Urban Loft",
    propertyType: "Business Hotel",
    city: "Bengaluru",
    country: "India",
    varnaScore: 62.1,
    eScore: 60.5,
    sScore: 63.0,
    gScore: 64.0,
    cScore: 61.0,
    totalSpendInr: 11360000,
    totalOrders: 2,
    co2eAvoidedKg: 960,
    treesEquivalent: 44,
    activeSuppliers: 2,
    varnaLeaders: 0,
  },
  {
    clientId: "CLT-008",
    clientName: "Meridian Coastal Retreat",
    propertyType: "Resort",
    city: "Alibaug",
    country: "India",
    varnaScore: 56.8,
    eScore: 54.0,
    sScore: 58.5,
    gScore: 59.0,
    cScore: 55.5,
    totalSpendInr: 9440000,
    totalOrders: 2,
    co2eAvoidedKg: 810,
    treesEquivalent: 37,
    activeSuppliers: 2,
    varnaLeaders: 0,
  },
];

type SortField =
  | "rank"
  | "clientName"
  | "varnaScore"
  | "eScore"
  | "sScore"
  | "gScore"
  | "totalSpendInr"
  | "co2eAvoidedKg"
  | "activeSuppliers";

type SortOrder = "asc" | "desc";

export default function GroupPropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("varnaScore");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const propertyTypes = ["All", "Luxury Hotel", "Resort", "Luxury Resort", "Boutique Hotel", "Business Hotel"];

  const filteredAndSortedProperties = useMemo(() => {
    let result = DEFAULT_PROPERTIES.filter((item) => {
      const matchesSearch =
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.country.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "All" || item.propertyType === selectedType;

      return matchesSearch && matchesType;
    });

    result.sort((a, b) => {
      let valA: any = a[sortField as keyof PropertyItem];
      let valB: any = b[sortField as keyof PropertyItem];

      if (sortField === "rank") {
        valA = a.varnaScore;
        valB = b.varnaScore;
      }

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [searchQuery, selectedType, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#6E7781]/40 group-hover:text-[#B85333] transition-colors" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-[#B85333]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#B85333]" />
    );
  };

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatUsd = (amountInr: number) => {
    const usd = amountInr / 83;
    if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
    if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
    return `$${Math.round(usd)}`;
  };

  const totalPortfolioSpendInr = DEFAULT_PROPERTIES.reduce((acc, p) => acc + p.totalSpendInr, 0);
  const avgVarnaScore = (
    DEFAULT_PROPERTIES.reduce((acc, p) => acc + p.varnaScore, 0) / DEFAULT_PROPERTIES.length
  ).toFixed(1);
  const varnaLeaderCount = DEFAULT_PROPERTIES.filter((p) => p.varnaScore >= 80).length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-5">
        <div>
          <div className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#B85333] dark:text-[#D4705A] mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>GROUP PORTFOLIO LEADERBOARD</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl font-medium tracking-tight text-[#1A1F26] dark:text-[#FAF8F5] uppercase">
            Hotel-Level Leaderboard
          </h1>
          <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] mt-1 font-light max-w-2xl leading-relaxed">
            Comparative performance, verified ESG metrics, ethical procurement spend, and carbon abatement across all 8 group properties.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-sans font-medium bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#1A1F26] dark:text-[#FAF8F5] hover:border-[#B85333]/40 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#6F848F]" />
            <span>Export Report</span>
          </button>
        </div>
      </header>

      {/* Summary KPI Cards Bar with Uniform Currency & Deltas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-4 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#6E7781] dark:text-[#8C9DA8] font-medium block mb-1">
            Total Properties
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
              {DEFAULT_PROPERTIES.length}
            </span>
            <span className="text-[10px] text-[#556B55] dark:text-[#738678] font-mono font-bold px-2 py-0.5 rounded bg-[#556B55]/10 border border-[#556B55]/20">
              100% Active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-4 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#6E7781] dark:text-[#8C9DA8] font-medium block mb-1">
            Avg. Varna Score
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-sans font-medium text-[#B85333] dark:text-[#D4705A]">
              {avgVarnaScore} <span className="text-xs font-light text-[#6E7781]">/ 100</span>
            </span>
            <span className="text-[10px] bg-[#B85333]/10 text-[#B85333] dark:text-[#D4705A] px-2 py-0.5 rounded font-mono font-bold border border-[#B85333]/20 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" /> +4.2 YTD
            </span>
          </div>
        </div>

        {/* Unified Primary INR Currency with Subtext USD */}
        <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-4 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#6E7781] dark:text-[#8C9DA8] font-medium block mb-1">
            Portfolio Spend
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
              {formatLakhs(totalPortfolioSpendInr)}
            </span>
            <span className="text-xs text-[#6F848F] font-mono font-medium">
              {formatUsd(totalPortfolioSpendInr)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-4 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#6E7781] dark:text-[#8C9DA8] font-medium block mb-1">
            Varna Leaders
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-sans font-medium text-[#556B55] dark:text-[#738678]">
              {varnaLeaderCount} <span className="text-xs font-light text-[#6E7781]">/ {DEFAULT_PROPERTIES.length}</span>
            </span>
            <span className="text-[10px] bg-[#556B55]/15 text-[#556B55] dark:text-[#738678] px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1 border border-[#556B55]/30">
              <Star className="w-2.5 h-2.5 fill-current" /> Gold Tier
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Contrast-Compliant Filter Chips */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#18191D]/95 backdrop-blur-md p-4 rounded-xl border border-[#EAE5DC] dark:border-[#8C9DA8]/20 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E7781] dark:text-[#8C9DA8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter properties by name or location..."
            className="w-full pl-10 pr-4 py-2 text-xs font-sans rounded-lg bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#1A1F26] dark:text-[#FAF8F5] focus:outline-none focus:border-[#B85333] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6E7781] hover:text-[#1A1F26] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Chips with High Contrast Active & Hover States */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
          {propertyTypes.map((type) => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all shrink-0 cursor-pointer ${isActive
                    ? "bg-[#B85333] text-white font-semibold shadow-xs"
                    : "bg-[#FAF8F5] dark:bg-[#22252B] text-[#1A1F26] dark:text-[#FAF8F5] hover:bg-[#EAE5DC] dark:hover:bg-[#2A2D34] border border-[#EAE5DC] dark:border-[#8C9DA8]/30 font-medium"
                  }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table with Styled Avatars, Sparkline ESG Bars & Details Affordance */}
      <div className="bg-white dark:bg-[#1E2028] rounded-xl border border-[#EAE5DC] dark:border-[#8C9DA8]/20 shadow-card-light dark:shadow-elevation-dark-low overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#FAF8F5] dark:bg-[#22252B] border-b border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[10px] uppercase font-sans font-semibold tracking-wider text-[#6E7781] dark:text-[#8C9DA8]">
                <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                <th
                  onClick={() => handleSort("clientName")}
                  className="py-3.5 px-4 cursor-pointer group hover:text-[#B85333] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Property Name &amp; Location</span>
                    {renderSortIndicator("clientName")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("varnaScore")}
                  className="py-3.5 px-4 cursor-pointer group hover:text-[#B85333] transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Varna Score</span>
                    {renderSortIndicator("varnaScore")}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">E / S / G Breakdown</th>
                <th
                  onClick={() => handleSort("totalSpendInr")}
                  className="py-3.5 px-4 cursor-pointer group hover:text-[#B85333] transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Sustainable Spend</span>
                    {renderSortIndicator("totalSpendInr")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("co2eAvoidedKg")}
                  className="py-3.5 px-4 cursor-pointer group hover:text-[#B85333] transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>CO₂e Avoided</span>
                    {renderSortIndicator("co2eAvoidedKg")}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Suppliers</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-3 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5DC] dark:divide-[#8C9DA8]/15 font-sans">
              <AnimatePresence>
                {filteredAndSortedProperties.map((prop, idx) => {
                  const isLeader = prop.varnaScore >= 80;
                  const rank = idx + 1;

                  // Brand Monogram Avatar colors
                  const avatarColorClass =
                    rank === 1
                      ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40"
                      : rank === 2
                        ? "bg-[#A89C82]/20 text-[#A89C82] border-[#A89C82]/40"
                        : rank === 3
                          ? "bg-[#B85333]/20 text-[#B85333] border-[#B85333]/40"
                          : "bg-[#6F848F]/20 text-[#6F848F] border-[#6F848F]/40";

                  return (
                    <motion.tr
                      key={prop.clientId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className="hover:bg-[#FAF8F5] dark:hover:bg-[#22252B]/60 transition-colors group cursor-pointer"
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center font-mono text-xs font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
                        {rank === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center text-xs mx-auto font-bold">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-[#A89C82]/20 text-[#A89C82] border border-[#A89C82]/40 flex items-center justify-center text-xs mx-auto font-bold">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="w-6 h-6 rounded-full bg-[#B85333]/20 text-[#B85333] border border-[#B85333]/40 flex items-center justify-center text-xs mx-auto font-bold">
                            3
                          </span>
                        ) : (
                          `#${rank}`
                        )}
                      </td>

                      {/* Property Name & Location with Brand Monogram Badge */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${avatarColorClass}`}>
                            {prop.clientName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#1A1F26] dark:text-[#FAF8F5] group-hover:text-[#B85333] transition-colors">
                                {prop.clientName}
                              </span>
                              {isLeader && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#556B55]/15 text-[#556B55] dark:text-[#738678] border border-[#556B55]/30">
                                  <Star className="w-2.5 h-2.5 fill-current" /> Leader
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#6E7781] dark:text-[#8C9DA8] font-light mt-0.5">
                              <MapPin className="w-3 h-3 text-[#6F848F]" />
                              <span>
                                {prop.city}, {prop.country}
                              </span>
                              <span>&bull;</span>
                              <span className="italic">{prop.propertyType}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Varna Score Pill */}
                      <td className="py-4 px-4 text-right">
                        <div className="text-base font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight">
                          {prop.varnaScore.toFixed(1)}
                          <span className="text-xs font-light text-[#6E7781]"> /100</span>
                        </div>
                      </td>

                      {/* ESG Breakdown Micro Bars */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
                          <div className="flex flex-col items-center gap-0.5" title={`Environmental: ${prop.eScore}`}>
                            <span className="text-[9px] text-[#738678] font-bold">E:{prop.eScore.toFixed(0)}</span>
                            <div className="w-8 h-1 bg-[#738678]/20 rounded-full overflow-hidden">
                              <div className="h-full bg-[#738678] rounded-full" style={{ width: `${prop.eScore}%` }} />
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-0.5" title={`Social: ${prop.sScore}`}>
                            <span className="text-[9px] text-[#B85333] font-bold">S:{prop.sScore.toFixed(0)}</span>
                            <div className="w-8 h-1 bg-[#B85333]/20 rounded-full overflow-hidden">
                              <div className="h-full bg-[#B85333] rounded-full" style={{ width: `${prop.sScore}%` }} />
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-0.5" title={`Governance: ${prop.gScore}`}>
                            <span className="text-[9px] text-[#6F848F] font-bold">G:{prop.gScore.toFixed(0)}</span>
                            <div className="w-8 h-1 bg-[#6F848F]/20 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6F848F] rounded-full" style={{ width: `${prop.gScore}%` }} />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Spend */}
                      <td className="py-4 px-4 text-right">
                        <div className="text-xs font-mono font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                          {formatLakhs(prop.totalSpendInr)}
                        </div>
                        <div className="text-[10px] text-[#6E7781] font-light mt-0.5">
                          {formatUsd(prop.totalSpendInr)} &bull; {prop.totalOrders} Orders
                        </div>
                      </td>

                      {/* CO2e Avoided */}
                      <td className="py-4 px-4 text-right">
                        <div className="text-xs font-mono font-bold text-[#556B55] dark:text-[#738678]">
                          {prop.co2eAvoidedKg.toLocaleString()} kg
                        </div>
                        <div className="text-[10px] text-[#6E7781] font-light mt-0.5">
                          {prop.treesEquivalent} Trees Planted
                        </div>
                      </td>

                      {/* Active Suppliers */}
                      <td className="py-4 px-4 text-center">
                        <div className="text-xs font-mono text-[#1A1F26] dark:text-[#FAF8F5] font-semibold">
                          {prop.activeSuppliers} Active
                        </div>
                        {prop.varnaLeaders > 0 && (
                          <div className="text-[10px] text-[#556B55] dark:text-[#738678] font-bold mt-0.5">
                            {prop.varnaLeaders} Leader
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {isLeader ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#556B55]/15 text-[#556B55] dark:text-[#738678] border border-[#556B55]/30">
                            <ShieldCheck className="w-3 h-3" /> Gold Tier
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#6F848F]/15 text-[#6F848F] dark:text-[#96AAB4] border border-[#6F848F]/30">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </td>

                      {/* Row Hover Details Affordance */}
                      <td className="py-4 px-3 text-center">
                        <ChevronRight className="w-4 h-4 text-[#6E7781]/0 group-hover:text-[#B85333] group-hover:translate-x-0.5 transition-all" />
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
