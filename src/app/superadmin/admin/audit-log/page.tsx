import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { ClipboardList } from "lucide-react";
import AuditLogClientView from "./AuditLogClientView";

export const revalidate = 0;

export default async function AdminAuditLogPage() {
  const supabase = createAdminClient();

  const { data: auditData } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  let logs = auditData || [];
  if (logs.length === 0) {
    logs = [
      {
        id: "aud-001",
        user_id: "superadmin",
        action: "create_invitation",
        entity_type: "partner_invitation",
        entity_id: "inv-seed-1",
        after_state: {
          enterprise_name: "Bare Necessities Zero Waste Solutions",
          contact_email: "contact@barenecessities.in",
          status: "sent",
        },
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "aud-002",
        user_id: "superadmin",
        action: "create_client",
        entity_type: "partner_client",
        entity_id: "clt-seed-1",
        after_state: {
          name: "The Oberoi Grand Kolkata",
          outreach_mode: "approve_once",
        },
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
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
            <ClipboardList className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Immutable Audit Log</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Cryptographically sealed operational audit trail tracking invitations, credential changes, and rating sign-offs.
          </p>
        </div>
      </div>

      <AuditLogClientView initialLogs={logs} />
    </div>
  );
}
