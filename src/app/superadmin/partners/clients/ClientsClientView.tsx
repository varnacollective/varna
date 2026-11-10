"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Users,
  Search,
  Plus,
  X,
  CheckCircle2,
  ExternalLink,
  Shield,
  Clock,
  Mail,
  RefreshCw,
} from "lucide-react";

interface ClientRecord {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  status: "active" | "inactive";
  outreach_mode: "approve_once" | "standing_authorisation" | "client_sends_each_wave";
  authorisation_doc_url?: string;
  reminder_max_count?: number;
  reminder_window_days?: number;
  supplier_count?: number;
  created_at?: string;
}

export default function ClientsClientView({
  initialClients,
}: {
  initialClients: ClientRecord[];
}) {
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "active" | "inactive">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Client Form State
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [outreachMode, setOutreachMode] = useState<ClientRecord["outreach_mode"]>("approve_once");
  const [formError, setFormError] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.contact_name?.toLowerCase().includes(q) ||
        c.contact_email?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  const activeCount = clients.filter((c) => c.status === "active").length;
  const standingAuthCount = clients.filter(
    (c) => c.outreach_mode === "standing_authorisation"
  ).length;
  const totalSuppliersLinked = clients.reduce(
    (sum, c) => sum + (c.supplier_count || 0),
    0
  );

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Client name is required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const res = await fetch("/api/superadmin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact_name: contactName.trim() || null,
          contact_email: contactEmail.trim() || null,
          outreach_mode: outreachMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create client organisation.");
      }

      setClients((prev) => [data.client, ...prev]);
      setModalOpen(false);
      setName("");
      setContactName("");
      setContactEmail("");
    } catch (err: any) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const getOutreachBadge = (mode: ClientRecord["outreach_mode"]) => {
    switch (mode) {
      case "standing_authorisation":
        return <span className="sa-pill sa-pill-active">Standing Auth</span>;
      case "client_sends_each_wave":
        return <span className="sa-pill sa-pill-pending">Wave Send</span>;
      default:
        return <span className="sa-pill sa-pill-sent">Approve Once</span>;
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
                background: "var(--sa-sand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-muted)",
              }}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Total Clients</div>
              <div className="sa-stat-value">{clients.length}</div>
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
              <div className="sa-stat-label">Active Clients</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-success)" }}>
                {activeCount}
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
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Standing Authorisation</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-info)" }}>
                {standingAuthCount}
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
                background: "var(--sa-accent-tint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-accent)",
              }}
            >
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Linked Suppliers</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-accent)" }}>
                {totalSuppliersLinked}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flex: 1, maxWidth: "420px" }}>
          <div className="relative flex-1">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--sa-caption)" }}
            />
            <input
              type="text"
              placeholder="Search clients by name, contact..."
              className="sa-input"
              style={{ paddingLeft: "32px", fontSize: "12px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="sa-input"
            style={{ width: "130px", fontSize: "12px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="sa-btn-primary"
        >
          <Plus className="w-4 h-4" />
          + Add Client
        </button>
      </div>

      {/* Table */}
      <div className="sa-card" style={{ overflow: "hidden" }}>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Client Organisation</th>
              <th>Primary Contact</th>
              <th>Email</th>
              <th>Outreach Protocol</th>
              <th>Linked Suppliers</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    color: "var(--sa-muted)",
                  }}
                >
                  No client organisations found matching your filter.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                      {client.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontFamily: "ui-monospace, monospace",
                        color: "var(--sa-caption)",
                      }}
                    >
                      {client.id.slice(0, 8)}
                    </div>
                  </td>
                  <td>{client.contact_name || "—"}</td>
                  <td>
                    {client.contact_email ? (
                      <span style={{ color: "var(--sa-muted)" }}>
                        {client.contact_email}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{getOutreachBadge(client.outreach_mode)}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--sa-ink)",
                      }}
                    >
                      {client.supplier_count ?? 0}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`sa-pill ${
                        client.status === "active"
                          ? "sa-pill-active"
                          : "sa-pill-expired"
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "11px", color: "var(--sa-caption)" }}>
                    {client.created_at
                      ? new Date(client.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Client Modal */}
      {modalOpen && (
        <>
          <div className="sa-overlay" onClick={() => setModalOpen(false)} />
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
                Add Hospitality Client
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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

            <form onSubmit={handleCreateClient} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {formError && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "var(--sa-danger-tint)",
                      color: "var(--sa-danger-fg)",
                      fontSize: "12px",
                      borderRadius: "var(--sa-radius-sm)",
                    }}
                  >
                    {formError}
                  </div>
                )}

                <div>
                  <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                    Organisation / Property Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Oberoi Grand Kolkata"
                    className="sa-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                    Primary Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ananya Sen"
                    className="sa-input"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. procurement@oberoigroup.com"
                    className="sa-input"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                    Outreach Protocol
                  </label>
                  <select
                    className="sa-input"
                    value={outreachMode}
                    onChange={(e) => setOutreachMode(e.target.value as any)}
                  >
                    <option value="approve_once">Approve Once (Standard)</option>
                    <option value="standing_authorisation">Standing Authorisation</option>
                    <option value="client_sends_each_wave">Client Sends Each Wave</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid var(--sa-border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="sa-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="sa-btn-primary"
                >
                  {saving ? "Saving..." : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
