import type { SupplierFlag } from "./supplier";
import { cleanWhitespace, isPlaceholder } from "./text";

/**
 * Company-name normalisation, used to match the same supplier written in
 * different ways. The original name is always kept; this produces a separate
 * matching key.
 */

const SUFFIX_RULES: readonly [RegExp, string][] = [
  [/\b(?:private|pvt|p)\s+(?:limited|ltd)$/, "pvt ltd"],
  [/\b(?:limited|ltd)$/, "ltd"],
  [/\bl\s?l\s?p$/, "llp"],
];

/** Legal-form words removed to get the core name, e.g. "example handloom pvt ltd" → "example handloom". */
const LEGAL_WORDS = new Set([
  "pvt",
  "ltd",
  "llp",
  "opc",
  "private",
  "limited",
  "inc",
  "co",
  "company",
  "corp",
  "corporation",
]);

export interface NameResult {
  /** The name as written (whitespace tidied), if there is one. */
  company_name?: string;
  /** Matching key, if there is a name. */
  company_name_normalised?: string;
  flags: SupplierFlag[];
}

/**
 * Check a company name. A missing name is flagged missing_name; the row is
 * kept for a human to decide (e.g. an individual artisan listed by person).
 */
export function checkCompanyName(raw: string | undefined): NameResult {
  const name = raw === undefined ? "" : cleanWhitespace(raw);
  if (isPlaceholder(name)) return { flags: ["missing_name"] };
  const normalised = normaliseCompanyName(name);
  if (normalised.length === 0) return { flags: ["missing_name"] };
  return {
    company_name: name,
    company_name_normalised: normalised,
    flags: [],
  };
}

/**
 * "M/s. Example Handloom Pvt. Ltd." → "example handloom pvt ltd".
 * Lowercase, "&" → "and", punctuation removed, legal suffixes standardised.
 */
export function normaliseCompanyName(name: string): string {
  let value = name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/^\s*(?:m\s*\/\s*s|messrs)\b\.?/, " ")
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const [pattern, replacement] of SUFFIX_RULES) {
    if (pattern.test(value)) {
      value = value.replace(pattern, replacement);
      break;
    }
  }
  return value;
}

/** The name without legal-form words, for fuzzy comparison. */
export function coreName(normalised: string): string {
  const words = normalised.split(" ").filter((word) => word.length > 0);
  while (words.length > 1 && LEGAL_WORDS.has(words[words.length - 1] ?? "")) {
    words.pop();
  }
  return words.join(" ");
}

/** Similarity between two strings from 0 (different) to 1 (identical), by edit distance. */
export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - editDistance(a, b) / longest;
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        (previous[j] ?? 0) + 1,
        (current[j - 1] ?? 0) + 1,
        (previous[j - 1] ?? 0) + cost,
      );
    }
    previous = current;
  }
  return previous[b.length] ?? 0;
}
