"use client";

import React, { useState } from "react";
import {
  FileText,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  X,
  FileCheck,
} from "lucide-react";

interface TemplateRecord {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  plain_body?: string;
  version: number;
  is_active: boolean;
  created_at?: string;
}

interface RuleRecord {
  id: string;
  category?: string;
  document_type: string;
  is_required: boolean;
  description?: string;
}

export default function TemplatesClientView({
  initialTemplates,
  initialRules,
}: {
  initialTemplates: TemplateRecord[];
  initialRules: RuleRecord[];
}) {
  const [tab, setTab] = useState<"emails" | "documents">("emails");
  const [templates] = useState<TemplateRecord[]>(initialTemplates);
  const [rules] = useState<RuleRecord[]>(initialRules);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRecord | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--sa-border)", paddingBottom: "12px" }}>
        <button
          type="button"
          onClick={() => setTab("emails")}
          className={tab === "emails" ? "sa-btn-primary" : "sa-btn-secondary"}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          <Mail className="w-3.5 h-3.5" />
          Email Notification Templates ({templates.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("documents")}
          className={tab === "documents" ? "sa-btn-primary" : "sa-btn-secondary"}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Mandatory Evidence Rules ({rules.length})
        </button>
      </div>

      {tab === "emails" ? (
        <div className="sa-card" style={{ overflow: "hidden" }}>
          <table className="sa-table">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Subject Line</th>
                <th>Version</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Preview</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                      {tpl.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: "var(--sa-ink-2)" }}>{tpl.subject}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "11px", fontFamily: "ui-monospace, monospace" }}>
                      v{tpl.version}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`sa-pill ${
                        tpl.is_active ? "sa-pill-active" : "sa-pill-expired"
                      }`}
                    >
                      {tpl.is_active ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate(tpl)}
                      className="sa-btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "11px" }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Body
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="sa-card" style={{ overflow: "hidden" }}>
          <table className="sa-table">
            <thead>
              <tr>
                <th>Target Category</th>
                <th>Document Type</th>
                <th>Requirement</th>
                <th>Validation Description</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: "var(--sa-accent)" }}>
                      {rule.category || "All"}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                      {rule.document_type}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`sa-pill ${
                        rule.is_required ? "sa-pill-declined" : "sa-pill-draft"
                      }`}
                    >
                      {rule.is_required ? "Mandatory" : "Optional / Bonus"}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--sa-muted)", maxWidth: "380px" }}>
                    {rule.description || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {selectedTemplate && (
        <>
          <div className="sa-overlay" onClick={() => setSelectedTemplate(null)} />
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
                  {selectedTemplate.name}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--sa-muted)", marginTop: "2px" }}>
                  Subject: {selectedTemplate.subject}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
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

            <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
              <div
                style={{
                  background: "var(--sa-sand)",
                  border: "1px solid var(--sa-border)",
                  borderRadius: "var(--sa-radius-sm)",
                  padding: "16px",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "var(--sa-ink-2)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedTemplate.plain_body || selectedTemplate.html_body}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
