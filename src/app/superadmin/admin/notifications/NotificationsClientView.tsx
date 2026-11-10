"use client";

import React, { useState } from "react";
import {
  Bell,
  Clock,
  ShieldAlert,
  Save,
  CheckCircle2,
  Calendar,
  Mail,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface NotificationSettings {
  id?: string;
  reminder_max_count: number;
  reminder_window_days: number;
  reminder_min_gap_hours: number;
  invitation_expiry_days: number;
  certificate_expiry_warning_days: number;
}

interface InAppNotification {
  id: string;
  type: string;
  title: string;
  body?: string;
  deep_link?: string;
  is_read: boolean;
  created_at?: string;
}

export default function NotificationsClientView({
  initialSettings,
  initialNotifications,
}: {
  initialSettings: NotificationSettings;
  initialNotifications: InAppNotification[];
}) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [notifications, setNotifications] = useState<InAppNotification[]>(initialNotifications);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/superadmin/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update notification settings.");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Settings Form */}
      <div className="sa-card" style={{ padding: "24px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--sa-ink)" }}>
            Supplier Outreach Cadence
          </h2>
          <p style={{ fontSize: "12px", color: "var(--sa-muted)", marginTop: "2px" }}>
            Automated reminders dispatched to invited and in-progress suppliers.
          </p>
        </div>

        {savedSuccess && (
          <div
            style={{
              padding: "10px 16px",
              background: "var(--sa-success-tint)",
              color: "var(--sa-success-fg)",
              fontSize: "12px",
              borderRadius: "var(--sa-radius-sm)",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Settings saved successfully.
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: "10px 16px",
              background: "var(--sa-danger-tint)",
              color: "var(--sa-danger-fg)",
              fontSize: "12px",
              borderRadius: "var(--sa-radius-sm)",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveSettings}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            <div>
              <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                Max Reminders per Wave
              </label>
              <input
                type="number"
                min={1}
                max={15}
                className="sa-input"
                value={settings.reminder_max_count}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reminder_max_count: Number(e.target.value) || 6,
                  })
                }
              />
              <p style={{ fontSize: "11px", color: "var(--sa-caption)", marginTop: "4px" }}>
                Upper limit of automated nudge emails before escalating to human reviewer.
              </p>
            </div>

            <div>
              <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                Reminder Window (Days)
              </label>
              <input
                type="number"
                min={7}
                max={90}
                className="sa-input"
                value={settings.reminder_window_days}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reminder_window_days: Number(e.target.value) || 28,
                  })
                }
              />
              <p style={{ fontSize: "11px", color: "var(--sa-caption)", marginTop: "4px" }}>
                Total duration of an active assessment completion cycle.
              </p>
            </div>

            <div>
              <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                Min Gap Between Reminders (Hours)
              </label>
              <input
                type="number"
                min={12}
                max={168}
                className="sa-input"
                value={settings.reminder_min_gap_hours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reminder_min_gap_hours: Number(e.target.value) || 48,
                  })
                }
              />
              <p style={{ fontSize: "11px", color: "var(--sa-caption)", marginTop: "4px" }}>
                Spacing window to respect partner inbox boundaries.
              </p>
            </div>

            <div>
              <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                Default Invitation Expiry (Days)
              </label>
              <input
                type="number"
                min={1}
                max={180}
                className="sa-input"
                value={settings.invitation_expiry_days}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    invitation_expiry_days: Number(e.target.value) || 30,
                  })
                }
              />
              <p style={{ fontSize: "11px", color: "var(--sa-caption)", marginTop: "4px" }}>
                Standard lifespan of an initial invitation link.
              </p>
            </div>

            <div>
              <label className="sa-label" style={{ display: "block", marginBottom: "6px" }}>
                Certificate Expiry Warning (Days)
              </label>
              <input
                type="number"
                min={15}
                max={120}
                className="sa-input"
                value={settings.certificate_expiry_warning_days}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    certificate_expiry_warning_days: Number(e.target.value) || 60,
                  })
                }
              />
              <p style={{ fontSize: "11px", color: "var(--sa-caption)", marginTop: "4px" }}>
                Lead time for re-verification prompts before certificate validity lapses.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="sa-btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </form>
      </div>

      {/* Recent In-App Notifications Feed */}
      <div className="sa-card" style={{ padding: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--sa-ink)" }}>
            Recent Platform Alerts &amp; Events
          </h2>
          <p style={{ fontSize: "12px", color: "var(--sa-muted)", marginTop: "2px" }}>
            Operational stream of document uploads, verification requests, and reminder dispatches.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {notifications.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "var(--sa-muted)",
                fontSize: "12px",
              }}
            >
              No active platform alerts in queue.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "12px 16px",
                  background: n.is_read ? "var(--sa-white)" : "var(--sa-sand)",
                  border: "1px solid var(--sa-border)",
                  borderRadius: "var(--sa-radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: n.is_read ? "var(--sa-caption)" : "var(--sa-accent)",
                    }}
                  />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--sa-ink)" }}>
                      {n.title}
                    </div>
                    {n.body && (
                      <div style={{ fontSize: "12px", color: "var(--sa-muted)", marginTop: "2px" }}>
                        {n.body}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "11px", color: "var(--sa-caption)" }}>
                    {n.created_at ? new Date(n.created_at).toLocaleDateString() : "Just now"}
                  </span>
                  {n.deep_link && (
                    <a
                      href={n.deep_link}
                      className="sa-btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "11px" }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
