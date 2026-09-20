"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wallet, ShoppingBag, Award, Quote } from "lucide-react";
import Image from "next/image";
import VarnaScoreHoverCard from "@/components/ui/VarnaScoreHoverCard";
import ChatWidget from "@/components/ChatWidget";
import BrandWatermark from "@/components/ui/BrandWatermark";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import KPICard from "@/components/dashboard/KPICard";
import ImpactPillars from "@/components/dashboard/ImpactPillars";
import SpendByCategoryChart from "@/components/dashboard/SpendByCategoryChart";
import PortfolioMixChart from "@/components/dashboard/PortfolioMixChart";
import CarbonImpact from "@/components/dashboard/CarbonImpact";
import SocialImpact from "@/components/dashboard/SocialImpact";
import Card from "@/components/ui/Card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { DashboardData } from "@/lib/mock-data";

import ClientOverviewV2 from "@/components/dashboard/v2/ClientOverviewV2";
import ClientOrdersV2 from "@/components/dashboard/orders/v2/ClientOrdersV2";

export default function DashboardClient({ initialData }: { initialData: DashboardData | null }) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (!initialData) {
      router.push("/");
    } else {
      setData(initialData);
    }

    // Read ?section= query param from client side safely
    const params = new URLSearchParams(window.location.search);
    const sec = params.get("section");
    if (sec && ["overview", "suppliers", "orders", "impact"].includes(sec)) {
      setActiveSection(sec);
    }
  }, [initialData, router]);

  const handleSectionChange = (section: string) => {
    if (section === "algorithm") {
      router.push("/algorithm");
    } else {
      setActiveSection(section);
      window.history.pushState({}, "", `/dashboard?section=${section}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("varna_client");
    router.push("/");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#121316] transition-colors duration-300">
        <motion.div
          className="flex flex-col items-center gap-6 w-full max-w-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            <img src="/logo-light.svg" alt="Varna" className="block dark:hidden h-10 w-auto" />
            <img src="/logo-dark.svg" alt="Varna" className="hidden dark:block h-10 w-auto" />
          </div>
          <div className="w-full space-y-3">
            <div className="h-4 w-full rounded-none animate-shimmer" />
            <div className="h-4 w-3/4 mx-auto rounded-none animate-shimmer" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#7A3F1E] dark:text-[#8C9DA8] font-semibold mt-2">
            Synthesizing Procurement Intelligence...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const { client, summary, categorySpend, tierDistribution } = data;

  return (
    <div className="min-h-screen flex bg-ambient-mesh-light dark:bg-ambient-mesh-dark text-[#1A1F26] dark:text-[#FAF8F5] transition-colors duration-300 relative selection:bg-[#B85333] selection:text-white overflow-x-hidden">
      {/* Subtle brand crystal mark in page corner */}
      <BrandWatermark position="bottom-right" size={600} opacity={0.035} />

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main className="varna-main flex-1 ml-24 p-8 max-w-[1400px] overflow-x-hidden relative z-10">
        {activeSection !== "overview" && (
          <TopBar
            clientName={client.clientName}
            industry={client.industry}
            logoPath={client.logoPath}
            dashboardData={data}
            clientDetails={{
              "Industry Sector": client.industry,
              "Location": client.city && client.state ? `${client.city}, ${client.state}` : client.city || client.state,
              "Status": client.status || "Active",
              "Onboarding Date": client.onboardingDate,
              "Active Suppliers": summary?.totalSuppliers ? `${summary.totalSuppliers} Verified Enterprises` : undefined,
              "Total Spend": summary?.totalSpend ? `₹${summary.totalSpend.toLocaleString('en-IN')}` : undefined,
            }}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeSection === "overview" && (
              <ClientOverviewV2 data={data} />
            )}
            {activeSection === "suppliers" && (
              <SuppliersSection data={data} />
            )}
            {activeSection === "orders" && (
              <ClientOrdersV2 dashboardData={data} />
            )}
            {activeSection === "impact" && (
              <ImpactSection summary={summary} supplierImpactData={data.supplierImpactData} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Varna Chat Assistant */}
      <ChatWidget dashboardData={data} />
    </div>
  );
}

// ─────────────── Overview Section ───────────────

function OverviewSection({
  summary,
  categorySpend,
  tierDistribution,
  supplierImpactData,
}: {
  summary: DashboardData["summary"];
  categorySpend: DashboardData["categorySpend"];
  tierDistribution: DashboardData["tierDistribution"];
  supplierImpactData: DashboardData["supplierImpactData"];
}) {
  return (
    <div className="space-y-8">
      {/* 1. KPI Strip (Cols 1-3) & Editorial Card (Col 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Spend"
          value={summary.totalSpend}
          prefix="₹"
          icon={Wallet}
          accentColor="deep-clay"
          delay={0.05}
          subtitle="Across vetted ethical artisanal enterprises"
        />
        <KPICard
          title="Total Orders"
          value={summary.totalOrders}
          icon={ShoppingBag}
          accentColor="slate-mist"
          delay={0.1}
          subtitle={`Fulfilled by ${summary.totalSuppliers} verified craft groups`}
        />
        <KPICard
          title="Avg Varna Score"
          value={summary.avgVarnaScore}
          decimals={1}
          icon={Award}
          accentColor="sage-mineral"
          delay={0.15}
          subtitle={
            summary.avgVarnaScore >= 80 ? "Varna Leader rating certified" : "Advanced rating approved"
          }
          varnaScoreData={{
            score: Math.round(summary.avgVarnaScore),
            eScore: Math.round(summary.avgEScore),
            sScore: Math.round(summary.avgSScore),
            gScore: Math.round(summary.avgGScore),
            cScore: Math.round(summary.avgCScore),
            supplierName: "Portfolio Average",
          }}
        />

        {/* Col 4: Rich terracotta/brown background Editorial Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#8C5233] dark:bg-[#7A3F1E] text-white p-6 sm:p-7 rounded-none flex flex-col justify-center items-center text-center relative overflow-hidden shadow-card-light dark:shadow-elevation-dark-low border border-[#7A3F1E]/40"
        >
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
            <Quote className="w-32 h-32 text-white" />
          </div>
          <p className="font-serif italic text-white text-base sm:text-lg leading-relaxed relative z-10 font-normal">
            &ldquo;Products become purpose. Rooms become stories. Hotels become impact makers.&rdquo;
          </p>
        </motion.div>
      </div>

      {/* 2. Mid-Section Split Layout: Visuals + Circular Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column (Visual): Tall elegant card containing /assets/Dashboard_visual_2.svg */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#9BA9B4]/18 p-6 flex flex-col justify-center items-center overflow-hidden relative shadow-card-light dark:shadow-elevation-dark-low rounded-none min-h-[340px]"
        >
          <div className="w-full h-full relative min-h-[300px] flex items-center justify-center">
            <Image
              src="/assets/Dashboard_visual_2.svg"
              alt="Artisanal Amenities Visual"
              fill
              className="object-contain p-2 rounded-none"
            />
          </div>
        </motion.div>

        {/* Right Column (ESG Pillars): Existing circular E, S, G, C charts */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <ImpactPillars
            eScore={summary.avgEScore}
            sScore={summary.avgSScore}
            gScore={summary.avgGScore}
            cScore={summary.avgCScore}
            pillarBreakdown={summary.pillarBreakdown}
            delay={0.3}
          />
        </div>
      </div>

      {/* 3. Bottom Grid: Spend, Tiers, Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendByCategoryChart data={categorySpend} delay={0.35} />
        <PortfolioMixChart data={tierDistribution} delay={0.4} />
      </div>

      {/* Impact Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CarbonImpact
          totalCO2eAvoidedKg={summary.totalCO2eAvoidedKg}
          delay={0.45}
        />
        <SocialImpact
          artisansSupported={summary.totalArtisansSupported}
          womenWorkforcePercent={summary.womenWorkforcePercent}
          culturalScore={summary.avgCScore}
          wageRatio={supplierImpactData?.[0]?.wageRatio || 1.05}
          supplierImpactData={supplierImpactData}
          delay={0.5}
        />
      </div>
    </div>
  );
}

// ─────────────── Suppliers Section (Inside Dashboard) ───────────────

function SuppliersSection({ data }: { data: DashboardData }) {
  const tierColors: Record<string, string> = {
    Platinum: "text-[#7A3F1E] bg-[#7A3F1E]/15 border-[#7A3F1E]/30",
    Gold: "text-[#738678] bg-[#738678]/15 border-[#738678]/30",
    Silver: "text-[#6F848F] bg-[#6F848F]/15 border-[#6F848F]/30",
    Bronze: "text-[#2F3C52] dark:text-[#FAF6EE] bg-[#2F3C52]/15 border-[#2F3C52]/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start border-b border-[#6F848F]/25 dark:border-[#8C9DA8]/20 pb-3 mb-6">
        <h2 className="varna-section-h2 text-3xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] tracking-hero uppercase leading-none">
          Supplier Portfolio
        </h2>
        <p className="text-xs text-[#6F848F] dark:text-[#8C9DA8] mt-1 font-light tracking-wide">
          List of vetted artisanal enterprises and procurement performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.suppliers.map((supplier, idx) => (
          <Card key={supplier.enterpriseId} delay={idx * 0.05} variant="verified" hoverEffect={true}>
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-[#6F848F]/20 dark:border-[#8C9DA8]/15">
              <div>
                <h3 className="text-base font-sans font-medium uppercase tracking-tight text-[#222326] dark:text-[#FAF6EE]">
                  {supplier.enterpriseName}
                </h3>
                <p className="text-[11px] text-[#6F848F] dark:text-[#8C9DA8] font-light mt-0.5">
                  {supplier.city}, {supplier.state}
                </p>
              </div>
              <span
                className={`
                  text-[8px] font-semibold uppercase tracking-widest
                  px-2.5 py-0.5 border
                  ${tierColors[supplier.tier] || "text-[#6F848F] border-[#6F848F]/30"}
                `}
              >
                {supplier.tier}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4">
              <div>
                <p className="text-[9px] uppercase text-[#6F848F] dark:text-[#8C9DA8] tracking-widest font-light">Varna Score</p>
                <VarnaScoreHoverCard
                  score={supplier.varnaScore}
                  eScore={supplier.eScore}
                  sScore={supplier.sScore}
                  gScore={supplier.gScore}
                  cScore={supplier.cScore}
                  supplierName={supplier.enterpriseName}
                >
                  <p className="text-2xl font-sans font-medium text-[#7A3F1E] dark:text-[#FAF6EE] mt-0.5 cursor-help">
                    {supplier.varnaScore}
                  </p>
                </VarnaScoreHoverCard>
              </div>
              <div>
                <p className="text-[9px] uppercase text-[#6F848F] dark:text-[#8C9DA8] tracking-widest font-light">Total Spend</p>
                <p className="text-2xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] mt-0.5">
                  ₹{Math.round(supplier.totalSpend / 1000)}K
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-[#6F848F] dark:text-[#8C9DA8] tracking-widest font-light">Artisans Employed</p>
                <p className="text-xs font-semibold text-[#222326] dark:text-[#FAF6EE] mt-1">
                  {supplier.artisansEmployed || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-[#6F848F] dark:text-[#8C9DA8] tracking-widest font-light">Women Workforce</p>
                <p className="text-xs font-semibold text-[#222326] dark:text-[#FAF6EE] mt-1">
                  {supplier.womenPercent ? `${supplier.womenPercent}%` : "N/A"}
                </p>
              </div>
            </div>

            {/* Mini ESGC bar colored with brand colors */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-[#6F848F]/20 dark:border-[#8C9DA8]/15">
              {[
                { label: "E", value: supplier.eScore, color: "#738678" }, // sage-mineral
                { label: "S", value: supplier.sScore, color: "#7A3F1E" }, // deep-clay
                { label: "G", value: supplier.gScore, color: "#6F848F" }, // slate-mist
                { label: "C", value: supplier.cScore, color: "#2F3C52" }, // midnight-blue
              ].map((s) => (
                <div key={s.label} className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-semibold text-[#6F848F] dark:text-[#8C9DA8]">{s.label}</span>
                    <span className="text-[8px] text-[#6F848F] dark:text-[#8C9DA8] tabular-nums">{s.value}</span>
                  </div>
                  <div className="h-1 bg-[#6F848F]/20 dark:bg-[#18191D] rounded-none overflow-hidden">
                    <motion.div
                      className="h-full rounded-none"
                      style={{ backgroundColor: s.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.04 + 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────── Orders Section ───────────────

function OrdersSection({ summary }: { summary: DashboardData["summary"] }) {
  const orderStats = [
    { label: "Total Orders", value: summary.totalOrders, prefix: "", suffix: "" },
    { label: "Total Spend", value: summary.totalSpend, prefix: "₹", suffix: "" },
    { label: "Vetted Suppliers", value: summary.totalSuppliers, prefix: "", suffix: "" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start border-b border-[#6F848F]/25 dark:border-[#8C9DA8]/20 pb-3 mb-6">
        <h2 className="varna-section-h2 text-3xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] tracking-hero uppercase leading-none">
          Orders Overview
        </h2>
        <p className="text-xs text-[#6F848F] dark:text-[#8C9DA8] mt-1 font-light tracking-wide">
          Key performance indicators for orders, fulfillment transparency, and vendor tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {orderStats.map((stat, idx) => (
          <Card key={stat.label} delay={idx * 0.05} variant="hero" className="text-left relative overflow-hidden">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#8C9DA8] mb-2">
              {stat.label}
            </p>
            <div className="text-4xl sm:text-5xl font-sans font-medium tracking-hero text-[#222326] dark:text-[#FAF6EE]">
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                delay={idx * 0.05 + 0.15}
              />
            </div>
            <div className="mt-2 text-[11px] text-[#6F848F] dark:text-[#8C9DA8]/80 font-light">
              {stat.label === "Total Spend" ? "Certified sustainable procurement" : stat.label === "Total Orders" ? "Direct ethical fulfillment" : "Multi-tier certified enterprises"}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────── Impact Section ───────────────

function ImpactSection({
  summary,
  supplierImpactData,
}: {
  summary: DashboardData["summary"];
  supplierImpactData: DashboardData["supplierImpactData"];
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start border-b border-[#6F848F]/25 dark:border-[#8C9DA8]/20 pb-3 mb-6">
        <h2 className="varna-section-h2 text-3xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] tracking-hero uppercase leading-none">
          Sustainability Impact Intelligence
        </h2>
        <p className="text-xs text-[#6F848F] dark:text-[#8C9DA8] mt-1 font-light tracking-wide">
          Comprehensive review of verified ecological absorption, fair craft wages, and governance indices.
        </p>
      </div>

      <ImpactPillars
        eScore={summary.avgEScore}
        sScore={summary.avgSScore}
        gScore={summary.avgGScore}
        cScore={summary.avgCScore}
        pillarBreakdown={summary.pillarBreakdown}
        delay={0.1}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CarbonImpact
          totalCO2eAvoidedKg={summary.totalCO2eAvoidedKg}
          delay={0.2}
        />
        <SocialImpact
          artisansSupported={summary.totalArtisansSupported}
          womenWorkforcePercent={summary.womenWorkforcePercent}
          culturalScore={summary.avgCScore}
          wageRatio={supplierImpactData?.[0]?.wageRatio || 1.05}
          supplierImpactData={supplierImpactData}
          delay={0.25}
        />
      </div>
    </div>
  );
}
