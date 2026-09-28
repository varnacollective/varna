import React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import ClientOverviewV2 from "@/components/dashboard/v2/ClientOverviewV2";
import { DateRangeProvider } from "@/context/DateRangeContext";
import {
  type DashboardData,
  type SupplierDetail,
  getClientLogoFallback,
  getSupplierLogoFallback,
} from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ hotelId: string }>;
}

const PROPERTIES_DATA: Record<string, {
  clientId: string;
  clientName: string;
  propertyType: string;
  city: string;
  country: string;
  varnaScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
  totalSpendInr: number;
  totalOrders: number;
  co2eAvoidedKg: number;
  treesEquivalent: number;
  activeSuppliers: number;
  varnaLeaders: number;
}> = {
  "CLT-001": {
    clientId: "CLT-001",
    clientName: "The Astor Dubai",
    propertyType: "Luxury Hotel",
    city: "Dubai",
    country: "UAE",
    varnaScore: 84.5,
    eScore: 82.0,
    sScore: 88.5,
    gScore: 85.0,
    cScore: 82.5,
    totalSpendInr: 25000000,
    totalOrders: 5,
    co2eAvoidedKg: 2160,
    treesEquivalent: 98,
    activeSuppliers: 4,
    varnaLeaders: 2,
  },
  "CLT-002": {
    clientId: "CLT-002",
    clientName: "Six Senses The Palm",
    propertyType: "Luxury Resort",
    city: "Dubai",
    country: "UAE",
    varnaScore: 78.9,
    eScore: 81.0,
    sScore: 76.5,
    gScore: 80.0,
    cScore: 78.0,
    totalSpendInr: 19600000,
    totalOrders: 4,
    co2eAvoidedKg: 1820,
    treesEquivalent: 83,
    activeSuppliers: 3,
    varnaLeaders: 1,
  },
  "CLT-003": {
    clientId: "CLT-003",
    clientName: "The Dorchester Dubai",
    propertyType: "Luxury Hotel",
    city: "Dubai",
    country: "UAE",
    varnaScore: 71.8,
    eScore: 69.5,
    sScore: 74.0,
    gScore: 72.5,
    cScore: 71.0,
    totalSpendInr: 15600000,
    totalOrders: 3,
    co2eAvoidedKg: 1410,
    treesEquivalent: 64,
    activeSuppliers: 2,
    varnaLeaders: 1,
  },
  "CLT-004": {
    clientId: "CLT-004",
    clientName: "Meridian Grand Palm",
    propertyType: "Luxury Resort",
    city: "Goa",
    country: "India",
    varnaScore: 81.2,
    eScore: 78.5,
    sScore: 84.0,
    gScore: 82.0,
    cScore: 80.5,
    totalSpendInr: 22800000,
    totalOrders: 6,
    co2eAvoidedKg: 1940,
    treesEquivalent: 88,
    activeSuppliers: 3,
    varnaLeaders: 2,
  },
  "CLT-005": {
    clientId: "CLT-005",
    clientName: "Meridian Oceanview Resort",
    propertyType: "Resort",
    city: "Kochi",
    country: "India",
    varnaScore: 74.3,
    eScore: 72.0,
    sScore: 75.5,
    gScore: 76.0,
    cScore: 73.5,
    totalSpendInr: 16800000,
    totalOrders: 4,
    co2eAvoidedKg: 1540,
    treesEquivalent: 70,
    activeSuppliers: 3,
    varnaLeaders: 1,
  },
  "CLT-006": {
    clientId: "CLT-006",
    clientName: "Meridian Heritage Suites",
    propertyType: "Boutique Hotel",
    city: "Jaipur",
    country: "India",
    varnaScore: 68.4,
    eScore: 65.0,
    sScore: 72.5,
    gScore: 68.0,
    cScore: 68.0,
    totalSpendInr: 13440000,
    totalOrders: 3,
    co2eAvoidedKg: 1280,
    treesEquivalent: 58,
    activeSuppliers: 3,
    varnaLeaders: 1,
  },
  "CLT-007": {
    clientId: "CLT-007",
    clientName: "Meridian Urban Loft",
    propertyType: "Business Hotel",
    city: "Bengaluru",
    country: "India",
    varnaScore: 62.1,
    eScore: 60.5,
    sScore: 63.0,
    gScore: 64.0,
    cScore: 61.0,
    totalSpendInr: 11360000,
    totalOrders: 2,
    co2eAvoidedKg: 960,
    treesEquivalent: 44,
    activeSuppliers: 2,
    varnaLeaders: 0,
  },
  "CLT-008": {
    clientId: "CLT-008",
    clientName: "Meridian Coastal Retreat",
    propertyType: "Resort",
    city: "Alibaug",
    country: "India",
    varnaScore: 56.8,
    eScore: 54.0,
    sScore: 58.5,
    gScore: 59.0,
    cScore: 55.5,
    totalSpendInr: 9440000,
    totalOrders: 2,
    co2eAvoidedKg: 810,
    treesEquivalent: 37,
    activeSuppliers: 2,
    varnaLeaders: 0,
  },
  "CLT-009": {
    clientId: "CLT-009",
    clientName: "Meridian Business Bay",
    propertyType: "Business Hotel",
    city: "Mumbai",
    country: "India",
    varnaScore: 52.4,
    eScore: 50.0,
    sScore: 53.5,
    gScore: 55.0,
    cScore: 51.0,
    totalSpendInr: 8160000,
    totalOrders: 2,
    co2eAvoidedKg: 690,
    treesEquivalent: 31,
    activeSuppliers: 1,
    varnaLeaders: 0,
  },
  "CLT-010": {
    clientId: "CLT-010",
    clientName: "Meridian Hilltop Sanctuary",
    propertyType: "Resort",
    city: "Shimla",
    country: "India",
    varnaScore: 47.9,
    eScore: 45.0,
    sScore: 49.0,
    gScore: 51.5,
    cScore: 46.0,
    totalSpendInr: 6880000,
    totalOrders: 1,
    co2eAvoidedKg: 540,
    treesEquivalent: 25,
    activeSuppliers: 1,
    varnaLeaders: 0,
  },
};

export default async function HotelDashboardDynamicPage({ params }: PageProps) {
  const { hotelId } = await params;
  const decodedId = decodeURIComponent(hotelId);

  // 1. Resolve target hotel metadata
  const normalizedSearch = decodedId.toLowerCase().replace(/[^a-z0-9]/g, "");
  const matchedKey = Object.keys(PROPERTIES_DATA).find((key) => {
    const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    const hotel = PROPERTIES_DATA[key];
    const normName = hotel.clientName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      key.toLowerCase() === decodedId.toLowerCase() ||
      normKey === normalizedSearch ||
      normName === normalizedSearch ||
      hotel.clientName.toLowerCase().includes(decodedId.toLowerCase())
    );
  });

  const property = matchedKey ? PROPERTIES_DATA[matchedKey] : PROPERTIES_DATA["CLT-001"];

  // 2. Fetch live data from Supabase if available
  const supabase = await createClient();

  const [{ data: clientMaster }, { data: clientSummary }, { data: catSpendData }, { data: scoresData }] =
    await Promise.all([
      supabase
        .from("client_master")
        .select("*")
        .or(`client_id.eq.${property.clientId},client_id.eq.${decodedId}`)
        .maybeSingle(),
      supabase
        .from("client_summary")
        .select("*")
        .or(`client_id.eq.${property.clientId},client_id.eq.${decodedId}`)
        .maybeSingle(),
      supabase
        .from("category_spend_by_client")
        .select("*")
        .or(`client_id.eq.${property.clientId},client_id.eq.${decodedId}`),
      supabase
        .from("scores_summary")
        .select("enterprise_id, enterprise_name, logo_path, final_varna_score, e_pillar_score, s_pillar_score, g_pillar_score, c_pillar_score"),
    ]);

  // 3. Static/Global Suppliers Feed (Maintained across views as instructed)
  const suppliersList: SupplierDetail[] = (scoresData && scoresData.length > 0 ? scoresData : [
    { enterprise_name: "Bare Necessities Zero Waste Solutions Pvt. Ltd.", enterprise_id: "ENT-001", final_varna_score: 78, e_pillar_score: 75, s_pillar_score: 80, g_pillar_score: 70, c_pillar_score: 72 },
    { enterprise_name: "UKHI INDIA PRIVATE LIMITED", enterprise_id: "ENT-002", final_varna_score: 56, e_pillar_score: 60, s_pillar_score: 55, g_pillar_score: 50, c_pillar_score: 45 },
    { enterprise_name: "Kheoni Ventures Pvt Ltd", enterprise_id: "ENT-003", final_varna_score: 42, e_pillar_score: 40, s_pillar_score: 45, g_pillar_score: 40, c_pillar_score: 35 },
    { enterprise_name: "Greensole Footwear Pvt Ltd", enterprise_id: "ENT-004", final_varna_score: 72, e_pillar_score: 70, s_pillar_score: 75, g_pillar_score: 68, c_pillar_score: 65 },
    { enterprise_name: "Marikar Green Earth Private Limited", enterprise_id: "ENT-005", final_varna_score: 64, e_pillar_score: 62, s_pillar_score: 65, g_pillar_score: 60, c_pillar_score: 58 },
  ]).map((s: any) => {
    const name = s.enterprise_name || "";
    const lower = name.toLowerCase();
    const isBare = lower.includes("bare");
    const isUKHI = lower.includes("ukhi");
    const tier = isBare ? "Platinum" : isUKHI ? "Gold" : "Silver";

    return {
      clientId: property.clientId,
      enterpriseId: s.enterprise_id || name,
      enterpriseName: name,
      tier,
      varnaScore: s.final_varna_score ?? 0,
      eScore: s.e_pillar_score ?? 0,
      sScore: s.s_pillar_score ?? 0,
      gScore: s.g_pillar_score ?? 0,
      cScore: s.c_pillar_score ?? 0,
      totalSpend: isBare ? 1680000 : isUKHI ? 960000 : 800000,
      totalOrders: isBare ? 12 : isUKHI ? 8 : 5,
      city: isBare ? "Bengaluru" : isUKHI ? "Faridabad" : "Indore",
      state: isBare ? "Karnataka" : isUKHI ? "Haryana" : "Madhya Pradesh",
      artisansEmployed: isBare ? 45 : isUKHI ? 120 : 30,
      womenPercent: isBare ? 82 : isUKHI ? 65 : 75,
      logoPath: s.logo_path || getSupplierLogoFallback(name),
    };
  });

  // 4. Hydrate Category Spend
  const categorySpend =
    catSpendData && catSpendData.length > 0
      ? catSpendData.map((row: any) => ({
          clientId: property.clientId,
          categoryName: row.category_name,
          totalSpend: row.total_spend_inr_auto ?? 0,
          totalOrders: row.total_units_auto ?? 0,
          avgVarnaScore: 0,
        }))
      : [
          {
            clientId: property.clientId,
            categoryName: "Organic Toiletries",
            totalSpend: Math.round(property.totalSpendInr * 0.42),
            totalOrders: Math.round(property.totalOrders * 0.4),
            avgVarnaScore: 84,
          },
          {
            clientId: property.clientId,
            categoryName: "Artisan Ceramics",
            totalSpend: Math.round(property.totalSpendInr * 0.24),
            totalOrders: Math.round(property.totalOrders * 0.25),
            avgVarnaScore: 78,
          },
          {
            clientId: property.clientId,
            categoryName: "Handmade Soap",
            totalSpend: Math.round(property.totalSpendInr * 0.2),
            totalOrders: Math.round(property.totalOrders * 0.2),
            avgVarnaScore: 82,
          },
          {
            clientId: property.clientId,
            categoryName: "Eco-Packaging",
            totalSpend: Math.round(property.totalSpendInr * 0.14),
            totalOrders: Math.round(property.totalOrders * 0.15),
            avgVarnaScore: 80,
          },
        ];

  // 5. Hydrate Tier Distribution
  const tierDistribution = [
    { tier: "Platinum", count: property.varnaLeaders > 0 ? property.varnaLeaders : 2, color: "#7A3F1E" },
    { tier: "Gold", count: Math.max(1, property.activeSuppliers - property.varnaLeaders), color: "#738678" },
    { tier: "Silver", count: 1, color: "#6F848F" },
  ];

  // 6. Assemble Full DashboardData for Client Components
  const dashboardData: DashboardData = {
    client: {
      clientId: property.clientId,
      clientName: clientMaster?.client_name || property.clientName,
      industry: clientMaster?.industry || property.propertyType || "Luxury Hospitality",
      city: clientMaster?.city || property.city,
      state: clientMaster?.state || property.country,
      onboardingDate: clientMaster?.onboarding_date || "2024-01-15",
      status: clientMaster?.status || "Active",
      logoPath: clientMaster?.logo_path || getClientLogoFallback(property.clientName),
    },
    summary: {
      clientId: property.clientId,
      clientName: clientMaster?.client_name || property.clientName,
      totalSpend: clientSummary?.total_spend_inr_auto ?? property.totalSpendInr,
      totalOrders: clientSummary?.total_orders_auto ?? property.totalOrders,
      avgVarnaScore: clientSummary?.avg_varna_score ?? property.varnaScore,
      avgEScore: clientSummary?.avg_e_score ?? property.eScore,
      avgSScore: clientSummary?.avg_s_score ?? property.sScore,
      avgGScore: clientSummary?.avg_g_score ?? property.gScore,
      avgCScore: clientSummary?.avg_c_score_craft_only ?? property.cScore,
      totalCO2eAvoidedKg: clientSummary?.total_co2e_avoided_kg_auto ?? property.co2eAvoidedKg,
      totalArtisansSupported: clientSummary?.total_artisans_supported ?? property.activeSuppliers * 320,
      womenWorkforcePercent: 68.3,
      totalSuppliers: clientSummary?.no_active_suppliers ?? property.activeSuppliers,
      avgLeadTimeDays: 12,
      pillarBreakdown: {
        Environmental: {
          pillarScore: clientSummary?.avg_e_score ?? property.eScore,
          criteria: [
            { name: "Carbon Impact", score: property.eScore + 2, weight: "20%" },
            { name: "Material Sustainability", score: property.eScore - 1, weight: "20%" },
            { name: "Circularity", score: property.eScore, weight: "15%" },
            { name: "Water Management", score: property.eScore - 3, weight: "15%" },
            { name: "Pollution Control", score: property.eScore + 1, weight: "15%" },
            { name: "Packaging", score: property.eScore + 4, weight: "15%" },
          ],
        },
        Social: {
          pillarScore: clientSummary?.avg_s_score ?? property.sScore,
          criteria: [
            { name: "Employment & Livelihood Impact", score: property.sScore + 1, weight: "30%" },
            { name: "Gender Inclusion", score: property.sScore + 3, weight: "25%" },
            { name: "Working Conditions & Fair Wages", score: property.sScore - 2, weight: "25%" },
            { name: "Health, Safety & Wellbeing", score: property.sScore, weight: "20%" },
          ],
        },
        Governance: {
          pillarScore: clientSummary?.avg_g_score ?? property.gScore,
          criteria: [
            { name: "Legal & Regulatory Compliance", score: property.gScore + 2, weight: "40%" },
            { name: "Business Ethics & Honest Dealing", score: property.gScore - 1, weight: "35%" },
            { name: "Responsible Sourcing Basics", score: property.gScore, weight: "25%" },
          ],
        },
        Cultural: {
          pillarScore: clientSummary?.avg_c_score_craft_only ?? property.cScore,
          criteria: [
            { name: "Craft Authenticity & Process Integrity", score: property.cScore + 1, weight: "40%" },
            { name: "Skill Rarity & GI Status", score: property.cScore - 2, weight: "35%" },
            { name: "Climate-Vulnerable Community Context", score: property.cScore, weight: "25%" },
          ],
        },
      },
      sdgImpact: [],
    } as any,
    suppliers: suppliersList,
    categorySpend,
    tierDistribution,
    supplierImpactData: [
      { name: "Bare Necessities", womenPct: 82, wageRatio: 1.8 },
      { name: "UKHI India", womenPct: 65, wageRatio: 1.4 },
      { name: "Kheoni Ventures", womenPct: 75, wageRatio: 1.6 },
    ],
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans">
      {/* ── Breadcrumb Navigation Strip ────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 px-6 lg:px-8 py-3.5 bg-white/70 dark:bg-[#18191D]/70 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/group/properties"
            className="inline-flex items-center gap-1.5 text-[#B85333] dark:text-[#D4705A] hover:underline font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Properties Portfolio</span>
          </Link>
          <span className="text-[#6E7781] dark:text-[#8C9DA8]">/</span>
          <span className="font-semibold text-[#1A1F26] dark:text-[#FAF8F5] truncate max-w-[200px] sm:max-w-none">
            {property.clientName}
          </span>
          <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#556B55]/15 text-[#556B55] dark:text-[#738678] border border-[#556B55]/30 hidden sm:inline-block">
            Hotel Drill-Down View
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#6E7781] dark:text-[#8C9DA8]">
            <MapPin className="w-3.5 h-3.5 text-[#6F848F]" />
            <span>
              {property.city}, {property.country}
            </span>
          </div>

          <Link
            href="/group/properties"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#EAE5DC] dark:border-[#8C9DA8]/20 bg-white dark:bg-[#22252B] text-[#6E7781] dark:text-[#8C9DA8] hover:text-[#1A1F26] dark:hover:text-[#FAF8F5] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Portfolio</span>
          </Link>
        </div>
      </div>

      {/* ── Main Client Overview V2 Section ───────────────────────────── */}
      <div className="p-6 lg:p-8 max-w-[1760px] mx-auto w-full">
        <DateRangeProvider>
          <ClientOverviewV2 data={dashboardData} />
        </DateRangeProvider>
      </div>
    </div>
  );
}
