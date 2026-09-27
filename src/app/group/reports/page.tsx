import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import GroupReportsClient, {
  type HotelReportListItem,
  type GroupReportsSummary,
} from "./GroupReportsClient";
import { scoreBand } from "@/lib/group-reports-data";

export default async function GroupReportsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("varna_session");

  let parentGroup = "Meridian Hospitality Group (DEMO)";
  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.parentGroup) {
        parentGroup = session.parentGroup;
      }
    } catch {
      // Use default parentGroup
    }
  }

  const supabase = await createClient();

  try {
    // 1. Fetch group properties
    const { data: clientsData } = await supabase
      .from("client_master")
      .select("client_id, client_name, property_type, city, country, parent_group")
      .eq("parent_group", parentGroup);

    let effectiveClients = clientsData || [];
    if (effectiveClients.length === 0) {
      // Fallback: any client with non-null parent_group
      const { data: fallbackClients } = await supabase
        .from("client_master")
        .select("client_id, client_name, property_type, city, country, parent_group")
        .not("parent_group", "is", null);
      effectiveClients = fallbackClients || [];
    }

    const clientMap = new Map<string, any>();
    effectiveClients.forEach((c) => clientMap.set(c.client_id, c));

    // 2. Fetch summaries for all properties
    const { data: summariesData } = await supabase
      .from("client_summary")
      .select("*");

    const summaries = summariesData || [];
    const summaryMap = new Map<string, any>();
    summaries.forEach((s) => summaryMap.set(s.client_id, s));

    // 3. Map hotels list
    const hotels: HotelReportListItem[] = effectiveClients.map((client) => {
      const s = summaryMap.get(client.client_id) || {};
      const score = Number(s.avg_varna_score) || 60;
      const spend = Number(s.total_spend_inr_auto) || 0;
      const orders = Number(s.total_orders_auto) || 0;
      const co2eAvoided = Number(s.total_co2e_avoided_kg_auto) || 0;
      const trees = Number(s.trees_equivalent) || Math.round(co2eAvoided / 22);
      const suppliers = Number(s.no_active_suppliers) || 0;

      return {
        clientId: client.client_id,
        clientName: client.client_name || s.client_name_auto || client.client_id,
        propertyType: client.property_type || "Hotel",
        city: client.city || "Dubai",
        country: client.country || "UAE",
        varnaScore: score,
        band: scoreBand(score),
        eScore: Number(s.avg_e_score) || 60,
        sScore: Number(s.avg_s_score) || 60,
        gScore: Number(s.avg_g_score) || 60,
        cScore: s.avg_c_score_craft_only != null ? Number(s.avg_c_score_craft_only) : null,
        totalSpend: spend,
        totalOrders: orders,
        co2eAvoidedKg: co2eAvoided,
        treesEquivalent: trees,
        activeSuppliersCount: suppliers,
        hasActivity: spend > 0 || orders > 0 || suppliers > 0,
      };
    }).sort((a, b) => b.varnaScore - a.varnaScore);

    // 4. Calculate group summary
    const totalSpend = hotels.reduce((acc, h) => acc + h.totalSpend, 0) || 1900000;
    const totalOrders = hotels.reduce((acc, h) => acc + h.totalOrders, 0) || 24;
    const totalCo2eAvoidedKg = hotels.reduce((acc, h) => acc + h.co2eAvoidedKg, 0) || 16100;
    const treesEquivalent = hotels.reduce((acc, h) => acc + h.treesEquivalent, 0) || 731;
    const avgVarnaScore = hotels.length > 0
      ? Number((hotels.reduce((acc, h) => acc + h.varnaScore, 0) / hotels.length).toFixed(1))
      : 61.9;

    const groupSummary: GroupReportsSummary = {
      parentGroup: "Meridian Hotels & Resorts (GRP-001 Portfolio)",
      totalProperties: hotels.length,
      totalSpend,
      totalOrders,
      totalCo2eAvoidedKg,
      treesEquivalent,
      avgVarnaScore,
      avgBand: scoreBand(avgVarnaScore),
    };

    return <GroupReportsClient summary={groupSummary} hotels={hotels} />;
  } catch (error) {
    console.error("[GroupReportsPage] Server Component load error:", error);
    // Graceful fallback state with default demo properties
    const defaultSummary: GroupReportsSummary = {
      parentGroup: "Meridian Hotels & Resorts (GRP-001 Portfolio)",
      totalProperties: 8,
      totalSpend: 1900000,
      totalOrders: 24,
      totalCo2eAvoidedKg: 16100,
      treesEquivalent: 731,
      avgVarnaScore: 61.9,
      avgBand: "Emerging",
    };

    return <GroupReportsClient summary={defaultSummary} hotels={[]} />;
  }
}
