"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wallet, ShoppingBag, Award } from "lucide-react";
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
    if (sec && ["overview", "orders", "impact"].includes(sec)) {
      setActiveSection(sec);
    }
  }, [initialData, router]);

  const handleSectionChange = (section: string) => {
    if (section === "suppliers") {
      router.push("/dashboard/suppliers");
    } else if (section === "algorithm") {
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
      <div className="min-h-screen flex items-center justify-center bg-[#D8CFB8] dark:bg-[#222326] transition-colors duration-300">
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
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#7A3F1E] dark:text-[#D8CFB8]/70 font-semibold mt-2">
            Synthesizing Procurement Intelligence...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const { client, summary, categorySpend, tierDistribution } = data;

  return (
    <div className="min-h-screen flex bg-[#D8CFB8] dark:bg-[#222326] text-[#222326] dark:text-[#D8CFB8] transition-colors duration-300 relative selection:bg-[#7A3F1E] selection:text-[#D8CFB8] overflow-x-hidden">
      {/* Subtle brand crystal mark in page corner */}
      <BrandWatermark position="bottom-right" size={600} opacity={0.035} />

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main className="flex-1 ml-24 p-8 max-w-[1400px] overflow-x-hidden relative z-10">
        <TopBar clientName={client.clientName} industry={client.industry} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeSection === "overview" && (
              <OverviewSection
                summary={summary}
                categorySpend={categorySpend}
                tierDistribution={tierDistribution}
                supplierImpactData={data.supplierImpactData}
              />
            )}
            {activeSection === "suppliers" && (
              <SuppliersSection data={data} />
            )}
            {activeSection === "orders" && (
              <OrdersSection summary={summary} />
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
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
      </div>

      {/* Impact Pillars with Custom Radial Gauges */}
      <ImpactPillars
        eScore={summary.avgEScore}
        sScore={summary.avgSScore}
        gScore={summary.avgGScore}
        cScore={summary.avgCScore}
        pillarBreakdown={summary.pillarBreakdown}
        delay={0.25}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendByCategoryChart data={categorySpend} delay={0.3} />
        <PortfolioMixChart data={tierDistribution} delay={0.35} />
      </div>

      {/* Impact Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CarbonImpact
          totalCO2eAvoidedKg={summary.totalCO2eAvoidedKg}
          delay={0.4}
        />
        <SocialImpact
          artisansSupported={summary.totalArtisansSupported}
          womenWorkforcePercent={summary.womenWorkforcePercent}
          culturalScore={summary.avgCScore}
          wageRatio={supplierImpactData?.[0]?.wageRatio || 1.05}
          supplierImpactData={supplierImpactData}
          delay={0.45}
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
    Bronze: "text-[#2F3C52] dark:text-[#D8CFB8] bg-[#2F3C52]/15 border-[#2F3C52]/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start border-b border-[#6F848F]/25 dark:border-[#2F3C52] pb-3 mb-6">
        <h2 className="text-3xl font-serif text-[#222326] dark:text-[#D8CFB8] tracking-hero uppercase leading-none">
          Supplier Portfolio
        </h2>
        <p className="text-xs text-[#6F848F] dark:text-[#D8CFB8]/60 mt-1 font-light tracking-wide">
          List of vetted artisanal enterprises and procurement performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.suppliers.map((supplier, idx) => (
          <Card key={supplier.enterpriseId} delay={idx * 0.05} variant="verified" hoverEffect={true}>
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-[#6F848F]/20">
              <div>
                <h3 className="text-base font-serif uppercase tracking-tight text-[#222326] dark:text-[#D8CFB8]">
                  {supplier.enterpriseName}
                </h3>
                <p className="text-[11px] text-[#6F848F] font-light mt-0.5">
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
                <p className="text-[9px] uppercase text-[#6F848F] tracking-widest font-light">Varna Score</p>
                <VarnaScoreHoverCard
                  score={supplier.varnaScore}
                  eScore={supplier.eScore}
                  sScore={supplier.sScore}
                  gScore={supplier.gScore}
                  cScore={supplier.cScore}
                  supplierName={supplier.enterpriseName}
                >
                  <p className="text-2xl font-serif text-[#7A3F1E] dark:text-[#D8CFB8] font-light mt-0.5 cursor-help">
                    {supplier.varnaScore}
                  </p>
                </VarnaScoreHoverCard>
              </div>
              <div>
                <p className="text-[9px] uppercase text-[#6F848F] tracking-widest font-light">Total Spend</p>
                <p className="text-2xl font-serif text-[#222326] dark:text-[#D8CFB8] font-light mt-0.5">
                  ₹{Math.round(supplier.totalSpend / 1000)}K
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-[#6F848F] tracking-widest font-light">Artisans Employed</p>
                <p className="text-xs font-semibold text-[#222326] dark:text-[#D8CFB8] mt-1">
                  {supplier.artisansEmployed || "—"}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-[#6F848F] tracking-widest font-light">Women Workforce</p>
                <p className="text-xs font-semibold text-[#222326] dark:text-[#D8CFB8] mt-1">
                  {supplier.womenPercent ? `${supplier.womenPercent}%` : "—"}
                </p>
              </div>
            </div>

            {/* Mini ESGC bar colored with brand colors */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-[#6F848F]/20">
              {[
                { label: "E", value: supplier.eScore, color: "#738678" }, // sage-mineral
                { label: "S", value: supplier.sScore, color: "#7A3F1E" }, // deep-clay
                { label: "G", value: supplier.gScore, color: "#6F848F" }, // slate-mist
                { label: "C", value: supplier.cScore, color: "#2F3C52" }, // midnight-blue
              ].map((s) => (
                <div key={s.label} className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-semibold text-[#6F848F]">{s.label}</span>
                    <span className="text-[8px] text-[#6F848F] tabular-nums">{s.value}</span>
                  </div>
                  <div className="h-1 bg-[#6F848F]/20 rounded-none overflow-hidden">
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
      <div className="flex flex-col items-start border-b border-[#6F848F]/25 dark:border-[#2F3C52] pb-3 mb-6">
        <h2 className="text-3xl font-serif text-[#222326] dark:text-[#D8CFB8] tracking-hero uppercase leading-none">
          Orders Overview
        </h2>
        <p className="text-xs text-[#6F848F] dark:text-[#D8CFB8]/60 mt-1 font-light tracking-wide">
          Key performance indicators for orders, fulfillment transparency, and vendor tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {orderStats.map((stat, idx) => (
          <Card key={stat.label} delay={idx * 0.05} variant="dense" className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#D8CFB8]/60 mb-2">
              {stat.label}
            </p>
            <div className="text-3xl sm:text-4xl font-serif font-light tracking-tighter text-[#222326] dark:text-[#D8CFB8]">
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                delay={idx * 0.05 + 0.15}
              />
            </div>
          </Card>
        ))}
      </div>

      <Card
        delay={0.3}
        hoverEffect={false}
        className="p-12 text-center bg-[#DFD8C2]/40 dark:bg-[#222326]/60 border-dashed border-[#6F848F]/30 dark:border-[#2F3C52]"
      >
        <div className="flex flex-col items-center gap-3.5 max-w-md mx-auto">
          <div className="w-12 h-12 border border-[#6F848F]/30 flex items-center justify-center text-[#6F848F]">
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h4 className="text-sm font-semibold tracking-wider uppercase text-[#222326] dark:text-[#D8CFB8]">
            Direct ERP Fulfillment Link Active
          </h4>
          <p className="text-xs text-[#6F848F] leading-relaxed font-light">
            Live order tracking, delivery waybills, and batch emission logs are synced continuously through your enterprise procurement gateway.
          </p>
        </div>
      </Card>
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
      <div className="flex flex-col items-start border-b border-[#6F848F]/25 dark:border-[#2F3C52] pb-3 mb-6">
        <h2 className="text-3xl font-serif text-[#222326] dark:text-[#D8CFB8] tracking-hero uppercase leading-none">
          Sustainability Impact Intelligence
        </h2>
        <p className="text-xs text-[#6F848F] dark:text-[#D8CFB8]/60 mt-1 font-light tracking-wide">
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
