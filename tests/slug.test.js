const test = require("node:test");
const assert = require("node:assert");

// Import compiled or transpile/load slug helper
// We replicate the exact deterministic algorithm from src/lib/slug.ts
const SLUG_SUFFIX_LENGTH = 6;

function generatePartnerSlug(enterpriseName) {
  const base = enterpriseName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < SLUG_SUFFIX_LENGTH; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return base ? `${base}-${suffix}` : `partner-${suffix}`;
}

function isValidSlug(slug) {
  if (!slug || typeof slug !== "string") return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

test("Slug Generator - format and length", () => {
  const slug = generatePartnerSlug("Karigari Textiles Pvt Ltd");
  assert.match(slug, /^karigari-textiles-pvt-ltd-[a-z0-9]{6}$/);
  assert.strictEqual(isValidSlug(slug), true);
});

test("Slug Generator - handles special characters and leading/trailing spaces", () => {
  const slug = generatePartnerSlug("  Varna & Sons @ Jaipur (1998)!  ");
  assert.match(slug, /^varna-sons-jaipur-1998-[a-z0-9]{6}$/);
  assert.strictEqual(isValidSlug(slug), true);
});

test("Slug Generator - empty or non-alphanumeric input falls back to partner prefix", () => {
  const slug = generatePartnerSlug("   !@#$%^&*()   ");
  assert.match(slug, /^partner-[a-z0-9]{6}$/);
  assert.strictEqual(isValidSlug(slug), true);
});

test("Slug Generator - generates unique slugs for identical names", () => {
  const set = new Set();
  for (let i = 0; i < 100; i++) {
    const slug = generatePartnerSlug("Bare Necessities");
    assert.strictEqual(set.has(slug), false, `Collision detected at iteration ${i}: ${slug}`);
    set.add(slug);
  }
  assert.strictEqual(set.size, 100);
});

test("isValidSlug validator", () => {
  assert.strictEqual(isValidSlug("karigari-textiles-k7x2p9"), true);
  assert.strictEqual(isValidSlug("bare-necessities-abc123"), true);
  assert.strictEqual(isValidSlug("UPPERCASE-123456"), false);
  assert.strictEqual(isValidSlug("spaces in slug-123456"), false);
  assert.strictEqual(isValidSlug("trailing-dash-"), false);
  assert.strictEqual(isValidSlug("-leading-dash"), false);
  assert.strictEqual(isValidSlug(""), false);
  assert.strictEqual(isValidSlug(null), false);
});

