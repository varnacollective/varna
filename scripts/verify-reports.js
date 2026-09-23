const fs = require('fs');
const path = require('path');

// Simulate the mapping logic from src/lib/partner-reports.ts
const PARTNER_REPORT_FILENAMES = {
  UKHI: "UKHI Impact Report_September 2026.pdf",
  BARE_NECESSITIES: "Bare Necessities- Impact Report 2026.pdf",
  KHEONI: "Kheoni Impact Report_September 2026.pdf",
};

const PARTNER_REPORT_MAP = {
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

function getPartnerReportFilename(params) {
  const { name, legalName, enterpriseId } = params;

  if (enterpriseId && PARTNER_REPORT_MAP[enterpriseId]) {
    return PARTNER_REPORT_MAP[enterpriseId];
  }
  if (legalName && PARTNER_REPORT_MAP[legalName]) {
    return PARTNER_REPORT_MAP[legalName];
  }
  if (name && PARTNER_REPORT_MAP[name]) {
    return PARTNER_REPORT_MAP[name];
  }

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

  return null;
}

function getPartnerReportUrl(params) {
  const filename = getPartnerReportFilename(params);
  if (!filename) return null;
  return `/Reports/${encodeURIComponent(filename)}`;
}

console.log("=== VERIFICATION REPORT FOR PARTNER SCORECARDS ===\n");

const testCases = [
  {
    desc: "UKHI India Private Limited (Direct legal name & ID)",
    input: { enterpriseId: "ENT-002", name: "UKHI INDIA PRIVATE LIMITED", legalName: "UKHI India Private Limited" },
    expectedFile: "UKHI Impact Report_September 2026.pdf",
    expectedUrl: "/Reports/UKHI%20Impact%20Report_September%202026.pdf",
  },
  {
    desc: "UKHI (Short name)",
    input: { name: "UKHI" },
    expectedFile: "UKHI Impact Report_September 2026.pdf",
    expectedUrl: "/Reports/UKHI%20Impact%20Report_September%202026.pdf",
  },
  {
    desc: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
    input: { enterpriseId: "ENT-001", name: "Bare Necessities Zero Waste Solutions Pvt. Ltd.", legalName: "Bare Necessities Zero Waste Solutions Pvt. Ltd." },
    expectedFile: "Bare Necessities- Impact Report 2026.pdf",
    expectedUrl: "/Reports/Bare%20Necessities-%20Impact%20Report%202026.pdf",
  },
  {
    desc: "Bare Necessities (Short name)",
    input: { name: "Bare Necessities" },
    expectedFile: "Bare Necessities- Impact Report 2026.pdf",
    expectedUrl: "/Reports/Bare%20Necessities-%20Impact%20Report%202026.pdf",
  },
  {
    desc: "Kheoni (Carousel card - name only)",
    input: { name: "Kheoni" },
    expectedFile: "Kheoni Impact Report_September 2026.pdf",
    expectedUrl: "/Reports/Kheoni%20Impact%20Report_September%202026.pdf",
  },
  {
    desc: "Kheoni Ventures Pvt Ltd (Database entry)",
    input: { enterpriseId: "ENT-003", name: "Kheoni Ventures Pvt Ltd", legalName: "Kheoni Ventures Pvt Ltd" },
    expectedFile: "Kheoni Impact Report_September 2026.pdf",
    expectedUrl: "/Reports/Kheoni%20Impact%20Report_September%202026.pdf",
  },
  {
    desc: "Greensole Footwear Pvt Ltd (Unmapped partner)",
    input: { enterpriseId: "ENT-004", name: "Greensole Footwear Pvt Ltd" },
    expectedFile: null,
    expectedUrl: null,
  },
  {
    desc: "Marikar Green Earth Private Limited (Unmapped partner)",
    input: { enterpriseId: "ENT-005", name: "Marikar Green Earth Private Limited" },
    expectedFile: null,
    expectedUrl: null,
  },
];

let allPassed = true;

testCases.forEach((tc, idx) => {
  const filename = getPartnerReportFilename(tc.input);
  const url = getPartnerReportUrl(tc.input);

  const fileMatch = filename === tc.expectedFile;
  const urlMatch = url === tc.expectedUrl;

  let diskCheck = true;
  if (filename) {
    const diskPath = path.join(__dirname, '..', 'public', 'Reports', filename);
    diskCheck = fs.existsSync(diskPath);
  }

  const passed = fileMatch && urlMatch && diskCheck;
  if (!passed) allPassed = false;

  console.log(`[${passed ? 'PASS' : 'FAIL'}] Test ${idx + 1}: ${tc.desc}`);
  console.log(`       Resolved filename: "${filename}"`);
  console.log(`       Resolved URL:      "${url}"`);
  if (filename) {
    const diskPath = path.join(__dirname, '..', 'public', 'Reports', filename);
    const size = fs.existsSync(diskPath) ? fs.statSync(diskPath).size : 0;
    console.log(`       Disk File Exists:  ${diskCheck} (${size} bytes at ${diskPath})`);
  } else {
    console.log(`       Button Rendered:   NO (Correctly omitted for unmapped partner)`);
  }
  console.log();
});

console.log("Overall Result:", allPassed ? "ALL CHECKS PASSED ✅" : "SOME CHECKS FAILED ❌");
process.exit(allPassed ? 0 : 1);
