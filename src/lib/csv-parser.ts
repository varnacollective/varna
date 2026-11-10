/**
 * lib/csv-parser.ts
 *
 * Deterministic rule-based bulk CSV/XLSX parser for supplier onboarding.
 * Features:
 * - Header row auto-detection
 * - Column synonym matching (name, brand, email, phone, category, state, city)
 * - Per-row validation: clean / auto-fixed / needs_varna / needs_client / rejected
 * - Rule-based duplicate detection (email, phone, normalized name)
 * - Non-India scope detection (marks out of scope, never invited)
 */

export interface ParsedSupplierRow {
  rowNumber: number;
  raw: Record<string, string>;
  clean: {
    enterprise_name: string;
    brand_name?: string;
    contact_person?: string;
    contact_email?: string;
    contact_phone?: string;
    category?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  validationStatus: "clean" | "auto_fixed" | "needs_varna" | "needs_client" | "rejected";
  validationErrors: string[];
  isDuplicate?: boolean;
  duplicateOf?: number;
  isOutOfScope?: boolean;
}

export interface CsvParseResult {
  headerRowIndex: number;
  detectedHeaders: string[];
  columnMapping: Record<string, string>;
  rows: ParsedSupplierRow[];
  totalRows: number;
  cleanCount: number;
  autoFixedCount: number;
  rejectedCount: number;
  duplicateCount: number;
  outOfScopeCount: number;
}

const INDIAN_STATES_LOWER = new Set([
  "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh", "goa", "gujarat",
  "haryana", "himachal pradesh", "jharkhand", "karnataka", "kerala", "madhya pradesh",
  "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "punjab", "rajasthan",
  "sikkim", "tamil nadu", "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
  "delhi", "delhi (nct)", "jammu and kashmir", "ladakh", "puducherry", "chandigarh",
  "dadra and nagar haveli and daman and diu", "lakshadweep", "andaman and nicobar islands"
]);

const SYNONYMS: Record<string, string[]> = {
  enterprise_name: ["enterprise", "enterprise name", "company", "company name", "supplier", "vendor", "legal name", "organisation", "organization"],
  brand_name: ["brand", "brand name", "trading name", "trade name", "label"],
  contact_person: ["contact person", "contact name", "name", "representative", "contact", "poc", "lead"],
  contact_email: ["email", "contact email", "e-mail", "email address", "mail"],
  contact_phone: ["phone", "mobile", "contact phone", "contact number", "tel", "telephone", "phone number", "whatsapp"],
  category: ["category", "product category", "segment", "type", "sector"],
  city: ["city", "district", "town", "location"],
  state: ["state", "province", "region"],
  country: ["country", "nation"]
};

export function detectHeaderRow(grid: string[][]): { index: number; headers: string[]; mapping: Record<string, string> } {
  let bestScore = -1;
  let bestIndex = 0;
  let bestHeaders: string[] = [];
  let bestMapping: Record<string, string> = {};

  for (let r = 0; r < Math.min(grid.length, 10); r++) {
    const row = grid[r].map(c => (c || "").trim().toLowerCase());
    const mapping: Record<string, string> = {};
    let score = 0;

    for (let c = 0; c < row.length; c++) {
      const colHeader = row[c];
      if (!colHeader) continue;

      for (const [standardKey, synList] of Object.entries(SYNONYMS)) {
        if (!mapping[standardKey] && (colHeader === standardKey || synList.includes(colHeader))) {
          mapping[standardKey] = grid[r][c].trim();
          score += (standardKey === "enterprise_name" || standardKey === "contact_email" ? 3 : 1);
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = r;
      bestHeaders = grid[r].map(c => (c || "").trim());
      bestMapping = mapping;
    }
  }

  return { index: bestIndex, headers: bestHeaders, mapping: bestMapping };
}

export function parseSupplierCsv(csvText: string): CsvParseResult {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const grid = lines.map(line => {
    // Basic CSV splitting (handling quoted values)
    const matches = line.match(/(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g) || [];
    return matches.map(m => m.replace(/^,/, "").replace(/^"|"$/g, "").trim());
  });

  if (grid.length === 0) {
    return {
      headerRowIndex: 0,
      detectedHeaders: [],
      columnMapping: {},
      rows: [],
      totalRows: 0,
      cleanCount: 0,
      autoFixedCount: 0,
      rejectedCount: 0,
      duplicateCount: 0,
      outOfScopeCount: 0,
    };
  }

  const { index: headerIndex, headers, mapping } = detectHeaderRow(grid);
  const dataRows = grid.slice(headerIndex + 1);

  // Inverted mapping: header index -> standard key
  const colIndexToKey: Record<number, string> = {};
  for (let c = 0; c < headers.length; c++) {
    const rawHeader = headers[c];
    for (const [stdKey, mappedRaw] of Object.entries(mapping)) {
      if (mappedRaw.toLowerCase() === rawHeader.toLowerCase()) {
        colIndexToKey[c] = stdKey;
      }
    }
  }

  const seenEmails = new Map<string, number>();
  const seenPhones = new Map<string, number>();
  const seenNames = new Map<string, number>();

  const parsedRows: ParsedSupplierRow[] = [];
  let cleanCount = 0;
  let autoFixedCount = 0;
  let rejectedCount = 0;
  let duplicateCount = 0;
  let outOfScopeCount = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const rawRow = dataRows[i];
    const rawObj: Record<string, string> = {};
    const cleanObj: any = {};
    const errors: string[] = [];
    let isAutoFixed = false;

    for (let c = 0; c < headers.length; c++) {
      const val = (rawRow[c] || "").trim();
      rawObj[headers[c]] = val;
      const key = colIndexToKey[c];
      if (key) {
        cleanObj[key] = val;
      }
    }

    // Cleaning & normalization
    let enterpriseName = (cleanObj.enterprise_name || "").trim();
    let email = (cleanObj.contact_email || "").trim().toLowerCase();
    let phone = (cleanObj.contact_phone || "").replace(/[^\d+]/g, "").trim();
    let country = (cleanObj.country || "India").trim();
    let state = (cleanObj.state || "").trim();

    // Check scope (India only)
    let isOutOfScope = false;
    if (country.toLowerCase() !== "india" && country.toLowerCase() !== "in" && country !== "") {
      isOutOfScope = true;
      outOfScopeCount++;
    }

    // Validation rules:
    // Mandatory: enterprise name + at least ONE working email or phone
    if (!enterpriseName) {
      errors.push("Missing enterprise legal name");
    }

    const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const hasValidPhone = phone.replace(/\D/g, "").length >= 10;

    if (!hasValidEmail && !hasValidPhone) {
      errors.push("Requires at least one valid contact email or phone number");
    }

    if (email && !hasValidEmail) {
      errors.push("Malformed email address");
    }

    // Auto-fix tracking
    if (cleanObj.contact_email && cleanObj.contact_email !== email) isAutoFixed = true;
    if (cleanObj.contact_phone && cleanObj.contact_phone !== phone) isAutoFixed = true;

    // Duplicate detection
    let isDuplicate = false;
    let duplicateOf: number | undefined;

    const normName = enterpriseName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (hasValidEmail && seenEmails.has(email)) {
      isDuplicate = true;
      duplicateOf = seenEmails.get(email);
    } else if (hasValidPhone && seenPhones.has(phone)) {
      isDuplicate = true;
      duplicateOf = seenPhones.get(phone);
    } else if (normName && seenNames.has(normName)) {
      isDuplicate = true;
      duplicateOf = seenNames.get(normName);
    }

    const rowNum = headerIndex + i + 2;

    if (isDuplicate) {
      duplicateCount++;
    } else {
      if (hasValidEmail) seenEmails.set(email, rowNum);
      if (hasValidPhone) seenPhones.set(phone, rowNum);
      if (normName) seenNames.set(normName, rowNum);
    }

    let validationStatus: ParsedSupplierRow["validationStatus"] = "clean";
    if (errors.length > 0) {
      validationStatus = "rejected";
      rejectedCount++;
    } else if (isAutoFixed) {
      validationStatus = "auto_fixed";
      autoFixedCount++;
    } else {
      cleanCount++;
    }

    parsedRows.push({
      rowNumber: rowNum,
      raw: rawObj,
      clean: {
        enterprise_name: enterpriseName,
        brand_name: cleanObj.brand_name || undefined,
        contact_person: cleanObj.contact_person || undefined,
        contact_email: email || undefined,
        contact_phone: phone || undefined,
        category: cleanObj.category || undefined,
        city: cleanObj.city || undefined,
        state: state || undefined,
        country: country || undefined,
      },
      validationStatus,
      validationErrors: errors,
      isDuplicate,
      duplicateOf,
      isOutOfScope,
    });
  }

  return {
    headerRowIndex: headerIndex,
    detectedHeaders: headers,
    columnMapping: mapping,
    rows: parsedRows,
    totalRows: parsedRows.length,
    cleanCount,
    autoFixedCount,
    rejectedCount,
    duplicateCount,
    outOfScopeCount,
  };
}

