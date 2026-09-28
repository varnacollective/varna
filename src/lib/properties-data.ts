export interface HotelPropertyMetadata {
  clientId: string;
  clientName: string;
  propertyType: string;
  city: string;
  country: string;
  groupId?: string;
  portfolio?: string;
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
}

export const HOTEL_PROPERTIES: Record<string, HotelPropertyMetadata> = {
  "CLT-001": {
    clientId: "CLT-001",
    clientName: "The Astor Dubai",
    propertyType: "Luxury Hotel",
    city: "Dubai",
    country: "UAE",
    groupId: "GRP-ASTOR",
    portfolio: "The Astor Collection",
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
    groupId: "GRP-IHG",
    portfolio: "Six Senses Hotels Resorts Spas",
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
    groupId: "GRP-DORCHESTER",
    portfolio: "Dorchester Collection",
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
    groupId: "GRP-001",
    portfolio: "Meridian Hotels & Resorts",
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
    groupId: "GRP-001",
    portfolio: "Meridian Hotels & Resorts",
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
    groupId: "GRP-001",
    portfolio: "Meridian Hotels & Resorts",
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
    groupId: "GRP-001",
    portfolio: "Meridian Hotels & Resorts",
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
    groupId: "GRP-001",
    portfolio: "Meridian Hotels & Resorts",
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
    groupId: "GRP-001",
    portfolio: "Meridian Hotels & Resorts",
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
    groupId: "GRP-001",
    portfolio: "Meridian Hotels & Resorts",
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

export function getGroupProperties(groupId: string = "GRP-001"): HotelPropertyMetadata[] {
  return Object.values(HOTEL_PROPERTIES).filter(
    (h) => h.groupId === groupId || h.portfolio === "Meridian Hotels & Resorts"
  );
}

export function resolveHotelProperty(queryId?: string | null): HotelPropertyMetadata {
  if (!queryId) return HOTEL_PROPERTIES["CLT-004"] || HOTEL_PROPERTIES["CLT-001"];
  const clean = queryId.trim();
  if (HOTEL_PROPERTIES[clean]) return HOTEL_PROPERTIES[clean];

  const norm = clean.toLowerCase().replace(/[^a-z0-9]/g, "");
  const found = Object.values(HOTEL_PROPERTIES).find((h) => {
    const normId = h.clientId.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normName = h.clientName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normId === norm || normName === norm || normName.includes(norm);
  });

  return found || HOTEL_PROPERTIES["CLT-004"] || HOTEL_PROPERTIES["CLT-001"];
}
