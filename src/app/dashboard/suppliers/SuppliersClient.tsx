"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import BrandWatermark from "@/components/ui/BrandWatermark";
import ChatWidget from "@/components/ChatWidget";
import Card from "@/components/ui/Card";
import VarnaScoreHoverCard from "@/components/ui/VarnaScoreHoverCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { SupplierConfidenceData } from "@/lib/mock-data";
import { SUPPLIER_CONFIDENCE_CHECKLISTS } from "@/lib/mock-data";
import SupplierProfileCard from "./SupplierProfileCard";
import {
  Calendar,
  Download,
  AlertTriangle,
  Info,
  Star,
  Sun,
  Moon,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Category spend dataset matching requested spec (Brand Palette only)
const CATEGORY_DATA = [
  { name: "Organic Toiletries", value: 16800, percentage: 42, color: "#7A3F1E" }, // deep-clay
  { name: "Artisan Ceramics", value: 9600, percentage: 24, color: "#738678" },  // sage-mineral
  { name: "Handmade Soap", value: 8000, percentage: 20, color: "#6F848F" },     // slate-mist
  { name: "Eco-Packaging", value: 5600, percentage: 14, color: "#2F3C52" },     // midnight-blue
];

function formatSpend(val: number): string {
  return `$${(val / 1000).toFixed(1)}K`;
}



// ─────────────── Main Suppliers View ───────────────

export default function SuppliersClient({
  suppliersData,
  liveConfidenceData,
}: {
  suppliersData: any[];
  liveConfidenceData: Record<string, SupplierConfidenceData>;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownloadReport = () => {
    setIsDownloading(true);
    setTimeout(() => {
      alert("Report compiled. Your verified audit export is downloading.");
      setIsDownloading(false);
    }, 600);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -500, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 500, behavior: "smooth" });
    }
  };

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
    <div className="min-h-screen flex bg-ambient-mesh-light dark:bg-ambient-mesh-dark text-[#222326] dark:text-[#FAF6EE] transition-colors duration-300 selection:bg-[#7A3F1E] selection:text-[#D8CFB8] font-sans relative overflow-x-hidden">
      {/* Subtle brand crystal mark in page corner */}
      <BrandWatermark position="bottom-right" size={600} opacity={0.035} />

      {/* Sidebar navigation */}
      <Sidebar
        activeSection="suppliers"
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-24 p-8 max-w-[1400px] overflow-x-hidden relative z-10">
        {/* Top Floating Action Bar */}
        <div className="flex justify-end items-center mb-6 gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 border border-[#6F848F]/30 dark:border-[#8C9DA8]/20 text-[#6F848F] dark:text-[#8C9DA8] hover:text-[#222326] dark:hover:text-[#FAF6EE] bg-[#E4DEC9] dark:bg-[#22252B] transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* 1. Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col items-start">
            {/* Breadcrumbs */}
            <div className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#7A3F1E] dark:text-[#FAF6EE]/80 mb-2">
              My Suppliers · Composite Verified Profiles
            </div>
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] tracking-hero uppercase leading-none mb-2">
              The Suppliers Behind Your Orders
            </h1>
            {/* Subtitle */}
            <p className="text-sm text-[#222326]/75 dark:text-[#FAF6EE]/75 max-w-2xl font-light leading-relaxed">
              Every audited metric across environmental footprint, living wages, and evidence quality—scan in five seconds, or inspect every line.
            </p>
          </div>

          {/* Right Action: Date Range Indicator & Report Download */}
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="flex items-center gap-2 border border-[#6F848F]/30 dark:border-[#8C9DA8]/25 px-4 py-3 bg-[#E4DEC9] dark:bg-[#22252B] text-xs text-[#6F848F] dark:text-[#FAF6EE]/70 rounded-none shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-[#6F848F] dark:text-[#8C9DA8]" strokeWidth={1.5} />
              <span className="font-light tracking-wide uppercase text-[10px]">Apr 1 – Jun 30, 2026</span>
            </div>

            <button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className={`flex items-center gap-2.5 px-5 py-3 bg-[#7A3F1E] text-[#D8CFB8] hover:bg-[#683315] dark:bg-[#FAF6EE] dark:text-[#18191D] dark:hover:bg-[#E8E2D1] text-xs font-sans uppercase tracking-widest transition-colors cursor-pointer shadow-elevation-low ${
                isDownloading ? "opacity-75 cursor-wait" : ""
              }`}
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              )}
              <span>{isDownloading ? "Preparing..." : "Download Report"}</span>
            </button>
          </div>
        </section>

        {/* 2. Primary Information Banner */}
        <section className="mb-8">
          <div className="flex items-start gap-3 border border-[#6F848F]/30 dark:border-[#8C9DA8]/20 bg-[#E4DEC9] dark:bg-[#22252B] p-5 rounded-lg shadow-elevation-low dark:shadow-elevation-dark-low">
            <Info className="w-5 h-5 text-[#6F848F] dark:text-[#8C9DA8] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-[#222326]/80 dark:text-[#FAF6EE]/80 font-light leading-relaxed">
              Recent orders were fulfilled using vetted artisanal products sourced from <span className="font-semibold text-[#222326] dark:text-[#FAF6EE]">Bare Necessities</span>, <span className="font-semibold text-[#222326] dark:text-[#FAF6EE]">Kheoni Ventures</span>, and <span className="font-semibold text-[#222326] dark:text-[#FAF6EE]">UKHI India</span>. Metrics represent verified operational audits and evidence multipliers.
            </p>
          </div>
        </section>

        {/* 3. Top KPI Cards (3 Columns) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* KPI 1: Total Orders */}
          <Card variant="hero" className="relative overflow-hidden">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#8C9DA8] mb-2">
              Total Orders
            </p>
            <div className="text-4xl sm:text-5xl font-sans font-medium tracking-hero text-[#222326] dark:text-[#FAF6EE]">
              <AnimatedCounter value={5} />
            </div>
            <p className="text-[11px] text-[#6F848F] dark:text-[#8C9DA8] mt-2 font-light">
              Suppliers sourced within active procurement cycle
            </p>
          </Card>

          {/* KPI 2: Total Spend */}
          <Card variant="hero" className="relative overflow-hidden">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#8C9DA8] mb-2">
              Total Spend
            </p>
            <div className="text-4xl sm:text-5xl font-sans font-medium tracking-hero text-[#7A3F1E] dark:text-[#FAF6EE]">
              $<AnimatedCounter value={40.0} decimals={1} />K
            </div>
            <p className="text-[11px] text-[#6F848F] dark:text-[#8C9DA8] mt-2 font-light">
              Ethical procurement capital deployed
            </p>
          </Card>

          {/* KPI 3: Avg Varna Score */}
          <Card variant="hero" className="relative overflow-hidden">
            <div className="absolute top-5 right-5">
              <Star className="w-4 h-4 text-[#7A3F1E] dark:text-[#FAF6EE] fill-current" strokeWidth={1} />
            </div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#8C9DA8] mb-2">
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
              <div className="text-4xl sm:text-5xl font-sans font-medium tracking-hero text-[#222326] dark:text-[#FAF6EE] cursor-help">
                <AnimatedCounter value={46} /><span className="text-xl font-light text-[#6F848F] dark:text-[#8C9DA8]">/100</span>
              </div>
            </VarnaScoreHoverCard>
            <p className="text-[11px] text-[#6F848F] dark:text-[#8C9DA8] mt-2 font-light">
              Weighted composite portfolio rating
            </p>
          </Card>
        </section>

        {/* 4. Secondary Warning Banner */}
        <section className="mb-8">
          <div className="flex items-start gap-3.5 border-l-3 border-[#7A3F1E] bg-[#7A3F1E]/8 dark:bg-[#7A3F1E]/15 p-5 shadow-elevation-low rounded-r">
            <AlertTriangle className="w-5 h-5 text-[#7A3F1E] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-[#7A3F1E] dark:text-[#FAF6EE]/90 font-light leading-relaxed">
              <span className="font-medium uppercase tracking-wider text-[10px] block mb-1">
                Audit Verification Note
              </span>
              Bare Necessities has disclosed company operations; product formulation transparency in orders #4 and #5 is awaiting laboratory batch certificate. Evidence multiplier calibrated to Self-Reported (0.75×).
            </p>
          </div>
        </section>

        {/* 5. Spend by Product Category Section */}
        <Card variant="chart" className="mb-10 p-8 shadow-elevation-low">
          <div className="border-b border-[#6F848F]/15 dark:border-[#8C9DA8]/20 pb-4 mb-6">
            <h3 className="text-xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] uppercase tracking-tight">
              Spend by Product Category
            </h3>
            <p className="text-xs text-[#6F848F] dark:text-[#8C9DA8] mt-1 font-light tracking-wide">
              Capital distribution across verified ethical categories sourced from current suppliers.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left: Donut Chart */}
            <div className="relative w-72 h-72 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="supplier-pie-glow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#222326" floodOpacity="0.12" />
                    </filter>
                  </defs>
                  <Pie
                    data={CATEGORY_DATA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={3}
                    cornerRadius={3}
                    strokeWidth={0}
                    filter="url(#supplier-pie-glow)"
                  >
                    {CATEGORY_DATA.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Hole Labels */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] tracking-tighter">$40.0K</span>
                <span className="text-[8px] uppercase tracking-[0.22em] text-[#6F848F] dark:text-[#8C9DA8] mt-1">Total Spend</span>
              </div>
            </div>

            {/* Right: Custom Legend */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {CATEGORY_DATA.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-3.5 p-3.5 rounded-sm bg-[#DFD8C2]/25 dark:bg-[#1A1C22]/80 border border-[#6F848F]/10 dark:border-[#8C9DA8]/15 hover:border-[#6F848F]/25 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#222326] dark:text-[#FAF6EE] font-medium truncate">
                      {cat.name}
                    </p>
                    <p className="text-[11px] text-[#6F848F] dark:text-[#8C9DA8] font-light mt-0.5">
                      {formatSpend(cat.value)} &bull; {cat.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 6. Active Supplier Profiles (Horizontal Carousel Layout) */}
        <section className="space-y-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#6F848F]/25 dark:border-[#8C9DA8]/20 pb-3 gap-4">
            <div>
              <h3 className="text-2xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] uppercase tracking-tight">
                Active Supplier Profiles
              </h3>
              <p className="text-xs text-[#6F848F] dark:text-[#8C9DA8] mt-1 font-light tracking-wide">
                Detailed sustainability audits, official UN SDG badges, and evidence confidence gauges.
              </p>
            </div>

            {/* Carousel Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                className="w-10 h-10 bg-[#7A3F1E] dark:bg-[#FAF6EE] text-[#D8CFB8] dark:text-[#18191D] hover:bg-[#683315] dark:hover:bg-[#E8E2D1] flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                className="w-10 h-10 bg-[#7A3F1E] dark:bg-[#FAF6EE] text-[#D8CFB8] dark:text-[#18191D] hover:bg-[#683315] dark:hover:bg-[#E8E2D1] flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Carousel */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 no-scrollbar pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {suppliersData.map((supplier) => {
              const name = supplier.enterprise_name;
              const isUKHI = name.toLowerCase().includes("ukhi");
              const isBare = name.toLowerCase().includes("bare");
              const isKheoni = name.toLowerCase().includes("kheoni");

              // Specific SDG mapping per supplier to replace any placeholder '?'
              let sdgIds: number[] = supplier.sdg_alignments || [];
              if (sdgIds.length === 0) {
                if (isUKHI) {
                  sdgIds = [8, 9, 12, 16]; // Goal 8 Decent Work, 9 Innovation, 12 Responsible Consumption, 16 Peace & Justice
                } else if (isBare) {
                  sdgIds = [12, 13, 14, 15]; // Responsible consumption, Climate action, Life in water, Life on land
                } else if (isKheoni) {
                  sdgIds = [3, 8, 12, 15]; // Good health, Decent work, Consumption, Terrestrial ecology
                }
              }

              const confidenceEntry =
                (liveConfidenceData && liveConfidenceData[name]) ||
                SUPPLIER_CONFIDENCE_CHECKLISTS[name] ||
                (isUKHI ? SUPPLIER_CONFIDENCE_CHECKLISTS["UKHI India Private Limited"] : null);

              const confidencePct = confidenceEntry?.score ?? supplier.confidence_pct ?? (isUKHI ? 52 : isBare ? 61 : 11);
              const isVerified = confidencePct >= 60;

              return (
                <div
                  key={supplier.enterprise_id || name}
                  className="min-w-[90%] md:min-w-[62%] lg:min-w-[50%] snap-center shrink-0 flex"
                >
                  <SupplierProfileCard
                    name={name}
                    legalName={name}
                    logoPath={supplier.logo_path}
                    location={supplier.city ? `${supplier.city}, ${supplier.state}` : isUKHI ? "Pune, Maharashtra" : "Karnataka, India"}
                    dataTier={isVerified ? "verified" : "self-reported"}
                    varnaScore={supplier.final_varna_score ?? (isUKHI ? 56 : isBare ? 78 : 42)}
                    eScore={supplier.e_pillar_score ?? 60}
                    sScore={supplier.s_pillar_score ?? 55}
                    gScore={supplier.g_pillar_score ?? 50}
                    cScore={supplier.c_pillar_score ?? 45}
                    carbonScore={supplier.c_pillar_score ?? 45}
                    skuCount={isUKHI ? 4 : 2}
                    totalUnits={isUKHI ? 2400 : 1200}
                    confidenceScore={confidencePct}
                    confidenceColor={isVerified ? "#738678" : "#7A3F1E"}
                    confidenceDasharray={`${confidencePct}, 100`}
                    badges={supplier.badges || []}
                    tags={[]}
                    categoryBars={[
                      { label: "Environment", val: supplier.e_pillar_score ?? 60 },
                      { label: "Social", val: supplier.s_pillar_score ?? 55 },
                      { label: "Governance", val: supplier.g_pillar_score ?? 50 },
                      { label: "Carbon Impact", val: supplier.c_pillar_score ?? 45 },
                    ]}
                    barColorClass={isVerified ? "bg-[#738678]" : "bg-[#7A3F1E]"}
                    sdgIds={sdgIds}
                    liveConfidenceData={liveConfidenceData}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Varna Chat Assistant */}
      <ChatWidget dashboardData={liveConfidenceData} />
    </div>
  );
}
