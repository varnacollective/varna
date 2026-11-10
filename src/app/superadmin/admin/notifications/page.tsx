import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { Bell } from "lucide-react";
import NotificationsClientView from "./NotificationsClientView";

export const revalidate = 0;

export default async function AdminNotificationsPage() {
  const supabase = createAdminClient();

  // Fetch notification_settings
  const { data: settingsData } = await supabase
    .from("notification_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  // Fetch recent in_app_notifications
  const { data: notificationsData } = await supabase
    .from("in_app_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const defaultSettings = settingsData || {
    reminder_max_count: 6,
    reminder_window_days: 28,
    reminder_min_gap_hours: 48,
    invitation_expiry_days: 30,
    certificate_expiry_warning_days: 60,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          borderBottom: "1px solid var(--sa-border)",
          paddingBottom: "16px",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Notification &amp; Reminder Settings</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Configure supplier outreach cadence, automated nudges, and monitor platform event notifications.
          </p>
        </div>
      </div>

      <NotificationsClientView
        initialSettings={defaultSettings}
        initialNotifications={notificationsData || []}
      />
    </div>
  );
}
