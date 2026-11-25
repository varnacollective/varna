/** Values people write when a field is empty. */
const PLACEHOLDERS = new Set([
  "",
  "-",
  "--",
  "na",
  "n/a",
  "n.a",
  "n.a.",
  "nil",
  "none",
  "null",
  "nan",
  "not available",
  "not applicable",
]);

export function isPlaceholder(value: string): boolean {
  return PLACEHOLDERS.has(value.trim().toLowerCase());
}

/** Join one or several raw cells into one text, one cell per line. */
export function joinRaw(raw: string | readonly string[]): string {
  return typeof raw === "string" ? raw : raw.join("\n");
}

/** Unicode-normalise and collapse whitespace. Lossless for meaning. */
export function cleanWhitespace(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}
