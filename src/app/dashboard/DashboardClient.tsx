"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Wallet,
  ShoppingBag,
  Award,
} from "lucide-react";
import VarnaScoreHoverCard from "@/components/ui/VarnaScoreHoverCard";
import ChatWidget from "@/components/ChatWidget";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import KPICard from "@/components/dashboard/KPICard";
import ImpactPillars from "@/components/dashboard/ImpactPillars";
import SpendByCategoryChart from "@/components/dashboard/SpendByCategoryChart";
import PortfolioMixChart from "@/components/dashboard/PortfolioMixChart";
import CarbonImpact from "@/components/dashboard/CarbonImpact";
import SocialImpact from "@/components/dashboard/SocialImpact";
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
      <div className="min-h-screen flex items-center justify-center bg-warm-stone dark:bg-[#17181A] transition-colors duration-300">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-8 h-8 text-deep-clay dark:text-warm-stone animate-spin" />
          <p className="text-xs uppercase tracking-widest text-slate-mist dark:text-warm-stone/50 font-light">
            Loading Sustainability Intel...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const { client, summary, categorySpend, tierDistribution } = data;

  return (
    <div className="min-h-screen flex bg-warm-stone dark:bg-[#17181A] text-carbon-ink dark:text-warm-stone transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main className="flex-1 ml-24 p-8 max-w-[1400px] overflow-x-hidden">
        <TopBar clientName={client.clientName} industry={client.industry} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
          subtitle="Across all ethical suppliers"
        />
        <KPICard
          title="Total Orders"
          value={summary.totalOrders}
          icon={ShoppingBag}
          accentColor="slate-mist"
          delay={0.1}
          subtitle={`Fulfilled by ${summary.totalSuppliers} groups`}
        />
        <KPICard
          title="Avg Varna Score"
          value={summary.avgVarnaScore}
          decimals={1}
          icon={Award}
          accentColor="sage-mineral"
          delay={0.15}
          subtitle={
            summary.avgVarnaScore >= 80 ? "Premium sustainability rating" : "Approved sustainability rating"
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

      {/* Impact Pillars */}
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

// ─────────────── Suppliers Section ───────────────

import Card from "@/components/ui/Card";

function SuppliersSection({ data }: { data: DashboardData }) {
  // Brand color tags for Tiers
  const tierColors: Record<string, string> = {
    Platinum: "text-deep-clay bg-deep-clay/10 border-deep-clay/20",
    Gold: "text-sage-mineral bg-sage-mineral/10 border-sage-mineral/20",
    Silver: "text-slate-mist bg-slate-mist/10 border-slate-mist/20",
    Bronze: "text-carbon-ink dark:text-warm-stone bg-warm-stone/20 dark:bg-warm-stone/10 border-warm-stone/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start border-b border-slate-mist/25 dark:border-midnight-blue pb-3 mb-6">
        <h2 className="text-2xl font-serif font-light text-carbon-ink dark:text-warm-stone tracking-tighter">
          Supplier Portfolio
        </h2>
        <p className="text-xs text-slate-mist dark:text-warm-stone/50 mt-1 font-light tracking-wide">
          List of vetted artisanal enterprises and procurement performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.suppliers.map((supplier, idx) => (
          <Card key={supplier.enterpriseId} delay={idx * 0.05} className="group" hoverEffect={true}>
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-mist/10 dark:border-midnight-blue/50">
              <div>
                <h3 className="text-sm font-semibold text-carbon-ink dark:text-warm-stone">
                  {supplier.enterpriseName}
                </h3>
                <p className="text-[11px] text-slate-mist dark:text-warm-stone/50 mt-0.5 font-light">
                  {supplier.city}, {supplier.state}
                </p>
              </div>
              <span
                className={`
                  text-[9px] font-semibold uppercase tracking-widest
                  px-2.5 py-1 rounded-none border
                  ${tierColors[supplier.tier] || "text-slate-mist border-slate-mist/30"}
                `}
              >
                {supplier.tier}
              </span>
            </div>

              <div className="grid grid-cols-2 gap-4 my-4">
              <div>
                <p className="text-[9px] uppercase text-slate-mist dark:text-warm-stone/50 tracking-widest font-light">Varna Score</p>
                <VarnaScoreHoverCard
                  score={supplier.varnaScore}
                  eScore={supplier.eScore}
                  sScore={supplier.sScore}
                  gScore={supplier.gScore}
                  cScore={supplier.cScore}
                  supplierName={supplier.enterpriseName}
                >
                  <p className="text-xl font-serif text-deep-clay dark:text-warm-stone font-light mt-0.5 cursor-help">{supplier.varnaScore}</p>
                </VarnaScoreHoverCard>
              </div>
              <div>
                <p className="text-[9px] uppercase text-slate-mist dark:text-warm-stone/50 tracking-widest font-light">Total Spend</p>
                <p className="text-xl font-serif text-carbon-ink dark:text-warm-stone font-light mt-0.5">₹{(supplier.totalSpend / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-slate-mist dark:text-warm-stone/50 tracking-widest font-light">Artisans Employed</p>
                <p className="text-xs font-semibold text-carbon-ink dark:text-warm-stone mt-1">{supplier.artisansEmployed || "—"}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-slate-mist dark:text-warm-stone/50 tracking-widest font-light">Women Workforce</p>
                <p className="text-xs font-semibold text-carbon-ink dark:text-warm-stone mt-1">{supplier.womenPercent ? `${supplier.womenPercent}%` : "—"}</p>
              </div>
            </div>

            {/* Mini ESGC bar colored with brand colors */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-slate-mist/10 dark:border-midnight-blue/50">
              {[
                { label: "E", value: supplier.eScore, color: "#738678" }, // sage-mineral
                { label: "S", value: supplier.sScore, color: "#7A3F1E" }, // deep-clay
                { label: "G", value: supplier.gScore, color: "#6F848F" }, // slate-mist
                { label: "C", value: supplier.cScore, color: "#2F3C52" }, // midnight-blue
              ].map((s) => (
                <div key={s.label} className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-semibold text-slate-mist dark:text-warm-stone/50">{s.label}</span>
                    <span className="text-[8px] text-slate-mist dark:text-warm-stone/50 tabular-nums">{s.value}</span>
                  </div>
                  <div className="h-1 bg-warm-stone/30 dark:bg-black/20 rounded-none overflow-hidden">
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

import AnimatedCounter from "@/components/ui/AnimatedCounter";

function OrdersSection({ summary }: { summary: DashboardData["summary"] }) {
  const orderStats = [
    { label: "Total Orders", value: summary.totalOrders, prefix: "", suffix: "" },
    { label: "Total Spend", value: summary.totalSpend, prefix: "₹", suffix: "" },
    { label: "Vetted Suppliers", value: summary.totalSuppliers, prefix: "", suffix: "" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start border-b border-slate-mist/25 dark:border-midnight-blue pb-3 mb-6">
        <h2 className="text-2xl font-serif font-light text-carbon-ink dark:text-warm-stone tracking-tighter">
          Orders Overview
        </h2>
        <p className="text-xs text-slate-mist dark:text-warm-stone/50 mt-1 font-light tracking-wide">
          Key performance indicators for orders and fulfillment metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {orderStats.map((stat, idx) => (
          <Card key={stat.label} delay={idx * 0.05} className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-mist dark:text-warm-stone/60 mb-2">
              {stat.label}
            </p>
            <div className="text-3xl font-sans font-light tracking-tight text-carbon-ink dark:text-warm-stone">
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

      <Card delay={0.3} hoverEffect={false} className="p-12 text-center bg-warm-stone/10 border-dashed border-slate-mist/30 dark:border-midnight-blue/50">
        <div className="flex flex-col items-center gap-3.5 max-w-md mx-auto">
          <ShoppingBag className="w-8 h-8 text-slate-mist/70" strokeWidth={1.2} />
          <h4 className="text-sm font-semibold tracking-wider uppercase text-carbon-ink dark:text-warm-stone">Fulfillment System Connection</h4>
          <p className="text-xs text-slate-mist dark:text-warm-stone/60 leading-relaxed font-light">
            Real-time dispatch schedules and direct shipping tracking integrations will appear once connected to your ERP node.
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
      <div className="flex flex-col items-start border-b border-slate-mist/25 dark:border-midnight-blue pb-3 mb-6">
        <h2 className="text-2xl font-serif font-light text-carbon-ink dark:text-warm-stone tracking-tighter">
          Sustainability Impact Reports
        </h2>
        <p className="text-xs text-slate-mist dark:text-warm-stone/50 mt-1 font-light tracking-wide">
          Overview of environmental, social, and cultural metrics achieved through ethical procurement.
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
