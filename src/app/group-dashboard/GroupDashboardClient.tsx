"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  DollarSign,
  Leaf,
  ShieldCheck,
  Award,
  AlertTriangle,
  TrendingUp,
  Search,
  Calendar,
  LogOut,
  ChevronDown,
  Info,
  Car,
  Trees,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
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
  Legend as RechartsLegend,
} from "recharts";

import BrandLogo from "@/components/ui/BrandLogo";
import RadialGauge from "@/components/ui/RadialGauge";
import KPICard from "@/components/dashboard/KPICard";
import GlassCard from "@/components/ui/GlassCard";
import Card from "@/components/ui/Card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { type FullGroupDashboardData, type HotelLeaderboardItem } from "./page";

interface GroupDashboardClientProps {
  initialData: FullGroupDashboardData;
}

export default function GroupDashboardClient({ initialData }: GroupDashboardClientProps) {
  const router = RouterHook();
  const { summary, hotels, spendByBand, tierDistribution, uniqueSuppliersCount } = initialData;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("Jan–Jun 2026");
  const [sortField, setSortField] = useState<keyof HotelLeaderboardItem>("varnaScore");
  const [sortAsc, setSortAsc] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  // Filter & Sort hotels
  const filteredHotels = hotels
    .filter((h) => {
      const q = searchTerm.toLowerCase();
      return (
        h.clientName.toLowerCase().includes(q) ||
        h.clientId.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.country.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const valA = a[sortField] ?? 0;
      const valB = b[sortField] ?? 0;
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

  const handleSort = (field: keyof HotelLeaderboardItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Formatting helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  // Sub-criteria definitions for bar rendering
  const subCriteriaConfig = {
    E: [
      { key: "e1", label: "E1 Carbon Impact", score: summary.subCriteria.e1, weight: "20%" },
      { key: "e2", label: "E2 Material Sustainability", score: summary.subCriteria.e2, weight: "20%" },
      { key: "e3", label: "E3 Circularity", score: summary.subCriteria.e3, weight: "15%" },
      { key: "e4", label: "E4 Water Management", score: summary.subCriteria.e4, weight: "15%" },
      { key: "e5", label: "E5 Pollution Control", score: summary.subCriteria.e5, weight: "15%" },
      { key: "e6", label: "E6 Sustainable Packaging", score: summary.subCriteria.e6, weight: "15%" },
    ],
    S: [
      { key: "s1", label: "S1 Livelihood Impact", score: summary.subCriteria.s1, weight: "30%" },
      { key: "s2", label: "S2 Gender Inclusion", score: summary.subCriteria.s2, weight: "25%" },
      { key: "s3", label: "S3 Fair Wages & Safety", score: summary.subCriteria.s3, weight: "25%" },
      { key: "s4", label: "S4 Health & Wellbeing", score: summary.subCriteria.s4, weight: "20%" },
    ],
    G: [
      { key: "g1", label: "G1 Legal Compliance", score: summary.subCriteria.g1, weight: "40%" },
      { key: "g2", label: "G2 Business Ethics", score: summary.subCriteria.g2, weight: "35%" },
      { key: "g3", label: "G3 Responsible Sourcing", score: summary.subCriteria.g3, weight: "25%" },
    ],
  };

  return (
    <div className="min-h-screen bg-[#18191D] text-[#FAF6EE] font-sans selection:bg-[#7A3F1E] selection:text-[#D8CFB8] pb-16">
      {/* ── Global Header Navigation ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#18191D]/90 backdrop-blur-md border-b border-[#8C9DA8]/15 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <BrandLogo name="Varna Collective" size="sm" />

          <div className="h-5 w-[1px] bg-[#8C9DA8]/20 hidden sm:block" />

          {/* Group Logo Chip */}
          <div className="flex items-center gap-2.5 bg-[#22252B] border border-[#8C9DA8]/20 px-3 py-1.5 rounded-full shadow-xs">
            <div className="w-5 h-5 rounded-full bg-[#944D25]/20 border border-[#944D25]/40 flex items-center justify-center text-[#944D25] text-xs font-sans font-bold">
              M
            </div>
            <span className="text-xs font-sans tracking-tight font-medium text-[#FAF6EE]">
              {summary.parentGroup}
            </span>
            <span className="text-[9px] uppercase font-sans font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#738678]/20 text-[#829888] border border-[#738678]/30">
              Group Portfolio
            </span>
          </div>
        </div>

        {/* Right Actions: Period Selector & Logout */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:flex items-center gap-2 bg-[#22252B] border border-[#8C9DA8]/20 px-3 py-1.5 text-xs text-[#8C9DA8]">
            <Calendar className="w-3.5 h-3.5 text-[#944D25]" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-[#FAF6EE] focus:outline-none cursor-pointer text-xs font-medium"
            >
              <option value="Jan–Jun 2026" className="bg-[#22252B] text-[#FAF6EE]">
                Reporting Period: Jan – Jun 2026
              </option>
              <option value="Full Year 2025" className="bg-[#22252B] text-[#FAF6EE]">
                Reporting Period: Full Year 2025
              </option>
            </select>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#22252B] hover:bg-[#2F3C52] text-[#8C9DA8] hover:text-[#FAF6EE] px-3.5 py-1.5 border border-[#8C9DA8]/20 transition-all text-xs font-sans font-medium"
            title="Sign out of group account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Page Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-10">
        {/* ── SECTION 1: Header Banner & Top-Level KPI Cards ──────────────── */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#8C9DA8]/15 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C9DA8] mb-1">
                <span>Multi-Property Group Dashboard</span>
                <span>&bull;</span>
                <span className="text-[#944D25]">Account GRP-001</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-sans font-medium text-[#FAF6EE] tracking-tight">
                {summary.parentGroup}
              </h1>
              <p className="text-xs text-[#8C9DA8] font-light mt-1 max-w-2xl">
                Aggregated ESG compliance, supplier sustainability performance, and climate impact metrics across all {summary.noProperties} properties.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-[#22252B] border border-[#8C9DA8]/20 px-3.5 py-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#944D25]" />
                <span className="text-xs text-[#8C9DA8]">Properties:</span>
                <span className="text-xs font-semibold text-[#FAF6EE]">{summary.noProperties} Managed</span>
              </div>
              <div className="bg-[#22252B] border border-[#8C9DA8]/20 px-3.5 py-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#829888]" />
                <span className="text-xs text-[#8C9DA8]">Relationships:</span>
                <span className="text-xs font-semibold text-[#FAF6EE]">{summary.noActiveSupplierRelationships} Active</span>
              </div>
            </div>
          </div>

          {/* Top-Level KPI Grid (7 Metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Group Avg Varna Score"
              value={summary.avgVarnaScore}
              decimals={1}
              icon={Award}
              accentColor="deep-clay"
              subtitle="Composite ESG index across 23 supplier relationships"
              varnaScoreData={{
                score: summary.avgVarnaScore,
                eScore: summary.avgE,
                sScore: summary.avgS,
                gScore: summary.avgG,
                cScore: 0,
              }}
            />

            <KPICard
              title="Total Group Spend"
              value={summary.totalSpend}
              prefix="₹"
              decimals={0}
              icon={DollarSign}
              accentColor="slate-mist"
              subtitle={`Across ${uniqueSuppliersCount} unique enterprise suppliers`}
            />

            <KPICard
              title="Total CO2e Emissions"
              value={summary.totalCo2eKg}
              suffix=" kg"
              decimals={0}
              icon={Leaf}
              accentColor="none"
              subtitle="Scope 3 procurement carbon footprint"
            />

            <KPICard
              title="CO2e Avoided"
              value={summary.totalCo2eAvoidedKg}
              suffix=" kg"
              decimals={1}
              icon={ShieldCheck}
              accentColor="sage-mineral"
              subtitle="Avoided relative to standard benchmarks"
            />
          </div>

          {/* Secondary KPI Strip (Car Km & Trees Equivalent) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="bg-[#22252B] border border-[#8C9DA8]/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#829888]/15 border border-[#829888]/30 flex items-center justify-center text-[#829888]">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-[#8C9DA8]">
                    Car Kilometers Avoided
                  </p>
                  <p className="text-2xl font-sans text-[#FAF6EE] font-medium">
                    {formatNumber(summary.carKmAvoided)} <span className="text-xs font-sans text-[#8C9DA8]">km</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[#829888] font-mono bg-[#829888]/10 px-2 py-1 border border-[#829888]/20">
                Transport Offset
              </span>
            </div>

            <div className="bg-[#22252B] border border-[#8C9DA8]/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#738678]/15 border border-[#738678]/30 flex items-center justify-center text-[#829888]">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-[#8C9DA8]">
                    Trees Equivalent
                  </p>
                  <p className="text-2xl font-sans text-[#FAF6EE] font-medium">
                    {formatNumber(summary.treesEquivalent)} <span className="text-xs font-sans text-[#8C9DA8]">trees</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[#829888] font-mono bg-[#738678]/10 px-2 py-1 border border-[#738678]/20">
                Annual Sequestration
              </span>
            </div>

            <div className="bg-[#22252B] border border-[#8C9DA8]/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#944D25]/15 border border-[#944D25]/30 flex items-center justify-center text-[#944D25]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-[#8C9DA8]">
                    CO2 Reduction Ratio
                  </p>
                  <p className="text-2xl font-sans text-[#FAF6EE] font-medium">
                    {((summary.totalCo2eAvoidedKg / (summary.totalCo2eKg + summary.totalCo2eAvoidedKg)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[#944D25] font-mono bg-[#944D25]/10 px-2 py-1 border border-[#944D25]/20">
                Carbon Efficiency
              </span>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: Group ESG Pillar Averages ────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#8C9DA8]/15 pb-3">
            <div>
              <h2 className="text-xl font-sans font-medium text-[#FAF6EE] tracking-tight">
                Group ESG Pillar Averages & Sub-Criteria Breakdowns
              </h2>
              <p className="text-xs text-[#8C9DA8]">
                Averaged across all 23 supplier relationships across the group portfolio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Environmental Gauge + Bars */}
            <GlassCard className="p-5 flex flex-col justify-between space-y-4" hoverEffect={false}>
              <div className="flex items-center justify-between border-b border-[#8C9DA8]/15 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#829888]">
                  Environmental Pillar
                </span>
                <span className="text-xs font-sans font-medium text-[#FAF6EE] bg-[#829888]/20 px-2 py-0.5 border border-[#829888]/30">
                  {summary.avgE} / 100
                </span>
              </div>

              <div className="py-2">
                <RadialGauge value={summary.avgE} label="Avg E Score" pillarKey="E" size={130} />
              </div>

              {/* Sub-Criteria Bar Chart */}
              <div className="space-y-2 pt-2 border-t border-[#8C9DA8]/10">
                <p className="text-[9px] uppercase tracking-widest text-[#8C9DA8] font-semibold mb-2">
                  Environmental Sub-Criteria
                </p>
                {subCriteriaConfig.E.map((sub) => (
                  <div key={sub.key} className="space-y-0.5 text-xs">
                    <div className="flex justify-between text-[10px] text-[#8C9DA8]">
                      <span>{sub.label}</span>
                      <span className="font-mono text-[#FAF6EE]">{sub.score}</span>
                    </div>
                    <div className="w-full bg-[#18191D] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#738678] to-[#829888] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, sub.score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Social Gauge + Bars */}
            <GlassCard className="p-5 flex flex-col justify-between space-y-4" hoverEffect={false}>
              <div className="flex items-center justify-between border-b border-[#8C9DA8]/15 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#944D25]">
                  Social Pillar
                </span>
                <span className="text-xs font-sans font-medium text-[#FAF6EE] bg-[#944D25]/20 px-2 py-0.5 border border-[#944D25]/30">
                  {summary.avgS} / 100
                </span>
              </div>

              <div className="py-2">
                <RadialGauge value={summary.avgS} label="Avg S Score" pillarKey="S" size={130} />
              </div>

              {/* Sub-Criteria Bar Chart */}
              <div className="space-y-2.5 pt-2 border-t border-[#8C9DA8]/10">
                <p className="text-[9px] uppercase tracking-widest text-[#8C9DA8] font-semibold mb-2">
                  Social Sub-Criteria
                </p>
                {subCriteriaConfig.S.map((sub) => (
                  <div key={sub.key} className="space-y-0.5 text-xs">
                    <div className="flex justify-between text-[10px] text-[#8C9DA8]">
                      <span>{sub.label}</span>
                      <span className="font-mono text-[#FAF6EE]">{sub.score}</span>
                    </div>
                    <div className="w-full bg-[#18191D] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#944D25] to-[#C5774E] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, sub.score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Governance Gauge + Bars */}
            <GlassCard className="p-5 flex flex-col justify-between space-y-4" hoverEffect={false}>
              <div className="flex items-center justify-between border-b border-[#8C9DA8]/15 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8298A5]">
                  Governance Pillar
                </span>
                <span className="text-xs font-sans font-medium text-[#FAF6EE] bg-[#8298A5]/20 px-2 py-0.5 border border-[#8298A5]/30">
                  {summary.avgG} / 100
                </span>
              </div>

              <div className="py-2">
                <RadialGauge value={summary.avgG} label="Avg G Score" pillarKey="G" size={130} />
              </div>

              {/* Sub-Criteria Bar Chart */}
              <div className="space-y-3 pt-2 border-t border-[#8C9DA8]/10">
                <p className="text-[9px] uppercase tracking-widest text-[#8C9DA8] font-semibold mb-2">
                  Governance Sub-Criteria
                </p>
                {subCriteriaConfig.G.map((sub) => (
                  <div key={sub.key} className="space-y-0.5 text-xs">
                    <div className="flex justify-between text-[10px] text-[#8C9DA8]">
                      <span>{sub.label}</span>
                      <span className="font-mono text-[#FAF6EE]">{sub.score}</span>
                    </div>
                    <div className="w-full bg-[#18191D] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#6F848F] to-[#8298A5] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, sub.score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Cultural Gauge + N/A Sub-Criteria Note */}
            <GlassCard className="p-5 flex flex-col justify-between space-y-4 opacity-95" hoverEffect={false}>
              <div className="flex items-center justify-between border-b border-[#8C9DA8]/15 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8C9DA8]">
                  Cultural Pillar
                </span>
                <span className="text-xs font-mono text-[#8C9DA8] bg-[#8C9DA8]/10 px-2 py-0.5 border border-[#8C9DA8]/20">
                  N/A
                </span>
              </div>

              <div className="py-2 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full border border-dashed border-[#8C9DA8]/30 flex flex-col items-center justify-center p-2 bg-[#18191D]/50 mb-2">
                  <span className="text-xl font-sans font-medium text-[#8C9DA8]">N/A</span>
                  <span className="text-[9px] text-[#8C9DA8]/70 uppercase tracking-wider">Non-Craft Group</span>
                </div>
                <span className="text-[10px] uppercase font-semibold text-[#8C9DA8] tracking-widest mt-1">
                  Craft Scope Only
                </span>
              </div>

              <div className="pt-2 border-t border-[#8C9DA8]/10 space-y-2">
                <div className="flex items-start gap-1.5 text-[10px] text-[#8C9DA8] bg-[#18191D]/80 p-2.5 border border-[#8C9DA8]/15 leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-[#8C9DA8] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Framework Rule:</strong> Cultural sub-criteria (C1 Craft Authenticity, C2 Skill Rarity, C3 Climate Vulnerability) only apply to craft-led enterprises. All suppliers in this group are non-craft enterprises.
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ── SECTION 4 & 5 & 6: Key Insights, Group Spend & Tiers ────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Insights Panel */}
          <GlassCard className="p-6 space-y-5" hoverEffect={false}>
            <div className="flex items-center gap-2 border-b border-[#8C9DA8]/15 pb-3">
              <ShieldCheck className="w-4 h-4 text-[#944D25]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FAF6EE]">
                Key Group Portfolio Insights
              </h3>
            </div>

            <div className="space-y-4">
              {/* Insight 1: Hotels Above Group Avg */}
              <div className="bg-[#18191D]/90 border border-[#738678]/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#829888]" />
                    <span className="text-xs font-semibold text-[#FAF6EE]">
                      Hotels Above Group Avg ({summary.hotelsAboveGroupAvg})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#829888] bg-[#829888]/15 px-2 py-0.5">
                    &gt; {summary.avgVarnaScore}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C9DA8] leading-snug">
                  5 properties outperform the group average score of {summary.avgVarnaScore}:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hotels
                    .filter((h) => h.varnaScore > summary.avgVarnaScore)
                    .map((h) => (
                      <span
                        key={h.clientId}
                        className="text-[10px] bg-[#22252B] border border-[#738678]/40 px-2 py-0.5 text-[#FAF6EE]"
                      >
                        {h.clientName} ({h.varnaScore})
                      </span>
                    ))}
                </div>
              </div>

              {/* Insight 2: Hotels Needing Focused Support */}
              <div className="bg-[#18191D]/90 border border-[#944D25]/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#944D25]" />
                    <span className="text-xs font-semibold text-[#FAF6EE]">
                      Needing Support &lt;50 ({summary.hotelsNeedingSupport})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#944D25] bg-[#944D25]/15 px-2 py-0.5">
                    Action Required
                  </span>
                </div>
                <p className="text-[11px] text-[#8C9DA8] leading-snug">
                  2 properties require focused supplier engagement due to Varna scores under 50:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hotels
                    .filter((h) => h.varnaScore < 50)
                    .map((h) => (
                      <span
                        key={h.clientId}
                        className="text-[10px] bg-[#944D25]/15 border border-[#944D25]/40 px-2 py-0.5 text-[#FAF6EE]"
                      >
                        {h.clientName} ({h.varnaScore})
                      </span>
                    ))}
                </div>
              </div>

              {/* Insight 3: Spend at Risk */}
              <div className="bg-[#18191D]/90 border border-[#7A3F1E]/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#7A3F1E]" />
                    <span className="text-xs font-semibold text-[#FAF6EE]">
                      Spend at Risk: {summary.spendAtRiskPct}%
                    </span>
                  </div>
                  <span className="text-xs font-sans font-medium text-[#944D25]">
                    {formatCurrency(summary.spendAtRisk)}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C9DA8] leading-relaxed">
                  Spend committed to Foundational or Not-Ready suppliers across the group portfolio.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Group Spend by Supplier Band */}
          <GlassCard className="p-6 space-y-4" hoverEffect={false}>
            <div className="flex items-center justify-between border-b border-[#8C9DA8]/15 pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FAF6EE]">
                Group Spend by Supplier Band
              </h3>
              <span className="text-[10px] text-[#8C9DA8] font-mono">
                Total: {formatCurrency(summary.totalSpend)}
              </span>
            </div>

            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendByBand}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="spend"
                    nameKey="band"
                  >
                    {spendByBand.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#18191D" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), "Group Spend"]}
                    contentStyle={{ backgroundColor: "#22252B", borderColor: "rgba(140, 157, 168, 0.2)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-sans font-medium text-[#FAF6EE]">
                  {spendByBand.length}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#8C9DA8]">Bands</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="space-y-1.5 pt-2 border-t border-[#8C9DA8]/10 text-xs">
              {spendByBand.map((b) => (
                <div key={b.band} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                    <span className="text-[#8C9DA8]">{b.band}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#FAF6EE]">{formatCurrency(b.spend)}</span>
                    <span className="text-[#8C9DA8] text-[10px]">({b.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Supplier Tier Distribution */}
          <GlassCard className="p-6 space-y-4" hoverEffect={false}>
            <div className="flex items-center justify-between border-b border-[#8C9DA8]/15 pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FAF6EE]">
                Supplier Tier Distribution
              </h3>
              <span className="text-[10px] text-[#8C9DA8] font-mono">
                {uniqueSuppliersCount} Unique Enterprise Suppliers
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="tier"
                    stroke="#8C9DA8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(140, 157, 168, 0.2)" }}
                  />
                  <YAxis
                    stroke="#8C9DA8"
                    fontSize={11}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(140, 157, 168, 0.2)" }}
                  />
                  <RechartsTooltip
                    formatter={(val: any) => [`${val} Suppliers`, "Count"]}
                    contentStyle={{ backgroundColor: "#22252B", borderColor: "rgba(140, 157, 168, 0.2)" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {tierDistribution.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-[#8C9DA8]/10 flex items-center justify-between text-[11px] text-[#8C9DA8]">
              <span>Micro A: &le;10L</span>
              <span>Micro B: 10–50L</span>
              <span>Small: 50L–5Cr</span>
              <span>Medium: &gt;5Cr</span>
            </div>
          </GlassCard>
        </section>

        {/* ── SECTION 3: Hotel-Level Leaderboard ──────────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8C9DA8]/15 pb-4">
            <div>
              <h2 className="text-xl font-sans font-medium text-[#FAF6EE] tracking-tight">
                Hotel-Level Leaderboard Table
              </h2>
              <p className="text-xs text-[#8C9DA8]">
                Properties ranked by Varna Sustainability Score across the group portfolio.
              </p>
            </div>

            {/* Table Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#8C9DA8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search property or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#22252B] border border-[#8C9DA8]/20 pl-9 pr-4 py-2 text-xs text-[#FAF6EE] placeholder-[#8C9DA8]/60 focus:outline-none focus:border-[#944D25]"
              />
            </div>
          </div>

          <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#22252B] border-b border-[#8C9DA8]/20 text-[10px] font-sans font-semibold uppercase tracking-wider text-[#8C9DA8]">
                    <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort("clientName")}>
                      Property &amp; Location
                    </th>
                    <th className="py-3.5 px-3 text-center cursor-pointer" onClick={() => handleSort("varnaScore")}>
                      Varna Score
                    </th>
                    <th className="py-3.5 px-3 text-center cursor-pointer" onClick={() => handleSort("eScore")}>
                      E
                    </th>
                    <th className="py-3.5 px-3 text-center cursor-pointer" onClick={() => handleSort("sScore")}>
                      S
                    </th>
                    <th className="py-3.5 px-3 text-center cursor-pointer" onClick={() => handleSort("gScore")}>
                      G
                    </th>
                    <th className="py-3.5 px-3 text-center cursor-pointer" onClick={() => handleSort("cScore")}>
                      C
                    </th>
                    <th className="py-3.5 px-3 text-right cursor-pointer" onClick={() => handleSort("totalSpend")}>
                      Total Spend
                    </th>
                    <th className="py-3.5 px-3 text-right cursor-pointer" onClick={() => handleSort("co2eKg")}>
                      CO2e (kg)
                    </th>
                    <th className="py-3.5 px-3 text-right cursor-pointer" onClick={() => handleSort("co2eAvoidedKg")}>
                      CO2e Avoided
                    </th>
                    <th className="py-3.5 px-3 text-right cursor-pointer" onClick={() => handleSort("carKmAvoided")}>
                      Car Km
                    </th>
                    <th className="py-3.5 px-3 text-right cursor-pointer" onClick={() => handleSort("treesEquivalent")}>
                      Trees
                    </th>
                    <th className="py-3.5 px-4 text-center cursor-pointer" onClick={() => handleSort("activeSuppliers")}>
                      Suppliers
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C9DA8]/10 text-xs">
                  {filteredHotels.map((item, idx) => {
                    const isAboveAvg = item.varnaScore > summary.avgVarnaScore;
                    const isLowScore = item.varnaScore < 50;

                    return (
                      <tr
                        key={item.clientId}
                        className="hover:bg-[#22252B]/60 transition-colors group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-[#18191D] border border-[#8C9DA8]/20 flex items-center justify-center text-[10px] font-mono text-[#8C9DA8]">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-sans text-sm font-medium text-[#FAF6EE] group-hover:text-[#944D25] transition-colors">
                                {item.clientName}
                              </p>
                              <p className="text-[10px] text-[#8C9DA8] flex items-center gap-1.5 mt-0.5">
                                <span>{item.city}, {item.country}</span>
                                <span>&bull;</span>
                                <span className="font-mono">{item.clientId}</span>
                                <span>&bull;</span>
                                <span>{item.propertyType}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Varna Score Badge */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`
                                text-sm font-sans font-medium px-2.5 py-0.5 rounded-full border
                                ${
                                  item.varnaScore >= 80
                                    ? "bg-[#738678]/15 border-[#738678]/40 text-[#829888]"
                                    : item.varnaScore >= 60
                                    ? "bg-[#6F848F]/15 border-[#6F848F]/40 text-[#8298A5]"
                                    : "bg-[#944D25]/15 border-[#944D25]/40 text-[#944D25]"
                                }
                              `}
                            >
                              {item.varnaScore.toFixed(1)}
                            </span>
                            {item.varnaLeaders > 0 && (
                              <span className="text-[8px] text-[#829888] tracking-wider mt-0.5">
                                ★ Leader
                              </span>
                            )}
                          </div>
                        </td>

                        {/* E Score */}
                        <td className="py-3.5 px-3 text-center font-mono text-[#8C9DA8]">
                          {item.eScore.toFixed(1)}
                        </td>

                        {/* S Score */}
                        <td className="py-3.5 px-3 text-center font-mono text-[#8C9DA8]">
                          {item.sScore.toFixed(1)}
                        </td>

                        {/* G Score */}
                        <td className="py-3.5 px-3 text-center font-mono text-[#8C9DA8]">
                          {item.gScore.toFixed(1)}
                        </td>

                        {/* C Score */}
                        <td className="py-3.5 px-3 text-center font-mono text-[#8C9DA8]">
                          {item.cScore !== null ? item.cScore.toFixed(1) : "—"}
                        </td>

                        {/* Total Spend */}
                        <td className="py-3.5 px-3 text-right font-mono font-medium text-[#FAF6EE]">
                          {formatCurrency(item.totalSpend)}
                        </td>

                        {/* CO2e kg */}
                        <td className="py-3.5 px-3 text-right font-mono text-[#8C9DA8]">
                          {formatNumber(item.co2eKg)}
                        </td>

                        {/* CO2e Avoided kg */}
                        <td className="py-3.5 px-3 text-right font-mono text-[#829888]">
                          +{formatNumber(item.co2eAvoidedKg)}
                        </td>

                        {/* Car Km */}
                        <td className="py-3.5 px-3 text-right font-mono text-[#8C9DA8]">
                          {item.carKmAvoided !== null ? formatNumber(item.carKmAvoided) : "—"}
                        </td>

                        {/* Trees */}
                        <td className="py-3.5 px-3 text-right font-mono text-[#8C9DA8]">
                          {item.treesEquivalent !== null ? formatNumber(item.treesEquivalent) : "—"}
                        </td>

                        {/* Active Suppliers */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-[#18191D] border border-[#8C9DA8]/20 px-2 py-0.5 text-[11px] font-mono text-[#FAF6EE]">
                            {item.activeSuppliers}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredHotels.length === 0 && (
              <div className="py-12 text-center text-xs text-[#8C9DA8]">
                No properties matched your search term "{searchTerm}".
              </div>
            )}
          </GlassCard>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-8 mt-16 pt-6 border-t border-[#8C9DA8]/15 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#8C9DA8]/60">
        <span>Varna Collective &bull; Multi-Property Group Architecture</span>
        <span>Scoped Account: GRP-001 &bull; {summary.parentGroup}</span>
      </footer>
    </div>
  );
}

// Router Hook helper
function RouterHook() {
  return useRouter();
}
