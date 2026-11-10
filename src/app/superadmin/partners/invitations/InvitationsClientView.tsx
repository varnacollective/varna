"use client";

import React, { useState, useMemo } from "react";
import {
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Send,
  Building2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import InvitePartnerButton, { ClientOption } from "@/components/SuperAdmin/InvitePartnerButton";

interface InvitationRecord {
  id: string;
  slug: string;
  supplier_id?: string | null;
  client_id?: string | null;
  enterprise_name: string;
  brand_name?: string | null;
  contact_person: string;
  contact_email: string;
  phone?: string | null;
  state?: string | null;
  category?: string | null;
  validity_days: number;
  status: string;
  invitation_url?: string | null;
  sent_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
}

export default function InvitationsClientView({
  initialInvitations,
  clients,
  autoOpenInvite = false,
}: {
  initialInvitations: InvitationRecord[];
  clients: ClientOption[];
  autoOpenInvite?: boolean;
}) {
  const [invitations, setInvitations] = useState<InvitationRecord[]>(initialInvitations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [clients]);

  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        inv.enterprise_name.toLowerCase().includes(q) ||
        inv.contact_person.toLowerCase().includes(q) ||
        inv.contact_email.toLowerCase().includes(q) ||
        inv.slug.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" ||
        inv.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [invitations, search, statusFilter]);

  const totalCount = invitations.length;
  const pendingCount = invitations.filter((i) => i.status === "pending").length;
  const sentCount = invitations.filter(
    (i) => i.status === "sent" || i.status === "delivered"
  ).length;
  const acceptedCount = invitations.filter(
    (i) => i.status === "accepted" || i.status === "registration_completed"
  ).length;

  const handleCopyLink = async (inv: InvitationRecord) => {
    const url =
      inv.invitation_url ||
      `${window.location.origin}/invitation/${inv.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(inv.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const refreshInvitations = () => {
    fetch("/api/superadmin/invitations")
      .then((r) => r.json())
      .then((d) => {
        if (d.invitations) setInvitations(d.invitations);
      })
      .catch(() => {});
  };

  const getStatusPill = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "registration_completed":
        return <span className="sa-pill sa-pill-active">Accepted</span>;
      case "sent":
      case "delivered":
        return <span className="sa-pill sa-pill-sent">Sent</span>;
      case "pending":
        return <span className="sa-pill sa-pill-pending">Pending</span>;
      case "expired":
        return <span className="sa-pill sa-pill-expired">Expired</span>;
      case "declined":
      case "bounced":
        return <span className="sa-pill sa-pill-declined">{status}</span>;
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
                background: "var(--sa-sand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-muted)",
              }}
            >
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Total Invitations</div>
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
              <div className="sa-stat-label">Pending Dispatch</div>
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
                background: "var(--sa-info-tint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sa-info)",
              }}
            >
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Sent / Active</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-info)" }}>
                {sentCount}
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
              <div className="sa-stat-label">Accepted / Completed</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-success)" }}>
                {acceptedCount}
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
        <div style={{ display: "flex", gap: "10px", flex: 1, maxWidth: "480px" }}>
          <div className="relative flex-1">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--sa-caption)" }}
            />
            <input
              type="text"
              placeholder="Search enterprise, contact, email, slug..."
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
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <InvitePartnerButton
          clients={clients}
          initialOpen={autoOpenInvite}
          onSuccess={refreshInvitations}
        />
      </div>

      {/* Table */}
      <div className="sa-card" style={{ overflow: "hidden" }}>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Enterprise</th>
              <th>Contact Person</th>
              <th>Client Partner</th>
              <th>Category</th>
              <th>Status</th>
              <th>Sent At</th>
              <th>Expires At</th>
              <th style={{ textAlign: "right" }}>Invitation Link</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvitations.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    color: "var(--sa-muted)",
                  }}
                >
                  No partner invitations found.
                </td>
              </tr>
            ) : (
              filteredInvitations.map((inv) => {
                const isCopied = copiedId === inv.id;
                const clientName = inv.client_id
                  ? clientMap.get(inv.client_id) || "Client"
                  : "General Pool";

                return (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                        {inv.enterprise_name}
                      </div>
                      {inv.brand_name && (
                        <div style={{ fontSize: "11px", color: "var(--sa-muted)" }}>
                          {inv.brand_name}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{inv.contact_person}</div>
                      <div style={{ fontSize: "11px", color: "var(--sa-caption)" }}>
                        {inv.contact_email}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--sa-ink-2)" }}>
                        {clientName}
                      </span>
                    </td>
                    <td>
                      {inv.category ? (
                        <span style={{ fontSize: "12px", color: "var(--sa-accent)" }}>
                          {inv.category}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{getStatusPill(inv.status)}</td>
                    <td style={{ fontSize: "11px", color: "var(--sa-caption)" }}>
                      {inv.sent_at
                        ? new Date(inv.sent_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={{ fontSize: "11px", color: "var(--sa-caption)" }}>
                      {inv.expires_at
                        ? new Date(inv.expires_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(inv)}
                          className={isCopied ? "sa-btn-primary" : "sa-btn-secondary"}
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                          title="Copy invitation link"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>

                        <a
                          href={inv.invitation_url || `/invitation/${inv.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sa-btn-secondary"
                          style={{ padding: "4px 6px" }}
                          title="Open invitation in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
