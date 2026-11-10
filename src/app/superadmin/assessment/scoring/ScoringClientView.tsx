"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  Award,
  ShieldCheck,
  Check,
  X,
  TrendingUp,
} from "lucide-react";

interface ScoreRecord {
  id: string;
  supplier_id?: string;
  partner_suppliers?: {
    enterprise_name: string;
    brand_name?: string | null;
  };
  partner_clients?: {
    name: string;
  };
  version: number;
  status: "draft" | "provisional" | "final";
  scores: {
    total?: number;
    environmental?: number;
    social?: number;
    governance?: number;
    craft?: number;
    [k: string]: any;
  };
  reviewer_id?: string;
  sign_off_reason?: string;
  signed_off_at?: string;
  created_at?: string;
}

export default function ScoringClientView({
  initialScores,
}: {
  initialScores: ScoreRecord[];
}) {
  const [scores, setScores] = useState<ScoreRecord[]>(initialScores);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedScore, setSelectedScore] = useState<ScoreRecord | null>(null);
  const [signOffNotes, setSignOffNotes] = useState("");

  const filteredScores = useMemo(() => {
    return scores.filter((s) => {
      const q = search.toLowerCase();
      const entName = s.partner_suppliers?.enterprise_name || "";
      const matchesSearch = !q || entName.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "ALL" || s.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [scores, search, statusFilter]);

  const finalCount = scores.filter((s) => s.status === "final").length;
  const provisionalCount = scores.filter((s) => s.status === "provisional").length;
  const draftCount = scores.filter((s) => s.status === "draft").length;

  const avgScore = useMemo(() => {
    const valid = scores
      .map((s) => Number(s.scores?.total || 0))
      .filter((n) => n > 0);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
  }, [scores]);

  const handleSignOff = (record: ScoreRecord) => {
    setScores((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? {
              ...item,
              status: "final",
              sign_off_reason: signOffNotes || "Approved and signed off by superadmin",
              signed_off_at: new Date().toISOString(),
            }
          : item
      )
    );
    setSelectedScore(null);
    setSignOffNotes("");
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
                background: "var(--sa-sand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-muted)",
              }}
            >
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Average Varna Score</div>
              <div className="sa-stat-value">{avgScore}/100</div>
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
              <div className="sa-stat-label">Signed-Off Final</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-success)" }}>
                {finalCount}
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
              <div className="sa-stat-label">Provisional Rating</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-warning-fg)" }}>
                {provisionalCount}
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
                background: "var(--sa-info-tint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-info)",
              }}
            >
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Draft Reviews</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-info)" }}>
                {draftCount}
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
              placeholder="Search enterprise scores..."
              className="sa-input"
              style={{ paddingLeft: "32px", fontSize: "12px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="sa-input"
            style={{ width: "150px", fontSize: "12px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="final">Final Signed-Off</option>
            <option value="provisional">Provisional</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="sa-card" style={{ overflow: "hidden" }}>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Enterprise</th>
              <th>Overall Score</th>
              <th>Environmental</th>
              <th>Social</th>
              <th>Governance</th>
              <th>Craft &amp; Heritage</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Sign-Off</th>
            </tr>
          </thead>
          <tbody>
            {filteredScores.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    color: "var(--sa-muted)",
                  }}
                >
                  No score records found.
                </td>
              </tr>
            ) : (
              filteredScores.map((score) => {
                const total = score.scores?.total ?? 0;
                const e = score.scores?.environmental ?? 0;
                const s = score.scores?.social ?? 0;
                const g = score.scores?.governance ?? 0;
                const c = score.scores?.craft ?? 0;

                return (
                  <tr key={score.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                        {score.partner_suppliers?.enterprise_name || "Supplier"}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--sa-caption)" }}>
                        v{score.version} · {score.partner_clients?.name || "Global"}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "var(--sa-accent)",
                        }}
                      >
                        {total}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--sa-caption)" }}>/100</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{e}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{s}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{g}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{c}</span>
                    </td>
                    <td>
                      <span
                        className={`sa-pill ${
                          score.status === "final"
                            ? "sa-pill-verified"
                            : score.status === "provisional"
                            ? "sa-pill-pending"
                            : "sa-pill-draft"
                        }`}
                      >
                        {score.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {score.status === "final" ? (
                        <div
                          className="sa-pill sa-pill-verified inline-flex"
                          style={{ padding: "4px 8px" }}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Signed Off
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedScore(score)}
                          className="sa-btn-primary"
                          style={{ padding: "4px 10px", fontSize: "11px" }}
                        >
                          Sign-Off
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sign-Off Modal */}
      {selectedScore && (
        <>
          <div className="sa-overlay" onClick={() => setSelectedScore(null)} />
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
                Sign-Off &amp; Publish Score
              </h3>
              <button
                type="button"
                onClick={() => setSelectedScore(null)}
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
                  padding: "16px",
                  background: "var(--sa-sand)",
                  borderRadius: "var(--sa-radius-sm)",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                  {selectedScore.partner_suppliers?.enterprise_name}
                </div>
                <div style={{ fontSize: "28px", fontWeight: 300, color: "var(--sa-accent)", marginTop: "6px" }}>
                  {selectedScore.scores?.total ?? 0}/100
                </div>
                <div style={{ fontSize: "12px", color: "var(--sa-muted)", marginTop: "4px" }}>
                  E: {selectedScore.scores?.environmental} · S: {selectedScore.scores?.social} · G: {selectedScore.scores?.governance} · C: {selectedScore.scores?.craft}
                </div>
              </div>

              <div>
                <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                  Sign-Off Statement / Auditor Note
                </label>
                <textarea
                  rows={4}
                  className="sa-input"
                  placeholder="Record verification methodology, audit sign-off reason, or special dispensations..."
                  value={signOffNotes}
                  onChange={(e) => setSignOffNotes(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => handleSignOff(selectedScore)}
                className="sa-btn-primary"
                style={{ justifyContent: "center", marginTop: "12px" }}
              >
                <ShieldCheck className="w-4 h-4" />
                Approve &amp; Publish Final Score
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
