/**
 * lib/validators.ts
 *
 * Backend validation logic and helper functions for Varna enterprise assessments.
 */

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates Indian Goods and Services Tax Identification Number (GSTIN).
 * Format: 2 digits state code + 10 chars PAN + 1 entity code + 1 'Z' + 1 checksum character.
 * Regex: /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
 * Also accepts "Not registered" / "not registered" as valid.
 */
export function validateGSTIN(gstin: string): ValidationResult {
  if (!gstin || typeof gstin !== "string") {
    return { valid: false, reason: "GSTIN is required" };
  }

  const trimmed = gstin.trim();
  if (trimmed.length === 0) {
    return { valid: false, reason: "GSTIN cannot be empty" };
  }

  if (trimmed.toLowerCase() === "not registered") {
    return { valid: true };
  }

  const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  const normalized = trimmed.toUpperCase();

  if (gstinRegex.test(normalized)) {
    return { valid: true };
  }

  return {
    valid: false,
    reason:
      "Invalid GSTIN format. Expected 15-character format (e.g., 29AAAAA0000A1Z5) or 'Not registered'.",
  };
}

/**
 * Validates Udyam MSME Registration Number.
 * Format: UDYAM-XX-00-0000000
 * Regex: /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/
 * Also accepts "Applied", "Not yet registered", "Not registered" as valid.
 */
export function validateUdyam(udyam: string): ValidationResult {
  if (!udyam || typeof udyam !== "string") {
    return { valid: false, reason: "Udyam registration number is required" };
  }

  const trimmed = udyam.trim();
  if (trimmed.length === 0) {
    return { valid: false, reason: "Udyam registration number cannot be empty" };
  }

  const lower = trimmed.toLowerCase();
  const allowedStatus = ["applied", "not yet registered", "not registered"];
  if (allowedStatus.includes(lower)) {
    return { valid: true };
  }

  const udyamRegex = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;
  const normalized = trimmed.toUpperCase();

  if (udyamRegex.test(normalized)) {
    return { valid: true };
  }

  return {
    valid: false,
    reason:
      "Invalid Udyam format. Expected UDYAM-XX-00-0000000 or 'Applied' / 'Not yet registered' / 'Not registered'.",
  };
}

/**
 * Validates standard RFC 5322 email address.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) {
    return false;
  }

  // Standard RFC 5322 compliant regex for email addresses
  const rfc5322Regex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!rfc5322Regex.test(trimmed)) {
    return false;
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domainPart] = parts;
  if (localPart.length > 64) {
    return false;
  }

  const domainLabels = domainPart.split(".");
  if (domainLabels.some((label) => label.length === 0 || label.length > 63)) {
    return false;
  }

  const tld = domainLabels[domainLabels.length - 1];
  if (tld.length < 2) {
    return false;
  }

  return true;
}

/**
 * Validates international and domestic phone numbers.
 * Supports e.g. "+91 98765 43210", "9876543210", "+1 (555) 123-4567".
 * Requires at least 10 digits and conforms to ITU-T E.164 max 15 digits.
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") {
    return false;
  }

  const trimmed = phone.trim();
  if (!/^\+?[\d\s\-().]{10,}$/.test(trimmed)) {
    return false;
  }

  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validates enterprise founding/incorporation year.
 * Must be an integer between 1800 and the current year.
 */
export function validateYear(year: number | string): boolean {
  if (year === null || year === undefined || year === "") {
    return false;
  }

  const num = typeof year === "number" ? year : Number(year);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    return false;
  }

  const currentYear = new Date().getFullYear();
  return num >= 1800 && num <= currentYear;
}

/**
 * Validates enterprise worker counts.
 * Requirements:
 * - women <= total
 * - both >= 0
 */
export function validateWorkers(
  total: number,
  women: number
): ValidationResult {
  if (
    typeof total !== "number" ||
    typeof women !== "number" ||
    !Number.isFinite(total) ||
    !Number.isFinite(women)
  ) {
    return { valid: false, reason: "Worker counts must be valid numbers" };
  }

  if (total < 0 || women < 0) {
    return { valid: false, reason: "Worker counts cannot be negative" };
  }

  if (women > total) {
    return {
      valid: false,
      reason: "Number of women workers cannot exceed total workers",
    };
  }

  return { valid: true };
}
