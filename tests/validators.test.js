const test = require("node:test");
const assert = require("node:assert");

// Copy of deterministic validation functions matching src/lib/validators.ts
function validateGSTIN(gstin) {
  if (!gstin || typeof gstin !== "string") return { valid: false, reason: "GSTIN is required" };
  const trimmed = gstin.trim();
  if (trimmed.length === 0) return { valid: false, reason: "GSTIN cannot be empty" };
  if (trimmed.toLowerCase() === "not registered") return { valid: true };
  const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  return gstinRegex.test(trimmed.toUpperCase())
    ? { valid: true }
    : { valid: false, reason: "Invalid GSTIN format." };
}

function validateUdyam(udyam) {
  if (!udyam || typeof udyam !== "string") return { valid: false, reason: "Udyam registration number is required" };
  const trimmed = udyam.trim();
  if (trimmed.length === 0) return { valid: false, reason: "Udyam registration number cannot be empty" };
  const lower = trimmed.toLowerCase();
  if (["applied", "not yet registered", "not registered"].includes(lower)) return { valid: true };
  const udyamRegex = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;
  return udyamRegex.test(trimmed.toUpperCase())
    ? { valid: true }
    : { valid: false, reason: "Invalid Udyam format." };
}

function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  const rfc5322Regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return rfc5322Regex.test(trimmed);
}

function validatePhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  if (!/^\+?[\d\s\-().]{10,}$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function validateYear(year) {
  if (year === null || year === undefined || year === "") return false;
  const num = typeof year === "number" ? year : Number(year);
  if (!Number.isFinite(num) || !Number.isInteger(num)) return false;
  const currentYear = new Date().getFullYear();
  return num >= 1800 && num <= currentYear;
}

function validateWorkers(total, women) {
  if (typeof total !== "number" || typeof women !== "number" || !Number.isFinite(total) || !Number.isFinite(women)) {
    return { valid: false, reason: "Worker counts must be valid numbers" };
  }
  if (total < 0 || women < 0) return { valid: false, reason: "Worker counts cannot be negative" };
  if (women > total) return { valid: false, reason: "Number of women workers cannot exceed total workers" };
  return { valid: true };
}

test("GSTIN Validator", () => {
  assert.strictEqual(validateGSTIN("08AABCA1234B1Z5").valid, true);
  assert.strictEqual(validateGSTIN("27AAPFU0939F1ZV").valid, true);
  assert.strictEqual(validateGSTIN("Not registered").valid, true);
  assert.strictEqual(validateGSTIN("not registered").valid, true);
  assert.strictEqual(validateGSTIN("INVALID_GSTIN_123").valid, false);
  assert.strictEqual(validateGSTIN("").valid, false);
  assert.strictEqual(validateGSTIN(null).valid, false);
});

test("Udyam Validator", () => {
  assert.strictEqual(validateUdyam("UDYAM-RJ-14-0012345").valid, true);
  assert.strictEqual(validateUdyam("UDYAM-MH-01-0000001").valid, true);
  assert.strictEqual(validateUdyam("Applied").valid, true);
  assert.strictEqual(validateUdyam("Not yet registered").valid, true);
  assert.strictEqual(validateUdyam("Not registered").valid, true);
  assert.strictEqual(validateUdyam("UDYAM-INVALID").valid, false);
  assert.strictEqual(validateUdyam("").valid, false);
  assert.strictEqual(validateUdyam(null).valid, false);
});

test("Email Validator", () => {
  assert.strictEqual(validateEmail("partner@karigaritextiles.in"), true);
  assert.strictEqual(validateEmail("yuvraj@varnacollective.com"), true);
  assert.strictEqual(validateEmail("info+varna@domain.co.in"), true);
  assert.strictEqual(validateEmail("invalid-email"), false);
  assert.strictEqual(validateEmail("@nodomain.com"), false);
  assert.strictEqual(validateEmail(""), false);
  assert.strictEqual(validateEmail(null), false);
});

test("Phone Validator", () => {
  assert.strictEqual(validatePhone("+91 98765 43210"), true);
  assert.strictEqual(validatePhone("9876543210"), true);
  assert.strictEqual(validatePhone("+91-9876-543210"), true);
  assert.strictEqual(validatePhone("+1 (555) 234-5678"), true);
  assert.strictEqual(validatePhone("12345"), false); // too short
  assert.strictEqual(validatePhone("abcdefghijk"), false);
  assert.strictEqual(validatePhone(""), false);
});

test("Year Validator", () => {
  assert.strictEqual(validateYear(2018), true);
  assert.strictEqual(validateYear("1995"), true);
  assert.strictEqual(validateYear(1800), true);
  assert.strictEqual(validateYear(new Date().getFullYear()), true);
  assert.strictEqual(validateYear(1799), false);
  assert.strictEqual(validateYear(2099), false);
  assert.strictEqual(validateYear("not-a-year"), false);
});

test("Workers Validator (Women <= Total)", () => {
  assert.strictEqual(validateWorkers(15, 12).valid, true);
  assert.strictEqual(validateWorkers(20, 20).valid, true);
  assert.strictEqual(validateWorkers(10, 0).valid, true);
  assert.strictEqual(validateWorkers(10, 15).valid, false); // women > total
  assert.strictEqual(validateWorkers(-5, 0).valid, false);
});

