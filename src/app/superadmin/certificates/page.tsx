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
  AlertCircle,
  FileText,
  Layers,
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
              const matched = rows.find(
                (r: Certificate) =>
                  r.id === prev.id || r.drive_file_id === prev.drive_file_id
              );
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

      if (
        selectedCert &&
        (selectedCert.id === cert.id || selectedCert.drive_file_id === cert.drive_file_id)
      ) {
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
  const pendingCount = certificates.filter(
    (c) => (c.status || "Pending").toLowerCase() === "pending"
  ).length;
  const verifiedCount = certificates.filter(
    (c) => (c.status || "").toLowerCase() === "verified"
  ).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          borderBottom: "1px solid var(--sa-border)",
          paddingBottom: "16px",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Certificate Verification</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Audit partner compliance, inspect document previews via Google Drive, and verify credentials.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCertificates}
            disabled={loading}
            className="sa-btn-secondary"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div className="sa-stat-card">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--sa-radius-sm)",
                background: "var(--sa-sand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-muted)",
              }}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Total Certificates</div>
              <div className="sa-stat-value">{totalCount}</div>
            </div>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--sa-radius-sm)",
                background: "var(--sa-warning-tint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-warning)",
              }}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Pending Review</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-warning-fg)" }}>
                {pendingCount}
              </div>
            </div>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--sa-radius-sm)",
                background: "var(--sa-success-tint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-success)",
              }}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Verified</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-success)" }}>
                {verifiedCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--sa-radius-sm)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              toastMessage.type === "success"
                ? "var(--sa-success-tint)"
                : "var(--sa-danger-tint)",
            color:
              toastMessage.type === "success"
                ? "var(--sa-success-fg)"
                : "var(--sa-danger-fg)",
            border: `1px solid ${
              toastMessage.type === "success"
                ? "rgba(45,125,70,0.2)"
                : "rgba(192,57,43,0.2)"
            }`,
          }}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              opacity: 0.7,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Certificate List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filters */}
          <div
            className="sa-card"
            style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* Search Input */}
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--sa-caption)" }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search partner or type..."
                className="sa-input"
                style={{ paddingLeft: "30px", fontSize: "12px" }}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5">
              {(["ALL", "Pending", "Verified"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    fontSize: "11px",
                    borderRadius: "var(--sa-radius-sm)",
                    fontWeight: 500,
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                    borderColor:
                      statusFilter === tab
                        ? "var(--sa-accent)"
                        : "var(--sa-border)",
                    background:
                      statusFilter === tab
                        ? "var(--sa-accent-tint)"
                        : "var(--sa-white)",
                    color:
                      statusFilter === tab
                        ? "var(--sa-accent)"
                        : "var(--sa-muted)",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "calc(100vh - 340px)",
              overflowY: "auto",
            }}
          >
            {loading ? (
              <div
                className="sa-card"
                style={{ padding: "32px", textAlign: "center", color: "var(--sa-muted)", fontSize: "13px" }}
              >
                <RefreshCw
                  className="w-5 h-5 animate-spin mx-auto mb-2"
                  style={{ color: "var(--sa-accent)" }}
                />
                Loading certificates...
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div
                className="sa-card"
                style={{ padding: "32px", textAlign: "center", color: "var(--sa-muted)", fontSize: "13px" }}
              >
                <FileText className="w-6 h-6 mx-auto mb-2 opacity-40" />
                No certificates match your criteria.
              </div>
            ) : (
              filteredCertificates.map((cert) => {
                const isSelected =
                  selectedCert &&
                  (selectedCert.id === cert.id ||
                    selectedCert.drive_file_id === cert.drive_file_id);
                const isVerified =
                  (cert.status || "").toLowerCase() === "verified";

                return (
                  <div
                    key={cert.id || cert.drive_file_id}
                    onClick={() => setSelectedCert(cert)}
                    className="sa-card"
                    style={{
                      padding: "14px 16px",
                      cursor: "pointer",
                      transition: "all 150ms ease",
                      borderLeft: isSelected
                        ? "3px solid var(--sa-accent)"
                        : "1px solid var(--sa-border)",
                      background: isSelected
                        ? "var(--sa-accent-tint)"
                        : "var(--sa-white)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--sa-ink)",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cert.partner_name || "Unnamed Partner"}
                      </p>
                      <span
                        className={`sa-pill ${
                          isVerified ? "sa-pill-verified" : "sa-pill-pending"
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

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "var(--sa-muted)",
                      }}
                    >
                      <span style={{ color: "var(--sa-accent)", fontWeight: 500 }}>
                        {cert.certificate_type || "General"}
                      </span>
                      {cert.created_at ? (
                        <span style={{ fontSize: "11px", color: "var(--sa-caption)" }}>
                          {new Date(cert.created_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--sa-caption)", fontFamily: "monospace" }}>
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

        {/* Right Column: Substantial Iframe Display */}
        <div className="lg:col-span-8">
          {selectedCert ? (
            <div
              className="sa-card"
              style={{
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 210px)",
                minHeight: "640px",
              }}
            >
              {/* Header Bar Above Iframe */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--sa-border)",
                  background: "var(--sa-sand)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        color: "var(--sa-accent)",
                      }}
                    >
                      {selectedCert.certificate_type}
                    </span>
                    <span style={{ color: "var(--sa-caption)" }}>•</span>
                    <span
                      className={`sa-pill ${
                        (selectedCert.status || "").toLowerCase() === "verified"
                          ? "sa-pill-verified"
                          : "sa-pill-pending"
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
                  <h2
                    style={{
                      fontFamily: "var(--font-serif, serif)",
                      fontSize: "20px",
                      color: "var(--sa-ink)",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedCert.partner_name}
                  </h2>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {selectedCert.drive_webview_link && (
                    <a
                      href={selectedCert.drive_webview_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sa-btn-secondary"
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                      title="Open in Google Drive"
                    >
                      <span>Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {(selectedCert.status || "").toLowerCase() === "verified" ? (
                    <div
                      className="sa-pill sa-pill-verified"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={updatingId === selectedCert.id}
                      onClick={() => handleVerify(selectedCert)}
                      className="sa-btn-primary"
                      style={{ fontSize: "12px", padding: "6px 14px" }}
                    >
                      {updatingId === selectedCert.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify Certificate</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Document Display Iframe */}
              <div
                style={{
                  flex: 1,
                  background: "var(--sa-canvas)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <iframe
                  key={selectedCert.id || selectedCert.drive_file_id}
                  src={getEmbedUrl(selectedCert)}
                  title={`${selectedCert.partner_name} - ${selectedCert.certificate_type}`}
                  style={{
                    width: "100%",
                    flex: 1,
                    border: "none",
                    background: "transparent",
                  }}
                  allow="autoplay"
                />

                {/* Footer bar with metadata */}
                <div
                  style={{
                    padding: "8px 16px",
                    background: "var(--sa-sand)",
                    borderTop: "1px solid var(--sa-border)",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    fontFamily: "ui-monospace, monospace",
                    color: "var(--sa-muted)",
                  }}
                >
                  <span>
                    File ID: {selectedCert.drive_file_id || "N/A"}
                  </span>
                  {selectedCert.drive_webview_link && (
                    <span style={{ fontSize: "10px", color: "var(--sa-caption)" }}>
                      If preview is blocked by browser restrictions, click "Drive ↗" to view directly.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="sa-card"
              style={{
                padding: "64px 32px",
                textAlign: "center",
                height: "calc(100vh - 210px)",
                minHeight: "640px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-muted)",
              }}
            >
              <FileCheck
                className="w-12 h-12 mb-3"
                style={{ color: "var(--sa-border-strong)" }}
              />
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--sa-ink)" }}>
                No Certificate Selected
              </p>
              <p style={{ fontSize: "12px", color: "var(--sa-muted)", marginTop: "4px", maxWidth: "300px" }}>
                Select a certificate from the list on the left to preview the document and perform verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
