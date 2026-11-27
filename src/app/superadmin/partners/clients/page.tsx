import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { Users, Building2, CheckCircle2, Shield, Calendar, Search } from "lucide-react";
import Link from "next/link";
import ClientsClientView from "./ClientsClientView";
import { CLIENT_COLUMNS, toClientRecord, type ClientMasterRow } from "@/lib/clients";

export const revalidate = 0;

export default async function PartnerClientsPage() {
  const supabase = createAdminClient();

  const { data: clientRows } = await supabase
    .from("client_master")
    .select(CLIENT_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id")
    .overrideTypes<ClientMasterRow[], { merge: false }>();
  const clients = (clientRows ?? []).map(toClientRecord);

  // Fetch link counts
  const { data: linksData } = await supabase
    .from("partner_client_supplier_links")
    .select("client_id");

  const countsByClient: Record<string, number> = {};
  if (linksData) {
    for (const link of linksData) {
      if (link.client_id) {
        countsByClient[link.client_id] = (countsByClient[link.client_id] || 0) + 1;
      }
    }
  }

  const enrichedClients = clients.map((c) => ({
    ...c,
    supplier_count: countsByClient[c.id] || 0,
  }));

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
            <Building2 className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Client Organisations</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Hospitality brand clients participating in the Varna supplier assessment and Scope 3 network.
          </p>
        </div>
      </div>

      <ClientsClientView initialClients={enrichedClients} />
    </div>
  );
}
