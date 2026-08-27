"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import VarnaScoreHoverCard from "@/components/ui/VarnaScoreHoverCard";
import ConfidenceChecklistHoverCard from "@/components/ui/ConfidenceChecklistHoverCard";
import DataTierBadge from "@/components/ui/DataTierBadge";
import type { DataTier } from "@/components/ui/DataTierBadge";
import type { SupplierConfidenceData } from "@/lib/mock-data";
import { SUPPLIER_CONFIDENCE_CHECKLISTS } from "@/lib/mock-data";
import {
  Calendar,
  Download,
  AlertTriangle,
  Info,
  Star,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  RefreshCw,
  AlertOctagon,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Category spend dataset matching requested spec:
// Total Spend: $40.0K. Categories sum to $40.0K (42%, 24%, 20%, 14%).
const CATEGORY_DATA = [
  { name: "Organic Toiletries", value: 16800, percentage: 42, color: "#7A3F1E" }, // deep-clay
  { name: "Artisan Ceramics", value: 9600, percentage: 24, color: "#738678" },  // sage-mineral
  { name: "Handmade Soap", value: 8000, percentage: 20, color: "#6F848F" },     // slate-mist
  { name: "Eco-Packaging", value: 5600, percentage: 14, color: "#2F3C52" },     // midnight-blue
];

function formatSpend(val: number): string {
  return `$${(val / 1000).toFixed(1)}K`;
}

// ─────────────── Supplier Profile Card ───────────────

interface SupplierProfileCardProps {
  name: string;
  legalName: string;
  location: string;
  dataTier: DataTier;
  varnaScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
  skuCount: number;
  totalUnits: number;
  confidenceScore: number;
  confidenceColor: string;
  confidenceDasharray: string;
  tags: { icon: typeof ShieldCheck; label: string; colorClass: string }[];
  categoryBars: { label: string; val: number }[];
  barColorClass: string;
  quote: string;
  sdgs: { val: string; color: string; label: string }[];
  liveConfidenceData?: Record<string, SupplierConfidenceData>;
}

function SupplierProfileCard({
  name,
  legalName,
  location,
  dataTier,
  varnaScore,
  eScore,
  sScore,
  gScore,
  cScore,
  skuCount,
  totalUnits,
  confidenceScore,
  confidenceColor,
  confidenceDasharray,
  tags,
  categoryBars,
  barColorClass,
  quote,
  sdgs,
  liveConfidenceData,
}: SupplierProfileCardProps) {
  // Use live data from Google Sheets if available, otherwise fall back to mock
  const confidenceData = (liveConfidenceData && Object.keys(liveConfidenceData).length > 0)
    ? liveConfidenceData[name]
    : SUPPLIER_CONFIDENCE_CHECKLISTS[name];

  return (
    <div className="bg-white dark:bg-[#2A2B2E] border border-slate-mist/30 dark:border-midnight-blue p-8 flex flex-col justify-between transition-transform duration-300 ease-out hover:scale-[1.01]">
      
      {/* Header block */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <h4 className="text-2xl font-serif text-carbon-ink dark:text-white font-light tracking-tight">
                {name}
              </h4>
              <DataTierBadge tier={dataTier} />
            </div>
            <p className="text-xs text-slate-mist dark:text-warm-stone/50 font-light mt-0.5">
              {legalName} &bull; {location}
            </p>
          </div>

          {/* Top-Right: Actual Varna Score (hover → VarnaScoreHoverCard) */}
          <VarnaScoreHoverCard
            score={varnaScore}
            eScore={eScore}
            sScore={sScore}
            gScore={gScore}
            cScore={cScore}
            supplierName={name}
          >
            <motion.div
              className="flex flex-col items-center cursor-help select-none"
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <span className="text-3xl font-serif font-light tracking-tighter text-deep-clay dark:text-warm-stone">
                {varnaScore}
              </span>
              <span className="text-[7px] font-semibold uppercase tracking-widest text-slate-mist dark:text-warm-stone/50 mt-0.5">
                Varna Score
              </span>
            </motion.div>
          </VarnaScoreHoverCard>
        </div>

        {/* Sourced line — updated format */}
        <div className="text-xs font-semibold text-sage-mineral dark:text-[#8AA391] mb-6">
          Sourced {skuCount} SKUs | Units Ordered: {totalUnits}
        </div>

        {/* Scan Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => {
            const Icon = tag.icon;
            return (
              <span
                key={tag.label}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${tag.colorClass}`}
              >
                <Icon className="w-3 h-3" />
                {tag.label}
              </span>
            );
          })}
        </div>

        {/* Category Read Progress Bars */}
        <div className="space-y-4 mb-6">
          {categoryBars.map((cat) => (
            <div key={cat.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-slate-mist dark:text-warm-stone/50 font-light">
                <span>{cat.label}</span>
                <span className="font-semibold text-carbon-ink dark:text-white">{cat.val}%</span>
              </div>
              <div className="h-1 bg-warm-stone/20 dark:bg-black/25 rounded-none overflow-hidden">
                <div
                  className={`h-full ${barColorClass}`}
                  style={{ width: `${cat.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* What this means text block */}
        <blockquote className="border-l border-slate-mist/30 dark:border-midnight-blue pl-4 py-1.5 my-6">
          <p className="text-xs font-serif italic font-light text-slate-mist dark:text-warm-stone/85 leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </blockquote>
      </div>

      {/* Bottom Section: SDG Alignment + Confidence Ring inline */}
      <div>
        <p className="text-[9px] uppercase tracking-widest text-slate-mist dark:text-warm-stone/50 font-semibold mb-3">
          SDG Alignment Index
        </p>
        <div className="flex items-center gap-4">
          {/* SDG colored boxes — enhanced with labels, hover animations */}
          <div className="flex gap-3">
            {sdgs.map((sdg, idx) => {
              const isUnknown = sdg.val === "?";
              return (
                <motion.div
                  key={`${sdg.val}-${idx}`}
                  className={`relative group flex flex-col cursor-default ${
                    isUnknown
                      ? "w-11 h-11 border border-dashed border-slate-mist/30 dark:border-warm-stone/20 bg-transparent rounded-sm items-center justify-center"
                      : `w-11 h-11 shadow-sm rounded-sm overflow-hidden ${sdg.color} bg-gradient-to-br from-white/10 to-black/20 border border-black/10`
                  }`}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  title={sdg.label}
                >
                  {isUnknown ? (
                    <span className="text-[11px] font-light text-slate-mist/50 dark:text-warm-stone/40">
                      ?
                    </span>
                  ) : (
                    <div className="w-full h-full flex flex-col relative p-1.5">
                      <span className="text-[14px] font-black leading-none tracking-tighter text-white drop-shadow-sm">
                        {sdg.val}
                      </span>
                      {/* Decorative elements to make it look like a real badge */}
                      <div className="mt-auto text-[4px] font-bold uppercase tracking-widest text-white/90 leading-tight">
                        {sdg.label.split(" ")[0]}
                        <br />
                        {sdg.label.split(" ").slice(1).join(" ")}
                      </div>
                    </div>
                  )}
                  {/* Hover label tooltip */}
                  {!isUnknown && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-white dark:text-warm-stone bg-carbon-ink dark:bg-[#1E2022] px-2 py-1 rounded shadow-xl border border-slate-mist/10">
                        {sdg.label}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Spacer to push ring to right */}
          <div className="flex-1" />

          {/* Confidence Ring (moved to bottom, 20% larger → w-16 h-16) */}
          {confidenceData && (
            <ConfidenceChecklistHoverCard
              supplierName={name}
              score={confidenceData.score}
              totalConfirmed={confidenceData.totalConfirmed}
              status={confidenceData.status}
              checklist={confidenceData.checklist}
            >
              <motion.div
                className="relative w-16 h-16 flex-shrink-0 cursor-help"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <svg className="-rotate-90 w-full h-full" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    className="stroke-carbon-ink/10 dark:stroke-warm-stone/10"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke={confidenceColor}
                    strokeWidth="3.2"
                    strokeDasharray={confidenceDasharray}
                    strokeLinecap="square"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[12px] font-serif font-semibold text-carbon-ink dark:text-white">
                    {confidenceScore}%
                  </span>
                  <span className="text-[6px] uppercase tracking-wider text-slate-mist">
                    Confidence
                  </span>
                </div>
              </motion.div>
            </ConfidenceChecklistHoverCard>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────── Main Page ───────────────

export default function SuppliersDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [liveConfidenceData, setLiveConfidenceData] = useState<Record<string, SupplierConfidenceData>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch live confidence data from the Confidence spreadsheet
  useEffect(() => {
    async function fetchConfidence() {
      try {
        const res = await fetch("/api/confidence");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && json.data) {
          setLiveConfidenceData(json.data);
        }
      } catch (err) {
        console.warn("Failed to fetch live confidence data, using mock fallback:", err);
        // liveConfidenceData stays empty → SupplierProfileCard falls back to mock
      }
    }
    fetchConfidence();
  }, []);

  const handleSectionChange = (section: string) => {
    if (section === "algorithm") {
      router.push("/algorithm");
    } else if (section !== "suppliers") {
      router.push(`/dashboard?section=${section}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("varna_client");
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-[#F9F9F8] dark:bg-carbon-ink text-carbon-ink dark:text-warm-stone transition-colors duration-300 selection:bg-deep-clay selection:text-warm-stone font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        activeSection="suppliers"
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-24 p-8 max-w-[1400px] overflow-x-hidden">
        {/* Top Floating Action Bar */}
        <div className="flex justify-end items-center mb-6 gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 border border-slate-mist/30 dark:border-midnight-blue text-slate-mist dark:text-warm-stone/50 hover:text-carbon-ink dark:hover:text-warm-stone bg-white dark:bg-[#2A2B2E] transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 1. Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col items-start">
            {/* Breadcrumbs */}
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-mist dark:text-warm-stone/50 mb-3">
              My Suppliers &gt; Composite Profile
            </div>
            {/* Title (Playfair Display styled serif) */}
            <h1 className="text-4xl font-serif font-light tracking-tighter text-carbon-ink dark:text-warm-stone leading-tight mb-2">
              The Suppliers Behind Your Orders
            </h1>
            {/* Subtitle */}
            <p className="text-sm text-slate-mist dark:text-warm-stone/60 max-w-2xl font-light leading-relaxed">
              Everything currently verifiable about each supplier you've sourced from — scan it in five seconds, or read every line.
            </p>
          </div>

          {/* Right Side Actions */}
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="flex items-center gap-2 border border-slate-mist/35 dark:border-midnight-blue px-4 py-3 bg-white dark:bg-[#2A2B2E] text-xs text-slate-mist dark:text-warm-stone/70">
              <Calendar className="w-3.5 h-3.5 text-slate-mist" strokeWidth={1.5} />
              <span className="font-light tracking-wide">Apr 1 - Jun 30, 2026</span>
            </div>
            
            <button
              onClick={() => alert("Report compiled. Your CSV/PDF export is downloading.")}
              className="flex items-center gap-2.5 px-5 py-3 bg-midnight-blue text-white hover:bg-carbon-ink dark:bg-warm-stone dark:text-carbon-ink dark:hover:bg-[#E4DEC9] text-xs font-serif uppercase tracking-widest transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Download Report</span>
            </button>
          </div>
        </section>

        {/* 2. Primary Information Banner */}
        <section className="mb-8">
          <div className="flex items-start gap-3 border border-slate-mist/30 dark:border-midnight-blue/50 bg-white dark:bg-[#2A2B2E] p-5 shadow-sm">
            <Info className="w-5 h-5 text-slate-mist flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-slate-mist dark:text-warm-stone/80 font-light leading-relaxed">
              2 of your recent orders were fulfilled using products sourced from <span className="font-semibold text-carbon-ink dark:text-white">Bare Necessities</span> and <span className="font-semibold text-carbon-ink dark:text-white">Kheoni</span>. The analytics represented below are consolidated aggregates matching this sourcing interval.
            </p>
          </div>
        </section>

        {/* 3. Top KPI Cards (3 Columns) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* KPI 1: Total Orders */}
          <div className="bg-white dark:bg-[#2A2B2E] border border-slate-mist/30 dark:border-midnight-blue p-6 relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/50 mb-2">
              Total Orders
            </p>
            <div className="text-3xl font-sans font-light tracking-tight text-carbon-ink dark:text-white">
              5
            </div>
            <p className="text-[10px] text-slate-mist/80 dark:text-warm-stone/40 mt-2 font-light">
              Suppliers sourced within current cycle
            </p>
          </div>

          {/* KPI 2: Total Spend */}
          <div className="bg-white dark:bg-[#2A2B2E] border border-slate-mist/30 dark:border-midnight-blue p-6 relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/50 mb-2">
              Total Spend
            </p>
            <div className="text-3xl font-serif font-light tracking-tighter text-carbon-ink dark:text-white">
              $40.0K
            </div>
            <p className="text-[10px] text-slate-mist/80 dark:text-warm-stone/40 mt-2 font-light">
              Procurement funding tracked in portal
            </p>
          </div>

          {/* KPI 3: Avg Varna Score */}
          <div className="bg-white dark:bg-[#2A2B2E] border border-slate-mist/30 dark:border-midnight-blue p-6 relative">
            <div className="absolute top-6 right-6">
              <Star className="w-4 h-4 text-deep-clay dark:text-warm-stone fill-current" strokeWidth={1} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/50 mb-2">
              Avg. Varna Score
            </p>
            <VarnaScoreHoverCard
              score={46}
              eScore={37}
              sScore={51}
              gScore={48}
              cScore={51}
              supplierName="Portfolio Average"
            >
              <div className="text-3xl font-serif font-light tracking-tighter text-carbon-ink dark:text-white cursor-help">
                46<span className="text-lg font-light text-slate-mist">/100</span>
              </div>
            </VarnaScoreHoverCard>
            <p className="text-[10px] text-slate-mist/80 dark:text-warm-stone/40 mt-2 font-light">
              Weighted average composite profile rating
            </p>
          </div>
        </section>

        {/* 4. Secondary Warning Banner */}
        <section className="mb-8">
          <div className="flex items-start gap-3 border border-deep-clay/20 bg-warm-stone/20 dark:bg-[#342D2A] p-5 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-deep-clay dark:text-deep-clay flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-deep-clay dark:text-warm-stone/85 font-light leading-relaxed">
              <span className="font-semibold uppercase tracking-wider text-[10px] block mb-1">Scoring note</span>
              Bare Necessities has not disclosed full product composition reports for items in orders #4 and #5. ESG tracking represents structural company operations; product levels remain estimated.
            </p>
          </div>
        </section>

        {/* 5. Spend by Product Category Section — donut increased by 30% */}
        <section className="mb-8 bg-white dark:bg-[#2A2B2E] border border-slate-mist/30 dark:border-midnight-blue p-8">
          <div className="border-b border-slate-mist/20 dark:border-midnight-blue pb-4 mb-6">
            <h3 className="text-lg font-serif font-light text-carbon-ink dark:text-warm-stone tracking-tighter">
              Spend by Product Category
            </h3>
            <p className="text-xs text-slate-mist dark:text-warm-stone/50 mt-1 font-light tracking-wide">
              Detailed allocations across categories sourced from current active suppliers.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left: Donut Chart — increased from w-56 h-56 to w-72 h-72 (+30%) */}
            <div className="relative w-72 h-72 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={3}
                    cornerRadius={0}
                    strokeWidth={1}
                    stroke={theme === "dark" ? "#2A2B2E" : "#FFFFFF"}
                  >
                    {CATEGORY_DATA.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Hole Labels */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-serif text-carbon-ink dark:text-white font-light tracking-tighter">$40.0K</span>
                <span className="text-[8px] uppercase tracking-[0.25em] text-slate-mist dark:text-warm-stone/50 mt-1">Total Spend</span>
              </div>
            </div>

            {/* Right: Custom Legend */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {CATEGORY_DATA.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-4 border border-slate-mist/20 dark:border-midnight-blue/50 p-4 bg-[#F9F9F8]/40 dark:bg-black/10"
                >
                  <div
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-carbon-ink dark:text-white font-semibold truncate">
                      {cat.name}
                    </p>
                    <p className="text-[11px] text-slate-mist dark:text-warm-stone/50 font-light mt-0.5">
                      {formatSpend(cat.value)} &bull; {cat.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Supplier Profiles (Grid Layout) */}
        <section className="space-y-6">
          <div className="border-b border-slate-mist/25 dark:border-midnight-blue pb-3">
            <h3 className="text-lg font-serif font-light text-carbon-ink dark:text-warm-stone tracking-tighter">
              Active Supplier Profiles
            </h3>
            <p className="text-xs text-slate-mist dark:text-warm-stone/50 mt-1 font-light tracking-wide">
              Detailed audits, verification tags, and operational scores for current suppliers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Supplier Card 1: Bare Necessities */}
            <SupplierProfileCard
              name="Bare Necessities"
              legalName="Zero Waste Solutions Pvt. Ltd."
              location="Bengaluru, Karnataka"
              dataTier="verified"
              varnaScore={73.5}
              eScore={65}
              sScore={80}
              gScore={75}
              cScore={70}
              skuCount={4}
              totalUnits={1240}
              confidenceScore={liveConfidenceData["Bare Necessities"]?.score ?? 61}
              confidenceColor="#738678"
              confidenceDasharray={`${liveConfidenceData["Bare Necessities"]?.score ?? 61}, 100`}
              tags={[
                { icon: ShieldCheck, label: "Cruelty-free (PETA)", colorClass: "bg-[#E1EAE3] text-sage-mineral dark:bg-[#202E24] dark:text-[#8AA391]" },
                { icon: Zap, label: "DPIIT startup", colorClass: "bg-[#F9F4DF] text-[#A68F35] dark:bg-[#342F1C] dark:text-[#D5C27F]" },
                { icon: RefreshCw, label: "Refillable format", colorClass: "bg-[#DFE6F9] text-midnight-blue dark:bg-[#1E2638] dark:text-warm-stone" },
              ]}
              categoryBars={[
                { label: "Governance", val: 80 },
                { label: "Environment", val: 65 },
                { label: "Community", val: 90 },
              ]}
              barColorClass="bg-slate-mist dark:bg-warm-stone"
              quote="Highly recommended for personal care products. Demonstrates strong ethical transparency and local employment models."
              sdgs={[
                { val: "8", color: "bg-[#A21942] text-white", label: "Decent Work" },
                { val: "9", color: "bg-[#FF3A21] text-white", label: "Innovation" },
                { val: "12", color: "bg-[#BF8B2E] text-white", label: "Responsible Consumption" },
                { val: "16", color: "bg-[#00689D] text-white", label: "Peace & Justice" },
              ]}
              liveConfidenceData={liveConfidenceData}
            />

            {/* Supplier Card 2: Kheoni */}
            <SupplierProfileCard
              name="Kheoni"
              legalName="Heritage Organic Foods LLP"
              location="Indore, Madhya Pradesh"
              dataTier="lapsed"
              varnaScore={28.2}
              eScore={8}
              sScore={12}
              gScore={15}
              cScore={0}
              skuCount={2}
              totalUnits={380}
              confidenceScore={liveConfidenceData["Kheoni"]?.score ?? 11}
              confidenceColor="#7A3F1E"
              confidenceDasharray={`${liveConfidenceData["Kheoni"]?.score ?? 11}, 100`}
              tags={[
                { icon: AlertOctagon, label: "EHS system lapsed", colorClass: "bg-[#ECEAE6] text-slate-mist dark:bg-black/30 dark:text-warm-stone/60 border border-slate-mist/20" },
              ]}
              categoryBars={[
                { label: "Governance", val: 15 },
                { label: "Environment", val: 8 },
                { label: "Community", val: 12 },
              ]}
              barColorClass="bg-deep-clay dark:bg-[#7A3F1E]"
              quote="Exercise caution. Sourcing from this entity currently presents exposure due to undocumented labor practices and environmental licensing gaps."
              sdgs={[
                { val: "?", color: "", label: "Unverified" },
                { val: "?", color: "", label: "Unverified" },
                { val: "?", color: "", label: "Unverified" },
                { val: "?", color: "", label: "Unverified" },
              ]}
              liveConfidenceData={liveConfidenceData}
            />

          </div>
        </section>
      </main>
    </div>
  );
}
