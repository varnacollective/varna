"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  FileCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ExternalLink,
  Search,
  RefreshCw,
  Building2,
  Filter,
  Eye,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Link2,
  Copy,
  Check,
  X,
} from "lucide-react";

interface Certificate {
  id: string | number;
  partner_name: string;
  certificate_type: string;
  drive_file_id: string;
  drive_webview_link: string;
  status?: string;
  created_at?: string;
  [key: string]: any;
}

export default function SuperadminCertificatesPage() {
  const supabase = createClient();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Pending" | "Verified">("ALL");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Generate Upload Link modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const openModal = () => {
    setPartnerName("");
    setDriveLink("");
    setGeneratedUrl(null);
    setCopied(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setGeneratedUrl(null);
    setCopied(false);
  };

  const handleGenerateLink = () => {
    if (!partnerName.trim() || !driveLink.trim()) return;
    const url = `${window.location.origin}/upload-certificate?partner=${encodeURIComponent(partnerName.trim())}&folder=${encodeURIComponent(driveLink.trim())}`;
    setGeneratedUrl(url);
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select the input text
    }
  };

  // Fetch certificates from Supabase table partner_certificates
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("partner_certificates")
        .select("*");

      if (error) {
        console.error("Error fetching partner_certificates:", error);
        setToastMessage({
          type: "error",
          text: `Failed to load certificates: ${error.message}`,
        });
      } else {
        const rows: Certificate[] = ((data as Certificate[]) || []).slice().reverse();
        setCertificates(rows);
        // Default select first certificate if none selected or current is gone
        if (rows.length > 0) {
          setSelectedCert((prev) => {
            if (prev) {
              const matched = rows.find((r: Certificate) => r.id === prev.id || r.drive_file_id === prev.drive_file_id);
              return matched || rows[0];
            }
            return rows[0];
          });
        } else {
          setSelectedCert(null);
        }
      }
    } catch (err: any) {
      console.error("Fetch exception:", err);
      setToastMessage({
        type: "error",
        text: "An error occurred while fetching certificates.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Filtered certificates based on search and status
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        cert.partner_name?.toLowerCase().includes(query) ||
        cert.certificate_type?.toLowerCase().includes(query) ||
        cert.drive_file_id?.toLowerCase().includes(query);

      const status = cert.status || "Pending";
      const matchesStatus =
        statusFilter === "ALL" ||
        status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [certificates, searchQuery, statusFilter]);

  // Handle Verify button click - changes status from "Pending" to "Verified"
  const handleVerify = async (cert: Certificate) => {
    setUpdatingId(cert.id);
    setToastMessage(null);

    try {
      let query = supabase
        .from("partner_certificates")
        .update({ status: "Verified" });

      if (cert.id !== undefined && cert.id !== null) {
        query = query.eq("id", cert.id);
      } else if (cert.drive_file_id) {
        query = query.eq("drive_file_id", cert.drive_file_id);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }

      // Optimistically update state
      setCertificates((prev) =>
        prev.map((item) =>
          item.id === cert.id || item.drive_file_id === cert.drive_file_id
            ? { ...item, status: "Verified" }
            : item
        )
      );

      if (selectedCert && (selectedCert.id === cert.id || selectedCert.drive_file_id === cert.drive_file_id)) {
        setSelectedCert({ ...selectedCert, status: "Verified" });
      }

      setToastMessage({
        type: "success",
        text: `Certificate for ${cert.partner_name} has been verified successfully.`,
      });
    } catch (err: any) {
      console.error("Verification failed:", err);
      setToastMessage({
        type: "error",
        text: err.message || "Failed to update status to Verified.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper to get embeddable iframe URL for Google Drive files
  const getEmbedUrl = (cert: Certificate) => {
    if (!cert) return "";
    const raw = cert.drive_webview_link || "";
    // Google Drive webViewLinks typically have /view?usp=... which requires /preview for iframe embedding
    if (raw.includes("/view")) {
      return raw.replace(/\/view(\?.*)?$/, "/preview");
    }
    if (cert.drive_file_id) {
      return `https://drive.google.com/file/d/${cert.drive_file_id}/preview`;
    }
    return raw;
  };

  // Stats calculation
  const totalCount = certificates.length;
  const pendingCount = certificates.filter((c) => (c.status || "Pending").toLowerCase() === "pending").length;
  const verifiedCount = certificates.filter((c) => (c.status || "").toLowerCase() === "verified").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-mist/20 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="w-5 h-5 text-deep-clay dark:text-warm-stone" />
            <h1 className="text-2xl font-sans font-medium text-warm-stone tracking-tight">
              Partner Certificate Verification
            </h1>
          </div>
          <p className="text-xs text-slate-mist font-light">
            Audit partner compliance, inspect document previews via Google Drive, and verify credentials.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#7A3F1E] hover:bg-[#B85333] text-white text-xs font-semibold tracking-wide transition-all shadow-md hover:shadow-[#7A3F1E]/30"
            title="Generate a partner upload link"
          >
            <Link2 className="w-3.5 h-3.5" />
            Generate Link
          </button>
          <button
            onClick={fetchCertificates}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-mist/30 text-xs text-warm-stone hover:bg-carbon-ink/40 transition-colors disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#1C1D21] border border-white/5 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-mist uppercase">Total Certificates</p>
              <p className="text-xl font-semibold text-warm-stone">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1C1D21] border border-amber-500/20 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-amber-400/80 uppercase">Pending Review</p>
              <p className="text-xl font-semibold text-amber-300">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1C1D21] border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-emerald-400/80 uppercase">Verified</p>
              <p className="text-xl font-semibold text-emerald-400">{verifiedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
              : "bg-red-950/40 border-red-500/30 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace: Split View (List on Left, Substantial Iframe on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Certificate List (5 cols on lg) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filters */}
          <div className="bg-[#1C1D21] border border-white/5 rounded-xl p-3 space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-mist" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search partner or type..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121316] border border-white/10 text-xs text-warm-stone placeholder-slate-mist/60 focus:outline-none focus:border-deep-clay transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 pt-1">
              {(["ALL", "Pending", "Verified"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`flex-1 py-1 px-2 text-[11px] font-mono rounded-lg transition-all ${
                    statusFilter === tab
                      ? "bg-deep-clay text-white shadow-sm"
                      : "bg-[#121316] text-slate-mist hover:text-warm-stone hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center bg-[#1C1D21] border border-white/5 rounded-xl text-slate-mist text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-deep-clay" />
                Loading certificates...
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="p-8 text-center bg-[#1C1D21] border border-white/5 rounded-xl text-slate-mist text-xs">
                <FileText className="w-6 h-6 mx-auto mb-2 opacity-40" />
                No certificates match your criteria.
              </div>
            ) : (
              filteredCertificates.map((cert) => {
                const isSelected =
                  selectedCert &&
                  (selectedCert.id === cert.id || selectedCert.drive_file_id === cert.drive_file_id);
                const isVerified = (cert.status || "").toLowerCase() === "verified";

                return (
                  <div
                    key={cert.id || cert.drive_file_id}
                    onClick={() => setSelectedCert(cert)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-[#252830] border-deep-clay shadow-md"
                        : "bg-[#1C1D21] border-white/5 hover:border-white/15 hover:bg-[#202329]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-medium text-warm-stone truncate">
                        {cert.partner_name || "Unnamed Partner"}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                          isVerified
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {isVerified ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-2.5 h-2.5" />
                            Pending
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-mist">
                      <span className="font-mono text-[#D4705A] text-[11px]">
                        {cert.certificate_type || "General"}
                      </span>
                      {cert.created_at ? (
                        <span className="text-[10px] text-slate-mist/80 font-mono">
                          {new Date(cert.created_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-mist/60 font-mono">
                          ID: {String(cert.id || cert.drive_file_id || "").slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Substantial Iframe Display & Verification Action (8 cols on lg) */}
        <div className="lg:col-span-8">
          {selectedCert ? (
            <div className="bg-[#1C1D21] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-210px)] min-h-[640px]">
              {/* Header Bar Next to / Above the Iframe */}
              <div className="p-4 sm:p-5 border-b border-white/10 bg-[#161719] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase text-deep-clay font-semibold">
                      {selectedCert.certificate_type}
                    </span>
                    <span className="text-white/20">•</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full ${
                        (selectedCert.status || "").toLowerCase() === "verified"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {(selectedCert.status || "").toLowerCase() === "verified" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </>
                      )}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif text-warm-stone truncate">
                    {selectedCert.partner_name}
                  </h2>
                </div>

                {/* Actions: Verify Button and Open in Drive */}
                <div className="flex items-center gap-3 shrink-0">
                  {selectedCert.drive_webview_link && (
                    <a
                      href={selectedCert.drive_webview_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs text-warm-stone hover:bg-white/5 transition-colors font-mono"
                      title="Open in Google Drive"
                    >
                      <span>Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Verify Button next to the iframe */}
                  {(selectedCert.status || "").toLowerCase() === "verified" ? (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={updatingId === selectedCert.id}
                      onClick={() => handleVerify(selectedCert)}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#7A3F1E] hover:bg-[#B85333] text-white text-xs font-semibold tracking-wide transition-all shadow-lg hover:shadow-[#7A3F1E]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {updatingId === selectedCert.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify Certificate</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Document Display Iframe taking up substantial screen real estate */}
              <div className="flex-1 bg-[#121316] relative flex flex-col">
                <iframe
                  key={selectedCert.id || selectedCert.drive_file_id}
                  src={getEmbedUrl(selectedCert)}
                  title={`${selectedCert.partner_name} - ${selectedCert.certificate_type}`}
                  className="w-full flex-1 border-0 bg-transparent"
                  allow="autoplay"
                />

                {/* Footer bar with metadata */}
                <div className="p-2.5 px-4 bg-[#161719] border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-mist">
                  <span className="truncate max-w-xs">
                    File ID: <span className="text-warm-stone/80">{selectedCert.drive_file_id || "N/A"}</span>
                  </span>
                  {selectedCert.drive_webview_link && (
                    <span className="text-[10px] text-slate-mist/70">
                      If preview is blocked by browser restrictions, click "Drive ↗" to view directly.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1C1D21] border border-white/10 rounded-2xl p-16 text-center h-[calc(100vh-210px)] min-h-[640px] flex flex-col items-center justify-center text-slate-mist">
              <FileCheck className="w-12 h-12 mb-3 text-slate-mist/30" />
              <p className="text-sm text-warm-stone font-medium">No Certificate Selected</p>
              <p className="text-xs text-slate-mist mt-1 max-w-xs">
                Select a certificate from the list on the left to preview the document and perform verification.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Generate Upload Link Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#7A3F1E]/20 border border-[#7A3F1E]/40 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-[#D4705A]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-warm-stone">Generate Upload Link</h2>
                  <p className="text-[11px] text-slate-mist font-mono">Create a shareable partner upload URL</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-mist hover:text-warm-stone hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {generatedUrl ? (
              /* ── Success / Result View ── */
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-200">
                    Link generated for <span className="font-semibold">{partnerName}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-mist mb-1.5 uppercase tracking-wider">Shareable URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedUrl}
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#121316] border border-white/10 text-xs text-warm-stone/80 font-mono focus:outline-none truncate"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={handleCopy}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        copied
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                          : "bg-[#7A3F1E] hover:bg-[#B85333] text-white"
                      }`}
                    >
                      {copied ? (
                        <><Check className="w-3.5 h-3.5" /> Copied!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy</>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => { setGeneratedUrl(null); setCopied(false); }}
                    className="text-xs text-slate-mist hover:text-warm-stone transition-colors"
                  >
                    ← Generate another
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-1.5 rounded-lg border border-slate-mist/30 text-xs text-warm-stone hover:bg-white/5 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* ── Input Form View ── */
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-mist mb-1.5 uppercase tracking-wider">
                    Partner Name
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g. Bare Necessities"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#121316] border border-white/10 text-xs text-warm-stone placeholder-slate-mist/50 focus:outline-none focus:border-[#D4705A]/60 transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-mist mb-1.5 uppercase tracking-wider">
                    Google Drive Folder ID
                  </label>
                  <input
                    type="text"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#121316] border border-white/10 text-xs text-warm-stone placeholder-slate-mist/50 focus:outline-none focus:border-[#D4705A]/60 transition-all font-mono"
                  />
                  <p className="mt-1.5 text-[10px] text-slate-mist/60">
                    Paste the Folder ID from the Drive URL (the long alphanumeric string after /folders/).
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border border-slate-mist/30 text-xs text-warm-stone hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateLink}
                    disabled={!partnerName.trim() || !driveLink.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7A3F1E] hover:bg-[#B85333] text-white text-xs font-semibold tracking-wide transition-all shadow-lg hover:shadow-[#7A3F1E]/30 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Create Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
