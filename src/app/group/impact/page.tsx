"use client";

import React from "react";
import {
  Leaf,
  Trees,
  Car,
  Users,
  ShieldCheck,
  Download,
  Award,
  Heart,
  Globe,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import ProgressRing from "@/components/ui/ProgressRing";
import PillarBreakdownHoverCard from "@/components/ui/PillarBreakdownHoverCard";

export default function GroupImpactPage() {
  const pillarScores = {
    e: 62,
    s: 58,
    g: 66,
    c: 59,
  };

  const eSub = [
    { code: "E1", label: "Carbon Footprint Audit", value: 68, color: "#738678" },
    { code: "E2", label: "Sustainable Raw Materials", value: 56, color: "#738678" },
    { code: "E3", label: "Circularity & Waste Reduction", value: 61, color: "#738678" },
    { code: "E4", label: "Water Conservation & Recycling", value: 65, color: "#738678" },
    { code: "E5", label: "Non-Toxic & Chemical Safety", value: 60, color: "#738678" },
    { code: "E6", label: "Zero Waste Packaging Standards", value: 62, color: "#738678" },
  ];

  const sSub = [
    { code: "S1", label: "Fair Employment Contracts", value: 64, color: "#B85333" },
    { code: "S2", label: "Gender Inclusion & Equity", value: 59, color: "#B85333" },
    { code: "S3", label: "Fair Living Wage Compliance", value: 54, color: "#B85333" },
    { code: "S4", label: "Workplace Health & Safety", value: 57, color: "#B85333" },
  ];

  const gSub = [
    { code: "G1", label: "Legal & Regulatory Compliance", value: 69, color: "#6F848F" },
    { code: "G2", label: "Ethics & Responsible Sourcing", value: 63, color: "#6F848F" },
    { code: "G3", label: "Supply Chain Audit Transparency", value: 58, color: "#6F848F" },
  ];

  const cSub = [
    { code: "C1", label: "Craft Authenticity & Heritage", value: 65, color: "#A89C82" },
    { code: "C2", label: "Rare Skill Preservation", value: 59, color: "#A89C82" },
    { code: "C3", label: "Climate Vulnerability Mitigation", value: 62, color: "#A89C82" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto font-sans">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-5">
        <div>
          <div className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#B85333] dark:text-[#D4705A] mb-1 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-[#556B55]" />
            <span>PORTFOLIO SUSTAINABILITY &amp; SOCIAL IMPACT</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl font-medium tracking-tight text-[#1A1F26] dark:text-[#FAF8F5] uppercase">
            Group Impact Analytics
          </h1>
          <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] mt-1 font-light max-w-2xl leading-relaxed">
            Deep-dive environmental footprint, social livelihood metrics, governance standards, and carbon abatement across all properties.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-sans font-medium bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#1A1F26] dark:text-[#FAF8F5] hover:border-[#B85333]/40 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6F848F]" />
            <span>Export ESG Dossier</span>
          </button>
        </div>
      </header>

      {/* ── TOP ROW: 4 Signature SVG Circular Dials with Hover Breakdown Popovers ─────────────────────────── */}
      <section className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-2xl p-6 shadow-card-light dark:shadow-elevation-dark-low">
        <div className="border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#B85333]" />
            <h2 className="text-sm font-sans font-medium uppercase tracking-wider text-[#1A1F26] dark:text-[#FAF8F5]">
              Portfolio ESG &amp; Carbon Pillar Dials
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#6E7781] dark:text-[#8C9DA8]">
            Hover or focus any dial for sub-criteria breakdown
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2">
          <PillarBreakdownHoverCard
            pillarLabel="Environmental"
            pillarScore={pillarScores.e}
            pillarKey="E"
            color="#738678"
            items={eSub.map((i) => ({ code: i.code, name: i.label, score: i.value, color: i.color }))}
          >
            <div className="flex flex-col items-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <ProgressRing
                value={pillarScores.e}
                size={130}
                strokeWidth={9}
                color="#738678"
                label="Environmental (E1–E6)"
                delay={0.1}
              />
            </div>
          </PillarBreakdownHoverCard>

          <PillarBreakdownHoverCard
            pillarLabel="Social"
            pillarScore={pillarScores.s}
            pillarKey="S"
            color="#B85333"
            items={sSub.map((i) => ({ code: i.code, name: i.label, score: i.value, color: i.color }))}
          >
            <div className="flex flex-col items-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <ProgressRing
                value={pillarScores.s}
                size={130}
                strokeWidth={9}
                color="#B85333"
                label="Social Livelihood (S1–S4)"
                delay={0.2}
              />
            </div>
          </PillarBreakdownHoverCard>

          <PillarBreakdownHoverCard
            pillarLabel="Governance"
            pillarScore={pillarScores.g}
            pillarKey="G"
            color="#6F848F"
            items={gSub.map((i) => ({ code: i.code, name: i.label, score: i.value, color: i.color }))}
          >
            <div className="flex flex-col items-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <ProgressRing
                value={pillarScores.g}
                size={130}
                strokeWidth={9}
                color="#6F848F"
                label="Governance (G1–G3)"
                delay={0.3}
              />
            </div>
          </PillarBreakdownHoverCard>

          <PillarBreakdownHoverCard
            pillarLabel="Cultural"
            pillarScore={pillarScores.c}
            pillarKey="C"
            color="#A89C82"
            items={cSub.map((i) => ({ code: i.code, name: i.label, score: i.value, color: i.color }))}
          >
            <div className="flex flex-col items-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <ProgressRing
                value={pillarScores.c}
                size={130}
                strokeWidth={9}
                color="#A89C82"
                label="Carbon &amp; Culture (C1–C3)"
                delay={0.4}
              />
            </div>
          </PillarBreakdownHoverCard>
        </div>
      </section>

      {/* ── MIDDLE ROW: Environmental Carbon Abatement & Social Livelihood ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carbon Abatement Card */}
        <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-2xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3 mb-5">
              <Leaf className="w-4 h-4 text-[#738678]" />
              <h3 className="text-sm font-sans font-medium uppercase tracking-wider text-[#1A1F26] dark:text-[#FAF8F5]">
                Carbon Footprint Abatement
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#6E7781] dark:text-[#8C9DA8] block mb-1">
                  Total CO₂e Avoided (YTD)
                </span>
                <div className="text-4xl font-sans font-medium tracking-tight text-[#556B55] dark:text-[#738678]">
                  16,100 <span className="text-lg font-light text-[#6E7781]">kg CO₂e</span>
                </div>
                <p className="text-[11px] text-[#6E7781] dark:text-[#8C9DA8] mt-1 font-light">
                  Direct emissions eliminated through eco-packaging, organic toiletries, and local craft sourcing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20">
                  <div className="w-8 h-8 rounded-full bg-[#556B55]/15 text-[#556B55] flex items-center justify-center shrink-0">
                    <Trees className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-base font-mono font-medium text-[#1A1F26] dark:text-[#FAF8F5] block leading-none">
                      731
                    </span>
                    <span className="text-[10px] text-[#6E7781] font-light">Trees Planted</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20">
                  <div className="w-8 h-8 rounded-full bg-[#6F848F]/15 text-[#6F848F] flex items-center justify-center shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-base font-mono font-medium text-[#1A1F26] dark:text-[#FAF8F5] block leading-none">
                      65,980
                    </span>
                    <span className="text-[10px] text-[#6E7781] font-light">Car Kms Avoided</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 flex items-center justify-between text-xs text-[#6E7781]">
            <span>Carbon Intensity Reduction:</span>
            <span className="font-mono font-semibold text-[#556B55] dark:text-[#738678] bg-[#556B55]/10 px-2 py-0.5 rounded">
              -24.5% vs Baseline
            </span>
          </div>
        </div>

        {/* Social Metrics Card */}
        <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-2xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3 mb-5">
              <Heart className="w-4 h-4 text-[#B85333]" />
              <h3 className="text-sm font-sans font-medium uppercase tracking-wider text-[#1A1F26] dark:text-[#FAF8F5]">
                Social Livelihood Impact
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#6E7781] dark:text-[#8C9DA8] block mb-1">
                  Women Workforce
                </span>
                <span className="text-3xl font-sans font-medium text-[#B85333] dark:text-[#D4705A]">
                  68.5%
                </span>
                <span className="text-[10px] text-[#6E7781] block mt-1 font-light">
                  Artisanal &amp; Supply Chain
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#6E7781] dark:text-[#8C9DA8] block mb-1">
                  Living Wage Ratio
                </span>
                <span className="text-3xl font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
                  1.42x
                </span>
                <span className="text-[10px] text-[#556B55] block mt-1 font-semibold">
                  +42% Above Minimum
                </span>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-[#B85333]/10 border border-[#B85333]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#B85333]" />
                <div>
                  <span className="text-sm font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5] block">
                    310 Artisans Supported
                  </span>
                  <span className="text-[11px] text-[#6E7781] font-light">
                    Across 12 rural craft clusters in India &amp; UAE
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-[#B85333] bg-white dark:bg-[#1E2028] px-2.5 py-1 rounded-md border border-[#B85333]/30">
                Direct
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 flex items-center justify-between text-xs text-[#6E7781]">
            <span>Ethical Working Condition Index:</span>
            <span className="font-mono font-semibold text-[#1A1F26] dark:text-[#FAF8F5]">
              88% Verified
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: Governance & Cultural Heritage ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Governance Card */}
        <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-2xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6F848F]" />
                <h3 className="text-sm font-sans font-medium uppercase tracking-wider text-[#1A1F26] dark:text-[#FAF8F5]">
                  Governance &amp; Transparency
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#6E7781]">Group Avg: 66.0</span>
            </div>

            <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] font-light leading-relaxed mb-4">
              Comprehensive regulatory compliance, ethical sourcing policies, and supply chain audit transparency across all properties.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-center">
                <span className="text-[10px] font-mono uppercase text-[#6E7781] block">G1 Legal</span>
                <span className="text-xl font-bold font-mono text-[#6F848F]">69</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-center">
                <span className="text-[10px] font-mono uppercase text-[#6E7781] block">G2 Ethics</span>
                <span className="text-xl font-bold font-mono text-[#6F848F]">63</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-center">
                <span className="text-[10px] font-mono uppercase text-[#6E7781] block">G3 Audit</span>
                <span className="text-xl font-bold font-mono text-[#6F848F]">58</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 flex items-center justify-between text-xs text-[#6E7781]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#556B55]" />
              100% Tax &amp; GSTIN Verification
            </span>
            <span className="font-mono font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
              Audited
            </span>
          </div>
        </div>

        {/* Cultural & Heritage Card */}
        <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-2xl p-6 shadow-card-light dark:shadow-elevation-dark-low flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#A89C82]" />
                <h3 className="text-sm font-sans font-medium uppercase tracking-wider text-[#1A1F26] dark:text-[#FAF8F5]">
                  Cultural &amp; Heritage Integrity
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#6E7781]">Group Avg: 59.0</span>
            </div>

            <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] font-light leading-relaxed mb-4">
              Safeguarding rare artisan skills, traditional handloom techniques, and climate-vulnerable craft communities.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-center">
                <span className="text-[10px] font-mono uppercase text-[#6E7781] block">C1 Craft</span>
                <span className="text-xl font-bold font-mono text-[#A89C82]">65</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-center">
                <span className="text-[10px] font-mono uppercase text-[#6E7781] block">C2 Skills</span>
                <span className="text-xl font-bold font-mono text-[#A89C82]">59</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-center">
                <span className="text-[10px] font-mono uppercase text-[#6E7781] block">C3 Climate</span>
                <span className="text-xl font-bold font-mono text-[#A89C82]">62</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 flex items-center justify-between text-xs text-[#6E7781]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A89C82]" />
              Handloom &amp; Traditional Craft Protection
            </span>
            <span className="font-mono font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
