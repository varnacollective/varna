import "server-only";
import { promises as dns } from "node:dns";

/**
 * Does an email's domain exist and accept email? Catches misread or mistyped
 * domains ("kalpataru.examp1e.com") with a DNS lookup: no AI, no email sent.
 *
 * "ok": mail servers found (or an address, which mail can also use).
 * "no_domain": the domain does not exist.
 * "no_mail": it exists but says it takes no email.
 * "unknown": the lookup itself failed (timeout, DNS down). Never flagged.
 */
export type DomainVerdict = "ok" | "no_domain" | "no_mail" | "unknown";

const BATCH = 20;

export function domainOf(email: string): string {
  return email.slice(email.lastIndexOf("@") + 1).trim().toLowerCase();
}

export async function checkEmailDomains(
  domains: Iterable<string>,
  timeoutMs = 3000,
): Promise<Map<string, DomainVerdict>> {
  const resolver = new dns.Resolver({ timeout: timeoutMs, tries: 2 });
  const unique = [...new Set(domains)];
  const verdicts = new Map<string, DomainVerdict>();
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const results = await Promise.all(batch.map((d) => checkDomain(resolver, d)));
    batch.forEach((d, j) => verdicts.set(d, results[j] ?? "unknown"));
  }
  return verdicts;
}

async function checkDomain(resolver: dns.Resolver, domain: string): Promise<DomainVerdict> {
  try {
    const mx = await resolver.resolveMx(domain);
    // A single empty record ("null MX") means the domain takes no email.
    if (mx.length === 1 && mx[0]?.exchange === "") return "no_mail";
    if (mx.length > 0) return "ok";
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === dns.NOTFOUND) return "no_domain";
    if (code !== dns.NODATA) return "unknown";
  }
  // No mail servers listed: mail falls back to the domain's own address.
  try {
    return (await resolver.resolve4(domain)).length > 0 ? "ok" : "no_mail";
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code === dns.NODATA || code === dns.NOTFOUND ? "no_mail" : "unknown";
  }
}
