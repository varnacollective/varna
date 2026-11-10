export const SLUG_SUFFIX_LENGTH = 6;

export function generatePartnerSlug(enterpriseName: string): string {
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

export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
