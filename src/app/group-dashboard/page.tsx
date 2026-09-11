import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import GroupDashboardClient from "./GroupDashboardClient";

export type GroupSummaryData = {
  parentGroup: string;
  noProperties: number;
  noActiveSupplierRelationships: number;
  totalSpend: number;
  totalCo2eKg: number;
  totalCo2eAvoidedKg: number;
  avgVarnaScore: number;
  avgE: number;
  avgS: number;
  avgG: number;
  avgC: number | null;
  carKmAvoided: number;
  treesEquivalent: number;
  hotelsAboveGroupAvg: number;
  hotelsNeedingSupport: number;
  spendAtRisk: number;
  spendAtRiskPct: number;
  subCriteria: {
    e1: number; e2: number; e3: number; e4: number; e5: number; e6: number;
    s1: number; s2: number; s3: number; s4: number;
    g1: number; g2: number; g3: number;
  };
};

export type HotelLeaderboardItem = {
  clientId: string;
  clientName: string;
  propertyType: string;
  city: string;
  country: string;
  varnaScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number | null;
  totalSpend: number;
  totalOrders: number;
  totalUnits: number;
  co2eKg: number;
  co2eAvoidedKg: number;
  co2ReductionPct: number;
  carKmAvoided: number | null;
  treesEquivalent: number | null;
  activeSuppliers: number;
  varnaLeaders: number;
};

export type SupplierBandSpend = {
  band: string;
  spend: number;
  percentage: number;
  color: string;
};

export type SupplierTierCount = {
  tier: string;
  count: number;
  color: string;
};

export type FullGroupDashboardData = {
  summary: GroupSummaryData;
  hotels: HotelLeaderboardItem[];
  spendByBand: SupplierBandSpend[];
  tierDistribution: SupplierTierCount[];
  uniqueSuppliersCount: number;
};

export default async function GroupDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("varna_session");

  if (!sessionCookie?.value) {
    redirect("/login");
  }

  let session: { clientId: string; clientName: string; isGroup?: boolean; parentGroup?: string };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  const parentGroup = session.parentGroup || "Meridian Hospitality Group (DEMO)";
  const supabase = await createClient();

  try {
    // 1. Fetch properties for this group from client_master
    const { data: clientsData, error: clientsErr } = await supabase
      .from("client_master")
      .select("client_id, client_name, property_type, city, country, parent_group")
      .eq("parent_group", parentGroup);

    if (clientsErr) {
      console.error("Supabase client_master error:", clientsErr);
    }

    const clientMap = new Map<string, any>();
    (clientsData || []).forEach((c) => clientMap.set(c.client_id, c));

    // 2. Fetch property summaries from client_summary
    const { data: summariesData, error: summariesErr } = await supabase
      .from("client_summary")
      .select("*")
      .eq("parent_group", parentGroup);

    if (summariesErr) {
      console.error("Supabase client_summary error:", summariesErr);
    }

    // 3. Fetch supplier details for live group aggregation
    const { data: supplierDetailsData, error: detailsErr } = await supabase
      .from("supplier_detail_by_client")
      .select("*")
      .eq("parent_group", parentGroup);

    if (detailsErr) {
      console.error("Supabase supplier_detail_by_client error:", detailsErr);
    }

    const details = supplierDetailsData || [];
    const summaries = summariesData || [];

    // Compute live aggregation metrics matching 11_GROUP_SUMMARY reference logic
    const noProperties = summaries.length;
    const noActiveSupplierRelationships = details.length;

    const totalSpend = summaries.reduce((acc, row) => acc + (Number(row.total_spend_inr_auto) || 0), 0);
    const totalCo2eKg = summaries.reduce((acc, row) => acc + (Number(row.total_co2e_kg_auto) || 0), 0);
    const totalCo2eAvoidedKg = summaries.reduce((acc, row) => acc + (Number(row.total_co2e_avoided_kg_auto) || 0), 0);
    const carKmAvoided = summaries.reduce((acc, row) => acc + (Number(row.car_km_avoided) || 0), 0);
    const treesEquivalent = summaries.reduce((acc, row) => acc + (Number(row.trees_equivalent) || 0), 0);

    // Group-level averages computed across supplier detail rows
    const avgVarnaScore = details.length > 0
      ? Number((details.reduce((acc, r) => acc + (Number(r.varna_score_auto) || 0), 0) / details.length).toFixed(1))
      : 0;

    const avgE = details.length > 0
      ? Number((details.reduce((acc, r) => acc + (Number(r.e_score_auto) || 0), 0) / details.length).toFixed(1))
      : 0;

    const avgS = details.length > 0
      ? Number((details.reduce((acc, r) => acc + (Number(r.s_score_auto) || 0), 0) / details.length).toFixed(1))
      : 0;

    const avgG = details.length > 0
      ? Number((details.reduce((acc, r) => acc + (Number(r.g_score_auto) || 0), 0) / details.length).toFixed(1))
      : 0;

    // Sub-criteria averages across supplier detail rows
    const calcSub = (field: string) => {
      const valid = details.map((r) => r[field]).filter((v) => v !== null && v !== undefined && !isNaN(Number(v)));
      return valid.length > 0 ? Number((valid.reduce((acc, v) => acc + Number(v), 0) / valid.length).toFixed(1)) : 0;
    };

    const subCriteria = {
      e1: calcSub("e1_carbon_auto"),
      e2: calcSub("e2_material_pct_auto"),
      e3: calcSub("e3_circularity_auto"),
      e4: calcSub("e4_water_auto"),
      e5: calcSub("e5_pollution_auto"),
      e6: calcSub("e6_packaging_auto"),
      s1: calcSub("s1_employment_auto"),
      s2: calcSub("s2_gender_auto"),
      s3: calcSub("s3_wages_auto"),
      s4: calcSub("s4_health_auto"),
      g1: calcSub("g1_legal_auto"),
      g2: calcSub("g2_ethics_auto"),
      g3: calcSub("g3_sourcing_auto"),
    };

    // Key Insights: Hotels Above Avg, Hotels Needing Support (<50), Spend at Risk
    const hotelsAboveGroupAvg = summaries.filter((s) => Number(s.avg_varna_score) > avgVarnaScore).length;
    const hotelsNeedingSupport = summaries.filter((s) => Number(s.avg_varna_score) < 50).length;

    const spendAtRisk = details
      .filter((r) => r.band_auto === "Foundational" || r.band_auto === "Not Ready")
      .reduce((acc, r) => acc + (Number(r.orders_inr_ytd_auto) || 0), 0);

    const spendAtRiskPct = totalSpend > 0 ? Number(((spendAtRisk / totalSpend) * 100).toFixed(1)) : 0;

    const groupSummary: GroupSummaryData = {
      parentGroup,
      noProperties,
      noActiveSupplierRelationships,
      totalSpend,
      totalCo2eKg,
      totalCo2eAvoidedKg,
      avgVarnaScore,
      avgE,
      avgS,
      avgG,
      avgC: null, // N/A per 11_GROUP_SUMMARY reference
      carKmAvoided,
      treesEquivalent,
      hotelsAboveGroupAvg,
      hotelsNeedingSupport,
      spendAtRisk,
      spendAtRiskPct,
      subCriteria,
    };

    // Build Hotel Leaderboard Items
    const hotels: HotelLeaderboardItem[] = summaries.map((s) => {
      const master = clientMap.get(s.client_id) || {};
      return {
        clientId: s.client_id,
        clientName: s.client_name_auto || master.client_name || s.client_id,
        propertyType: master.property_type || "Hotel",
        city: master.city || "Unknown",
        country: master.country || "Unknown",
        varnaScore: Number(s.avg_varna_score) || 0,
        eScore: Number(s.avg_e_score) || 0,
        sScore: Number(s.avg_s_score) || 0,
        gScore: Number(s.avg_g_score) || 0,
        cScore: s.avg_c_score_craft_only !== null && s.avg_c_score_craft_only !== undefined ? Number(s.avg_c_score_craft_only) : null,
        totalSpend: Number(s.total_spend_inr_auto) || 0,
        totalOrders: Number(s.total_orders_auto) || 0,
        totalUnits: Number(s.total_units_auto) || 0,
        co2eKg: Number(s.total_co2e_kg_auto) || 0,
        co2eAvoidedKg: Number(s.total_co2e_avoided_kg_auto) || 0,
        co2ReductionPct: Number(s.co2_reduction_pct_auto) || 0,
        carKmAvoided: s.car_km_avoided !== null && s.car_km_avoided !== undefined ? Number(s.car_km_avoided) : null,
        treesEquivalent: s.trees_equivalent !== null && s.trees_equivalent !== undefined ? Number(s.trees_equivalent) : null,
        activeSuppliers: Number(s.no_active_suppliers) || 0,
        varnaLeaders: Number(s.no_varna_leaders) || 0,
      };
    }).sort((a, b) => b.varnaScore - a.varnaScore);

    // Compute Group Spend by Supplier Band
    const bandSpendMap: Record<string, number> = {
      "Varna Leader": 0,
      Advanced: 0,
      Emerging: 0,
      Foundational: 0,
      "Not Ready": 0,
    };

    details.forEach((d) => {
      const band = d.band_auto || "Not Ready";
      const spend = Number(d.orders_inr_ytd_auto) || 0;
      if (bandSpendMap[band] !== undefined) {
        bandSpendMap[band] += spend;
      } else {
        bandSpendMap["Not Ready"] += spend;
      }
    });

    const bandColors: Record<string, string> = {
      "Varna Leader": "#738678", // Sage Mineral
      Advanced: "#6F848F",       // Slate Mist
      Emerging: "#A89C82",       // Warm Stone Dark
      Foundational: "#944D25",   // Luminous Clay
      "Not Ready": "#7A3F1E",    // Deep Clay
    };

    const spendByBand: SupplierBandSpend[] = Object.keys(bandSpendMap).map((band) => {
      const spend = bandSpendMap[band];
      return {
        band,
        spend,
        percentage: totalSpend > 0 ? Number(((spend / totalSpend) * 100).toFixed(1)) : 0,
        color: bandColors[band] || "#6F848F",
      };
    });

    // Compute Supplier Tier Distribution across unique suppliers
    const uniqueSuppliersMap = new Map<string, string>();
    details.forEach((d) => {
      if (d.enterprise_id && !uniqueSuppliersMap.has(d.enterprise_id)) {
        uniqueSuppliersMap.set(d.enterprise_id, d.tier_auto || "Micro A");
      }
    });

    const tierCountMap: Record<string, number> = {
      "Micro A": 0,
      "Micro B": 0,
      Small: 0,
      Medium: 0,
    };

    uniqueSuppliersMap.forEach((tier) => {
      if (tierCountMap[tier] !== undefined) {
        tierCountMap[tier]++;
      } else {
        const norm = tier.toLowerCase();
        if (norm.includes("micro a")) tierCountMap["Micro A"]++;
        else if (norm.includes("micro b")) tierCountMap["Micro B"]++;
        else if (norm.includes("small")) tierCountMap["Small"]++;
        else if (norm.includes("medium")) tierCountMap["Medium"]++;
        else tierCountMap["Micro A"]++;
      }
    });

    const tierColors: Record<string, string> = {
      "Micro A": "#6F848F",
      "Micro B": "#8298A5",
      Small: "#738678",
      Medium: "#944D25",
    };

    const tierDistribution: SupplierTierCount[] = Object.keys(tierCountMap).map((tier) => ({
      tier,
      count: tierCountMap[tier],
      color: tierColors[tier] || "#6F848F",
    }));

    const fullData: FullGroupDashboardData = {
      summary: groupSummary,
      hotels,
      spendByBand,
      tierDistribution,
      uniqueSuppliersCount: uniqueSuppliersMap.size,
    };

    return <GroupDashboardClient initialData={fullData} />;
  } catch (error) {
    console.error("GroupDashboard Server Page error:", error);
    redirect("/login");
  }
}
