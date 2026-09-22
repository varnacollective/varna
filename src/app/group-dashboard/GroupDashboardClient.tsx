"use client";

import React, { useState } from "react";
import {
  Award,
  Building2,
  Users,
  Coins,
  Leaf,
  ShieldCheck,
  Car,
  Trees,
  Trophy,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Search,
  Sun,
  Moon,
  Sparkles,
  Quote,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

import LeaderboardTable from "@/components/Group/LeaderboardTable";
import RadialGauge from "@/components/ui/RadialGauge";
import PillarBreakdownHoverCard from "@/components/ui/PillarBreakdownHoverCard";
import {
  type FullGroupDashboardData,
  type HotelLeaderboardItem,
  type SupplierBandSpend,
  type SupplierTierCount,
} from "@/types/group-dashboard";

interface GroupDashboardClientProps {
  initialData?: FullGroupDashboardData;
}

// ── Default Mock Fallback matching Target Quiet Luxury Design ─────────────────
const DEFAULT_GROUP_DATA: FullGroupDashboardData = {
  summary: {
    parentGroup: "Meridian Hotels & Resorts",
    noProperties: 8,
    noActiveSupplierRelationships: 23,
    totalSpend: 1900000,
    totalCo2eKg: 65890,
    totalCo2eAvoidedKg: 16100,
    avgVarnaScore: 61.9,
    avgE: 62,
    avgS: 58,
    avgG: 66,
    avgC: 59,
    carKmAvoided: 65980,
    treesEquivalent: 731,
    hotelsAboveGroupAvg: 5,
    hotelsNeedingSupport: 2,
    spendAtRisk: 460000,
    spendAtRiskPct: 24,
    subCriteria: {
      e1: 68, e2: 56, e3: 61, e4: 65, e5: 60, e6: 62,
      s1: 64, s2: 59, s3: 54, s4: 57,
      g1: 69, g2: 63, g3: 58,
      c1: 65, c2: 59, c3: 62,
    },
  },
  hotels: [
    {
      clientId: "PROP-001",
      clientName: "Meridian Grand Palm",
      propertyType: "Luxury Resort",
      city: "Goa",
      country: "India",
      varnaScore: 85.3,
      eScore: 88,
      sScore: 82,
      gScore: 86,
      cScore: 85,
      totalSpend: 420000,
      totalOrders: 42,
      totalUnits: 1200,
      co2eKg: 12400,
      co2eAvoidedKg: 3800,
      co2ReductionPct: 23.4,
      carKmAvoided: 15570,
      treesEquivalent: 173,
      activeSuppliers: 5,
      varnaLeaders: 3,
    },
    {
      clientId: "PROP-002",
      clientName: "Meridian Desert Oasis",
      propertyType: "Heritage Palace",
      city: "Jaipur",
      country: "India",
      varnaScore: 82.6,
      eScore: 84,
      sScore: 79,
      gScore: 83,
      cScore: 81,
      totalSpend: 310000,
      totalOrders: 35,
      totalUnits: 980,
      co2eKg: 9800,
      co2eAvoidedKg: 2900,
      co2ReductionPct: 22.8,
      carKmAvoided: 11890,
      treesEquivalent: 132,
      activeSuppliers: 4,
      varnaLeaders: 2,
    },
    {
      clientId: "PROP-003",
      clientName: "Meridian Oceanview Resort",
      propertyType: "Coastal Resort",
      city: "Kochi",
      country: "India",
      varnaScore: 70.5,
      eScore: 72,
      sScore: 68,
      gScore: 71,
      cScore: 71,
      totalSpend: 260000,
      totalOrders: 28,
      totalUnits: 750,
      co2eKg: 7100,
      co2eAvoidedKg: 2100,
      co2ReductionPct: 22.8,
      carKmAvoided: 8610,
      treesEquivalent: 95,
      activeSuppliers: 3,
      varnaLeaders: 2,
    },
    {
      clientId: "PROP-004",
      clientName: "Meridian Heritage Suites",
      propertyType: "Boutique Hotel",
      city: "Udaipur",
      country: "India",
      varnaScore: 64.4,
      eScore: 66,
      sScore: 62,
      gScore: 67,
      cScore: 62,
      totalSpend: 240000,
      totalOrders: 24,
      totalUnits: 680,
      co2eKg: 6800,
      co2eAvoidedKg: 1900,
      co2ReductionPct: 21.8,
      carKmAvoided: 7790,
      treesEquivalent: 86,
      activeSuppliers: 3,
      varnaLeaders: 1,
    },
    {
      clientId: "PROP-005",
      clientName: "Meridian Coastal Retreat",
      propertyType: "Eco Retreat",
      city: "Alibaug",
      country: "India",
      varnaScore: 63.3,
      eScore: 65,
      sScore: 61,
      gScore: 64,
      cScore: 63,
      totalSpend: 210000,
      totalOrders: 22,
      totalUnits: 590,
      co2eKg: 5900,
      co2eAvoidedKg: 1600,
      co2ReductionPct: 21.3,
      carKmAvoided: 6560,
      treesEquivalent: 73,
      activeSuppliers: 3,
      varnaLeaders: 1,
    },
    {
      clientId: "PROP-006",
      clientName: "Meridian Urban Loft",
      propertyType: "City Hotel",
      city: "Bengaluru",
      country: "India",
      varnaScore: 52.0,
      eScore: 53,
      sScore: 49,
      gScore: 52,
      cScore: 54,
      totalSpend: 180000,
      totalOrders: 18,
      totalUnits: 480,
      co2eKg: 4800,
      co2eAvoidedKg: 1100,
      co2ReductionPct: 18.6,
      carKmAvoided: 4510,
      treesEquivalent: 50,
      activeSuppliers: 2,
      varnaLeaders: 0,
    },
    {
      clientId: "PROP-007",
      clientName: "Meridian City Center",
      propertyType: "Business Hotel",
      city: "New Delhi",
      country: "India",
      varnaScore: 48.5,
      eScore: 46,
      sScore: 48,
      gScore: 51,
      cScore: 49,
      totalSpend: 150000,
      totalOrders: 15,
      totalUnits: 410,
      co2eKg: 4500,
      co2eAvoidedKg: 900,
      co2ReductionPct: 16.7,
      carKmAvoided: 3690,
      treesEquivalent: 41,
      activeSuppliers: 2,
      varnaLeaders: 0,
    },
    {
      clientId: "PROP-008",
      clientName: "Meridian Business Hub",
      propertyType: "Airport Hotel",
      city: "Mumbai",
      country: "India",
      varnaScore: 45.2,
      eScore: 43,
      sScore: 45,
      gScore: 47,
      cScore: 46,
      totalSpend: 130000,
      totalOrders: 12,
      totalUnits: 360,
      co2eKg: 5000,
      co2eAvoidedKg: 800,
      co2ReductionPct: 13.8,
      carKmAvoided: 3280,
      treesEquivalent: 36,
      activeSuppliers: 2,
      varnaLeaders: 0,
    },
  ],
  spendByBand: [
    { band: "Leader (80+)", spend: 730000, percentage: 38.4, color: "#556B55" },
    { band: "Advanced (70-79)", spend: 500000, percentage: 26.3, color: "#6F848F" },
    { band: "Emerging (50-69)", spend: 210000, percentage: 11.1, color: "#A89C82" },
    { band: "Foundational / Not Ready", spend: 460000, percentage: 24.2, color: "#7A3F1E" },
  ],
  tierDistribution: [
    { tier: "Micro A", count: 9, percentage: 39, color: "#556B55" },
    { tier: "Micro B", count: 6, percentage: 26, color: "#6F848F" },
    { tier: "Small", count: 5, percentage: 22, color: "#A89C82" },
    { tier: "Medium", count: 3, percentage: 13, color: "#7A3F1E" },
  ],
  uniqueSuppliersCount: 23,
};

export default function GroupDashboardClient({ initialData }: GroupDashboardClientProps) {
  const data = initialData || DEFAULT_GROUP_DATA;
  const { summary, hotels, spendByBand, tierDistribution } = data;
  const { theme, setTheme } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("Aug 2026");

  const filteredHotels = hotels.filter((h: HotelLeaderboardItem) => {
    const term = searchTerm.toLowerCase();
    return (
      h.clientName.toLowerCase().includes(term) ||
      h.city.toLowerCase().includes(term) ||
      h.country.toLowerCase().includes(term) ||
      h.propertyType.toLowerCase().includes(term)
    );
  });

  const formatLakhs = (amount: number) => {
    if (!amount && amount !== 0) return "₹0";
    if (amount >= 100000) {
      const lakhs = (amount / 100000).toFixed(1);
      return `₹${lakhs}L`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNum = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  return (
    <div className="w-full font-sans">
      {/* ── Top Header Bar / Hero Band ──────────────────────────────────────────────────── */}
      <header className="varna-grp-header px-6 md:px-8 py-8 bg-gradient-to-r from-[#FAF8F5] via-[#F4EFEA] to-[#FAF8F5] dark:from-[#18191D] dark:via-[#22252B] dark:to-[#18191D] border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 shadow-xs">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-sans font-semibold tracking-[0.22em] text-[#B85333] dark:text-[#D4705A] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#556B55]" />
              <span>GROUP SUSTAINABILITY DASHBOARD</span>
            </div>
            <h1 className="varna-grp-hero-h1 font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight font-normal leading-tight">
              A more responsible hospitality, together.
            </h1>
            <p className="text-xs font-sans text-[#6E7781] dark:text-[#8C9DA8] flex flex-wrap items-center gap-2 pt-1 font-light">
              <span className="font-medium text-[#1A1F26] dark:text-[#FAF8F5]">{summary.parentGroup}</span>
              <span>&bull;</span>
              <span>{summary.noProperties} Portfolio Properties</span>
              <span>&bull;</span>
              <span>{summary.noActiveSupplierRelationships} Active Partner Relationships</span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#6E7781] dark:text-[#8C9DA8] hover:text-[#1A1F26] dark:hover:text-[#FAF8F5] transition-all shadow-xs cursor-pointer"
                title="Toggle Light/Dark Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-[#C5A059]" /> : <Moon className="w-4 h-4 text-[#1A1F26]" />}
              </button>

              <div className="flex items-center gap-2 bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 px-3 py-1.5 rounded-lg shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-[#B85333]" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-transparent text-xs font-sans font-semibold text-[#1A1F26] dark:text-[#FAF8F5] focus:outline-none cursor-pointer"
                >
                  <option value="Aug 2026" className="bg-white dark:bg-[#1E2028]">Aug 2026</option>
                  <option value="Jul 2026" className="bg-white dark:bg-[#1E2028]">Jul 2026</option>
                  <option value="Q2 2026" className="bg-white dark:bg-[#1E2028]">Q2 2026</option>
                  <option value="FY 2025" className="bg-white dark:bg-[#1E2028]">FY 2025</option>
                </select>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#6E7781] dark:text-[#8C9DA8] block">
                PEOPLE &bull; PLACES &bull; A BRIGHTER TOMORROW
              </span>
              <span className="text-[11px] font-serif italic text-[#6E7781] dark:text-[#8C9DA8]">
                Responsible choices deliver lasting value.
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="varna-grp-content p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* ── Executive KPI Strip (Differentiated Hero Metric) ────────────────────────────────────────── */}
        <section className="varna-grp-kpi-strip grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {/* HERO METRIC CARD: Group Avg Score */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#B85333]/10 via-white to-white dark:from-[#B85333]/20 dark:via-[#1E2028] dark:to-[#1E2028] border border-[#B85333]/40 rounded-xl p-4 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-bold tracking-wider text-[#B85333] dark:text-[#D4705A]">
                <Award className="w-4 h-4 text-[#B85333]" />
                <span>Group Avg Varna Score</span>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#556B55]/15 text-[#556B55] dark:text-[#738678] border border-[#556B55]/30">
                Emerging Tier
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight">
                {summary.avgVarnaScore.toFixed(1)}
              </span>
              <span className="text-xs font-light text-[#6E7781] dark:text-[#8C9DA8]">/ 100 benchmark</span>
            </div>
            <p className="text-[10px] text-[#6E7781] dark:text-[#8C9DA8] mt-2 font-light border-t border-[#EAE5DC] dark:border-[#8C9DA8]/20 pt-2">
              +4.2 pts YTD across all 8 portfolio properties
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-4 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
              <Building2 className="w-3.5 h-3.5 text-[#556B55]" />
              <span className="truncate">Properties</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl lg:text-3xl font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
                {summary.noProperties}
              </span>
              <span className="text-[10px] text-[#556B55] block mt-0.5 font-mono">100% Active</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-4 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
              <Users className="w-3.5 h-3.5 text-[#B85333]" />
              <span className="truncate">Active Suppliers</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl lg:text-3xl font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
                {summary.noActiveSupplierRelationships}
              </span>
              <span className="text-[10px] text-[#6E7781] block mt-0.5 font-mono">Verified Ledger</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-4 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
              <Coins className="w-3.5 h-3.5 text-[#6F848F]" />
              <span className="truncate">Total Spend</span>
            </div>
            <div className="mt-2">
              <span className="text-xl lg:text-2xl font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
                {formatLakhs(summary.totalSpend)}
              </span>
              <span className="text-[10px] text-[#6E7781] block mt-0.5 font-mono">$228K Eq.</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-4 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
              <Leaf className="w-3.5 h-3.5 text-[#556B55]" />
              <span className="truncate">Total CO₂e</span>
            </div>
            <div className="mt-2">
              <span className="text-lg lg:text-xl font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
                {formatNum(summary.totalCo2eKg)} <span className="text-[10px] font-normal text-[#6E7781]">kg</span>
              </span>
              <span className="text-[10px] text-[#6E7781] block mt-0.5 font-mono">Gross Footprint</span>
            </div>
          </div>

          {/* EQUIVALENTS CARD WITH ICONS */}
          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-4 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
              <span>Equivalents</span>
              <div className="flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-[#6F848F]" />
                <Trees className="w-3.5 h-3.5 text-[#556B55]" />
              </div>
            </div>
            <div className="mt-2 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#6E7781] dark:text-[#8C9DA8]">
                  <Car className="w-3 h-3 text-[#6F848F]" />
                  <span>Car Kms:</span>
                </div>
                <span className="font-bold text-[#1A1F26] dark:text-[#FAF8F5]">{formatNum(summary.carKmAvoided)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#6E7781] dark:text-[#8C9DA8]">
                  <Trees className="w-3 h-3 text-[#556B55]" />
                  <span>Trees Planted:</span>
                </div>
                <span className="font-bold text-[#556B55] dark:text-[#7B9B7B]">{formatNum(summary.treesEquivalent)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── ESG Pillar Dials with Hover Breakdowns & Tier Legend ───────────────── */}
        <section className="varna-grp-esg-grid grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
            {/* Header & Tier Legend Key */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-4 gap-3">
              <div>
                <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.14em] text-[#6E7781] dark:text-[#8C9DA8]">
                  GROUP ESG PILLAR AVERAGES
                </h3>
                <p className="text-[11px] text-[#6E7781] dark:text-[#8C9DA8] font-light mt-0.5">
                  Hover or focus any gauge to reveal its detailed sub-criteria breakdown
                </p>
              </div>

              {/* Defined Color-to-Tier Legend Key */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#556B55]" />
                  <span className="text-[#1A1F26] dark:text-[#FAF8F5] font-medium">Leader (80+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6F848F]" />
                  <span className="text-[#1A1F26] dark:text-[#FAF8F5] font-medium">Advanced (70–79)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A89C82]" />
                  <span className="text-[#1A1F26] dark:text-[#FAF8F5] font-medium">Emerging (50–69)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B85333]" />
                  <span className="text-[#1A1F26] dark:text-[#FAF8F5] font-medium">Foundational (&lt;50)</span>
                </div>
              </div>
            </div>

            <div className="varna-grp-esg-dials grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 text-center">
              <PillarBreakdownHoverCard
                pillarLabel="Environmental"
                pillarScore={summary.avgE}
                pillarKey="E"
                color="#556B55"
                scores={summary.subCriteria}
              >
                <div className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group/gauge">
                  <RadialGauge value={summary.avgE} label="" pillarKey="E" size={95} strokeWidth={9} />
                  <span className="text-xs font-sans font-semibold text-[#556B55] dark:text-[#7B9B7B]">
                    Environmental (E1–E6)
                  </span>
                  <span className="text-[10px] bg-[#556B55]/10 text-[#556B55] dark:text-[#7B9B7B] px-2 py-0.5 rounded font-mono font-medium">
                    62.0 / Emerging
                  </span>
                </div>
              </PillarBreakdownHoverCard>

              <PillarBreakdownHoverCard
                pillarLabel="Social"
                pillarScore={summary.avgS}
                pillarKey="S"
                color="#B85333"
                scores={summary.subCriteria}
              >
                <div className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group/gauge">
                  <RadialGauge value={summary.avgS} label="" pillarKey="S" size={95} strokeWidth={9} />
                  <span className="text-xs font-sans font-semibold text-[#B85333] dark:text-[#D4705A]">
                    Social (S1–S4)
                  </span>
                  <span className="text-[10px] bg-[#B85333]/10 text-[#B85333] dark:text-[#D4705A] px-2 py-0.5 rounded font-mono font-medium">
                    58.0 / Emerging
                  </span>
                </div>
              </PillarBreakdownHoverCard>

              <PillarBreakdownHoverCard
                pillarLabel="Governance"
                pillarScore={summary.avgG}
                pillarKey="G"
                color="#2A3644"
                scores={summary.subCriteria}
              >
                <div className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group/gauge">
                  <RadialGauge value={summary.avgG} label="" pillarKey="G" size={95} strokeWidth={9} />
                  <span className="text-xs font-sans font-semibold text-[#2A3644] dark:text-[#96AAB4]">
                    Governance (G1–G3)
                  </span>
                  <span className="text-[10px] bg-[#6F848F]/15 text-[#6F848F] dark:text-[#96AAB4] px-2 py-0.5 rounded font-mono font-medium">
                    66.0 / Emerging
                  </span>
                </div>
              </PillarBreakdownHoverCard>

              <PillarBreakdownHoverCard
                pillarLabel="Cultural"
                pillarScore={summary.avgC || 59}
                pillarKey="C"
                color="#A89C82"
                scores={summary.subCriteria}
              >
                <div className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group/gauge">
                  <RadialGauge value={summary.avgC || 59} label="" pillarKey="C" size={95} strokeWidth={9} />
                  <span className="text-xs font-sans font-semibold text-[#A89C82] dark:text-[#C5A059]">
                    Cultural (C1–C3)
                  </span>
                  <span className="text-[10px] bg-[#A89C82]/15 text-[#A89C82] dark:text-[#C5A059] px-2 py-0.5 rounded font-mono font-medium">
                    59.0 / Emerging
                  </span>
                </div>
              </PillarBreakdownHoverCard>
            </div>

            <div className="text-[10px] text-[#6E7781] dark:text-[#8C9DA8] text-center border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 pt-3 font-mono">
              Weighted composite score calculated across all active partner relationships and verified audit documents
            </div>
          </div>
        </section>

        {/* ── Hotel Leaderboard & Key Insights Panel ──────────────────── */}
        <section className="varna-grp-leaderboard-section grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-sans font-semibold uppercase tracking-[0.14em] text-[#1A1F26] dark:text-[#FAF8F5]">
                  HOTEL-LEVEL LEADERBOARD
                </h3>
                <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] font-light">
                  Property performance, procurement spend, carbon footprint, and Varna ESG pillar scores (click header to sort)
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#6E7781] dark:text-[#8C9DA8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter property or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 pl-9 pr-3 py-1.5 text-xs text-[#1A1F26] dark:text-[#FAF8F5] placeholder-[#6E7781]/60 rounded-lg focus:outline-none focus:border-[#B85333] transition-colors"
                />
              </div>
            </div>

            <LeaderboardTable hotels={filteredHotels} groupAvgScore={summary.avgVarnaScore} />
          </div>

          {/* KEY INSIGHTS PANEL WITH LEFT-ACCENT SEVERITY BARS */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-5 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between h-full space-y-4 font-sans">
              <div className="border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3">
                <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.14em] text-[#6E7781] dark:text-[#8C9DA8]">
                  PORTFOLIO INTELLIGENCE &amp; ALERTS
                </h3>
              </div>

              <div className="space-y-3">
                {/* SUCCESS SEVERITY CARD: Left Accent Green */}
                <div className="p-3.5 rounded-r-xl bg-[#556B55]/10 border border-[#556B55]/20 border-l-4 border-l-[#556B55] flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-[#556B55]/20 text-[#556B55] dark:text-[#738678] shrink-0 mt-0.5">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                      {summary.hotelsAboveGroupAvg} Properties Exceed Average
                    </div>
                    <p className="text-[11px] text-[#6E7781] dark:text-[#8C9DA8] mt-0.5 font-light">
                      Outperforming portfolio average score of <span className="font-mono text-[#556B55] dark:text-[#738678] font-semibold">{summary.avgVarnaScore}</span>
                    </p>
                  </div>
                </div>

                {/* WARNING SEVERITY CARD: Left Accent Orange */}
                <div className="p-3.5 rounded-r-xl bg-[#B85333]/10 border border-[#B85333]/20 border-l-4 border-l-[#B85333] flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-[#B85333]/20 text-[#B85333] dark:text-[#D4705A] shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                      {summary.hotelsNeedingSupport} Properties Need Support
                    </div>
                    <p className="text-[11px] text-[#6E7781] dark:text-[#8C9DA8] mt-0.5 font-light">
                      Targeted intervention required <span className="font-mono text-[#B85333] font-semibold">(Varna score &lt; 50)</span>
                    </p>
                  </div>
                </div>

                {/* CRITICAL SEVERITY CARD: Left Accent Deep Clay */}
                <div className="p-3.5 rounded-r-xl bg-[#7A3F1E]/10 border border-[#7A3F1E]/20 border-l-4 border-l-[#7A3F1E] flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-[#7A3F1E]/20 text-[#7A3F1E] dark:text-[#C47547] shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                      {formatLakhs(summary.spendAtRisk)} ({summary.spendAtRiskPct}%) Spend at Risk
                    </div>
                    <p className="text-[11px] text-[#6E7781] dark:text-[#8C9DA8] mt-0.5 font-light">
                      Procurement mapped to Foundational &amp; unverified suppliers
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 text-[10px] font-mono text-[#6E7781] dark:text-[#8C9DA8] flex items-center justify-between">
                <span>Varna Automated Engine</span>
                <span className="flex items-center gap-1 text-[#556B55]">
                  <CheckCircle2 className="w-3 h-3" /> Updated Today
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Spend & Tier Distributions + Editorial Quote Card ──────────────────────────────────── */}
        <section className="varna-grp-charts-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SPEND BY SUPPLIER BAND DONUT CHART */}
          <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
            <div className="border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.14em] text-[#6E7781] dark:text-[#8C9DA8]">
                GROUP SPEND BY SUPPLIER BAND
              </h3>
            </div>

            <div className="h-52 w-full relative py-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendByBand}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="spend"
                    nameKey="band"
                  >
                    {spendByBand.map((entry: SupplierBandSpend, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: any) => [formatLakhs(Number(val)), "Spend"]}
                    contentStyle={{
                      backgroundColor: "#1E2028",
                      borderColor: "rgba(140, 157, 168, 0.2)",
                      color: "#FAF8F5",
                      fontSize: "12px",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                  {formatLakhs(summary.totalSpend)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#6E7781] dark:text-[#8C9DA8]">
                  Total Spend
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 text-xs font-sans">
              {spendByBand.map((b: SupplierBandSpend) => (
                <div key={b.band} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                    <span className="text-[#6E7781] dark:text-[#8C9DA8]">{b.band}</span>
                  </div>
                  <span className="font-mono text-[#1A1F26] dark:text-[#FAF8F5] font-semibold">
                    {b.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SUPPLIER TIER DISTRIBUTION BAR CHART */}
          <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
            <div className="border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.14em] text-[#6E7781] dark:text-[#8C9DA8]">
                PARTNER TIER DISTRIBUTION
              </h3>
            </div>

            <div className="h-52 w-full py-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierDistribution} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="tier"
                    stroke="#6E7781"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(140, 157, 168, 0.2)" }}
                  />
                  <YAxis
                    stroke="#6E7781"
                    fontSize={11}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(140, 157, 168, 0.2)" }}
                  />
                  <RechartsTooltip
                    formatter={(val: any) => [`${val} suppliers`, "Count"]}
                    contentStyle={{
                      backgroundColor: "#1E2028",
                      borderColor: "rgba(140, 157, 168, 0.2)",
                      color: "#FAF8F5",
                      fontSize: "12px",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {tierDistribution.map((entry: SupplierTierCount, index: number) => (
                      <Cell key={`bar-tier-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 flex items-center justify-between text-[10px] font-mono text-[#6E7781] dark:text-[#8C9DA8]">
              <span>Micro A (9)</span>
              <span>Micro B (6)</span>
              <span>Small (5)</span>
              <span>Medium (3)</span>
            </div>
          </div>

          {/* EDITORIAL MAGAZINE PULL-QUOTE CARD */}
          <div className="bg-gradient-to-br from-[#FAF8F5] via-[#F4EFEA] to-[#EAE5DC] dark:from-[#1E2028] dark:via-[#191B22] dark:to-[#121316] border border-[#EAE5DC] dark:border-[#8C9DA8]/25 rounded-xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden group">
            <Quote className="w-16 h-16 text-[#B85333]/15 dark:text-[#B85333]/25 absolute -top-3 -left-3 pointer-events-none rotate-12" />

            <div className="space-y-4 relative z-10 pt-4">
              <div className="text-[10px] uppercase font-sans font-bold tracking-[0.22em] text-[#B85333] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#B85333]" />
                <span>SUSTAINABLE LUXURY VISION</span>
              </div>
              <blockquote className="font-serif text-2xl lg:text-3xl text-[#1A1F26] dark:text-[#FAF8F5] leading-snug font-normal italic tracking-tight">
                &ldquo;Responsible hospitality creates stronger places and enduring cultural heritage.&rdquo;
              </blockquote>
            </div>

            <div className="pt-6 relative z-10 border-t border-[#1A1F26]/15 dark:border-white/15 flex items-center justify-between font-sans">
              <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#1A1F26] dark:text-[#FAF8F5]">
                VARNA COLLECTIVE
              </span>
              <span className="text-[10px] font-mono text-[#6E7781] dark:text-[#8C9DA8]">
                GRP-001 Portfolio
              </span>
            </div>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#B85333]/10 dark:bg-[#B85333]/15 blur-2xl pointer-events-none" />
          </div>
        </section>
      </div>
    </div>
  );
}
