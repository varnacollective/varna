"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  ArrowUpRight,
  Sun,
  Moon,
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

import GroupSidebar from "@/components/GroupSidebar";
import LeaderboardTable from "@/components/Group/LeaderboardTable";
import RadialGauge from "@/components/ui/RadialGauge";
import { type FullGroupDashboardData, type HotelLeaderboardItem } from "./page";

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
      activeSuppliers: 3,
      varnaLeaders: 0,
    },
    {
      clientId: "PROP-007",
      clientName: "Meridian Business Tower",
      propertyType: "Business Hotel",
      city: "Mumbai",
      country: "India",
      varnaScore: 45.3,
      eScore: 46,
      sScore: 43,
      gScore: 47,
      cScore: 45,
      totalSpend: 150000,
      totalOrders: 15,
      totalUnits: 390,
      co2eKg: 3900,
      co2eAvoidedKg: 900,
      co2ReductionPct: 18.7,
      carKmAvoided: 3690,
      treesEquivalent: 41,
      activeSuppliers: 3,
      varnaLeaders: 0,
    },
    {
      clientId: "PROP-008",
      clientName: "Meridian Riverside Lodge",
      propertyType: "Lodge",
      city: "Rishikesh",
      country: "India",
      varnaScore: 39.3,
      eScore: 41,
      sScore: 37,
      gScore: 40,
      cScore: 39,
      totalSpend: 130000,
      totalOrders: 12,
      totalUnits: 320,
      co2eKg: 3200,
      co2eAvoidedKg: 800,
      co2ReductionPct: 20.0,
      carKmAvoided: 3280,
      treesEquivalent: 36,
      activeSuppliers: 2,
      varnaLeaders: 0,
    },
  ],
  spendByBand: [
    { band: "Varna Leader", spend: 505400, percentage: 26.6, color: "#556B55" },
    { band: "Advanced", spend: 856900, percentage: 45.1, color: "#6F848F" },
    { band: "Emerging", spend: 163400, percentage: 8.6, color: "#A89C82" },
    { band: "Foundational", spend: 317300, percentage: 16.7, color: "#B85333" },
    { band: "Not Ready", spend: 57000, percentage: 3.0, color: "#7A3F1E" },
  ],
  tierDistribution: [
    { tier: "Micro A", count: 9, color: "#A89C82" },
    { tier: "Micro B", count: 6, color: "#556B55" },
    { tier: "Small", count: 5, color: "#6F848F" },
    { tier: "Medium", count: 3, color: "#B85333" },
  ],
  uniqueSuppliersCount: 23,
};

export default function GroupDashboardClient({ initialData }: GroupDashboardClientProps) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("Aug 2026");
  const [searchTerm, setSearchTerm] = useState("");

  const data = initialData && initialData.hotels.length >= 4 ? initialData : DEFAULT_GROUP_DATA;
  const { summary, hotels, spendByBand, tierDistribution } = data;

  const filteredHotels = hotels.filter((h) => {
    const q = searchTerm.toLowerCase();
    return (
      h.clientName.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.propertyType.toLowerCase().includes(q)
    );
  });

  const formatLakhs = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}k`;
  };

  const formatNum = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  // Sub-criteria definitions with colors
  const subCriteria = [
    // Environmental
    { key: "E1", score: summary.subCriteria.e1 || 68, pillar: "Environmental", color: "#556B55" },
    { key: "E2", score: summary.subCriteria.e2 || 56, pillar: "Environmental", color: "#556B55" },
    { key: "E3", score: summary.subCriteria.e3 || 61, pillar: "Environmental", color: "#556B55" },
    { key: "E4", score: summary.subCriteria.e4 || 65, pillar: "Environmental", color: "#556B55" },
    { key: "E5", score: summary.subCriteria.e5 || 60, pillar: "Environmental", color: "#556B55" },
    { key: "E6", score: summary.subCriteria.e6 || 62, pillar: "Environmental", color: "#556B55" },
    // Social
    { key: "S1", score: summary.subCriteria.s1 || 64, pillar: "Social", color: "#B85333" },
    { key: "S2", score: summary.subCriteria.s2 || 59, pillar: "Social", color: "#B85333" },
    { key: "S3", score: summary.subCriteria.s3 || 54, pillar: "Social", color: "#B85333" },
    { key: "S4", score: summary.subCriteria.s4 || 57, pillar: "Social", color: "#B85333" },
    // Governance
    { key: "G1", score: summary.subCriteria.g1 || 69, pillar: "Governance", color: "#2A3644" },
    { key: "G2", score: summary.subCriteria.g2 || 63, pillar: "Governance", color: "#2A3644" },
    { key: "G3", score: summary.subCriteria.g3 || 58, pillar: "Governance", color: "#2A3644" },
    // Cultural
    { key: "C1", score: 62, pillar: "Cultural", color: "#A89C82" },
    { key: "C2", score: 55, pillar: "Cultural", color: "#A89C82" },
    { key: "C3", score: 61, pillar: "Cultural", color: "#A89C82" },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#121316] text-[#1A1F26] dark:text-[#FAF8F5] transition-colors duration-300 font-sans">
      {/* ── 1. Vertical Sidebar ─────────────────────────────────────────────── */}
      <GroupSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        groupName={summary.parentGroup}
      />

      {/* ── Main Content Area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="px-8 pt-8 pb-4 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15">
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-sans font-semibold tracking-[0.2em] text-[#6E7781] dark:text-[#8C9DA8]">
              GROUP SUSTAINABILITY DASHBOARD
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-4xl text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight font-normal leading-tight">
              A more responsible hospitality, together.
            </h1>
            <p className="text-xs font-sans text-[#6E7781] dark:text-[#8C9DA8] flex items-center gap-2 pt-0.5">
              <span>{summary.noProperties} properties</span>
              <span>&bull;</span>
              <span>A shared commitment</span>
              <span>&bull;</span>
              <span>Real impact</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#6E7781] dark:text-[#8C9DA8] hover:text-[#1A1F26] dark:hover:text-[#FAF8F5] transition-all shadow-xs"
                title="Toggle Light/Dark Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-[#C5A059]" /> : <Moon className="w-4 h-4 text-[#1A1F26]" />}
              </button>

              {/* Date Filter Dropdown */}
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

            {/* Editorial Luxury Header Tagline */}
            <div className="text-right hidden sm:block">
              <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#6E7781] dark:text-[#8C9DA8] block">
                PEOPLE &bull; PLACES &bull; A BRIGHTER TOMORROW
              </span>
              <span className="text-[11px] font-display italic text-[#6E7781] dark:text-[#8C9DA8]">
                Responsible choices deliver lasting value.
              </span>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* ── 2. Top Executive KPI Strip ────────────────────────────────────── */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* KPI 1: Group Avg Varna Score */}
            <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-3.5 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
                <Award className="w-3.5 h-3.5 text-[#B85333]" />
                <span className="truncate">Group Avg Score</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl lg:text-3xl font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                  {summary.avgVarnaScore.toFixed(1)}
                </span>
                <span className="text-[10px] text-[#556B55] font-semibold">/100</span>
              </div>
            </div>

            {/* KPI 2: Number of Properties */}
            <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-3.5 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
                <Building2 className="w-3.5 h-3.5 text-[#556B55]" />
                <span className="truncate">Properties</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl lg:text-3xl font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                  {summary.noProperties}
                </span>
              </div>
            </div>

            {/* KPI 3: Active Suppliers */}
            <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-3.5 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
                <Users className="w-3.5 h-3.5 text-[#B85333]" />
                <span className="truncate">Active Suppliers</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl lg:text-3xl font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                  {summary.noActiveSupplierRelationships}
                </span>
              </div>
            </div>

            {/* KPI 4: Total Spend */}
            <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-3.5 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
                <Coins className="w-3.5 h-3.5 text-[#6F848F]" />
                <span className="truncate">Total Spend</span>
              </div>
              <div className="mt-2">
                <span className="text-xl lg:text-2xl font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                  {formatLakhs(summary.totalSpend)}
                </span>
              </div>
            </div>

            {/* KPI 5: Total CO2e */}
            <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-3.5 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
                <Leaf className="w-3.5 h-3.5 text-[#556B55]" />
                <span className="truncate">Total CO₂e</span>
              </div>
              <div className="mt-2">
                <span className="text-lg lg:text-xl font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                  {formatNum(summary.totalCo2eKg)} <span className="text-[10px] font-normal text-[#6E7781]">kg</span>
                </span>
              </div>
            </div>

            {/* KPI 6: CO2e Avoided */}
            <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-3.5 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#556B55]" />
                <span className="truncate">CO₂e Avoided</span>
              </div>
              <div className="mt-2">
                <span className="text-lg lg:text-xl font-sans font-bold text-[#556B55] dark:text-[#7B9B7B]">
                  {formatNum(summary.totalCo2eAvoidedKg)} <span className="text-[10px] font-normal">kg</span>
                </span>
              </div>
            </div>

            {/* KPI 7: Equivalents (Car Km & Trees) */}
            <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-3.5 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] uppercase font-sans font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
                <div className="flex items-center gap-1">
                  <Car className="w-3 h-3 text-[#6F848F]" />
                  <Trees className="w-3 h-3 text-[#556B55]" />
                </div>
                <span>Equivalents</span>
              </div>
              <div className="mt-1 space-y-0.5 text-xs font-mono">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#6E7781] dark:text-[#8C9DA8]">Car Km:</span>
                  <span className="font-bold text-[#1A1F26] dark:text-[#FAF8F5]">{formatNum(summary.carKmAvoided)} km</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#6E7781] dark:text-[#8C9DA8]">Trees:</span>
                  <span className="font-bold text-[#556B55] dark:text-[#7B9B7B]">{formatNum(summary.treesEquivalent)} trees</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. ESG Pillar Dials & Sub-Criteria Micro-Charts ───────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pillar Dials Card (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3">
                <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.14em] text-[#6E7781] dark:text-[#8C9DA8]">
                  GROUP ESG PILLAR AVERAGES
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 text-center">
                {/* Environmental Dial */}
                <div className="flex flex-col items-center space-y-2">
                  <RadialGauge value={summary.avgE} label="" pillarKey="E" size={85} strokeWidth={8} />
                  <span className="text-xs font-sans font-semibold text-[#556B55] dark:text-[#7B9B7B]">
                    Environmental
                  </span>
                </div>

                {/* Social Dial */}
                <div className="flex flex-col items-center space-y-2">
                  <RadialGauge value={summary.avgS} label="" pillarKey="S" size={85} strokeWidth={8} />
                  <span className="text-xs font-sans font-semibold text-[#B85333] dark:text-[#D4705A]">
                    Social
                  </span>
                </div>

                {/* Governance Dial */}
                <div className="flex flex-col items-center space-y-2">
                  <RadialGauge value={summary.avgG} label="" pillarKey="G" size={85} strokeWidth={8} />
                  <span className="text-xs font-sans font-semibold text-[#2A3644] dark:text-[#96AAB4]">
                    Governance
                  </span>
                </div>

                {/* Cultural Dial */}
                <div className="flex flex-col items-center space-y-2">
                  <RadialGauge value={summary.avgC || 59} label="" pillarKey="C" size={85} strokeWidth={8} />
                  <span className="text-xs font-sans font-semibold text-[#A89C82] dark:text-[#C5A059]">
                    Cultural
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-[#6E7781] dark:text-[#8C9DA8] text-center border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 pt-3">
                Weighted composite score across all active supplier relationships
              </div>
            </div>

            {/* Sub-Criteria Micro-Bar Chart (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3">
                <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.14em] text-[#6E7781] dark:text-[#8C9DA8]">
                  SUB-CRITERIA BREAKDOWN (GROUP AVERAGE)
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-sans">
                  <span className="text-[#556B55] font-semibold">&bull; Environmental</span>
                  <span className="text-[#B85333] font-semibold">&bull; Social</span>
                  <span className="text-[#2A3644] dark:text-[#96AAB4] font-semibold">&bull; Governance</span>
                  <span className="text-[#A89C82] font-semibold">&bull; Cultural</span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="py-4">
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subCriteria} margin={{ top: 15, right: 5, left: -25, bottom: 0 }}>
                      <XAxis
                        dataKey="key"
                        stroke="#6E7781"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(140, 157, 168, 0.2)" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="#6E7781"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(140, 157, 168, 0.2)" }}
                      />
                      <RechartsTooltip
                        formatter={(val: any) => [`${val} / 100`, "Group Average"]}
                        contentStyle={{
                          backgroundColor: "#1E2028",
                          borderColor: "rgba(140, 157, 168, 0.2)",
                          color: "#FAF8F5",
                          fontSize: "12px",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                        {subCriteria.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-4 text-center text-[10px] text-[#6E7781] dark:text-[#8C9DA8] pt-2 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15">
                <span>E1–E6 Carbon &amp; Water</span>
                <span>S1–S4 Wages &amp; Inclusion</span>
                <span>G1–G3 Compliance &amp; Ethics</span>
                <span>C1–C3 Authenticity &amp; Heritage</span>
              </div>
            </div>
          </section>

          {/* ── 4 & 5. Hotel Leaderboard & Key Insights Panel ──────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Hotel Leaderboard Table (9 cols) */}
            <div className="lg:col-span-9 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-sans font-semibold uppercase tracking-[0.14em] text-[#1A1F26] dark:text-[#FAF8F5]">
                    HOTEL-LEVEL LEADERBOARD
                  </h3>
                  <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8]">
                    Property-level performance across procurement spend, carbon footprint, and Varna ESG pillars
                  </p>
                </div>

                {/* Table Filter Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#6E7781] dark:text-[#8C9DA8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter property or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 pl-9 pr-3 py-1.5 text-xs text-[#1A1F26] dark:text-[#FAF8F5] placeholder-[#6E7781]/60 rounded-lg focus:outline-none focus:border-[#B85333]"
                  />
                </div>
              </div>

              <LeaderboardTable hotels={filteredHotels} groupAvgScore={summary.avgVarnaScore} />
            </div>

            {/* Dynamic Key Insights Panel (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-5 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between h-full space-y-5">
                <div className="border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3">
                  <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.14em] text-[#6E7781] dark:text-[#8C9DA8]">
                    KEY INSIGHTS
                  </h3>
                </div>

                <div className="space-y-4 flex-1">
                  {/* Insight 1: Trophy Icon */}
                  <div className="p-4 rounded-xl bg-[#556B55]/10 border border-[#556B55]/20 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#556B55]/20 text-[#556B55] dark:text-[#7B9B7B] shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                        {summary.hotelsAboveGroupAvg} hotels
                      </div>
                      <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] mt-0.5">
                        above group average score ({summary.avgVarnaScore})
                      </p>
                    </div>
                  </div>

                  {/* Insight 2: Warning Icon (Orange/Red) */}
                  <div className="p-4 rounded-xl bg-[#B85333]/10 border border-[#B85333]/20 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#B85333]/20 text-[#B85333] dark:text-[#D4705A] shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                        {summary.hotelsNeedingSupport} hotels
                      </div>
                      <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] mt-0.5">
                        need focused support <span className="font-mono text-[#B85333]">(Varna score &lt; 50)</span>
                      </p>
                    </div>
                  </div>

                  {/* Insight 3: Spend at Risk */}
                  <div className="p-4 rounded-xl bg-[#7A3F1E]/10 border border-[#7A3F1E]/20 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#7A3F1E]/20 text-[#7A3F1E] dark:text-[#C47547] shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                        {formatLakhs(summary.spendAtRisk)} ({summary.spendAtRiskPct}%)
                      </div>
                      <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] mt-0.5">
                        spend at risk with Foundational / Not Ready suppliers
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 text-[10px] text-[#6E7781] dark:text-[#8C9DA8]">
                  Automated intelligence computed from portfolio spend ledger
                </div>
              </div>
            </div>
          </section>

          {/* ── 6. Spend & Tier Distributions ──────────────────────────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Group Spend by Supplier Band */}
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
                      {spendByBand.map((entry, index) => (
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
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-sans font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                    {formatLakhs(summary.totalSpend)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#6E7781] dark:text-[#8C9DA8]">
                    Total Spend
                  </span>
                </div>
              </div>

              {/* Band Legend */}
              <div className="space-y-1.5 pt-3 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 text-xs">
                {spendByBand.map((b) => (
                  <div key={b.band} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-[#6E7781] dark:text-[#8C9DA8] font-sans">{b.band}</span>
                    </div>
                    <span className="font-mono text-[#1A1F26] dark:text-[#FAF8F5] font-medium">
                      {b.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Tier Distribution */}
            <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
              <div className="border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3 flex items-center justify-between">
                <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.14em] text-[#6E7781] dark:text-[#8C9DA8]">
                  SUPPLIER TIER DISTRIBUTION
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
                      {tierDistribution.map((entry, index) => (
                        <Cell key={`bar-tier-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-3 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 flex items-center justify-between text-[10px] text-[#6E7781] dark:text-[#8C9DA8]">
                <span>Micro A (9)</span>
                <span>Micro B (6)</span>
                <span>Small (5)</span>
                <span>Medium (3)</span>
              </div>
            </div>

            {/* Editorial Luxury Quote & Branding Banner */}
            <div className="bg-gradient-to-br from-[#FAF8F5] to-[#EAE5DC] dark:from-[#1E2028] dark:to-[#18191D] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-4 relative z-10">
                <div className="text-[10px] uppercase font-sans font-semibold tracking-[0.2em] text-[#B85333]">
                  SUSTAINABLE LUXURY VISION
                </div>
                <blockquote className="font-display text-2xl lg:text-3xl text-[#1A1F26] dark:text-[#FAF8F5] leading-snug font-normal italic">
                  &ldquo;Responsible hospitality creates stronger places.&rdquo;
                </blockquote>
              </div>

              <div className="pt-6 relative z-10 border-t border-[#1A1F26]/10 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-sans uppercase font-bold tracking-[0.2em] text-[#1A1F26] dark:text-[#FAF8F5]">
                  VARNA COLLECTIVE
                </span>
                <span className="text-[10px] font-sans text-[#6E7781] dark:text-[#8C9DA8]">
                  GRP-001 Portfolio
                </span>
              </div>

              {/* Decorative Subtle Ambient Mesh Overlay */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#B85333]/5 dark:bg-[#B85333]/10 blur-2xl pointer-events-none" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
