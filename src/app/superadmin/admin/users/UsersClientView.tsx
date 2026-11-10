"use client";

import React, { useState, useMemo } from "react";
import {
  UserCog,
  Search,
  Plus,
  X,
  CheckCircle2,
  Shield,
  Mail,
  User,
} from "lucide-react";

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: "varna_administrator" | "assessment_team" | "score_reviewer" | "project_lead" | "support";
  is_active: boolean;
  created_at?: string;
}

export default function UsersClientView({
  initialUsers,
}: {
  initialUsers: AdminUserRecord[];
}) {
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminUserRecord["role"]>("assessment_team");
  const [formError, setFormError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "ALL" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError("Name and valid email are required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const res = await fetch("/api/superadmin/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create administrator user.");
      }

      setUsers((prev) => [data.user, ...prev]);
      setModalOpen(false);
      setName("");
      setEmail("");
    } catch (err: any) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (r: AdminUserRecord["role"]) => {
    switch (r) {
      case "varna_administrator":
        return <span className="sa-pill sa-pill-active">Super Admin</span>;
      case "score_reviewer":
        return <span className="sa-pill sa-pill-sent">Score Reviewer</span>;
      case "assessment_team":
        return <span className="sa-pill sa-pill-pending">Assessor</span>;
      case "project_lead":
        return <span className="sa-pill sa-pill-active">Project Lead</span>;
      default:
        return <span className="sa-pill sa-pill-draft">{r}</span>;
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
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Total Staff Users</div>
              <div className="sa-stat-value">{users.length}</div>
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
              <div className="sa-stat-label">Active Team Members</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-success)" }}>
                {users.filter((u) => u.is_active).length}
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
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="sa-stat-label">Score Reviewers</div>
              <div className="sa-stat-value" style={{ color: "var(--sa-accent)" }}>
                {users.filter((u) => u.role === "score_reviewer" || u.role === "varna_administrator").length}
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
              placeholder="Search team members by name, email..."
              className="sa-input"
              style={{ paddingLeft: "32px", fontSize: "12px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="sa-input"
            style={{ width: "160px", fontSize: "12px" }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="varna_administrator">Varna Administrator</option>
            <option value="score_reviewer">Score Reviewer</option>
            <option value="assessment_team">Assessment Team</option>
            <option value="project_lead">Project Lead</option>
            <option value="support">Support</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="sa-btn-primary"
        >
          <Plus className="w-4 h-4" />
          + Add Team Member
        </button>
      </div>

      {/* Table */}
      <div className="sa-card" style={{ overflow: "hidden" }}>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email Address</th>
              <th>Role Assignment</th>
              <th>Status</th>
              <th>Added Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    color: "var(--sa-muted)",
                  }}
                >
                  No team members matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--sa-ink)" }}>
                      {user.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: "var(--sa-ink-2)" }}>{user.email}</span>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <span
                      className={`sa-pill ${
                        user.is_active ? "sa-pill-active" : "sa-pill-expired"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ fontSize: "11px", color: "var(--sa-caption)" }}>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
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
                Add Staff Member
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

            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sahar Mansoor"
                    className="sa-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sahar@varnacollective.com"
                    className="sa-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                    Role Assignment
                  </label>
                  <select
                    className="sa-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                  >
                    <option value="assessment_team">Assessment Team (Reviewer)</option>
                    <option value="score_reviewer">Score Reviewer (Sign-Off Authority)</option>
                    <option value="project_lead">Project Lead (Client Oversight)</option>
                    <option value="varna_administrator">Varna Administrator (Full Control)</option>
                    <option value="support">Support</option>
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
                  {saving ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
