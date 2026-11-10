"use client";

import React, { useState, useMemo } from "react";
import {
  ClipboardList,
  Search,
  User,
  Clock,
  Eye,
  X,
  ShieldCheck,
  FileText,
} from "lucide-react";

interface AuditRecord {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  before_state?: any;
  after_state?: any;
  reason?: string;
  ip_address?: string;
  created_at?: string;
}

export default function AuditLogClientView({
  initialLogs,
}: {
  initialLogs: AuditRecord[];
}) {
  const [logs] = useState<AuditRecord[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditRecord | null>(null);

  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.action));
    return Array.from(set).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.action.toLowerCase().includes(q) ||
        (l.user_id && l.user_id.toLowerCase().includes(q)) ||
        (l.entity_type && l.entity_type.toLowerCase().includes(q)) ||
        (l.entity_id && l.entity_id.toLowerCase().includes(q));

      const matchesAction =
        actionFilter === "ALL" || l.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  const getActionBadge = (act: string) => {
    if (act.includes("create")) {
      return <span className="sa-pill sa-pill-active">{act}</span>;
    }
    if (act.includes("update") || act.includes("sign")) {
      return <span className="sa-pill sa-pill-sent">{act}</span>;
    }
    if (act.includes("delete") || act.includes("reject")) {
      return <span className="sa-pill sa-pill-declined">{act}</span>;
    }
    return <span className="sa-pill sa-pill-draft">{act}</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
        <div style={{ display: "flex", gap: "10px", flex: 1, maxWidth: "520px" }}>
          <div className="relative flex-1">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--sa-caption)" }}
            />
            <input
              type="text"
              placeholder="Search by action, user ID, entity type, ID..."
              className="sa-input"
              style={{ paddingLeft: "32px", fontSize: "12px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="sa-input"
            style={{ width: "180px", fontSize: "12px" }}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        <div className="sa-live-dot">Tamper-Evident Ledger</div>
      </div>

      {/* Table */}
      <div className="sa-card" style={{ overflow: "hidden" }}>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor ID</th>
              <th>Action Executed</th>
              <th>Entity Target</th>
              <th>Entity ID</th>
              <th style={{ textAlign: "right" }}>Payload State</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    color: "var(--sa-muted)",
                  }}
                >
                  No audit log entries matching your criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: "11px", color: "var(--sa-caption)", whiteSpace: "nowrap" }}>
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs">
                      <User className="w-3.5 h-3.5 opacity-50" />
                      <span style={{ fontWeight: 500 }}>{log.user_id || "system"}</span>
                    </div>
                  </td>
                  <td>{getActionBadge(log.action)}</td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--sa-muted)" }}>
                      {log.entity_type || "—"}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "ui-monospace, monospace",
                        color: "var(--sa-caption)",
                      }}
                    >
                      {log.entity_id ? log.entity_id.slice(0, 12) : "—"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {log.after_state || log.before_state ? (
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="sa-btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect JSON
                      </button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--sa-caption)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect JSON Modal */}
      {selectedLog && (
        <>
          <div className="sa-overlay" onClick={() => setSelectedLog(null)} />
          <div
            className="sa-slideover"
            style={{ width: "520px" }}
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
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                  Audit Event Payload
                </h3>
                <p style={{ fontSize: "11px", color: "var(--sa-muted)", marginTop: "2px" }}>
                  Action: {selectedLog.action} · Actor: {selectedLog.user_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
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

            <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              {selectedLog.before_state && (
                <div>
                  <div className="sa-label" style={{ marginBottom: "6px" }}>
                    Before State
                  </div>
                  <pre
                    style={{
                      background: "var(--sa-sand)",
                      border: "1px solid var(--sa-border)",
                      borderRadius: "var(--sa-radius-sm)",
                      padding: "12px",
                      fontSize: "11px",
                      fontFamily: "ui-monospace, monospace",
                      overflowX: "auto",
                      color: "var(--sa-ink-2)",
                    }}
                  >
                    {JSON.stringify(selectedLog.before_state, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.after_state && (
                <div>
                  <div className="sa-label" style={{ marginBottom: "6px" }}>
                    After State / Delta
                  </div>
                  <pre
                    style={{
                      background: "var(--sa-sand)",
                      border: "1px solid var(--sa-border)",
                      borderRadius: "var(--sa-radius-sm)",
                      padding: "12px",
                      fontSize: "11px",
                      fontFamily: "ui-monospace, monospace",
                      overflowX: "auto",
                      color: "var(--sa-ink-2)",
                    }}
                  >
                    {JSON.stringify(selectedLog.after_state, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
