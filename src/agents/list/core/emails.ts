import { z } from "zod/v4";
import type { SupplierFlag, Suggestion } from "./supplier";
import { isPlaceholder, joinRaw } from "./text";

const emailSchema = z.email();

/** Local parts that point to a shared inbox rather than a person. Still usable. */
export const GENERIC_LOCAL_PARTS: ReadonlySet<string> = new Set([
  "info",
  "sales",
  "contact",
  "contactus",
  "admin",
  "hello",
  "support",
  "office",
  "enquiry",
  "enquiries",
  "inquiry",
  "mail",
  "accounts",
  "account",
  "hr",
  "marketing",
  "team",
  "care",
  "customercare",
  "orders",
  "order",
  "export",
  "exports",
  "business",
]);

/** Common misspellings of email domains → likely intended domain. Suggested only. */
export const DOMAIN_TYPOS: Readonly<Record<string, string>> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "redifmail.com": "rediffmail.com",
  "rediffmial.com": "rediffmail.com",
};

export interface EmailResult {
  /** Valid, lowercased, unique emails, in source order. */
  emails: string[];
  /** Email-like values that failed validation, exactly as written. */
  invalid: string[];
  flags: SupplierFlag[];
  suggestions: Suggestion[];
}

/** Turn "name [at] domain [dot] com" style obfuscation into a plain address. */
export function deobfuscateEmails(text: string): string {
  return text
    .replace(/\s*[[({]\s*at\s*[\])}]\s*/gi, "@")
    .replace(/\s*[[({]\s*dot\s*[\])}]\s*/gi, ".");
}

const WRAPPING = /^[<("'[]+|[>)"'\].,:;]+$/g;

/**
 * Extract and check emails from one or more raw cells.
 * Never changes meaning: only lowercases, removes wrapping punctuation and
 * decodes obvious obfuscation. Typos are suggested, never fixed.
 */
export function checkEmails(raw: string | readonly string[]): EmailResult {
  const text = deobfuscateEmails(joinRaw(raw)).replace(/mailto:/gi, " ");
  const emails: string[] = [];
  const invalid: string[] = [];
  const suggestions: Suggestion[] = [];

  for (const token of text.split(/[\s,;|/]+/)) {
    const candidate = token.replace(WRAPPING, "");
    if (isPlaceholder(candidate) || !candidate.includes("@")) continue;
    const lower = candidate.toLowerCase();
    if (!emailSchema.safeParse(lower).success) {
      if (!invalid.includes(candidate)) invalid.push(candidate);
      continue;
    }
    if (emails.includes(lower)) continue;
    emails.push(lower);

    const [local = "", domain = ""] = lower.split("@");
    const intended = DOMAIN_TYPOS[domain];
    if (intended !== undefined) {
      suggestions.push({
        field: "emails",
        issue: `possible typo in email domain "${domain}"`,
        suggested_value: `${local}@${intended}`,
      });
    }
  }

  const flags: SupplierFlag[] = [];
  if (emails.length === 0 && invalid.length === 0) flags.push("missing_email");
  if (invalid.length > 0) flags.push("invalid_email");
  if (emails.some((email) => GENERIC_LOCAL_PARTS.has(localPart(email)))) {
    flags.push("generic_email");
  }
  return { emails, invalid, flags, suggestions };
}

function localPart(email: string): string {
  return email.slice(0, email.indexOf("@"));
}
