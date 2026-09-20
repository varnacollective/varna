"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import Sidebar from "@/components/layout/Sidebar";
import BrandWatermark from "@/components/ui/BrandWatermark";
import { Sun, Moon, ArrowRight } from "lucide-react";

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
      } else if (section === "orders") {
        router.push("/dashboard/orders");
      } else if (section === "impact") {
        router.push("/dashboard/impact");
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
    <div className="min-h-screen flex bg-[#F4F1EA] dark:bg-[#0F1115] text-[#1A1F26] dark:text-[#EFECE6] font-sans transition-colors duration-300 relative selection:bg-[#7D3F1E] selection:text-white overflow-x-hidden">
      {/* Subtle brand crystal mark in page corner */}
      <BrandWatermark position="bottom-right" size={600} opacity={0.035} />

      {/* Sidebar navigation */}
      <Sidebar
        activeSection="algorithm"
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="varna-main flex-1 ml-24 p-4 lg:p-8 relative z-10">
        {/* Constrained Max-Width Container (max-w-[1200px]) */}
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Top Header Bar with Title Tag & Theme Switcher Button */}
          <div className="flex items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.18em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
                Enterprise Portal | Methodology &amp; Standard
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="
                p-2.5 rounded-full border border-black/10 dark:border-white/15
                bg-white dark:bg-[#181B20] text-[#1A1F26] dark:text-[#EFECE6]
                shadow-xs transition-colors hover:border-[#7D3F1E] dark:hover:border-[#E07A57]
                cursor-pointer shrink-0
              "
              title="Toggle light/dark theme"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#E07A57]" strokeWidth={1.8} />
              ) : (
                <Moon className="w-4 h-4 text-[#7D3F1E]" strokeWidth={1.8} />
              )}
            </button>
          </div>

          {/* ── SECTION 1: TOP HEADER BANNER & IMAGE 1 ───────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left (Cols 1-8): Warm Beige Card */}
            <div className="lg:col-span-8 bg-[#F0EBE1] dark:bg-[#1E2126] border border-[#E7E2D6] dark:border-[#2A2F37] rounded-2xl p-7 lg:p-10 flex flex-col justify-center min-h-[220px]">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs uppercase tracking-[0.16em] font-semibold text-[#6F6A61] dark:text-[#9A948A]">
                  The Framework
                </span>
                <span className="varna-script-text text-lg lg:text-xl text-[#7D3F1E] dark:text-[#F1E6C8] font-normal">
                  quiet. slow. intentional.
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#1A1F26] dark:text-[#EFECE6] uppercase tracking-wide leading-tight mb-3">
                THE VARNA FRAMEWORK
              </h1>

              <p className="text-sm lg:text-[15px] text-[#5B564E] dark:text-[#C2BCB0] font-normal leading-relaxed max-w-2xl">
                India&apos;s first sustainability credentialing standard engineered specifically for small and micro enterprises. Built for producers that conventional ESG frameworks overlook, and for hospitality buyers who need verifiable integrity rather than a self-declared checkbox.
              </p>
            </div>

            {/* Right (Cols 9-12): Image Container 1 (Clean render, NO text overlay) */}
            <div className="lg:col-span-4 rounded-2xl overflow-hidden min-h-[180px] lg:min-h-[220px] relative border border-[#E7E2D6] dark:border-[#2A2F37] bg-[#181B20]">
              <Image
                src="/assets/framework1.jpg"
                alt="Framework Concept"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* ── SECTION 2: THE THREE PILLARS (50%, 30%, 20%) ─────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Impact (50%) */}
            <div className="bg-white dark:bg-[#181B20] border border-[#E7E2D6] dark:border-[#2A2F37] rounded-2xl p-6 lg:p-7 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E7E2D6] dark:border-[#2A2F37]">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#6F6A61] dark:text-[#9A948A]">
                      Pillar 01
                    </span>
                    <h3 className="text-xl font-medium text-[#1A1F26] dark:text-[#EFECE6] mt-0.5">
                      Impact
                    </h3>
                  </div>

                  <span className="text-3xl font-light text-[#7D3F1E] dark:text-[#E07A57] tabular-nums">
                    50%
                  </span>
                </div>

                <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] leading-relaxed mt-3">
                  Measures environmental absorption, fair craft wages, cultural preservation, and raw material circularity.
                </p>
              </div>

              {/* Bottom Muted Tag Pills */}
              <div className="pt-2">
                {["Environmental", "Social", "Governance", "Cultural"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#F4F1EA] dark:bg-[#2A2F37] text-[#5B564E] dark:text-[#C2BCB0] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-xs mr-2 mb-2 inline-block font-medium border border-black/5 dark:border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 2: Readiness (30%) */}
            <div className="bg-white dark:bg-[#181B20] border border-[#E7E2D6] dark:border-[#2A2F37] rounded-2xl p-6 lg:p-7 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E7E2D6] dark:border-[#2A2F37]">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#6F6A61] dark:text-[#9A948A]">
                      Pillar 02
                    </span>
                    <h3 className="text-xl font-medium text-[#1A1F26] dark:text-[#EFECE6] mt-0.5">
                      Readiness
                    </h3>
                  </div>

                  <span className="text-3xl font-light text-[#6E8471] dark:text-[#9DB4A0] tabular-nums">
                    30%
                  </span>
                </div>

                <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] leading-relaxed mt-3">
                  Evaluates operational systems, supply chain traceability, management protocols, and transparent disclosures.
                </p>
              </div>

              {/* Bottom Muted Tag Pills */}
              <div className="pt-2">
                {["Traceability", "Management", "Systems", "Disclosures"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#F4F1EA] dark:bg-[#2A2F37] text-[#5B564E] dark:text-[#C2BCB0] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-xs mr-2 mb-2 inline-block font-medium border border-black/5 dark:border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 3: Risk (20%) */}
            <div className="bg-white dark:bg-[#181B20] border border-[#E7E2D6] dark:border-[#2A2F37] rounded-2xl p-6 lg:p-7 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E7E2D6] dark:border-[#2A2F37]">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#6F6A61] dark:text-[#9A948A]">
                      Pillar 03
                    </span>
                    <h3 className="text-xl font-medium text-[#1A1F26] dark:text-[#EFECE6] mt-0.5">
                      Risk
                    </h3>
                  </div>

                  <span className="text-3xl font-light text-[#6F8391] dark:text-[#93A9B8] tabular-nums">
                    20%
                  </span>
                </div>

                <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] leading-relaxed mt-3">
                  Assesses statutory compliance, labor law adherence, audit verification, and legal integrity indicators.
                </p>
              </div>

              {/* Bottom Muted Tag Pills */}
              <div className="pt-2">
                {["Compliance", "Verification", "Integrity", "Labor law"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#F4F1EA] dark:bg-[#2A2F37] text-[#5B564E] dark:text-[#C2BCB0] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-xs mr-2 mb-2 inline-block font-medium border border-black/5 dark:border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION 3: FINAL VARNA SCORE BAR ───────────────────────────── */}
          <div className="bg-[#36424A] dark:bg-[#222B32] text-white rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
            <div>
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/70 block">
                Weighted synthesis
              </span>
              <h2 className="text-2xl lg:text-3xl font-serif font-normal uppercase tracking-wider text-white mt-0.5">
                FINAL VARNA SCORE
              </h2>
            </div>

            <div className="text-left md:text-right space-y-1">
              <div className="text-base sm:text-lg font-mono font-medium text-[#F4EACF] tracking-wide">
                (0.50 × Impact) + (0.30 × Readiness) + (0.20 × Risk)
              </div>
              <p className="text-xs text-white/80 font-normal">
                Out of 100. Sets the performance band and verified benchmark tier.
              </p>
            </div>
          </div>

          {/* ── SECTION 4: PRINCIPLES & IMAGE 2 ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left (Cols 1-7): White Card */}
            <div className="lg:col-span-7 bg-white dark:bg-[#181B20] border border-[#E7E2D6] dark:border-[#2A2F37] p-7 lg:p-9 rounded-2xl flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-serif font-normal text-[#1A1F26] dark:text-[#EFECE6] uppercase tracking-wide mb-6 pb-3 border-b border-[#E7E2D6] dark:border-[#2A2F37]">
                  The three principles
                </h2>

                <div className="space-y-6">
                  {/* Item 01 */}
                  <div className="flex items-start gap-4">
                    <span className="text-sm font-mono font-semibold text-[#7D3F1E] dark:text-[#E07A57] shrink-0 mt-0.5">
                      01
                    </span>
                    <div>
                      <h4 className="text-base font-medium text-[#1A1F26] dark:text-[#EFECE6]">
                        Objective
                      </h4>
                      <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] leading-relaxed mt-1">
                        Grounded in empirical data points, third-party certificates, and verified documentation rather than unverified self-assertions.
                      </p>
                    </div>
                  </div>

                  {/* Item 02 */}
                  <div className="flex items-start gap-4">
                    <span className="text-sm font-mono font-semibold text-[#7D3F1E] dark:text-[#E07A57] shrink-0 mt-0.5">
                      02
                    </span>
                    <div>
                      <h4 className="text-base font-medium text-[#1A1F26] dark:text-[#EFECE6]">
                        Calibrated
                      </h4>
                      <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] leading-relaxed mt-1">
                        Tailored specifically for micro, small, and artisanal craft producers, recognizing legitimate resource constraints without compromising standards.
                      </p>
                    </div>
                  </div>

                  {/* Item 03 */}
                  <div className="flex items-start gap-4">
                    <span className="text-sm font-mono font-semibold text-[#7D3F1E] dark:text-[#E07A57] shrink-0 mt-0.5">
                      03
                    </span>
                    <div>
                      <h4 className="text-base font-medium text-[#1A1F26] dark:text-[#EFECE6]">
                        Developmental
                      </h4>
                      <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] leading-relaxed mt-1">
                        Provides actionable pathways for continuous improvement, guiding suppliers through evidence upgrades and tier progression over time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right (Cols 8-12): Image Container 2 (Clean render, NO text overlay) */}
            <div className="lg:col-span-5 rounded-2xl overflow-hidden min-h-[300px] relative border border-[#E7E2D6] dark:border-[#2A2F37] bg-[#181B20]">
              <Image
                src="/assets/framework2.jpg"
                alt="Craftsmanship"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* ── SECTION 5: THE EVIDENCE MULTIPLIER PIPELINE ─────────────────── */}
          <div className="space-y-4">
            <div className="pb-1">
              <h2 className="text-xl font-medium text-[#1A1F26] dark:text-[#EFECE6] tracking-tight">
                The Evidence Multiplier Pipeline
              </h2>
              <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] mt-0.5 font-normal">
                How evidence confidence adjusts raw pillar scores to ensure verified data integrity.
              </p>
            </div>

            {/* Top Row: 5-Step Flow Diagram */}
            <div className="flex flex-row items-center justify-between gap-2 overflow-x-auto pb-2 min-w-[700px]">
              {[
                { step: "Step 01", label: "Actual data" },
                { step: "Step 02", label: "Band lookup" },
                { step: "Step 03", label: "Raw score" },
                { step: "Step 04", label: "Evidence multiplier" },
                { step: "Step 05", label: "Effective score" },
              ].map((s, idx, arr) => (
                <div key={s.step} className="flex items-center gap-2 flex-1">
                  <div className="bg-white dark:bg-[#181B20] border border-[#E7E2D6] dark:border-[#2A2F37] px-4 py-3 rounded-xl shadow-2xs flex-1 text-center">
                    <span className="text-[10px] uppercase font-semibold text-[#7D3F1E] dark:text-[#E07A57] block">
                      {s.step}
                    </span>
                    <span className="text-xs font-medium text-[#1A1F26] dark:text-[#EFECE6] mt-0.5 block">
                      {s.label}
                    </span>
                  </div>

                  {idx < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-[#6F6A61] dark:text-[#9A948A] shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Row: Multiplier Cards (3 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
              {/* Card 1: 0.50x */}
              <div className="bg-white dark:bg-[#181B20] border border-[#E7E2D6] dark:border-[#2A2F37] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-[#E7E2D6] dark:border-[#2A2F37]">
                    <span className="text-xs font-semibold text-[#1A1F26] dark:text-[#EFECE6]">
                      Proxy Data
                    </span>
                    <span className="text-3xl font-light text-[#6F8391] dark:text-[#93A9B8] tabular-nums font-mono">
                      0.50×
                    </span>
                  </div>
                  <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] mt-3 leading-relaxed">
                    None or proxy data. Unverified claims carry a 50% discount multiplier until documentation is submitted.
                  </p>
                </div>
              </div>

              {/* Card 2: 0.75x */}
              <div className="bg-white dark:bg-[#181B20] border border-[#E7E2D6] dark:border-[#2A2F37] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-[#E7E2D6] dark:border-[#2A2F37]">
                    <span className="text-xs font-semibold text-[#1A1F26] dark:text-[#EFECE6]">
                      Self-Reported
                    </span>
                    <span className="text-3xl font-light text-[#7D3F1E] dark:text-[#E07A57] tabular-nums font-mono">
                      0.75×
                    </span>
                  </div>
                  <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] mt-3 leading-relaxed">
                    Self-reported disclosures with internal documentation on file carry a 75% evidence weight.
                  </p>
                </div>
              </div>

              {/* Card 3: 1.00x */}
              <div className="bg-white dark:bg-[#181B20] border border-[#E7E2D6] dark:border-[#2A2F37] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-[#E7E2D6] dark:border-[#2A2F37]">
                    <span className="text-xs font-semibold text-[#1A1F26] dark:text-[#EFECE6]">
                      Third-Party Verified
                    </span>
                    <span className="text-3xl font-light text-[#55705A] dark:text-[#9DB4A0] tabular-nums font-mono">
                      1.00×
                    </span>
                  </div>
                  <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] mt-3 leading-relaxed">
                    Third-party audited certifications, statutory filings, and direct laboratory test reports carry full 100% weight.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 6: PERFORMANCE BANDS ───────────────────────────────── */}
          <div className="bg-white dark:bg-[#181B20] rounded-2xl p-7 lg:p-9 border border-[#E7E2D6] dark:border-[#2A2F37] space-y-6">
            <div className="pb-3 border-b border-[#E7E2D6] dark:border-[#2A2F37] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-[#1A1F26] dark:text-[#EFECE6]">
                  Performance Bands
                </h2>
                <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] mt-0.5 font-normal">
                  Standardized rating scale assigned based on effective Varna Score.
                </p>
              </div>
            </div>

            {/* Top Segmented Color Bar (5 segments: Grey, Beige, Olive, Brown, Slate) */}
            <div className="h-3 w-full rounded-full overflow-hidden flex items-center gap-1 bg-black/5 dark:bg-white/10 p-0.5">
              <div className="h-full w-[40%] bg-[#6F8391] rounded-l-full" title="Not Ready (<40)" />
              <div className="h-full w-[15%] bg-[#A89C82]" title="Foundational (40-54)" />
              <div className="h-full w-[15%] bg-[#55705A]" title="Emerging (55-69)" />
              <div className="h-full w-[15%] bg-[#7D3F1E]" title="Advanced (70-84)" />
              <div className="h-full w-[15%] bg-[#2B3A55] rounded-r-full" title="Varna Leader (85-100)" />
            </div>

            {/* Stacked Band Rating List */}
            <div className="divide-y divide-[#E7E2D6] dark:divide-[#2A2F37]">
              {/* Band 1 */}
              <div className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-xs bg-[#2B3A55]" />
                  <span className="font-semibold text-[#1A1F26] dark:text-[#EFECE6]">
                    Varna Leader
                  </span>
                </div>
                <span className="font-mono text-xs font-medium text-[#6F6A61] dark:text-[#9A948A]">
                  85–100
                </span>
              </div>

              {/* Band 2 */}
              <div className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-xs bg-[#7D3F1E]" />
                  <span className="font-semibold text-[#1A1F26] dark:text-[#EFECE6]">
                    Advanced
                  </span>
                </div>
                <span className="font-mono text-xs font-medium text-[#6F6A61] dark:text-[#9A948A]">
                  70–84
                </span>
              </div>

              {/* Band 3 */}
              <div className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-xs bg-[#55705A]" />
                  <span className="font-semibold text-[#1A1F26] dark:text-[#EFECE6]">
                    Emerging
                  </span>
                </div>
                <span className="font-mono text-xs font-medium text-[#6F6A61] dark:text-[#9A948A]">
                  55–69
                </span>
              </div>

              {/* Band 4 */}
              <div className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-xs bg-[#A89C82]" />
                  <span className="font-semibold text-[#1A1F26] dark:text-[#EFECE6]">
                    Foundational
                  </span>
                </div>
                <span className="font-mono text-xs font-medium text-[#6F6A61] dark:text-[#9A948A]">
                  40–54
                </span>
              </div>

              {/* Band 5 */}
              <div className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-xs bg-[#6F8391]" />
                  <span className="font-semibold text-[#1A1F26] dark:text-[#EFECE6]">
                    Not Ready
                  </span>
                </div>
                <span className="font-mono text-xs font-medium text-[#6F6A61] dark:text-[#9A948A]">
                  UNDER 40
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
