"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Sidebar from "@/components/layout/Sidebar";
import BrandWatermark from "@/components/ui/BrandWatermark";
import Card from "@/components/ui/Card";
import FlowConnector from "@/components/ui/FlowConnector";
import { Sun, Moon, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function AlgorithmPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSectionChange = (section: string) => {
    if (section !== "algorithm") {
      if (section === "suppliers") {
        router.push("/dashboard/suppliers");
      } else {
        router.push(`/dashboard?section=${section}`);
      }
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("varna_client");
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-ambient-mesh-light dark:bg-ambient-mesh-dark text-[#222326] dark:text-[#FAF6EE] font-sans transition-colors duration-300 relative selection:bg-[#7A3F1E] selection:text-[#D8CFB8] overflow-x-hidden">
      {/* Subtle brand crystal mark in page corner */}
      <BrandWatermark position="bottom-right" size={600} opacity={0.04} />

      <Sidebar
        activeSection="algorithm"
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />

      <main className="varna-main flex-1 ml-24 relative z-10">
        {/* Floating Theme Toggle */}
        <div className="varna-algo-theme-toggle fixed top-8 right-8 z-50">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 border border-[#6F848F]/40 dark:border-[#8C9DA8]/20 text-[#222326] dark:text-[#FAF6EE] bg-[#E4DEC9]/80 dark:bg-[#22252B] backdrop-blur-md shadow-sm transition-colors hover:border-[#7A3F1E] cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* ── 1. HERO SECTION & DIAMOND FORMULA ARCHITECTURE ───────────────── */}
        <section className="pt-16 pb-20 px-8 sm:px-14 md:px-20 max-w-7xl mx-auto border-b border-[#6F848F]/25 dark:border-[#8C9DA8]/15">
          {/* Header Block: Clear vertical spacing, full-width, zero overlap */}
          <div className="flex flex-col items-start mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#7A3F1E] dark:text-[#FAF6EE]/80">
                The Varna Framework · Architecture &amp; Methodology
              </span>
              <span className="w-8 h-px bg-[#7A3F1E]/40 dark:bg-[#FAF6EE]/30" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] tracking-hero leading-tight mb-4 uppercase">
              The Varna Framework
            </h1>

            <p className="text-sm sm:text-base text-[#222326]/75 dark:text-[#FAF6EE]/75 max-w-3xl font-light leading-relaxed">
              India's first sustainability credentialing standard engineered specifically for small and micro enterprises. Built for producers that conventional ESG frameworks overlook, and for hospitality buyers who need verifiable integrity rather than a self-declared checkbox.
            </p>

            <span className="font-accent text-xl text-[#7A3F1E] dark:text-[#FAF6EE]/90 mt-2 select-none">
              quiet. slow. intentional.
            </span>
          </div>

          {/* ── Diamond Formula Diagram Section ─────────────────────────────────── */}
          <div className="w-full bg-[#E4DEC9] dark:bg-[#1D1F24] border border-[#6F848F]/30 dark:border-[#8C9DA8]/20 p-8 sm:p-12 shadow-elevation-mid dark:shadow-elevation-dark-mid relative rounded-lg">
            <div className="text-center mb-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6F848F] dark:text-[#FAF6EE]/70">
                Core Scoring Model · Convergent Diamond Architecture
              </p>
              <h3 className="text-2xl font-sans font-medium tracking-tight text-[#222326] dark:text-[#FAF6EE] mt-1 uppercase">
                Weight Distribution &amp; Synthesis
              </h3>
            </div>

            {/* Desktop Diamond SVG Connector Network + Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
              {/* Card 1: Impact (50%) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-lg border-t-4 border-t-[#738678] border border-[#6F848F]/20 dark:border-[#8C9DA8]/20 bg-[#DFD8C2]/60 dark:bg-[#22252B] p-6 flex flex-col justify-between relative group hover:border-[#738678]/60 transition-all shadow-elevation-low dark:shadow-elevation-dark-low hover:shadow-elevation-mid"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-[#738678] dark:text-[#829888]">
                      Pillar 01
                    </span>
                    <span className="text-3xl font-sans font-medium text-[#738678] dark:text-[#829888]">
                      50%
                    </span>
                  </div>
                  <h4 className="text-xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] mb-2 uppercase tracking-tight">
                    Impact
                  </h4>
                  <p className="text-xs text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light leading-relaxed">
                    Evaluates tangible operations across four balanced pillars: Environmental stewardship, Social equity, Governance compliance, and Cultural craft preservation.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#6F848F]/20 dark:border-[#8C9DA8]/15 flex flex-wrap gap-1.5">
                  {["Environmental", "Social", "Governance", "Cultural"].map((d) => (
                    <span key={d} className="text-[8px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#738678]/30 dark:border-[#829888]/30 bg-[#738678]/10 dark:bg-[#829888]/15 text-[#738678] dark:text-[#829888] font-medium">
                      {d}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Card 2: Readiness (30%) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="rounded-lg border-t-4 border-t-[#6F848F] border border-[#6F848F]/20 dark:border-[#8C9DA8]/20 bg-[#DFD8C2]/60 dark:bg-[#22252B] p-6 flex flex-col justify-between relative group hover:border-[#6F848F]/60 transition-all shadow-elevation-low dark:shadow-elevation-dark-low hover:shadow-elevation-mid"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-[#6F848F] dark:text-[#8C9DA8]">
                      Pillar 02
                    </span>
                    <span className="text-3xl font-sans font-medium text-[#6F848F] dark:text-[#8C9DA8]">
                      30%
                    </span>
                  </div>
                  <h4 className="text-xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] mb-2 uppercase tracking-tight">
                    Readiness
                  </h4>
                  <p className="text-xs text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light leading-relaxed">
                    Assesses management capability, operational tracking systems, traceable bills of materials, and long-term organizational capacity for sustainable production.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#6F848F]/20 dark:border-[#8C9DA8]/15 flex flex-wrap gap-1.5">
                  {["Traceability", "Management", "Systems", "Disclosures"].map((d) => (
                    <span key={d} className="text-[8px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#6F848F]/30 dark:border-[#8C9DA8]/30 bg-[#6F848F]/10 dark:bg-[#8C9DA8]/15 text-[#6F848F] dark:text-[#8C9DA8] font-medium">
                      {d}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Card 3: Risk (20%) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="rounded-lg border-t-4 border-t-[#7A3F1E] border border-[#6F848F]/20 dark:border-[#8C9DA8]/20 bg-[#DFD8C2]/60 dark:bg-[#22252B] p-6 flex flex-col justify-between relative group hover:border-[#7A3F1E]/60 transition-all shadow-elevation-low dark:shadow-elevation-dark-low hover:shadow-elevation-mid"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-[#7A3F1E] dark:text-[#944D25]">
                      Pillar 03
                    </span>
                    <span className="text-3xl font-sans font-medium text-[#7A3F1E] dark:text-[#944D25]">
                      20%
                    </span>
                  </div>
                  <h4 className="text-xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] mb-2 uppercase tracking-tight">
                    Risk
                  </h4>
                  <p className="text-xs text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light leading-relaxed">
                    Evaluates regulatory compliance status, documentation validity, and adverse issues. Calibrated starting at 100 with deductions applied only for verified infractions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#6F848F]/20 dark:border-[#8C9DA8]/15 flex flex-wrap gap-1.5">
                  {["Compliance", "Verification", "Integrity", "Labor Law"].map((d) => (
                    <span key={d} className="text-[8px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#7A3F1E]/30 dark:border-[#944D25]/30 bg-[#7A3F1E]/10 dark:bg-[#944D25]/15 text-[#7A3F1E] dark:text-[#944D25] font-medium">
                      {d}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Convergence Arrow & Final Score Node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mt-8 flex flex-col items-center"
            >
              <FlowConnector direction="vertical" length={36} color="#7A3F1E" className="mb-2" />
              
              <div className="w-full max-w-md rounded-xl border border-[#7A3F1E]/40 dark:border-[#8C9DA8]/25 bg-gradient-to-b from-[#E4DEC9] to-[#DFD8C2] dark:from-[#262B34] dark:to-[#1E2127] p-7 text-center shadow-elevation-mid dark:shadow-elevation-dark-mid relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#738678] via-[#7A3F1E] to-[#6F848F] dark:from-[#829888] dark:via-[#944D25] dark:to-[#8C9DA8]" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#7A3F1E] dark:text-[#FAF6EE]/90">
                  Weighted Mathematical Synthesis
                </span>
                <h3 className="text-3xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] tracking-tight uppercase my-1.5">
                  Final Varna Score (100)
                </h3>
                <p className="text-[11px] text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light">
                  (0.50 × Impact) + (0.30 × Readiness) + (0.20 × Risk)
                </p>
                <div className="mt-3.5 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#738678] dark:text-[#829888] font-semibold px-3 py-1 rounded-full bg-[#738678]/10 dark:bg-[#829888]/15 border border-[#738678]/25 dark:border-[#829888]/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Determines MSME Performance Band &amp; Procurement Tier</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── 2. SECTION 1 · THE THREE PRINCIPLES ──────────────────────────── */}
        <section id="section-1" className="scroll-mt-28 py-20 px-8 sm:px-14 md:px-20 max-w-7xl mx-auto border-b border-[#6F848F]/25 dark:border-[#8C9DA8]/15">
          <div className="text-center mb-12">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#6F848F] dark:text-[#FAF6EE]/70 block mb-2">
              Section 1 · Foundational Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] uppercase tracking-tight">
              The Three Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="editorial">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#7A3F1E] dark:text-[#FAF6EE]/70 mb-3 block">
                Principle 01
              </span>
              <h3 className="text-2xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] mb-3 uppercase tracking-tight">
                Objective
              </h3>
              <p className="text-sm text-[#222326]/75 dark:text-[#FAF6EE]/75 font-light leading-relaxed">
                Every score is rooted in empirical, verifiable operational inputs mapped to transparent scoring rubrics: never subjective assessor impressions or vanity narratives.
              </p>
            </Card>

            <Card variant="editorial">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#7A3F1E] dark:text-[#FAF6EE]/70 mb-3 block">
                Principle 02
              </span>
              <h3 className="text-2xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] mb-3 uppercase tracking-tight">
                Calibrated
              </h3>
              <p className="text-sm text-[#222326]/75 dark:text-[#FAF6EE]/75 font-light leading-relaxed">
                Scoring algorithms scale dynamically based on enterprise category, employee headcount, annual revenue, and operating tenure. Micro artisans are never penalized for lacking corporate ESG compliance officers.
              </p>
            </Card>

            <Card variant="editorial">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#7A3F1E] dark:text-[#FAF6EE]/70 mb-3 block">
                Principle 03
              </span>
              <h3 className="text-2xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] mb-3 uppercase tracking-tight">
                Developmental
              </h3>
              <p className="text-sm text-[#222326]/75 dark:text-[#FAF6EE]/75 font-light leading-relaxed">
                A Varna rating is a baseline trajectory, not a static verdict. Every assessment automatically yields a prioritized improvement roadmap guiding suppliers toward the Leader tier.
              </p>
            </Card>
          </div>
        </section>

        {/* ── 3. SECTION 2 · THE FORMULA BREAKDOWN (with scroll-mt-28) ──────── */}
        <section
          id="section-2"
          className="scroll-mt-28 py-20 px-8 sm:px-14 md:px-20 max-w-7xl mx-auto border-b border-[#6F848F]/25 dark:border-[#8C9DA8]/15"
        >
          <div className="mb-12">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#6F848F] dark:text-[#FAF6EE]/70 block mb-2">
              Section 2 · Mathematical Framework
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] uppercase tracking-tight">
              The Formula Breakdown
            </h2>
            <p className="text-sm text-[#222326]/75 dark:text-[#FAF6EE]/75 max-w-2xl font-light mt-2">
              How individual indicators are audited, aggregated, and balanced into the final enterprise rating.
            </p>
          </div>

          <div className="space-y-6">
            <Card variant="default" className="border-l-4 border-l-[#738678]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-[#738678]/40 bg-[#738678]/10 flex items-center justify-center text-xl font-sans font-medium text-[#738678] dark:text-[#829888] flex-shrink-0">
                    50%
                  </div>
                  <div>
                    <h4 className="text-lg font-sans font-medium uppercase tracking-tight text-[#222326] dark:text-[#FAF6EE]">
                      Impact Dimension
                    </h4>
                    <p className="text-xs text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light mt-1">
                      Direct measurements of environmental efficiency, carbon emissions avoided, artisanal living wages, and cultural heritage protection.
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs font-sans text-[#6F848F] dark:text-[#8C9DA8] uppercase tracking-wider font-medium">
                  Impact Score = (E × 0.35) + (S × 0.35) + (G × 0.15) + (C × 0.15)
                </div>
              </div>
            </Card>

            <Card variant="default" className="border-l-4 border-l-[#6F848F]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-[#6F848F]/40 bg-[#6F848F]/10 flex items-center justify-center text-xl font-sans font-medium text-[#6F848F] dark:text-[#8C9DA8] flex-shrink-0">
                    30%
                  </div>
                  <div>
                    <h4 className="text-lg font-sans font-medium uppercase tracking-tight text-[#222326] dark:text-[#FAF6EE]">
                      Readiness Dimension
                    </h4>
                    <p className="text-xs text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light mt-1">
                      Verification of inventory tracking protocols, supply-chain transparency, worker safety standards, and operational resilience.
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs font-sans text-[#6F848F] dark:text-[#8C9DA8] uppercase tracking-wider font-medium">
                  Readiness Score = Sum of Audited Operational Controls
                </div>
              </div>
            </Card>

            <Card variant="default" className="border-l-4 border-l-[#7A3F1E]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-[#7A3F1E]/40 bg-[#7A3F1E]/10 flex items-center justify-center text-xl font-sans font-medium text-[#7A3F1E] dark:text-[#944D25] flex-shrink-0">
                    20%
                  </div>
                  <div>
                    <h4 className="text-lg font-sans font-medium uppercase tracking-tight text-[#222326] dark:text-[#FAF6EE]">
                      Risk Dimension
                    </h4>
                    <p className="text-xs text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light mt-1">
                      Legal compliance standing (GSTIN, Udyam MSME status, statutory labor adherence). Begins at 100 and applies formulaic point deductions.
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs font-sans text-[#6F848F] dark:text-[#8C9DA8] uppercase tracking-wider font-medium">
                  Risk Score = 100 − Deductions for Confirmed Gaps
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 4. SECTION 3 · THE MULTIPLIER EFFECT (Calculation Pipeline) ──── */}
        <section id="section-3" className="scroll-mt-28 py-20 px-8 sm:px-14 md:px-20 max-w-7xl mx-auto border-b border-[#6F848F]/25 dark:border-[#8C9DA8]/15">
          <div className="text-center mb-14">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#6F848F] dark:text-[#FAF6EE]/70 block mb-2">
              Section 3 · Data Quality Multipliers
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] uppercase tracking-tight">
              The Evidence Multiplier Pipeline
            </h2>
            <p className="text-sm text-[#222326]/75 dark:text-[#FAF6EE]/75 max-w-2xl mx-auto font-light mt-2">
              How evidentiary confidence scales raw scores down, incentivizing verified audits over unverified claims.
            </p>
          </div>

          {/* 5-Step Pipeline Strip */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-16">
            {/* Step 01 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full md:w-auto flex-1 p-4 border border-[#6F848F]/30 dark:border-[#8C9DA8]/20 bg-[#E4DEC9] dark:bg-[#22252B] rounded-lg text-center shadow-elevation-low dark:shadow-elevation-dark-low"
            >
              <span className="text-[8px] font-semibold uppercase tracking-widest text-[#6F848F] dark:text-[#8C9DA8] block mb-1">Step 01</span>
              <h5 className="text-sm font-sans font-medium uppercase text-[#222326] dark:text-[#FAF6EE]">Actual Data</h5>
              <p className="text-[10px] text-[#6F848F] dark:text-[#FAF6EE]/60 mt-1 font-light">Metrics &amp; Invoices</p>
            </motion.div>

            <FlowConnector direction="horizontal" length={28} color="#7A3F1E" className="hidden md:block" />
            <FlowConnector direction="vertical" length={20} color="#7A3F1E" className="md:hidden" />

            {/* Step 02 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="w-full md:w-auto flex-1 p-4 border border-[#6F848F]/30 dark:border-[#8C9DA8]/20 bg-[#E4DEC9] dark:bg-[#22252B] rounded-lg text-center shadow-elevation-low dark:shadow-elevation-dark-low"
            >
              <span className="text-[8px] font-semibold uppercase tracking-widest text-[#6F848F] dark:text-[#8C9DA8] block mb-1">Step 02</span>
              <h5 className="text-sm font-sans font-medium uppercase text-[#222326] dark:text-[#FAF6EE]">Band Lookup</h5>
              <p className="text-[10px] text-[#6F848F] dark:text-[#FAF6EE]/60 mt-1 font-light">MSME Thresholds</p>
            </motion.div>

            <FlowConnector direction="horizontal" length={28} color="#7A3F1E" className="hidden md:block" />
            <FlowConnector direction="vertical" length={20} color="#7A3F1E" className="md:hidden" />

            {/* Step 03 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="w-full md:w-auto flex-1 p-4 border border-[#6F848F]/30 dark:border-[#8C9DA8]/20 bg-[#E4DEC9] dark:bg-[#22252B] rounded-lg text-center shadow-elevation-low dark:shadow-elevation-dark-low"
            >
              <span className="text-[8px] font-semibold uppercase tracking-widest text-[#6F848F] dark:text-[#8C9DA8] block mb-1">Step 03</span>
              <h5 className="text-sm font-sans font-medium uppercase text-[#222326] dark:text-[#FAF6EE]">Raw Score</h5>
              <p className="text-[10px] text-[#6F848F] dark:text-[#FAF6EE]/60 mt-1 font-light">Linear Map (0–100)</p>
            </motion.div>

            <FlowConnector direction="horizontal" length={28} color="#7A3F1E" className="hidden md:block" />
            <FlowConnector direction="vertical" length={20} color="#7A3F1E" className="md:hidden" />

            {/* Step 04 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="w-full md:w-auto flex-1 p-4 border border-[#7A3F1E]/60 dark:border-[#944D25]/40 bg-[#E4DEC9] dark:bg-[#22252B] rounded-lg text-center shadow-elevation-low dark:shadow-elevation-dark-low"
            >
              <span className="text-[8px] font-semibold uppercase tracking-widest text-[#7A3F1E] dark:text-[#944D25] block mb-1">Step 04</span>
              <h5 className="text-sm font-sans font-medium uppercase text-[#7A3F1E] dark:text-[#FAF6EE]">Multiplier</h5>
              <p className="text-[10px] text-[#6F848F] dark:text-[#FAF6EE]/60 mt-1 font-light">0.50× · 0.75× · 1.00×</p>
            </motion.div>

            <FlowConnector direction="horizontal" length={28} color="#7A3F1E" className="hidden md:block" />
            <FlowConnector direction="vertical" length={20} color="#7A3F1E" className="md:hidden" />

            {/* Step 05 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="w-full md:w-auto flex-1 p-4 border-2 border-[#738678] dark:border-[#829888] bg-[#E4DEC9] dark:bg-[#22252B] rounded-lg text-center shadow-elevation-mid dark:shadow-elevation-dark-mid"
            >
              <span className="text-[8px] font-semibold uppercase tracking-widest text-[#738678] dark:text-[#829888] block mb-1">Step 05</span>
              <h5 className="text-sm font-sans font-medium uppercase text-[#738678] dark:text-[#829888]">Effective</h5>
              <p className="text-[10px] text-[#738678] dark:text-[#829888] mt-1 font-light">Verified Score</p>
            </motion.div>
          </div>

          {/* Evidence Quality Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 border border-[#7A3F1E]/40 dark:border-[#8C9DA8]/20 bg-[#E4DEC9] dark:bg-[#22252B] rounded-lg shadow-elevation-low dark:shadow-elevation-dark-low">
              <div className="text-3xl font-sans font-medium text-[#7A3F1E] dark:text-[#944D25] mb-2">0.50×</div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#222326] dark:text-[#FAF6EE] mb-1">
                None / Proxy Data
              </h5>
              <p className="text-xs text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light leading-relaxed">
                Metric is estimated using regional averages or industry proxies without primary receipts.
              </p>
            </div>

            <div className="p-6 border border-[#6F848F]/40 dark:border-[#8C9DA8]/20 bg-[#E4DEC9] dark:bg-[#22252B] rounded-lg shadow-elevation-low dark:shadow-elevation-dark-low">
              <div className="text-3xl font-sans font-medium text-[#6F848F] dark:text-[#8C9DA8] mb-2">0.75×</div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#222326] dark:text-[#FAF6EE] mb-1">
                Self-Reported
              </h5>
              <p className="text-xs text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light leading-relaxed">
                Data is signed and declared by enterprise management but awaiting third-party verification.
              </p>
            </div>

            <div className="p-6 border border-[#738678]/40 dark:border-[#8C9DA8]/20 bg-[#E4DEC9] dark:bg-[#22252B] rounded-lg shadow-elevation-low dark:shadow-elevation-dark-low">
              <div className="text-3xl font-sans font-medium text-[#738678] dark:text-[#829888] mb-2">1.00×</div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#222326] dark:text-[#FAF6EE] mb-1">
                Third-Party Verified
              </h5>
              <p className="text-xs text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light leading-relaxed">
                Backed by active certificates, third-party audit reports, and verified traceability slips.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="font-accent text-2xl md:text-3xl text-[#7A3F1E] dark:text-[#FAF6EE]/90 select-none">
              "The score is not a judgment. It is a calculation."
            </p>
          </div>
        </section>

        {/* ── 5. SECTION 4 · PERFORMANCE BANDS ─────────────────────────────── */}
        <section id="section-4" className="scroll-mt-28 py-20 px-8 sm:px-14 md:px-20 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#6F848F] dark:text-[#FAF6EE]/70 block mb-2">
              Section 4 · Classification Scale
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-medium text-[#222326] dark:text-[#FAF6EE] uppercase tracking-tight">
              Performance Bands
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                title: "Varna Leader",
                range: "85–100",
                color: "border-l-[#738678]",
                textColor: "text-[#738678] dark:text-[#829888]",
                desc: "Industry-leading ESG operations, third-party verified evidence, full traceability.",
              },
              {
                title: "Advanced",
                range: "70–84",
                color: "border-l-[#6F848F]",
                textColor: "text-[#6F848F] dark:text-[#8C9DA8]",
                desc: "High compliance, verifiable environmental & living wage tracking, consistent reporting.",
              },
              {
                title: "Emerging",
                range: "55–69",
                color: "border-l-[#A89C82]",
                textColor: "text-[#5C5238] dark:text-warm-stone",
                desc: "Foundational practices in place; actively building formalized sustainability documentation.",
              },
              {
                title: "Foundational",
                range: "40–54",
                color: "border-l-[#7A3F1E]",
                textColor: "text-[#7A3F1E] dark:text-[#944D25]",
                desc: "Core statutory compliance established; requires technical assistance to scale impact metrics.",
              },
              {
                title: "Not Ready",
                range: "<40",
                color: "border-l-[#7A3F1E]/60",
                textColor: "text-[#7A3F1E]/80 dark:text-[#944D25]/80",
                desc: "Compliance or disclosure gaps identified; not approved for enterprise procurement catalog.",
              },
            ].map((band) => (
              <div
                key={band.title}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 border-l-4 ${band.color} bg-[#E4DEC9] dark:bg-[#22252B] border border-[#6F848F]/25 dark:border-[#8C9DA8]/15 shadow-elevation-low dark:shadow-elevation-dark-low rounded-lg gap-2`}
              >
                <div>
                  <h4 className={`text-xl font-sans font-medium uppercase tracking-tight ${band.textColor}`}>
                    {band.title}
                  </h4>
                  <p className="text-xs text-[#222326]/70 dark:text-[#FAF6EE]/70 font-light mt-0.5">
                    {band.desc}
                  </p>
                </div>
                <span className="text-sm font-sans tracking-widest uppercase font-semibold text-[#222326]/80 dark:text-[#FAF6EE]/90 whitespace-nowrap">
                  {band.range}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
