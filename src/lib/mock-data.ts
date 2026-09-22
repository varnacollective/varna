// ============================================================================
// Mock Data: Varna Collective Sustainability Dashboard
// Mirrors the Google Sheets: 9_CLIENT_MASTER, 6_CLIENT_SUMMARY,
// 7_SUPPLIER_DETAIL_BY_CLIENT, 8_CATEGORY_SPEND_BY_CLIENT
// ============================================================================

export interface ClientMaster {
  clientId: string;
  clientName: string;
  industry: string;
  city: string;
  state: string;
  onboardingDate: string;
  status: string;
  logoPath?: string;
}

export interface ClientSummary {
  clientId: string;
  clientName: string;
  totalSpend: number;
  totalOrders: number;
  avgVarnaScore: number;
  avgEScore: number;
  avgSScore: number;
  avgGScore: number;
  avgCScore: number;
  totalCO2eAvoidedKg: number;
  totalArtisansSupported: number;
  womenWorkforcePercent: number;
  totalSuppliers: number;
  avgLeadTimeDays: number;
  pillarBreakdown?: Record<string, any>;
  logoPath?: string;
}

export interface SupplierDetail {
  clientId: string;
  enterpriseId: string;
  enterpriseName: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  varnaScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  cScore: number;
  totalSpend: number;
  totalOrders: number;
  city: string;
  state: string;
  artisansEmployed: number;
  womenPercent: number;
  logoPath?: string;
  isCraftLed?: boolean;
  sdgIds?: number[];
  badges?: string[];
  roadmapAction1?: string;
  action1UpliftPts?: number;
  action1Effort?: string;
}

export interface CategorySpend {
  clientId: string;
  categoryName: string;
  totalSpend: number;
  totalOrders: number;
  avgVarnaScore: number;
}

export interface DashboardData {
  client: ClientMaster;
  summary: ClientSummary;
  suppliers: SupplierDetail[];
  categorySpend: CategorySpend[];
  tierDistribution: { tier: string; count: number; color: string }[];
  supplierImpactData: { name: string; womenPct: number; wageRatio: number }[];
}

// ──────────────── 9_CLIENT_MASTER ────────────────

export const MOCK_CLIENTS: ClientMaster[] = [
  {
    clientId: "CLT001",
    clientName: "A Group",
    industry: "Luxury Hospitality",
    city: "Mumbai",
    state: "Maharashtra",
    onboardingDate: "2024-01-15",
    status: "Active",
  },
  {
    clientId: "CLT002",
    clientName: "Taj Hotels & Resorts",
    industry: "Luxury Hospitality",
    city: "Mumbai",
    state: "Maharashtra",
    onboardingDate: "2024-02-20",
    status: "Active",
  },
  {
    clientId: "CLT003",
    clientName: "ITC Hotels",
    industry: "Premium Hospitality",
    city: "Kolkata",
    state: "West Bengal",
    onboardingDate: "2024-03-10",
    status: "Active",
  },
  {
    clientId: "CLT004",
    clientName: "Leela Palace Hotels",
    industry: "Ultra Luxury Hospitality",
    city: "Bengaluru",
    state: "Karnataka",
    onboardingDate: "2024-04-05",
    status: "Active",
  },
];

// ──────────────── 6_CLIENT_SUMMARY ────────────────

export const MOCK_CLIENT_SUMMARIES: ClientSummary[] = [
  {
    clientId: "CLT001",
    clientName: "A Group",
    totalSpend: 4875000,
    totalOrders: 342,
    avgVarnaScore: 82.4,
    avgEScore: 78.5,
    avgSScore: 85.2,
    avgGScore: 80.1,
    avgCScore: 86.0,
    totalCO2eAvoidedKg: 12450,
    totalArtisansSupported: 1247,
    womenWorkforcePercent: 68.3,
    totalSuppliers: 28,
    avgLeadTimeDays: 12,
  },
  {
    clientId: "CLT002",
    clientName: "Taj Hotels & Resorts",
    totalSpend: 6230000,
    totalOrders: 478,
    avgVarnaScore: 79.1,
    avgEScore: 75.8,
    avgSScore: 82.4,
    avgGScore: 77.9,
    avgCScore: 80.5,
    totalCO2eAvoidedKg: 15890,
    totalArtisansSupported: 1856,
    womenWorkforcePercent: 72.1,
    totalSuppliers: 35,
    avgLeadTimeDays: 14,
  },
  {
    clientId: "CLT003",
    clientName: "ITC Hotels",
    totalSpend: 3560000,
    totalOrders: 256,
    avgVarnaScore: 88.7,
    avgEScore: 90.2,
    avgSScore: 87.5,
    avgGScore: 86.3,
    avgCScore: 90.8,
    totalCO2eAvoidedKg: 9870,
    totalArtisansSupported: 945,
    womenWorkforcePercent: 65.7,
    totalSuppliers: 22,
    avgLeadTimeDays: 10,
  },
  {
    clientId: "CLT004",
    clientName: "Leela Palace Hotels",
    totalSpend: 5120000,
    totalOrders: 389,
    avgVarnaScore: 76.3,
    avgEScore: 73.1,
    avgSScore: 79.8,
    avgGScore: 74.5,
    avgCScore: 77.9,
    totalCO2eAvoidedKg: 11230,
    totalArtisansSupported: 1102,
    womenWorkforcePercent: 61.4,
    totalSuppliers: 30,
    avgLeadTimeDays: 15,
  },
];

// ──────────────── 7_SUPPLIER_DETAIL_BY_CLIENT ────────────────

export const MOCK_SUPPLIER_DETAILS: SupplierDetail[] = [
  // CLT001: The Oberoi Group suppliers
  { clientId: "CLT001", enterpriseId: "ENT001", enterpriseName: "Khadi Naturals", tier: "Platinum", varnaScore: 92, eScore: 95, sScore: 90, gScore: 88, cScore: 94, totalSpend: 520000, totalOrders: 45, city: "Jaipur", state: "Rajasthan", artisansEmployed: 120, womenPercent: 78 },
  { clientId: "CLT001", enterpriseId: "ENT002", enterpriseName: "Anokhi Textiles", tier: "Platinum", varnaScore: 89, eScore: 85, sScore: 92, gScore: 87, cScore: 91, totalSpend: 480000, totalOrders: 38, city: "Jaipur", state: "Rajasthan", artisansEmployed: 95, womenPercent: 82 },
  { clientId: "CLT001", enterpriseId: "ENT003", enterpriseName: "GreenWeave Co.", tier: "Gold", varnaScore: 84, eScore: 88, sScore: 80, gScore: 82, cScore: 86, totalSpend: 350000, totalOrders: 32, city: "Varanasi", state: "Uttar Pradesh", artisansEmployed: 75, womenPercent: 65 },
  { clientId: "CLT001", enterpriseId: "ENT004", enterpriseName: "Dharma Crafts", tier: "Gold", varnaScore: 81, eScore: 79, sScore: 84, gScore: 80, cScore: 82, totalSpend: 310000, totalOrders: 28, city: "Chennai", state: "Tamil Nadu", artisansEmployed: 60, womenPercent: 70 },
  { clientId: "CLT001", enterpriseId: "ENT005", enterpriseName: "Terra Ceramics", tier: "Gold", varnaScore: 80, eScore: 82, sScore: 78, gScore: 79, cScore: 81, totalSpend: 290000, totalOrders: 25, city: "Khurja", state: "Uttar Pradesh", artisansEmployed: 55, womenPercent: 45 },
  { clientId: "CLT001", enterpriseId: "ENT006", enterpriseName: "Saheli Handlooms", tier: "Silver", varnaScore: 76, eScore: 74, sScore: 79, gScore: 75, cScore: 77, totalSpend: 250000, totalOrders: 22, city: "Maheshwar", state: "Madhya Pradesh", artisansEmployed: 42, womenPercent: 88 },
  { clientId: "CLT001", enterpriseId: "ENT007", enterpriseName: "Bamboo Bazar", tier: "Silver", varnaScore: 73, eScore: 78, sScore: 70, gScore: 72, cScore: 71, totalSpend: 220000, totalOrders: 20, city: "Agartala", state: "Tripura", artisansEmployed: 38, womenPercent: 55 },
  { clientId: "CLT001", enterpriseId: "ENT008", enterpriseName: "Nirmala Pottery", tier: "Silver", varnaScore: 71, eScore: 70, sScore: 73, gScore: 70, cScore: 72, totalSpend: 195000, totalOrders: 18, city: "Jaipur", state: "Rajasthan", artisansEmployed: 32, womenPercent: 60 },
  { clientId: "CLT001", enterpriseId: "ENT009", enterpriseName: "EcoFiber Mills", tier: "Bronze", varnaScore: 68, eScore: 72, sScore: 65, gScore: 67, cScore: 68, totalSpend: 160000, totalOrders: 15, city: "Ahmedabad", state: "Gujarat", artisansEmployed: 28, womenPercent: 40 },
  { clientId: "CLT001", enterpriseId: "ENT010", enterpriseName: "Rudra Artisans", tier: "Bronze", varnaScore: 65, eScore: 63, sScore: 68, gScore: 64, cScore: 66, totalSpend: 100000, totalOrders: 12, city: "Jodhpur", state: "Rajasthan", artisansEmployed: 22, womenPercent: 50 },

  // CLT002 suppliers
  { clientId: "CLT002", enterpriseId: "ENT011", enterpriseName: "Chanderi Silks", tier: "Platinum", varnaScore: 90, eScore: 88, sScore: 93, gScore: 87, cScore: 92, totalSpend: 680000, totalOrders: 52, city: "Chanderi", state: "Madhya Pradesh", artisansEmployed: 145, womenPercent: 85 },
  { clientId: "CLT002", enterpriseId: "ENT012", enterpriseName: "Himalayan Herbals", tier: "Platinum", varnaScore: 87, eScore: 92, sScore: 84, gScore: 85, cScore: 88, totalSpend: 590000, totalOrders: 48, city: "Dehradun", state: "Uttarakhand", artisansEmployed: 110, womenPercent: 75 },
  { clientId: "CLT002", enterpriseId: "ENT003", enterpriseName: "GreenWeave Co.", tier: "Gold", varnaScore: 84, eScore: 88, sScore: 80, gScore: 82, cScore: 86, totalSpend: 420000, totalOrders: 36, city: "Varanasi", state: "Uttar Pradesh", artisansEmployed: 75, womenPercent: 65 },
  { clientId: "CLT002", enterpriseId: "ENT013", enterpriseName: "Indigo Roots", tier: "Gold", varnaScore: 82, eScore: 85, sScore: 80, gScore: 78, cScore: 84, totalSpend: 380000, totalOrders: 30, city: "Bagru", state: "Rajasthan", artisansEmployed: 68, womenPercent: 72 },
  { clientId: "CLT002", enterpriseId: "ENT014", enterpriseName: "Lakshmi Brass", tier: "Silver", varnaScore: 75, eScore: 72, sScore: 78, gScore: 74, cScore: 76, totalSpend: 280000, totalOrders: 24, city: "Moradabad", state: "Uttar Pradesh", artisansEmployed: 50, womenPercent: 35 },
  { clientId: "CLT002", enterpriseId: "ENT015", enterpriseName: "Coir Collective", tier: "Silver", varnaScore: 72, eScore: 76, sScore: 70, gScore: 71, cScore: 72, totalSpend: 240000, totalOrders: 20, city: "Alappuzha", state: "Kerala", artisansEmployed: 45, womenPercent: 80 },
  { clientId: "CLT002", enterpriseId: "ENT016", enterpriseName: "Stone Artistry", tier: "Bronze", varnaScore: 67, eScore: 65, sScore: 70, gScore: 66, cScore: 68, totalSpend: 180000, totalOrders: 16, city: "Agra", state: "Uttar Pradesh", artisansEmployed: 30, womenPercent: 25 },

  // CLT003 suppliers
  { clientId: "CLT003", enterpriseId: "ENT001", enterpriseName: "Khadi Naturals", tier: "Platinum", varnaScore: 92, eScore: 95, sScore: 90, gScore: 88, cScore: 94, totalSpend: 620000, totalOrders: 50, city: "Jaipur", state: "Rajasthan", artisansEmployed: 120, womenPercent: 78 },
  { clientId: "CLT003", enterpriseId: "ENT017", enterpriseName: "Bengal Looms", tier: "Platinum", varnaScore: 91, eScore: 89, sScore: 94, gScore: 88, cScore: 93, totalSpend: 560000, totalOrders: 42, city: "Shantiniketan", state: "West Bengal", artisansEmployed: 130, womenPercent: 82 },
  { clientId: "CLT003", enterpriseId: "ENT018", enterpriseName: "Dokra Heritage", tier: "Gold", varnaScore: 86, eScore: 83, sScore: 88, gScore: 85, cScore: 89, totalSpend: 400000, totalOrders: 35, city: "Bankura", state: "West Bengal", artisansEmployed: 80, womenPercent: 60 },
  { clientId: "CLT003", enterpriseId: "ENT019", enterpriseName: "Terracotta Tales", tier: "Gold", varnaScore: 83, eScore: 87, sScore: 80, gScore: 82, cScore: 84, totalSpend: 340000, totalOrders: 28, city: "Bishnupur", state: "West Bengal", artisansEmployed: 65, womenPercent: 55 },
  { clientId: "CLT003", enterpriseId: "ENT020", enterpriseName: "Kantha Works", tier: "Silver", varnaScore: 78, eScore: 75, sScore: 82, gScore: 76, cScore: 80, totalSpend: 260000, totalOrders: 22, city: "Bolpur", state: "West Bengal", artisansEmployed: 48, womenPercent: 90 },
  { clientId: "CLT003", enterpriseId: "ENT009", enterpriseName: "EcoFiber Mills", tier: "Bronze", varnaScore: 68, eScore: 72, sScore: 65, gScore: 67, cScore: 68, totalSpend: 180000, totalOrders: 14, city: "Ahmedabad", state: "Gujarat", artisansEmployed: 28, womenPercent: 40 },

  // CLT004 suppliers
  { clientId: "CLT004", enterpriseId: "ENT002", enterpriseName: "Anokhi Textiles", tier: "Platinum", varnaScore: 89, eScore: 85, sScore: 92, gScore: 87, cScore: 91, totalSpend: 550000, totalOrders: 44, city: "Jaipur", state: "Rajasthan", artisansEmployed: 95, womenPercent: 82 },
  { clientId: "CLT004", enterpriseId: "ENT021", enterpriseName: "Mysore Silks", tier: "Platinum", varnaScore: 88, eScore: 84, sScore: 91, gScore: 86, cScore: 90, totalSpend: 520000, totalOrders: 40, city: "Mysuru", state: "Karnataka", artisansEmployed: 105, womenPercent: 76 },
  { clientId: "CLT004", enterpriseId: "ENT022", enterpriseName: "Sandur Crafts", tier: "Gold", varnaScore: 82, eScore: 80, sScore: 85, gScore: 81, cScore: 83, totalSpend: 390000, totalOrders: 32, city: "Sandur", state: "Karnataka", artisansEmployed: 72, womenPercent: 68 },
  { clientId: "CLT004", enterpriseId: "ENT004", enterpriseName: "Dharma Crafts", tier: "Gold", varnaScore: 81, eScore: 79, sScore: 84, gScore: 80, cScore: 82, totalSpend: 350000, totalOrders: 30, city: "Chennai", state: "Tamil Nadu", artisansEmployed: 60, womenPercent: 70 },
  { clientId: "CLT004", enterpriseId: "ENT023", enterpriseName: "Auroville Papers", tier: "Silver", varnaScore: 77, eScore: 82, sScore: 74, gScore: 75, cScore: 76, totalSpend: 280000, totalOrders: 25, city: "Auroville", state: "Tamil Nadu", artisansEmployed: 40, womenPercent: 58 },
  { clientId: "CLT004", enterpriseId: "ENT024", enterpriseName: "Channapatna Toys", tier: "Silver", varnaScore: 74, eScore: 71, sScore: 77, gScore: 73, cScore: 75, totalSpend: 230000, totalOrders: 20, city: "Channapatna", state: "Karnataka", artisansEmployed: 35, womenPercent: 45 },
  { clientId: "CLT004", enterpriseId: "ENT025", enterpriseName: "Bidri Works", tier: "Bronze", varnaScore: 69, eScore: 66, sScore: 72, gScore: 68, cScore: 70, totalSpend: 180000, totalOrders: 16, city: "Bidar", state: "Karnataka", artisansEmployed: 25, womenPercent: 30 },
];

// ──────────────── 8_CATEGORY_SPEND_BY_CLIENT ────────────────

export const MOCK_CATEGORY_SPEND: CategorySpend[] = [
  // CLT001
  { clientId: "CLT001", categoryName: "Handloom Textiles", totalSpend: 1250000, totalOrders: 95, avgVarnaScore: 86 },
  { clientId: "CLT001", categoryName: "Organic Toiletries", totalSpend: 890000, totalOrders: 72, avgVarnaScore: 84 },
  { clientId: "CLT001", categoryName: "Artisan Ceramics", totalSpend: 720000, totalOrders: 55, avgVarnaScore: 79 },
  { clientId: "CLT001", categoryName: "Bamboo Products", totalSpend: 580000, totalOrders: 42, avgVarnaScore: 81 },
  { clientId: "CLT001", categoryName: "Natural Dyes & Inks", totalSpend: 450000, totalOrders: 30, avgVarnaScore: 88 },
  { clientId: "CLT001", categoryName: "Brass & Metalware", totalSpend: 385000, totalOrders: 24, avgVarnaScore: 76 },
  { clientId: "CLT001", categoryName: "Handmade Paper", totalSpend: 320000, totalOrders: 18, avgVarnaScore: 83 },
  { clientId: "CLT001", categoryName: "Coir & Jute", totalSpend: 280000, totalOrders: 6, avgVarnaScore: 77 },

  // CLT002
  { clientId: "CLT002", categoryName: "Handloom Textiles", totalSpend: 1680000, totalOrders: 120, avgVarnaScore: 83 },
  { clientId: "CLT002", categoryName: "Organic Toiletries", totalSpend: 1120000, totalOrders: 90, avgVarnaScore: 81 },
  { clientId: "CLT002", categoryName: "Natural Dyes & Inks", totalSpend: 850000, totalOrders: 65, avgVarnaScore: 85 },
  { clientId: "CLT002", categoryName: "Artisan Ceramics", totalSpend: 780000, totalOrders: 58, avgVarnaScore: 78 },
  { clientId: "CLT002", categoryName: "Brass & Metalware", totalSpend: 620000, totalOrders: 45, avgVarnaScore: 74 },
  { clientId: "CLT002", categoryName: "Stone Carving", totalSpend: 480000, totalOrders: 32, avgVarnaScore: 72 },
  { clientId: "CLT002", categoryName: "Coir & Jute", totalSpend: 400000, totalOrders: 38, avgVarnaScore: 76 },
  { clientId: "CLT002", categoryName: "Bamboo Products", totalSpend: 300000, totalOrders: 30, avgVarnaScore: 80 },

  // CLT003
  { clientId: "CLT003", categoryName: "Handloom Textiles", totalSpend: 1080000, totalOrders: 82, avgVarnaScore: 91 },
  { clientId: "CLT003", categoryName: "Terracotta & Pottery", totalSpend: 680000, totalOrders: 48, avgVarnaScore: 87 },
  { clientId: "CLT003", categoryName: "Organic Toiletries", totalSpend: 560000, totalOrders: 40, avgVarnaScore: 89 },
  { clientId: "CLT003", categoryName: "Dokra Metalcraft", totalSpend: 480000, totalOrders: 35, avgVarnaScore: 86 },
  { clientId: "CLT003", categoryName: "Kantha Embroidery", totalSpend: 420000, totalOrders: 28, avgVarnaScore: 90 },
  { clientId: "CLT003", categoryName: "Bamboo Products", totalSpend: 340000, totalOrders: 23, avgVarnaScore: 85 },

  // CLT004
  { clientId: "CLT004", categoryName: "Silk Textiles", totalSpend: 1350000, totalOrders: 98, avgVarnaScore: 80 },
  { clientId: "CLT004", categoryName: "Sandalwood Products", totalSpend: 920000, totalOrders: 72, avgVarnaScore: 78 },
  { clientId: "CLT004", categoryName: "Artisan Ceramics", totalSpend: 680000, totalOrders: 52, avgVarnaScore: 76 },
  { clientId: "CLT004", categoryName: "Handmade Paper", totalSpend: 540000, totalOrders: 40, avgVarnaScore: 82 },
  { clientId: "CLT004", categoryName: "Lacquerware & Toys", totalSpend: 460000, totalOrders: 35, avgVarnaScore: 75 },
  { clientId: "CLT004", categoryName: "Bidri Metalwork", totalSpend: 380000, totalOrders: 28, avgVarnaScore: 73 },
  { clientId: "CLT004", categoryName: "Organic Toiletries", totalSpend: 490000, totalOrders: 38, avgVarnaScore: 77 },
  { clientId: "CLT004", categoryName: "Coir & Jute", totalSpend: 300000, totalOrders: 26, avgVarnaScore: 74 },
];

// ──────────────── Helper Functions ────────────────

export function getClientByCredentials(
  clientId: string
): ClientMaster | undefined {
  return MOCK_CLIENTS.find(
    (c) => c.clientId.toLowerCase() === clientId.toLowerCase()
  );
}

export function getClientSummary(clientId: string): ClientSummary | undefined {
  return MOCK_CLIENT_SUMMARIES.find((s) => s.clientId === clientId);
}

export function getSuppliersByClient(clientId: string): SupplierDetail[] {
  return MOCK_SUPPLIER_DETAILS.filter((s) => s.clientId === clientId);
}

export function getCategorySpendByClient(clientId: string): CategorySpend[] {
  return MOCK_CATEGORY_SPEND.filter((c) => c.clientId === clientId);
}

export function getSupplierTierDistribution(
  clientId: string
): { tier: string; count: number; color: string }[] {
  const suppliers = getSuppliersByClient(clientId);
  const tierColors: Record<string, string> = {
    Platinum: "#A78BFA",
    Gold: "#FBBF24",
    Silver: "#94A3B8",
    Bronze: "#D97706",
  };

  const grouped: Record<string, number> = {};
  for (const s of suppliers) {
    grouped[s.tier] = (grouped[s.tier] || 0) + 1;
  }

  return Object.entries(grouped).map(([tier, count]) => ({
    tier,
    count,
    color: tierColors[tier] || "#6B7280",
  }));
}

// ──────────────── Pillar Definitions (Tooltip Text) ────────────────

export const PILLAR_DEFINITIONS: Record<string, string> = {
  Environmental:
    "Evaluates the climate, material, water, pollution, and packaging impact of the supplier's product and production.",
  Social:
    "Evaluates the quality and depth of employment, gender inclusion, working conditions, and community livelihood impact.",
  Governance:
    "Evaluates legal standing, regulatory compliance, ethical operation, and sourcing integrity.",
  Cultural:
    "Evaluates India's craft and heritage production systems, skill rarity, and climate-vulnerable community context.",
};

// ──────────────── Pillar Criteria Breakdown ────────────────

export interface PillarCriterion {
  name: string;
  score: number;
  weight: string;
}

export interface PillarBreakdown {
  pillarScore: number;
  criteria: PillarCriterion[];
}

export const PILLAR_CRITERIA_BREAKDOWN: Record<string, PillarBreakdown> = {
  Environmental: {
    pillarScore: 79,
    criteria: [
      { name: "Carbon Intensity", score: 85, weight: "30%" },
      { name: "Material Sustainability", score: 80, weight: "25%" },
      { name: "Circularity & End-of-Life", score: 75, weight: "20%" },
      { name: "Water Usage", score: 70, weight: "10%" },
      { name: "Pollution & Hazardous Content", score: 80, weight: "10%" },
      { name: "Packaging Impact", score: 85, weight: "5%" },
    ],
  },
  Social: {
    pillarScore: 85,
    criteria: [
      { name: "Employment & Livelihood Impact", score: 90, weight: "30%" },
      { name: "Gender Inclusion", score: 85, weight: "25%" },
      { name: "Working Conditions & Fair Wages", score: 80, weight: "25%" },
      { name: "Health, Safety & Wellbeing", score: 85, weight: "20%" },
    ],
  },
  Governance: {
    pillarScore: 80,
    criteria: [
      { name: "Legal & Regulatory Compliance", score: 85, weight: "40%" },
      { name: "Business Ethics & Honest Dealing", score: 80, weight: "35%" },
      { name: "Responsible Sourcing Basics", score: 75, weight: "25%" },
    ],
  },
  Cultural: {
    pillarScore: 86,
    criteria: [
      { name: "Craft Authenticity & Process Integrity", score: 90, weight: "40%" },
      { name: "Skill Rarity & GI Status", score: 85, weight: "35%" },
      { name: "Climate-Vulnerable Community Context", score: 80, weight: "25%" },
    ],
  },
};

// ──────────────── Supplier Confidence Checklists ────────────────

export type ConfidenceStatus = "verified" | "partial" | "lapsed" | "missing";

export interface ConfidenceChecklistItem {
  item: string;
  status: ConfidenceStatus;
  score: number;
}

export interface SupplierConfidenceData {
  score: number;
  eScore?: number;
  sScore?: number;
  gScore?: number;
  cScore?: number;
  totalConfirmed: string;
  status: string;
  checklist: ConfidenceChecklistItem[];
}

export const SUPPLIER_CONFIDENCE_CHECKLISTS: Record<string, SupplierConfidenceData> = {
  "Bare Necessities": {
    score: 47,
    totalConfirmed: "8.50 of 18 tracked data points confirmed",
    status: "Self-Reported",
    checklist: [
      { item: "Incorporation certificate", status: "verified", score: 1.0 },
      { item: "Tax registration, no discrepancy", status: "verified", score: 1.0 },
      { item: "MSME / Udyam recognition", status: "verified", score: 1.0 },
      { item: "Signed, dated Code of Conduct", status: "partial", score: 0.25 },
      { item: "Docs internally consistent", status: "partial", score: 0.25 },
      { item: "Environmental mgmt. certificate, current", status: "lapsed", score: 0.5 },
      { item: "Packaging disclosed", status: "verified", score: 1.0 },
      { item: "Composition % disclosed", status: "missing", score: 0.0 },
      { item: "Energy data, allocated", status: "lapsed", score: 0.5 },
      { item: "Waste / circularity program", status: "verified", score: 1.0 },
      { item: "OHS certificate, current", status: "partial", score: 0.25 },
      { item: "Labour welfare policy", status: "lapsed", score: 0.5 },
      { item: "Community / livelihood program", status: "missing", score: 0.0 },
      { item: "Cruelty-free / ethical certification", status: "verified", score: 1.0 },
      { item: "Product safety certificate, current & direct", status: "partial", score: 0.25 },
      { item: "Third-party audited report", status: "missing", score: 0.0 },
      { item: "Self-reported impact report", status: "missing", score: 0.0 },
      { item: "Verified carbon / LCA data", status: "missing", score: 0.0 },
    ],
  },
  "Bare Necessities Zero Waste Solutions Pvt. Ltd.": {
    score: 47,
    totalConfirmed: "8.50 of 18 tracked data points confirmed",
    status: "Self-Reported",
    checklist: [
      { item: "Incorporation certificate", status: "verified", score: 1.0 },
      { item: "Tax registration, no discrepancy", status: "verified", score: 1.0 },
      { item: "MSME / Udyam recognition", status: "verified", score: 1.0 },
      { item: "Signed, dated Code of Conduct", status: "partial", score: 0.25 },
      { item: "Docs internally consistent", status: "partial", score: 0.25 },
      { item: "Environmental mgmt. certificate, current", status: "lapsed", score: 0.5 },
      { item: "Packaging disclosed", status: "verified", score: 1.0 },
      { item: "Composition % disclosed", status: "missing", score: 0.0 },
      { item: "Energy data, allocated", status: "lapsed", score: 0.5 },
      { item: "Waste / circularity program", status: "verified", score: 1.0 },
      { item: "OHS certificate, current", status: "partial", score: 0.25 },
      { item: "Labour welfare policy", status: "lapsed", score: 0.5 },
      { item: "Community / livelihood program", status: "missing", score: 0.0 },
      { item: "Cruelty-free / ethical certification", status: "verified", score: 1.0 },
      { item: "Product safety certificate, current & direct", status: "partial", score: 0.25 },
      { item: "Third-party audited report", status: "missing", score: 0.0 },
      { item: "Self-reported impact report", status: "missing", score: 0.0 },
      { item: "Verified carbon / LCA data", status: "missing", score: 0.0 },
    ],
  },
  Kheoni: {
    score: 24,
    totalConfirmed: "4.25 of 18 tracked data points confirmed",
    status: "Self-Reported",
    checklist: [
      { item: "Incorporation certificate", status: "verified", score: 1.0 },
      { item: "Tax registration, no discrepancy", status: "verified", score: 1.0 },
      { item: "MSME / Udyam recognition", status: "verified", score: 1.0 },
      { item: "Signed, dated Code of Conduct", status: "missing", score: 0.0 },
      { item: "Docs internally consistent", status: "verified", score: 1.0 },
      { item: "Environmental mgmt. certificate, current", status: "missing", score: 0.0 },
      { item: "Packaging disclosed", status: "partial", score: 0.25 },
      { item: "Composition % disclosed", status: "missing", score: 0.0 },
      { item: "Energy data, allocated", status: "missing", score: 0.0 },
      { item: "Waste / circularity program", status: "missing", score: 0.0 },
      { item: "OHS certificate, current", status: "missing", score: 0.0 },
      { item: "Labour welfare policy", status: "missing", score: 0.0 },
      { item: "Community / livelihood program", status: "missing", score: 0.0 },
      { item: "Cruelty-free / ethical certification", status: "missing", score: 0.0 },
      { item: "Product safety certificate, current & direct", status: "missing", score: 0.0 },
      { item: "Third-party audited report", status: "missing", score: 0.0 },
      { item: "Self-reported impact report", status: "missing", score: 0.0 },
      { item: "Verified carbon / LCA data", status: "missing", score: 0.0 },
    ],
  },
  "Kheoni Ventures Pvt Ltd": {
    score: 24,
    totalConfirmed: "4.25 of 18 tracked data points confirmed",
    status: "Self-Reported",
    checklist: [
      { item: "Incorporation certificate", status: "verified", score: 1.0 },
      { item: "Tax registration, no discrepancy", status: "verified", score: 1.0 },
      { item: "MSME / Udyam recognition", status: "verified", score: 1.0 },
      { item: "Signed, dated Code of Conduct", status: "missing", score: 0.0 },
      { item: "Docs internally consistent", status: "verified", score: 1.0 },
      { item: "Environmental mgmt. certificate, current", status: "missing", score: 0.0 },
      { item: "Packaging disclosed", status: "partial", score: 0.25 },
      { item: "Composition % disclosed", status: "missing", score: 0.0 },
      { item: "Energy data, allocated", status: "missing", score: 0.0 },
      { item: "Waste / circularity program", status: "missing", score: 0.0 },
      { item: "OHS certificate, current", status: "missing", score: 0.0 },
      { item: "Labour welfare policy", status: "missing", score: 0.0 },
      { item: "Community / livelihood program", status: "missing", score: 0.0 },
      { item: "Cruelty-free / ethical certification", status: "missing", score: 0.0 },
      { item: "Product safety certificate, current & direct", status: "missing", score: 0.0 },
      { item: "Third-party audited report", status: "missing", score: 0.0 },
      { item: "Self-reported impact report", status: "missing", score: 0.0 },
      { item: "Verified carbon / LCA data", status: "missing", score: 0.0 },
    ],
  },
  "UKHI India Private Limited": {
    score: 63,
    totalConfirmed: "11.25 of 18 tracked data points confirmed",
    status: "Verified",
    checklist: [
      { item: "GST Registration Certificate", status: "verified", score: 1.0 },
      { item: "Udyam MSME Registration Certificate", status: "verified", score: 1.0 },
      { item: "Ethics & Responsible Sourcing Policy", status: "verified", score: 1.0 },
      { item: "On-Time Supplier Payment Terms", status: "verified", score: 1.0 },
      { item: "Clean Legal & Regulatory Compliance Track Record", status: "verified", score: 1.0 },
      { item: "Water Footprint Reduction Actions", status: "verified", score: 1.0 },
      { item: "Water Recycling & Conservation Protocols", status: "verified", score: 1.0 },
      { item: "Non-Toxic & Chemical Safety Compliance", status: "lapsed", score: 0.5 },
      { item: "Environmental Management System (ISO 14001)", status: "lapsed", score: 0.5 },
      { item: "Zero Waste & Circular Packaging Standards", status: "missing", score: 0.0 },
      { item: "Written Employee & Artisan Contracts", status: "verified", score: 1.0 },
      { item: "State Minimum Wage & Fair Living Wage Compliance", status: "lapsed", score: 0.5 },
      { item: "ESI / Worker Health Insurance Coverage", status: "lapsed", score: 0.5 },
      { item: "Workplace Health & Safety Measures", status: "partial", score: 0.25 },
      { item: "Carbon Footprint Audit & Report", status: "partial", score: 0.25 },
      { item: "Energy Consumption & Electricity Tracking", status: "lapsed", score: 0.5 },
      { item: "Raw Material Traceability & Sustainable Sourcing", status: "partial", score: 0.25 },
      { item: "PETA / BCorp / Quality Audit Certifications", status: "missing", score: 0.0 },
    ],
  },
  UKHI: {
    score: 63,
    totalConfirmed: "11.25 of 18 tracked data points confirmed",
    status: "Verified",
    checklist: [
      { item: "GST Registration Certificate", status: "verified", score: 1.0 },
      { item: "Udyam MSME Registration Certificate", status: "verified", score: 1.0 },
      { item: "Ethics & Responsible Sourcing Policy", status: "verified", score: 1.0 },
      { item: "On-Time Supplier Payment Terms", status: "verified", score: 1.0 },
      { item: "Clean Legal & Regulatory Compliance Track Record", status: "verified", score: 1.0 },
      { item: "Water Footprint Reduction Actions", status: "verified", score: 1.0 },
      { item: "Water Recycling & Conservation Protocols", status: "verified", score: 1.0 },
      { item: "Non-Toxic & Chemical Safety Compliance", status: "lapsed", score: 0.5 },
      { item: "Environmental Management System (ISO 14001)", status: "lapsed", score: 0.5 },
      { item: "Zero Waste & Circular Packaging Standards", status: "missing", score: 0.0 },
      { item: "Written Employee & Artisan Contracts", status: "verified", score: 1.0 },
      { item: "State Minimum Wage & Fair Living Wage Compliance", status: "lapsed", score: 0.5 },
      { item: "ESI / Worker Health Insurance Coverage", status: "lapsed", score: 0.5 },
      { item: "Workplace Health & Safety Measures", status: "partial", score: 0.25 },
      { item: "Carbon Footprint Audit & Report", status: "partial", score: 0.25 },
      { item: "Energy Consumption & Electricity Tracking", status: "lapsed", score: 0.5 },
      { item: "Raw Material Traceability & Sustainable Sourcing", status: "partial", score: 0.25 },
      { item: "PETA / BCorp / Quality Audit Certifications", status: "missing", score: 0.0 },
    ],
  },
};

export function getClientLogoFallback(clientName?: string): string | undefined {
  if (!clientName) return undefined;
  const lower = clientName.toLowerCase();
  if (lower.includes("six senses")) return "/logos/clients/six-senses.jpg";
  if (lower.includes("dorchester")) return "/logos/clients/dorchester-collection.png";
  if (lower.includes("oberoi")) return "/logos/clients/oberoi-dubai.png";
  return undefined;
}

export function getSupplierLogoFallback(supplierName?: string): string | undefined {
  if (!supplierName) return undefined;
  const lower = supplierName.toLowerCase();
  if (lower.includes("bare")) return "/logos/suppliers/bare-necessities.png";
  if (lower.includes("ukhi")) return "/logos/suppliers/ukhi.jpg";
  if (lower.includes("kheoni")) return "/logos/suppliers/kheoni.jpg";
  return undefined;
}

export interface ClientOrderItem {
  orderNumber: string;
  orderDate: string;
  supplierName: string;
  supplierLogo?: string;
  orderValue: number;
  fulfilmentStatus: "Complete" | "In Progress" | "Delayed" | string;
  evidenceStatus: "Awaiting certificate" | "Verified" | "Self-reported" | string;
  evidenceWeight: number; // 1.00, 0.75, 0.50
  evidenceStatusLabel: string;
  pendingItemNote?: string;
  relatedOrderNumbers?: string[];
  checklist: {
    title: string;
    description: string;
    status: "complete" | "pending" | "upcoming";
  }[];
}

export const CLIENT_ORDERS_LIST: ClientOrderItem[] = [
  {
    orderNumber: "#5",
    orderDate: "12 May 2026",
    supplierName: "Bare Necessities",
    supplierLogo: "/logos/suppliers/bare-necessities.png",
    orderValue: 78500,
    fulfilmentStatus: "Complete",
    evidenceStatus: "Awaiting certificate",
    evidenceWeight: 0.75,
    evidenceStatusLabel: "Self-reported",
    pendingItemNote: "Awaiting the certificate for this order's formulations",
    relatedOrderNumbers: ["#4"],
    checklist: [
      {
        title: "Company operations disclosed",
        description: "Complete",
        status: "complete",
      },
      {
        title: "Laboratory batch certificate",
        description: "Awaiting the certificate for this order's formulations",
        status: "pending",
      },
      {
        title: "Verified formulation claims",
        description: "A reviewed third-party certificate carries full weight (1.00×)",
        status: "upcoming",
      },
    ],
  },
  {
    orderNumber: "#4",
    orderDate: "28 Apr 2026",
    supplierName: "Bare Necessities",
    supplierLogo: "/logos/suppliers/bare-necessities.png",
    orderValue: 64200,
    fulfilmentStatus: "Complete",
    evidenceStatus: "Awaiting certificate",
    evidenceWeight: 0.75,
    evidenceStatusLabel: "Self-reported",
    pendingItemNote: "Awaiting the certificate for this order's formulations",
    relatedOrderNumbers: ["#5"],
    checklist: [
      {
        title: "Company operations disclosed",
        description: "Complete",
        status: "complete",
      },
      {
        title: "Laboratory batch certificate",
        description: "Awaiting the certificate for this order's formulations",
        status: "pending",
      },
      {
        title: "Verified formulation claims",
        description: "A reviewed third-party certificate carries full weight (1.00×)",
        status: "upcoming",
      },
    ],
  },
  {
    orderNumber: "#3",
    orderDate: "14 Mar 2026",
    supplierName: "UKHI India",
    supplierLogo: "/logos/suppliers/ukhi.jpg",
    orderValue: 96000,
    fulfilmentStatus: "Complete",
    evidenceStatus: "Verified",
    evidenceWeight: 1.0,
    evidenceStatusLabel: "Third-party verified",
    checklist: [
      {
        title: "Incorporation & GST Audit",
        description: "Third-party verified documentation on file",
        status: "complete",
      },
      {
        title: "Sustainable Sourcing Audit",
        description: "Verified ethical supply chain and fair-wage compliance",
        status: "complete",
      },
      {
        title: "Verified Sourcing Certificate",
        description: "Full evidence weight (1.00×) confirmed",
        status: "complete",
      },
    ],
  },
  {
    orderNumber: "#2",
    orderDate: "02 Feb 2026",
    supplierName: "UKHI India",
    supplierLogo: "/logos/suppliers/ukhi.jpg",
    orderValue: 48450,
    fulfilmentStatus: "Complete",
    evidenceStatus: "Verified",
    evidenceWeight: 1.0,
    evidenceStatusLabel: "Third-party verified",
    checklist: [
      {
        title: "Incorporation & GST Audit",
        description: "Third-party verified documentation on file",
        status: "complete",
      },
      {
        title: "Sustainable Sourcing Audit",
        description: "Verified ethical supply chain and fair-wage compliance",
        status: "complete",
      },
      {
        title: "Verified Sourcing Certificate",
        description: "Full evidence weight (1.00×) confirmed",
        status: "complete",
      },
    ],
  },
  {
    orderNumber: "#1",
    orderDate: "18 Jan 2026",
    supplierName: "Kheoni",
    supplierLogo: "/logos/suppliers/kheoni.jpg",
    orderValue: 26000,
    fulfilmentStatus: "In Progress",
    evidenceStatus: "Self-reported",
    evidenceWeight: 0.75,
    evidenceStatusLabel: "Self-reported",
    checklist: [
      {
        title: "Forest-first organic disclosure",
        description: "Self-reported impact documentation on file",
        status: "complete",
      },
      {
        title: "Indigenous collection audit",
        description: "Documentation submitted for verification",
        status: "pending",
      },
    ],
  },
];


