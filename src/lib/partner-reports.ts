/**
 * Partner Reports Mapping Configuration
 * Maps partner identifiers (enterprise_id, exact legal name, trade name)
 * to their exact literal PDF filenames in /public/Reports.
 */

// Literal filenames in /public/Reports
export const PARTNER_REPORT_FILENAMES = {
  UKHI: "UKHI Impact Report_September 2026.pdf",
  BARE_NECESSITIES: "Bare Necessities- Impact Report 2026.pdf",
  KHEONI: "Kheoni Impact Report_September 2026.pdf",
} as const;

/**
 * Literal configuration map keyed by partner IDs, legal names, and standard aliases.
 */
export const PARTNER_REPORT_MAP: Record<string, string> = {
  // UKHI India Private Limited
  "ENT-002": PARTNER_REPORT_FILENAMES.UKHI,
  "UKHI India Private Limited": PARTNER_REPORT_FILENAMES.UKHI,
  "UKHI INDIA PRIVATE LIMITED": PARTNER_REPORT_FILENAMES.UKHI,
  "UKHI": PARTNER_REPORT_FILENAMES.UKHI,

  // Bare Necessities Zero Waste Solutions Pvt. Ltd.
  "ENT-001": PARTNER_REPORT_FILENAMES.BARE_NECESSITIES,
  "Bare Necessities Zero Waste Solutions Pvt. Ltd.": PARTNER_REPORT_FILENAMES.BARE_NECESSITIES,
  "Bare Necessities": PARTNER_REPORT_FILENAMES.BARE_NECESSITIES,

  // Kheoni
  "ENT-003": PARTNER_REPORT_FILENAMES.KHEONI,
  "Kheoni": PARTNER_REPORT_FILENAMES.KHEONI,
  "Kheoni Ventures Pvt Ltd": PARTNER_REPORT_FILENAMES.KHEONI,
};

/**
 * Returns the exact literal PDF filename for a given partner, or null if no report is mapped.
 */
export function getPartnerReportFilename(params: {
  name?: string;
  legalName?: string;
  enterpriseId?: string;
}): string | null {
  const { name, legalName, enterpriseId } = params;

  // 1. Direct ID lookup
  if (enterpriseId && PARTNER_REPORT_MAP[enterpriseId]) {
    return PARTNER_REPORT_MAP[enterpriseId];
  }

  // 2. Direct exact name lookup
  if (legalName && PARTNER_REPORT_MAP[legalName]) {
    return PARTNER_REPORT_MAP[legalName];
  }
  if (name && PARTNER_REPORT_MAP[name]) {
    return PARTNER_REPORT_MAP[name];
  }

  // 3. Normalized / case-insensitive & substring fallback matching
  const searchStr = `${name || ""} ${legalName || ""}`.toLowerCase();
  if (searchStr.includes("ukhi")) {
    return PARTNER_REPORT_FILENAMES.UKHI;
  }
  if (searchStr.includes("bare")) {
    return PARTNER_REPORT_FILENAMES.BARE_NECESSITIES;
  }
  if (searchStr.includes("kheoni")) {
    return PARTNER_REPORT_FILENAMES.KHEONI;
  }

  // Any other partner (e.g. Greensole, Marikar, or future partners without report)
  return null;
}

/**
 * Returns the browser-facing URL to open the partner's PDF report in full-screen.
 * URL-encodes the filename properly so spaces become %20, hyphens and underscores are preserved.
 * Example: "/Reports/UKHI%20Impact%20Report_September%202026.pdf"
 */
export function getPartnerReportUrl(params: {
  name?: string;
  legalName?: string;
  enterpriseId?: string;
}): string | null {
  const filename = getPartnerReportFilename(params);
  if (!filename) return null;

  return `/Reports/${encodeURIComponent(filename)}`;
}
