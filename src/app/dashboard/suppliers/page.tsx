"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Sidebar from "@/components/layout/Sidebar";
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

export default function SuppliersDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSectionChange = (section: string) => {
    if (section !== "suppliers") {
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
            <div className="text-3xl font-sans font-light tracking-tight text-carbon-ink dark:text-white">
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
            <div className="text-3xl font-sans font-light tracking-tight text-carbon-ink dark:text-white">
              46<span className="text-lg font-light text-slate-mist">/100</span>
            </div>
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

        {/* 5. Spend by Product Category Section */}
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
            {/* Left: Donut Chart */}
            <div className="relative w-56 h-56 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
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
            <div className="bg-white dark:bg-[#2A2B2E] border border-slate-mist/30 dark:border-midnight-blue p-8 flex flex-col justify-between">
              
              {/* Header block */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-2xl font-serif text-carbon-ink dark:text-white font-light tracking-tight">
                      Bare Necessities
                    </h4>
                    <p className="text-xs text-slate-mist dark:text-warm-stone/50 font-light mt-0.5">
                      Zero Waste Solutions Pvt. Ltd. &bull; Bengaluru, Karnataka
                    </p>
                  </div>
                  {/* SVG score ring (61%) */}
                  <div className="relative w-14 h-14 flex-shrink-0">
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
                        stroke="#738678" // sage-mineral representing high score
                        strokeWidth="3.2"
                        strokeDasharray="61, 100"
                        strokeLinecap="square"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[11px] font-serif font-semibold text-carbon-ink dark:text-white">61%</span>
                      <span className="text-[6px] uppercase tracking-wider text-slate-mist">Varna</span>
                    </div>
                  </div>
                </div>

                {/* Sourced line */}
                <div className="text-xs font-semibold text-sage-mineral dark:text-[#8AA391] mb-6">
                  Sourced 4 SKUs in your last order
                </div>

                {/* Scan Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#E1EAE3] text-sage-mineral dark:bg-[#202E24] dark:text-[#8AA391] text-[10px] font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" /> Cruelty-free (PETA)
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F9F4DF] text-[#A68F35] dark:bg-[#342F1C] dark:text-[#D5C27F] text-[10px] font-semibold uppercase tracking-wider">
                    <Zap className="w-3 h-3" /> DPIIT startup
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#DFE6F9] text-midnight-blue dark:bg-[#1E2638] dark:text-warm-stone text-[10px] font-semibold uppercase tracking-wider">
                    <RefreshCw className="w-3 h-3" /> Refillable format
                  </span>
                </div>

                {/* Category Read Progress Bars */}
                <div className="space-y-4 mb-6">
                  {[
                    { label: "Governance", val: 80 },
                    { label: "Environment", val: 65 },
                    { label: "Community", val: 90 },
                  ].map((cat) => (
                    <div key={cat.label} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-slate-mist dark:text-warm-stone/50 font-light">
                        <span>{cat.label}</span>
                        <span className="font-semibold text-carbon-ink dark:text-white">{cat.val}%</span>
                      </div>
                      <div className="h-1 bg-warm-stone/20 dark:bg-black/25 rounded-none overflow-hidden">
                        <div
                          className="h-full bg-slate-mist dark:bg-warm-stone"
                          style={{ width: `${cat.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* What this means text block */}
                <blockquote className="border-l border-slate-mist/30 dark:border-midnight-blue pl-4 py-1.5 my-6">
                  <p className="text-xs font-serif italic font-light text-slate-mist dark:text-warm-stone/85 leading-relaxed">
                    "Highly recommended for personal care products. Demonstrates strong ethical transparency and local employment models."
                  </p>
                </blockquote>
              </div>

              {/* SDG Alignment */}
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-mist dark:text-warm-stone/50 font-semibold mb-3">
                  SDG Alignment Index
                </p>
                <div className="flex gap-2.5">
                  {[
                    { val: "8", color: "bg-[#A21942] text-white" },  // Decent Work
                    { val: "9", color: "bg-[#FF3A21] text-white" },  // Innovation
                    { val: "12", color: "bg-[#BF8B2E] text-white" }, // Responsible Consump.
                    { val: "16", color: "bg-[#00689D] text-white" }, // Peace & Justice
                  ].map((sdg) => (
                    <div
                      key={sdg.val}
                      className={`w-9 h-9 flex items-center justify-center font-bold text-xs ${sdg.color}`}
                      title={`SDG ${sdg.val}`}
                    >
                      {sdg.val}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Supplier Card 2: Kheoni */}
            <div className="bg-white dark:bg-[#2A2B2E] border border-slate-mist/30 dark:border-midnight-blue p-8 flex flex-col justify-between">
              
              {/* Header block */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-2xl font-serif text-carbon-ink dark:text-white font-light tracking-tight">
                      Kheoni
                    </h4>
                    <p className="text-xs text-slate-mist dark:text-warm-stone/50 font-light mt-0.5">
                      Heritage Organic Foods LLP &bull; Indore, Madhya Pradesh
                    </p>
                  </div>
                  {/* SVG score ring (11%) */}
                  <div className="relative w-14 h-14 flex-shrink-0">
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
                        stroke="#7A3F1E" // deep-clay representing low score
                        strokeWidth="3.2"
                        strokeDasharray="11, 100"
                        strokeLinecap="square"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[11px] font-serif font-semibold text-carbon-ink dark:text-white">11%</span>
                      <span className="text-[6px] uppercase tracking-wider text-slate-mist">Varna</span>
                    </div>
                  </div>
                </div>

                {/* Sourced line */}
                <div className="text-xs font-semibold text-sage-mineral dark:text-[#8AA391] mb-6">
                  Sourced 2 SKUs in your last order
                </div>

                {/* Scan Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#ECEAE6] text-slate-mist dark:bg-black/30 dark:text-warm-stone/60 text-[10px] font-semibold uppercase tracking-wider border border-slate-mist/20">
                    <AlertOctagon className="w-3 h-3 text-deep-clay" /> EHS system lapsed
                  </span>
                </div>

                {/* Category Read Progress Bars */}
                <div className="space-y-4 mb-6">
                  {[
                    { label: "Governance", val: 15 },
                    { label: "Environment", val: 8 },
                    { label: "Community", val: 12 },
                  ].map((cat) => (
                    <div key={cat.label} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-slate-mist dark:text-warm-stone/50 font-light">
                        <span>{cat.label}</span>
                        <span className="font-semibold text-carbon-ink dark:text-white">{cat.val}%</span>
                      </div>
                      <div className="h-1 bg-warm-stone/20 dark:bg-black/25 rounded-none overflow-hidden">
                        <div
                          className="h-full bg-deep-clay dark:bg-[#7A3F1E]"
                          style={{ width: `${cat.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* What this means text block */}
                <blockquote className="border-l border-deep-clay/35 pl-4 py-1.5 my-6">
                  <p className="text-xs font-serif italic font-light text-slate-mist dark:text-warm-stone/85 leading-relaxed">
                    "Exercise caution. Sourcing from this entity currently presents exposure due to undocumented labor practices and environmental licensing gaps."
                  </p>
                </blockquote>
              </div>

              {/* SDG Alignment */}
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-mist dark:text-warm-stone/50 font-semibold mb-3">
                  SDG Alignment Index
                </p>
                <div className="flex gap-2.5">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-9 h-9 flex items-center justify-center bg-slate-mist/20 dark:bg-black/20 text-slate-mist/60 dark:text-warm-stone/40 border border-slate-mist/10 font-bold text-xs"
                      title="No SDG data verified"
                    >
                      ?
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
