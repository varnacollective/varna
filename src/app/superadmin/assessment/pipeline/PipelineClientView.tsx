"use client";

import React, { useState, useMemo } from "react";
import {
  GitBranch,
  Search,
  Filter,
  ArrowRight,
  Clock,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Layers,
} from "lucide-react";

const PIPELINE_STAGES = [
  { key: "invited", label: "Invited", color: "var(--sa-info)" },
  { key: "registered", label: "Registered", color: "var(--sa-accent)" },
  { key: "in_progress", label: "In Progress", color: "var(--sa-warning)" },
  { key: "submitted", label: "Submitted", color: "var(--sa-warning-fg)" },
  { key: "under_verification", label: "Verification", color: "var(--sa-accent)" },
  { key: "verification_complete", label: "Verified", color: "var(--sa-success)" },
  { key: "scoring_in_progress", label: "Scoring", color: "var(--sa-accent-pressed)" },
  { key: "awaiting_approval", label: "Sign-Off", color: "var(--sa-warning)" },
  { key: "completed", label: "Completed", color: "var(--sa-success)" },
  { key: "published", label: "Published", color: "var(--sa-success-fg)" },
];

export default function PipelineClientView({
  initialPipeline,
}: {
  initialPipeline: any[];
}) {
  const [pipeline, setPipeline] = useState<any[]>(initialPipeline);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  const filteredItems = useMemo(() => {
    return pipeline.filter((item) => {
      const supplierName = item.partner_suppliers?.enterprise_name || "";
      const clientName = item.partner_clients?.name || "";
      const q = search.toLowerCase();

      const matchesSearch =
        !q ||
        supplierName.toLowerCase().includes(q) ||
        clientName.toLowerCase().includes(q) ||
        (item.assigned_to && item.assigned_to.toLowerCase().includes(q));

      const matchesStage =
        stageFilter === "ALL" || item.status === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [pipeline, search, stageFilter]);

  // Stage counts
  const countsByStage = useMemo(() => {
    const counts: Record<string, number> = {};
    pipeline.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [pipeline]);

  const activeInPipeline = pipeline.filter(
    (p) => p.status !== "completed" && p.status !== "published"
  ).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top summary funnel stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "10px",
        }}
      >
        {PIPELINE_STAGES.slice(0, 6).map((stage) => {
          const count = countsByStage[stage.key] || 0;
          return (
            <div
              key={stage.key}
              onClick={() => setStageFilter(stageFilter === stage.key ? "ALL" : stage.key)}
              className="sa-stat-card"
              style={{
                padding: "12px 14px",
                cursor: "pointer",
                borderLeft: stageFilter === stage.key ? `3px solid ${stage.color}` : "1px solid var(--sa-border)",
                background: stageFilter === stage.key ? "var(--sa-sand)" : "var(--sa-white)",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--sa-muted)",
                  letterSpacing: "0.06em",
                }}
              >
                {stage.label}
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 300,
                  color: count > 0 ? "var(--sa-ink)" : "var(--sa-caption)",
                  marginTop: "4px",
                }}
              >
                {count}
              </div>
            </div>
          );
        })}
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
        <div style={{ display: "flex", gap: "10px", flex: 1, maxWidth: "460px" }}>
          <div className="relative flex-1">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--sa-caption)" }}
            />
            <input
              type="text"
              placeholder="Search partner enterprise, client, reviewer..."
              className="sa-input"
              style={{ paddingLeft: "32px", fontSize: "12px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="sa-input"
            style={{ width: "160px", fontSize: "12px" }}
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="ALL">All Stages ({pipeline.length})</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label} ({countsByStage[s.key] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={viewMode === "kanban" ? "sa-btn-primary" : "sa-btn-secondary"}
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            Board
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={viewMode === "table" ? "sa-btn-primary" : "sa-btn-secondary"}
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            List
          </button>
        </div>
      </div>

      {/* Board View */}
      {viewMode === "kanban" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          {PIPELINE_STAGES.filter((s) => stageFilter === "ALL" || s.key === stageFilter).map((stage) => {
            const itemsInStage = filteredItems.filter((i) => i.status === stage.key);

            return (
              <div
                key={stage.key}
                className="sa-card"
                style={{
                  padding: "14px",
                  background: "var(--sa-sand)",
                  minHeight: "360px",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "10px",
                    borderBottom: "1px solid var(--sa-border)",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: stage.color,
                      }}
                    />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--sa-ink)" }}>
                      {stage.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      background: "var(--sa-white)",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      color: "var(--sa-muted)",
                    }}
                  >
                    {itemsInStage.length}
                  </span>
                </div>

                {/* Cards in column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {itemsInStage.length === 0 ? (
                    <div
                      style={{
                        padding: "24px 12px",
                        textAlign: "center",
                        fontSize: "11px",
                        color: "var(--sa-caption)",
                      }}
                    >
                      No partners in this stage
                    </div>
                  ) : (
                    itemsInStage.map((item) => (
                      <div
                        key={item.id}
                        className="sa-card"
                        style={{
                          padding: "12px 14px",
                          background: "var(--sa-white)",
                          boxShadow: "var(--sa-shadow-sm)",
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--sa-ink)" }}>
                          {item.partner_suppliers?.enterprise_name || "Supplier"}
                        </div>

                        {item.partner_clients?.name && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--sa-muted)",
                              marginTop: "2px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Building2 className="w-3 h-3 opacity-60" />
                            {item.partner_clients.name}
                          </div>
                        )}

                        <div
                          style={{
                            marginTop: "10px",
                            paddingTop: "8px",
                            borderTop: "1px solid var(--sa-sand)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "11px",
                            color: "var(--sa-caption)",
                          }}
                        >
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.days_in_status ?? 0}d in stage
                          </span>

                          {item.assigned_to ? (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {item.assigned_to}
                            </span>
                          ) : (
                            <span style={{ fontStyle: "italic" }}>Unassigned</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="sa-card" style={{ overflow: "hidden" }}>
          <table className="sa-table">
            <thead>
              <tr>
                <th>Supplier Enterprise</th>
                <th>Client Partner</th>
                <th>Current Status</th>
                <th>Days in Status</th>
                <th>Total Days</th>
                <th>Assigned To</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "36px",
                      textAlign: "center",
                      color: "var(--sa-muted)",
                    }}
                  >
                    No records found in assessment pipeline.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                        {item.partner_suppliers?.enterprise_name || "Supplier"}
                      </div>
                      {item.partner_suppliers?.contact_person && (
                        <div style={{ fontSize: "11px", color: "var(--sa-muted)" }}>
                          {item.partner_suppliers.contact_person}
                        </div>
                      )}
                    </td>
                    <td>{item.partner_clients?.name || "General Pool"}</td>
                    <td>
                      <span className="sa-pill sa-pill-pending">
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>{item.days_in_status ?? 0} days</td>
                    <td>{item.total_days ?? 0} days</td>
                    <td>{item.assigned_to || "Unassigned"}</td>
                    <td style={{ fontSize: "11px", color: "var(--sa-caption)" }}>
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
