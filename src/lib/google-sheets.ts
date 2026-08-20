import { google } from "googleapis";
import {
  type ClientMaster,
  type ClientSummary,
  type SupplierDetail,
  type CategorySpend,
  getClientByCredentials,
  getClientSummary,
  getSuppliersByClient,
  getCategorySpendByClient,
  getSupplierTierDistribution,
} from "./mock-data";

// ── Types ────────────────────────────────────────────────────────────────────

export interface DashboardData {
  client: ClientMaster;
  summary: ClientSummary;
  suppliers: SupplierDetail[];
  categorySpend: CategorySpend[];
  tierDistribution: { tier: string; count: number; color: string }[];
}

// ── Helper functions for Google Sheets ────────────────────────────────────────

function getAuth() {
  const keyEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyEnv) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY");
  }
  const credentials = JSON.parse(keyEnv);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

async function getSheetData(range: string) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });
  return res.data.values || [];
}

// Helper to parse numbers safely from strings like "1,268.40" or "68%"
function parseNumber(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/,/g, "").replace("%", "").trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// ── Mock Data Fallback Loader ────────────────────────────────────────────────

export function loadMockDashboardData(clientId: string): DashboardData | null {
  // Normalize ID for comparison (e.g., CLT-001 -> CLT001)
  const normalizedId = clientId.replace(/-/g, "").toUpperCase();
  const client = getClientByCredentials(normalizedId);
  if (!client) return null;

  const summary = getClientSummary(client.clientId);
  if (!summary) return null;

  const suppliers = getSuppliersByClient(client.clientId);
  const categorySpend = getCategorySpendByClient(client.clientId);
  const tierDistribution = getSupplierTierDistribution(client.clientId);

  return {
    client,
    summary,
    suppliers,
    categorySpend,
    tierDistribution,
  };
}

// Helper to normalize Client IDs for comparison
function normalizeId(id: string): string {
  return id.replace(/-/g, "").toLowerCase().trim();
}

// ── Data Fetching ────────────────────────────────────────────────────────────

export async function validateClient(
  clientId: string,
  _password: string
): Promise<ClientMaster | null> {
  try {
    const rows = await getSheetData("9_CLIENT_MASTER!A3:J");
    const targetNorm = normalizeId(clientId);

    for (const row of rows) {
      if (row[0] && normalizeId(row[0]) === targetNorm) {
        return {
          clientId: row[0],
          clientName: row[1] || "Unknown Client",
          industry: row[2] || "Hospitality",
          city: row[3] || "Unknown City",
          state: row[4] || "Unknown State",
          onboardingDate: row[7] || "2024-01-01",
          status: row[9] || "Active",
        };
      }
    }

    // If not found in Google Sheets, fall back to matching mock clients
    const mockClient = getClientByCredentials(clientId) || getClientByCredentials(clientId.replace(/-/g, ""));
    return mockClient || null;
  } catch (error) {
    console.warn("Google Sheets validateClient failed, falling back to mock data:", error);
    const mockClient = getClientByCredentials(clientId) || getClientByCredentials(clientId.replace(/-/g, ""));
    return mockClient || null;
  }
}

export async function fetchDashboardData(
  clientId: string
): Promise<DashboardData | null> {
  try {
    // 1. Validate Client
    const client = await validateClient(clientId, "");
    if (!client) return null;

    try {
      const targetNorm = normalizeId(client.clientId);

      // 2. Fetch Client Summary
      let summary: ClientSummary | null = null;
      const summaryRows = await getSheetData("6_CLIENT_SUMMARY!A3:Z");
      for (const row of summaryRows) {
        if (row[0] && normalizeId(row[0]) === targetNorm) {
          summary = {
            clientId: row[0],
            clientName: row[1],
            totalSpend: parseNumber(row[3]),
            totalOrders: parseNumber(row[4]),
            avgVarnaScore: parseNumber(row[10]),
            avgEScore: parseNumber(row[11]),
            avgSScore: parseNumber(row[12]),
            avgGScore: parseNumber(row[13]),
            avgCScore: parseNumber(row[14]),
            totalCO2eAvoidedKg: parseNumber(row[7]),
            totalArtisansSupported: parseNumber(row[17]),
            womenWorkforcePercent: parseNumber(row[18]),
            totalSuppliers: parseNumber(row[9]),
            avgLeadTimeDays: 14, // Default fallback
          };
          break;
        }
      }
      if (!summary) {
        // Fallback if client validated but summary sheet is missing this client
        return loadMockDashboardData(client.clientId);
      }

      // 3. Fetch Suppliers
      const suppliers: SupplierDetail[] = [];
      const supplierRows = await getSheetData("7_SUPPLIER_DETAIL_BY_CLIENT!A3:Z");
      for (const row of supplierRows) {
        if (row[0] && normalizeId(row[0]) === targetNorm) {
          let tierStr = row[3] || "Bronze";
          if (!["Platinum", "Gold", "Silver", "Bronze"].includes(tierStr)) {
            tierStr = "Silver";
          }
          suppliers.push({
            clientId: row[0],
            enterpriseId: row[1],
            enterpriseName: row[2],
            tier: tierStr as "Platinum" | "Gold" | "Silver" | "Bronze",
            varnaScore: parseNumber(row[5]),
            eScore: parseNumber(row[8]),
            sScore: parseNumber(row[9]),
            gScore: parseNumber(row[10]),
            cScore: parseNumber(row[11]),
            totalSpend: parseNumber(row[14]),
            totalOrders: parseNumber(row[15]),
            city: row[12] || "Unknown",
            state: row[13] || "Unknown",
            artisansEmployed: parseNumber(row[16] || "0"),
            womenPercent: parseNumber(row[17] || "0"),
          });
        }
      }

      // 4. Fetch Category Spend
      const categorySpend: CategorySpend[] = [];
      const categoryRows = await getSheetData("8_CATEGORY_SPEND_BY_CLIENT!A3:Z");
      for (const row of categoryRows) {
        if (row[0] && normalizeId(row[0]) === targetNorm) {
          categorySpend.push({
            clientId: row[0],
            categoryName: row[1],
            totalSpend: parseNumber(row[2]),
            totalOrders: parseNumber(row[3]),
            avgVarnaScore: parseNumber(row[4] || "80"),
          });
        }
      }

      // 5. Tier Distribution
      const tierColors: Record<string, string> = {
        Platinum: "#7A3F1E", // deep-clay as premium
        Gold: "#738678",      // sage-mineral
        Silver: "#6F848F",    // slate-mist
        Bronze: "#D8CFB8",    // warm-stone
      };

      const grouped: Record<string, number> = {
        Platinum: 0,
        Gold: 0,
        Silver: 0,
        Bronze: 0
      };
      for (const s of suppliers) {
        if (s.tier in grouped) {
          grouped[s.tier]++;
        }
      }

      const tierDistribution = Object.entries(grouped)
        .filter(([_, count]) => count > 0)
        .map(([tier, count]) => ({
          tier,
          count,
          color: tierColors[tier] || "#6F848F",
        }));

      // If we fetched the summary but suppliers or spend categories are completely empty, merge with mock data for safety
      if (suppliers.length === 0) {
        const mockData = loadMockDashboardData(client.clientId);
        if (mockData) {
          return {
            client,
            summary,
            suppliers: mockData.suppliers,
            categorySpend: mockData.categorySpend,
            tierDistribution: mockData.tierDistribution,
          };
        }
      }

      return {
        client,
        summary,
        suppliers,
        categorySpend,
        tierDistribution,
      };
    } catch (sheetError) {
      console.warn("Sheets sheets read failed, falling back to mock dashboard data:", sheetError);
      return loadMockDashboardData(client.clientId);
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // General fallback
    return loadMockDashboardData(clientId);
  }
}
