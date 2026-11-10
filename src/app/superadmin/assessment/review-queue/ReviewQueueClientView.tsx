"use client";

import React, { useState, useMemo } from "react";
import {
  Flag,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  User,
  ShieldAlert,
  Check,
  X,
} from "lucide-react";

interface FlagRecord {
  id: string;
  type: string;
  source_ref?: string;
  description?: string;
  client_id?: string;
  partner_clients?: { id: string; name: string };
  assigned_reviewer_id?: string;
  status: "open" | "accepted" | "corrected" | "escalated";
  resolution_reason?: string;
  created_at?: string;
  resolved_at?: string;
}

export default function ReviewQueueClientView({
  initialFlags,
}: {
  initialFlags: FlagRecord[];
}) {
  const [flags, setFlags] = useState<FlagRecord[]>(initialFlags);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedFlag, setSelectedFlag] = useState<FlagRecord | null>(null);
  const [resolutionText, setResolutionText] = useState("");

  const filteredFlags = useMemo(() => {
    return flags.filter((f) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        f.type.toLowerCase().includes(q) ||
        f.source_ref?.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q) ||
        f.assigned_reviewer_id?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || f.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [flags, search, statusFilter]);

  const openCount = flags.filter((f) => f.status === "open").length;
  const escalatedCount = flags.filter((f) => f.status === "escalated").length;
  const resolvedCount = flags.filter(
    (f) => f.status === "corrected" || f.status === "accepted"
  ).length;

  const handleResolve = (flagId: string, status: "accepted" | "corrected" | "escalated") => {
    setFlags((prev) =>
      prev.map((item) =>
        item.id === flagId
          ? {
              ...item,
              status,
              resolution_reason: resolutionText || `Flag marked as ${status} by reviewer`,
              resolved_at: new Date().toISOString(),
            }
          : item
      )
    );
    setSelectedFlag(null);
    setResolutionText("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="sa-pill sa-pill-pending">Open Flag</span>;
      case "escalated":
        return <span className="sa-pill sa-pill-declined">Escalated</span>;
      case "corrected":
      case "accepted":
        return <span className="sa-pill sa-pill-active">Resolved</span>;
      default:
        return <span className="sa-pill sa-pill-draft">{status}</span>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Stat Cards */}
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
                background: "var(--sa-warning-tint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-warning-fg)",
              }}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Open Review Flags</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-warning-fg)" }}>
                {openCount}
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
                background: "var(--sa-danger-tint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-danger)",
              }}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Escalated Items</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-danger)" }}>
                {escalatedCount}
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
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Resolved Flags</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-success)" }}>
                {resolvedCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flex: 1, maxWidth: "480px" }}>
          <div className="relative flex-1">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--sa-caption)" }}
            />
            <input
              type="text"
              placeholder="Search flags, criteria, reviewers..."
              className="sa-input"
              style={{ paddingLeft: "32px", fontSize: "12px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="sa-input"
            style={{ width: "140px", fontSize: "12px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="open">Open</option>
            <option value="escalated">Escalated</option>
            <option value="corrected">Corrected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>
      </div>

      {/* Flags Table */}
      <div className="sa-card" style={{ overflow: "hidden" }}>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Flag Type &amp; Ref</th>
              <th>Description &amp; Context</th>
              <th>Assigned Reviewer</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlags.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    color: "var(--sa-muted)",
                  }}
                >
                  No review flags matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredFlags.map((flag) => (
                <tr key={flag.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                      {flag.type.replace(/_/g, " ")}
                    </div>
                    {flag.source_ref && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--sa-accent)",
                          marginTop: "2px",
                        }}
                      >
                        {flag.source_ref}
                      </div>
                    )}
                  </td>
                  <td style={{ maxWidth: "340px" }}>
                    <div style={{ fontSize: "13px", color: "var(--sa-ink-2)", lineHeight: 1.4 }}>
                      {flag.description || "—"}
                    </div>
                    {flag.resolution_reason && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--sa-success-fg)",
                          marginTop: "4px",
                          fontStyle: "italic",
                        }}
                      >
                        Resolution: {flag.resolution_reason}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs">
                      <User className="w-3.5 h-3.5 opacity-50" />
                      <span>{flag.assigned_reviewer_id || "Unassigned"}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(flag.status)}</td>
                  <td style={{ fontSize: "11px", color: "var(--sa-caption)" }}>
                    {flag.created_at
                      ? new Date(flag.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {flag.status === "open" || flag.status === "escalated" ? (
                      <button
                        type="button"
                        onClick={() => setSelectedFlag(flag)}
                        className="sa-btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "11px" }}
                      >
                        Resolve
                      </button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--sa-muted)" }}>
                        Closed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resolution Modal */}
      {selectedFlag && (
        <>
          <div className="sa-overlay" onClick={() => setSelectedFlag(null)} />
          <div
            className="sa-slideover"
            style={{ width: "440px" }}
            role="dialog"
            aria-modal="true"
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--sa-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                Resolve Review Flag
              </h3>
              <button
                type="button"
                onClick={() => setSelectedFlag(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--sa-muted)",
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--sa-sand)",
                  borderRadius: "var(--sa-radius-sm)",
                  fontSize: "12px",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                  {selectedFlag.type.replace(/_/g, " ")}
                </div>
                <div style={{ color: "var(--sa-muted)", marginTop: "4px" }}>
                  {selectedFlag.description}
                </div>
              </div>

              <div>
                <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                  Resolution Notes
                </label>
                <textarea
                  rows={4}
                  className="sa-input"
                  placeholder="Explain corrective actions, verified facts, or sign-off reason..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => handleResolve(selectedFlag.id, "corrected")}
                  className="sa-btn-primary"
                  style={{ justifyContent: "center" }}
                >
                  <Check className="w-4 h-4" />
                  Mark as Corrected &amp; Resolved
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve(selectedFlag.id, "accepted")}
                  className="sa-btn-secondary"
                  style={{ justifyContent: "center" }}
                >
                  Accept as Within Tolerance
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve(selectedFlag.id, "escalated")}
                  className="sa-btn-secondary"
                  style={{ justifyContent: "center", color: "var(--sa-danger)" }}
                >
                  Escalate to Lead Assessor
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
