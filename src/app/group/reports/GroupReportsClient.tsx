"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Loader2,
  Building,
  CheckCircle2,
  Sparkles,
  Search,
  ExternalLink,
  ShieldAlert,
  Leaf,
  Layers,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface HotelReportListItem {
  clientId: string;
  clientName: string;
  propertyType: string;
  city: string;
  country: string;
  varnaScore: number;
  band: string;
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number | null;
  totalSpend: number;
  totalOrders: number;
  co2eAvoidedKg: number;
  treesEquivalent: number;
  activeSuppliersCount: number;
  hasActivity: boolean;
}

export interface GroupReportsSummary {
  parentGroup: string;
  totalProperties: number;
  totalSpend: number;
  totalOrders: number;
  totalCo2eAvoidedKg: number;
  treesEquivalent: number;
  avgVarnaScore: number;
  avgBand: string;
}

interface GroupReportsClientProps {
  summary: GroupReportsSummary;
  hotels: HotelReportListItem[];
}

export default function GroupReportsClient({ summary, hotels }: GroupReportsClientProps) {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBand, setSelectedBand] = useState<string>("All");

  const bandOptions = ["All", "Varna Leader", "Advanced", "Emerging", "Foundational", "Not Ready"];

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const matchesSearch =
        h.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.propertyType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBand = selectedBand === "All" || h.band === selectedBand;
      return matchesSearch && matchesBand;
    });
  }, [hotels, searchQuery, selectedBand]);

  /**
   * Generates a PDF via /api/group/export-report, downloads it, AND opens it in a new tab.
   */
  const handleGenerateReport = async (clientId?: string, hotelName?: string) => {
    const isAll = !clientId || clientId === "ALL";
    const reportKey = isAll ? "ALL" : clientId;

    setGeneratingId(reportKey);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Open placeholder tab synchronously to bypass browser pop-up blockers
    let previewWindow: Window | null = null;
    try {
      previewWindow = window.open("about:blank", "_blank");
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Preparing Varna ESG Report...</title>
              <style>
                body {
                  margin: 0;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background-color: #FAF8F5;
                  color: #1A1F26;
                }
                .card {
                  text-align: center;
                  padding: 32px 40px;
                  background: white;
                  border-radius: 16px;
                  border: 1px solid #EAE5DC;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                  max-width: 420px;
                }
                .spinner {
                  width: 32px;
                  height: 32px;
                  border: 3px solid #EAE5DC;
                  border-top-color: #7A3F1E;
                  border-radius: 50%;
                  animation: spin 0.8s linear infinite;
                  margin: 0 auto 16px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                h2 { font-size: 18px; margin: 0 0 8px; color: #7A3F1E; font-weight: 600; }
                p { font-size: 13px; color: #6E7781; margin: 0; line-height: 1.5; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="spinner"></div>
                <h2>Varna Collective</h2>
                <p>Compiling audited sustainability disclosures and rendering high-resolution PDF for <strong>${
                  isAll ? "all group properties" : hotelName || clientId
                }</strong>...</p>
              </div>
            </body>
          </html>
        `);
      }
    } catch {
      // In case window.open fails synchronously, will attempt fallback
    }

    try {
      const endpoint = isAll
        ? `/api/group/export-report?all=true`
        : `/api/group/export-report?clientId=${encodeURIComponent(clientId)}`;

      const res = await fetch(endpoint);

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server returned HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);

      // 1. Open in new tab
      if (previewWindow && !previewWindow.closed) {
        previewWindow.location.href = blobUrl;
      } else {
        window.open(blobUrl, "_blank");
      }

      // 2. Trigger browser download
      const filename = isAll
        ? `varna-consolidated-group-report-${new Date().toISOString().slice(0, 10)}.pdf`
        : `varna-esg-report-${(hotelName || clientId).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;

      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = filename;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      setSuccessMessage(
        isAll
          ? "Consolidated Group Report generated successfully. Download started and opened in new tab."
          : `${hotelName || clientId} report generated successfully. Download started and opened in new tab.`
      );
    } catch (err: any) {
      console.error("[GroupReports] Generation failed:", err);
      if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
      }
      setErrorMessage(
        err?.message || "Failed to generate report PDF. Please verify connection and retry."
      );
    } finally {
      setGeneratingId(null);
    }
  };

  const bandBadgeColor = (band: string) => {
    switch (band) {
      case "Varna Leader":
        return "bg-[#556B55]/10 text-[#556B55] border-[#556B55]/25 dark:bg-[#556B55]/20 dark:text-[#8AA391]";
      case "Advanced":
        return "bg-[#6F848F]/10 text-[#6F848F] border-[#6F848F]/25 dark:bg-[#6F848F]/20 dark:text-[#93A9B8]";
      case "Emerging":
        return "bg-[#A89C82]/15 text-[#7A6B4E] border-[#A89C82]/30 dark:bg-[#A89C82]/20 dark:text-[#D4C8B0]";
      case "Foundational":
        return "bg-[#B85333]/10 text-[#B85333] border-[#B85333]/25 dark:bg-[#B85333]/20 dark:text-[#E07A57]";
      case "Not Ready":
        return "bg-red-500/10 text-red-600 border-red-500/25 dark:bg-red-500/20 dark:text-red-400";
      default:
        return "bg-black/5 text-[#6E7781] border-black/10 dark:bg-white/5 dark:text-[#8C9DA8]";
    }
  };

  const scorePillColor = (score: number) => {
    if (score >= 85) return "text-[#556B55] dark:text-[#8AA391]";
    if (score >= 70) return "text-[#6F848F] dark:text-[#93A9B8]";
    if (score >= 55) return "text-[#A89C82] dark:text-[#D4C8B0]";
    if (score >= 40) return "text-[#B85333] dark:text-[#E07A57]";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto font-sans">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-sans font-semibold tracking-[0.22em] text-[#B85333] dark:text-[#E07A57] flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-[#B85333]" />
            <span>EXECUTIVE DISCLOSURES · GRP-001 PORTFOLIO</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight uppercase">
            Group Reports &amp; Dossiers
          </h1>
          <p className="text-xs font-sans text-[#6E7781] dark:text-[#8C9DA8] mt-1 font-light max-w-2xl leading-relaxed">
            Generate board-ready ESG compliance documentation, individual property impact scorecards, and consolidated auditor-verified exports.
          </p>
        </div>

        {/* Global Group Export Shortcut */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#6E7781] dark:text-[#8C9DA8] hidden lg:inline-block">
            {hotels.length} Properties in Portfolio
          </span>
        </div>
      </header>

      {/* ── Status Banners (Feedback) ────────────────────────────────────────── */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-xs text-red-700 dark:text-red-400"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Report Generation Error</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-[#556B55]/10 dark:bg-[#556B55]/20 border border-[#556B55]/30 flex items-start gap-3 text-xs text-[#384A38] dark:text-[#8AA391]"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#556B55] dark:text-[#8AA391]" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Success</span>
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-[#556B55] dark:text-[#8AA391] hover:underline text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Banner: Generate All Hotels Consolidated Report ─────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7A3F1E]/95 via-[#5D2C12] to-[#2F3C52] text-white p-6 sm:p-8 shadow-card-light dark:shadow-elevation-dark-high border border-white/10">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[10.5px] font-sans font-semibold uppercase tracking-wider text-[#FAF6EE]">
              <Sparkles className="w-3 h-3 text-[#E07A57]" />
              <span>Consolidated Executive Dossier</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-tight">
              All Hotels Portfolio ESG Report
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">
              Generates a single multi-section PDF containing the executive portfolio rollup, group-level leaderboard, and full sustainability disclosures for all {summary.totalProperties} properties.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="bg-black/20 rounded-lg p-2.5 border border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">Properties</span>
                <span className="text-base sm:text-lg font-bold font-sans">{summary.totalProperties} Active</span>
              </div>
              <div className="bg-black/20 rounded-lg p-2.5 border border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">Total Spend</span>
                <span className="text-base sm:text-lg font-bold font-sans">₹{(summary.totalSpend / 100000).toFixed(2)}L</span>
              </div>
              <div className="bg-black/20 rounded-lg p-2.5 border border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">Avg. Varna</span>
                <span className="text-base sm:text-lg font-bold font-sans">{summary.avgVarnaScore.toFixed(1)}/100</span>
              </div>
              <div className="bg-black/20 rounded-lg p-2.5 border border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">CO2e Avoided</span>
                <span className="text-base sm:text-lg font-bold font-sans">{summary.totalCo2eAvoidedKg.toLocaleString("en-IN")} kg</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
            <button
              onClick={() => handleGenerateReport(undefined, "All Hotels")}
              disabled={generatingId !== null}
              className="
                w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl
                bg-[#FAF8F5] hover:bg-white text-[#7A3F1E]
                text-xs sm:text-sm font-sans font-semibold tracking-wide
                transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                cursor-pointer disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100
              "
              title="Generate and download complete group PDF"
            >
              {generatingId === "ALL" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#7A3F1E]" />
                  <span>Generating All Hotels Dossier...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#7A3F1E]" />
                  <span>Generate All Hotels Report (PDF)</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-white/60 font-light">
              Includes group rollup cover + detailed disclosures for all hotels
            </span>
          </div>
        </div>
      </div>

      {/* ── Individual Properties Section ────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15">
          <div>
            <h3 className="text-lg font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
              Individual Property Reports
            </h3>
            <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] font-light">
              Export dedicated 3-page sustainability audits for any individual hotel in the portfolio.
            </p>
          </div>

          {/* Search & Band Filter Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#6E7781] dark:text-[#8C9DA8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hotel or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#1A1F26] dark:text-[#FAF8F5] focus:outline-hidden focus:border-[#7A3F1E]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#6E7781] dark:text-[#8C9DA8]" />
              <select
                value={selectedBand}
                onChange={(e) => setSelectedBand(e.target.value)}
                aria-label="Filter by performance band"
                className="py-1.5 px-2.5 rounded-lg text-xs bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#1A1F26] dark:text-[#FAF8F5] focus:outline-hidden focus:border-[#7A3F1E]"
              >
                {bandOptions.map((b) => (
                  <option key={b} value={b}>
                    {b === "All" ? "All Bands" : b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Hotels Table / List */}
        {filteredHotels.length === 0 ? (
          <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-12 text-center shadow-xs">
            <Building className="w-8 h-8 text-[#6E7781] mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-sans font-medium text-[#1A1F26] dark:text-[#FAF8F5]">
              No properties found matching criteria
            </h4>
            <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] mt-1">
              Try adjusting your search terms or band filters.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl shadow-card-light dark:shadow-elevation-dark-low overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] dark:bg-[#18191D] border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 text-[10px] font-sans font-semibold uppercase tracking-wider text-[#6E7781] dark:text-[#8C9DA8]">
                    <th className="py-3 px-4">Hotel Property</th>
                    <th className="py-3 px-3">Location &amp; Type</th>
                    <th className="py-3 px-3 text-center">Varna Score</th>
                    <th className="py-3 px-3 text-center">Performance Band</th>
                    <th className="py-3 px-3 text-right">Spend (INR)</th>
                    <th className="py-3 px-3 text-center">Orders &amp; Partners</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE5DC] dark:divide-[#8C9DA8]/10 text-xs font-sans">
                  {filteredHotels.map((hotel) => {
                    const isCurrentGenerating = generatingId === hotel.clientId;

                    return (
                      <tr
                        key={hotel.clientId}
                        className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#252830]/40 transition-colors"
                      >
                        {/* Hotel Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] dark:bg-[#2A2D35] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 flex items-center justify-center font-bold text-[#7A3F1E] dark:text-[#E07A57] shrink-0 text-xs">
                              {hotel.clientName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium text-[#1A1F26] dark:text-[#FAF8F5] block">
                                {hotel.clientName}
                              </span>
                              <span className="text-[10px] font-mono text-[#6E7781] dark:text-[#8C9DA8]">
                                {hotel.clientId} · GRP-001 Portfolio
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Location & Property Type */}
                        <td className="py-3.5 px-3">
                          <span className="text-[#1A1F26] dark:text-[#FAF8F5] block">
                            {hotel.city}, {hotel.country}
                          </span>
                          <span className="text-[10.5px] text-[#6E7781] dark:text-[#8C9DA8]">
                            {hotel.propertyType}
                          </span>
                        </td>

                        {/* Varna Score */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex items-baseline gap-1">
                            <span className={`text-base font-bold font-sans ${scorePillColor(hotel.varnaScore)}`}>
                              {hotel.varnaScore.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-[#6E7781] dark:text-[#8C9DA8]">/100</span>
                          </div>
                        </td>

                        {/* Performance Band */}
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${bandBadgeColor(
                              hotel.band
                            )}`}
                          >
                            {hotel.band}
                          </span>
                        </td>

                        {/* Total Spend */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="font-semibold text-[#1A1F26] dark:text-[#FAF8F5] block">
                            ₹{(hotel.totalSpend / 100000).toFixed(2)}L
                          </span>
                          <span className="text-[10px] text-[#556B55] dark:text-[#8AA391]">
                            {hotel.co2eAvoidedKg.toLocaleString("en-IN")} kg CO2e saved
                          </span>
                        </td>

                        {/* Orders & Suppliers */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="text-[#1A1F26] dark:text-[#FAF8F5] font-medium block">
                            {hotel.totalOrders} Orders
                          </span>
                          <span className="text-[10px] text-[#6E7781] dark:text-[#8C9DA8]">
                            {hotel.activeSuppliersCount} verified suppliers
                          </span>
                        </td>

                        {/* Generate Report Button */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleGenerateReport(hotel.clientId, hotel.clientName)}
                            disabled={generatingId !== null}
                            className="
                              inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg
                              bg-[#7A3F1E] hover:bg-[#633318] dark:bg-[#9E5528] dark:hover:bg-[#83441D]
                              text-white text-xs font-semibold tracking-wide
                              transition-all duration-150 shadow-xs hover:shadow-sm cursor-pointer
                              disabled:opacity-60 disabled:cursor-wait active:scale-95
                            "
                            title={`Generate PDF report for ${hotel.clientName}`}
                          >
                            {isCurrentGenerating ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Generate Report</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
