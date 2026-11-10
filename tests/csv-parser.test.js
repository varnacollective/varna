const test = require("node:test");
const assert = require("node:assert");

// Copy of csv parser functions matching src/lib/csv-parser.ts
const SYNONYMS = {
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

function detectHeaderRow(grid) {
  let bestScore = -1;
  let bestIndex = 0;
  let bestHeaders = [];
  let bestMapping = {};

  for (let r = 0; r < Math.min(grid.length, 10); r++) {
    const row = grid[r].map(c => (c || "").trim().toLowerCase());
    const mapping = {};
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

function parseSupplierCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const grid = lines.map(line => {
    const matches = line.match(/(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g) || [];
    return matches.map(m => m.replace(/^,/, "").replace(/^"|"$/g, "").trim());
  });

  if (grid.length === 0) {
    return { rows: [], totalRows: 0, cleanCount: 0, autoFixedCount: 0, rejectedCount: 0, duplicateCount: 0, outOfScopeCount: 0 };
  }

  const { index: headerIndex, headers, mapping } = detectHeaderRow(grid);
  const dataRows = grid.slice(headerIndex + 1);

  const colIndexToKey = {};
  for (let c = 0; c < headers.length; c++) {
    const rawHeader = headers[c];
    for (const [stdKey, mappedRaw] of Object.entries(mapping)) {
      if (mappedRaw.toLowerCase() === rawHeader.toLowerCase()) {
        colIndexToKey[c] = stdKey;
      }
    }
  }

  const seenEmails = new Map();
  const seenPhones = new Map();
  const seenNames = new Map();

  const parsedRows = [];
  let cleanCount = 0;
  let autoFixedCount = 0;
  let rejectedCount = 0;
  let duplicateCount = 0;
  let outOfScopeCount = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const rawRow = dataRows[i];
    const cleanObj = {};
    const errors = [];
    let isAutoFixed = false;

    for (let c = 0; c < headers.length; c++) {
      const val = (rawRow[c] || "").trim();
      const key = colIndexToKey[c];
      if (key) cleanObj[key] = val;
    }

    let enterpriseName = (cleanObj.enterprise_name || "").trim();
    let email = (cleanObj.contact_email || "").trim().toLowerCase();
    let phone = (cleanObj.contact_phone || "").replace(/[^\d+]/g, "").trim();
    let country = (cleanObj.country || "India").trim();

    let isOutOfScope = false;
    if (country.toLowerCase() !== "india" && country.toLowerCase() !== "in" && country !== "") {
      isOutOfScope = true;
      outOfScopeCount++;
    }

    if (!enterpriseName) errors.push("Missing enterprise legal name");
    const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const hasValidPhone = phone.replace(/\D/g, "").length >= 10;
    if (!hasValidEmail && !hasValidPhone) errors.push("Requires at least one valid contact email or phone number");

    if (cleanObj.contact_email && cleanObj.contact_email !== email) isAutoFixed = true;
    if (cleanObj.contact_phone && cleanObj.contact_phone !== phone) isAutoFixed = true;

    let isDuplicate = false;
    const normName = enterpriseName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (hasValidEmail && seenEmails.has(email)) isDuplicate = true;
    else if (hasValidPhone && seenPhones.has(phone)) isDuplicate = true;
    else if (normName && seenNames.has(normName)) isDuplicate = true;

    const rowNum = headerIndex + i + 2;
    if (isDuplicate) duplicateCount++;
    else {
      if (hasValidEmail) seenEmails.set(email, rowNum);
      if (hasValidPhone) seenPhones.set(phone, rowNum);
      if (normName) seenNames.set(normName, rowNum);
    }

    let validationStatus = "clean";
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
      clean: { enterprise_name: enterpriseName, contact_email: email, contact_phone: phone, country },
      validationStatus,
      validationErrors: errors,
      isDuplicate,
      isOutOfScope
    });
  }

  return { rows: parsedRows, totalRows: parsedRows.length, cleanCount, autoFixedCount, rejectedCount, duplicateCount, outOfScopeCount };
}

test("CSV Parser - header detection & synonym mapping", () => {
  const csv = `Company Name,Contact Person,Email Address,Mobile,City,State,Country
Karigari Weaves,Anand Verma,anand@karigari.in,+91 98765 43210,Bagru,Rajasthan,India
Sita Silk Handlooms,Sita Devi,sita@silks.org,+91 91234 56789,Varanasi,Uttar Pradesh,India`;

  const result = parseSupplierCsv(csv);
  assert.strictEqual(result.totalRows, 2);
  assert.strictEqual(result.rejectedCount, 0);
  assert.strictEqual(result.rows[0].clean.enterprise_name, "Karigari Weaves");
  assert.strictEqual(result.rows[0].clean.contact_email, "anand@karigari.in");
});

test("CSV Parser - auto-fixing lowercase email and normalized phone", () => {
  const csv = `Enterprise,Email,Phone
Maa Durga Handicrafts,  INFO@MaaDurga.COM  , +91 (9876) 543-210 `;

  const result = parseSupplierCsv(csv);
  assert.strictEqual(result.rows[0].validationStatus, "auto_fixed");
  assert.strictEqual(result.rows[0].clean.contact_email, "info@maadurga.com");
  assert.strictEqual(result.rows[0].clean.contact_phone, "+919876543210");
});

test("CSV Parser - rejects rows missing both email and phone", () => {
  const csv = `Vendor,Email,Phone
Incomplete Vendor,,,`;

  const result = parseSupplierCsv(csv);
  assert.strictEqual(result.rows[0].validationStatus, "rejected");
  assert.strictEqual(result.rejectedCount, 1);
});

test("CSV Parser - detects duplicate rows by email or phone", () => {
  const csv = `Supplier,Email,Phone
Artisan Co 1,artisan@domain.com,9876543210
Artisan Co 2,artisan@domain.com,9999999999
Artisan Co 3,different@domain.com,9876543210`;

  const result = parseSupplierCsv(csv);
  assert.strictEqual(result.rows[0].isDuplicate, false);
  assert.strictEqual(result.rows[1].isDuplicate, true); // duplicate email
  assert.strictEqual(result.rows[2].isDuplicate, true); // duplicate phone
  assert.strictEqual(result.duplicateCount, 2);
});

test("CSV Parser - marks non-Indian rows out of scope", () => {
  const csv = `Enterprise,Email,Phone,Country
European Ceramics,info@euroceramics.de,+49 123 45678,Germany
Indian Terracotta,info@terracotta.in,+91 98765 43210,India`;

  const result = parseSupplierCsv(csv);
  assert.strictEqual(result.rows[0].isOutOfScope, true);
  assert.strictEqual(result.rows[1].isOutOfScope, false);
  assert.strictEqual(result.outOfScopeCount, 1);
});
