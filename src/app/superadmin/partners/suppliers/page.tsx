import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { Package, Search } from "lucide-react";
import SuppliersClientView from "./SuppliersClientView";

export const revalidate = 0;

export default async function PartnerSuppliersPage() {
  const supabase = createAdminClient();

  // Fetch partner_suppliers
  const { data: suppliersData } = await supabase
    .from("partner_suppliers")
    .select("*")
    .order("created_at", { ascending: false });

  let suppliers = suppliersData || [];

  // Fallback to enterprise_master if partner_suppliers is empty
  if (suppliers.length === 0) {
    const { data: enterpriseMasterData } = await supabase
      .from("enterprise_master")
      .select("*");

    if (enterpriseMasterData && enterpriseMasterData.length > 0) {
      suppliers = enterpriseMasterData.map((em: any) => ({
        id: em.enterprise_id || String(em.id),
        enterprise_name: em.enterprise_name || em.name,
        brand_name: em.brand_name || em.trading_name || null,
        contact_person: em.contact_person || em.founder || "Manager",
        contact_email: em.contact_email || em.email || "info@artisan.in",
        contact_phone: em.contact_phone || em.phone || null,
        state: em.state || em.location || null,
        status: "active",
        source: "manual",
        created_at: em.created_at || new Date().toISOString(),
      }));
    }
  }

  // Fetch clients for the Invite Partner modal
  const { data: clientsData } = await supabase
    .from("partner_clients")
    .select("id, name")
    .order("name");

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
            <Package className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Suppliers Directory</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Comprehensive directory of artisan producers, ethical manufacturers, and verified suppliers.
          </p>
        </div>
      </div>

      <SuppliersClientView
        initialSuppliers={suppliers}
        clients={clientsData || []}
      />
    </div>
  );
}
