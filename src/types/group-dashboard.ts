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
