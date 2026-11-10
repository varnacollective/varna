"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  Building2,
  ExternalLink,
} from "lucide-react";
import InvitePartnerButton, { ClientOption } from "@/components/SuperAdmin/InvitePartnerButton";

interface SupplierRecord {
  id: string;
  enterprise_name: string;
  brand_name?: string | null;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  state?: string | null;
  status: string;
  source: string;
  is_out_of_scope?: boolean;
  created_at?: string;
}

export default function SuppliersClientView({
  initialSuppliers,
  clients,
}: {
  initialSuppliers: SupplierRecord[];
  clients: ClientOption[];
}) {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(initialSuppliers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");

  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    suppliers.forEach((s) => {
      if (s.state) states.add(s.state);
    });
    return Array.from(states).sort();
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.enterprise_name.toLowerCase().includes(q) ||
        s.brand_name?.toLowerCase().includes(q) ||
        s.contact_person?.toLowerCase().includes(q) ||
        s.contact_email?.toLowerCase().includes(q) ||
        s.state?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || s.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesState =
        stateFilter === "ALL" || s.state === stateFilter;

      return matchesSearch && matchesStatus && matchesState;
    });
  }, [suppliers, search, statusFilter, stateFilter]);

  const totalCount = suppliers.length;
  const activeCount = suppliers.filter(
    (s) => (s.status || "").toLowerCase() === "active"
  ).length;
  const statesCount = uniqueStates.length;
  const manualCount = suppliers.filter((s) => s.source === "manual").length;

  const handlePartnerInvited = () => {
    // Refresh or reload list
    fetch("/api/superadmin/suppliers")
      .then((r) => r.json())
      .then((d) => {
        if (d.suppliers) setSuppliers(d.suppliers);
      })
      .catch(() => {});
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
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Total Suppliers</div>
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
              <div className="sa-stat-label">Active Suppliers</div>
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
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">States Covered</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-info)" }}>
                {statesCount}
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
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Direct Onboarded</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-accent)" }}>
                {manualCount}
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
        <div style={{ display: "flex", gap: "10px", flex: 1, maxWidth: "560px" }}>
          <div className="relative flex-1">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--sa-caption)" }}
            />
            <input
              type="text"
              placeholder="Search enterprise, brand, contact, state..."
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
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>

          {uniqueStates.length > 0 && (
            <select
              className="sa-input"
              style={{ width: "140px", fontSize: "12px" }}
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="ALL">All States</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Invite Partner Button */}
        <InvitePartnerButton
          clients={clients}
          onSuccess={handlePartnerInvited}
        />
      </div>

      {/* Table */}
      <div className="sa-card" style={{ overflow: "hidden" }}>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Enterprise Name</th>
              <th>Brand / Trade</th>
              <th>Contact Person</th>
              <th>Email &amp; Phone</th>
              <th>Location</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    color: "var(--sa-muted)",
                  }}
                >
                  No suppliers found matching your search.
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                      {supplier.enterprise_name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontFamily: "ui-monospace, monospace",
                        color: "var(--sa-caption)",
                      }}
                    >
                      {supplier.id.slice(0, 8)}
                    </div>
                  </td>
                  <td>
                    {supplier.brand_name ? (
                      <span style={{ fontWeight: 500 }}>{supplier.brand_name}</span>
                    ) : (
                      <span style={{ color: "var(--sa-caption)" }}>—</span>
                    )}
                  </td>
                  <td>{supplier.contact_person || "—"}</td>
                  <td>
                    <div>
                      {supplier.contact_email ? (
                        <div style={{ color: "var(--sa-ink-2)" }}>{supplier.contact_email}</div>
                      ) : null}
                      {supplier.contact_phone ? (
                        <div style={{ fontSize: "11px", color: "var(--sa-muted)" }}>
                          {supplier.contact_phone}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    {supplier.state ? (
                      <span className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 opacity-50" />
                        {supplier.state}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontFamily: "ui-monospace, monospace",
                        color: "var(--sa-muted)",
                      }}
                    >
                      {supplier.source || "manual"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`sa-pill ${
                        supplier.status === "active"
                          ? "sa-pill-active"
                          : supplier.status === "pending"
                          ? "sa-pill-pending"
                          : "sa-pill-expired"
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
