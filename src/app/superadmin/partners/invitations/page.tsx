import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { Mail } from "lucide-react";
import InvitationsClientView from "./InvitationsClientView";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ action?: string }>;
}

export default async function PartnerInvitationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const autoOpenInvite = params?.action === "invite";

  const supabase = createAdminClient();

  const [invitationsRes, clientsRes] = await Promise.all([
    supabase
      .from("partner_invitations")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("partner_clients")
      .select("id, name")
      .order("name"),
  ]);

  const invitations = invitationsRes.data || [];
  const clients = clientsRes.data || [];

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
            <Mail className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Partner Invitations</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Track invitation links, send batches, manage expiry timelines, and view completion rates.
          </p>
        </div>
      </div>

      <InvitationsClientView
        initialInvitations={invitations}
        clients={clients}
        autoOpenInvite={autoOpenInvite}
      />
    </div>
  );
}
