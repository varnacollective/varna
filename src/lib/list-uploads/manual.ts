import { z } from "zod/v4";
import { checkEmails } from "@/agents/list/core/emails";
import { checkCompanyName } from "@/agents/list/core/names";
import { checkPhones } from "@/agents/list/core/phones";
import { cleanWhitespace } from "@/agents/list/core/text";
import { checkStatus, issuesFromChecks } from "./review-row";
import type { CheckStatus, Evidence, Issue } from "./types";

/**
 * One supplier added by hand. It is checked by the same rules as a supplier
 * read from a file (company name, email, phone), then reviewed and invited
 * the same way. No database access here.
 */

export const ADDED_BY_HAND = "Added by hand";

const optionalText = z
  .string()
  .max(300)
  .nullish()
  .transform((v) => (v?.trim() ? cleanWhitespace(v) : null));

export const ManualSupplier = z.strictObject({
  /** A hotel code, or null for No hotel. Must be chosen. */
  clientId: z.string({ error: "Choose the hotel, or No hotel." }).trim().min(1, "Choose the hotel, or No hotel.").max(64).nullable(),
  company_name: z.string({ error: "Enter the company name." }).max(300).transform((v) => cleanWhitespace(v)).pipe(z.string().min(1, "Enter the company name.")),
  brand_name: optionalText,
  contact_name: optionalText,
  email: optionalText,
  phone: optionalText,
  city: optionalText,
  state: optionalText,
  category: optionalText,
});
export type ManualSupplier = z.infer<typeof ManualSupplier>;

const LABELS: Record<Exclude<keyof ManualSupplier, "clientId">, string> = {
  company_name: "Company",
  brand_name: "Brand",
  contact_name: "Contact name",
  email: "Email",
  phone: "Phone",
  city: "City",
  state: "State",
  category: "Category",
};

export interface NewManualRow {
  id: string;
  upload_id: string;
  file_id: null;
  position: number;
  company_name: string | null;
  brand_name: string | null;
  contact_name: string | null;
  email: string | null;
  other_emails: string[];
  phone: string | null;
  other_phones: string[];
  city: string | null;
  state: string | null;
  category: string | null;
  check_status: CheckStatus;
  issues: Issue[];
  /** What was typed, kept as the evidence, like the cells of a file. */
  extracted: { manual: Record<string, string>; evidence: Evidence };
}

export function manualRow(input: ManualSupplier, where: { id: string; uploadId: string }): NewManualRow {
  const name = checkCompanyName(input.company_name);
  const emails = checkEmails(input.email ?? "");
  const phones = checkPhones(input.phone ?? "");
  // Typed values that fail a check are kept as typed, so the reviewer sees and fixes them.
  const [email = emails.invalid[0] ?? null, ...otherEmails] = emails.emails;
  const [phone = input.phone, ...otherPhones] = phones.phones;
  // The list rules skip very short numbers (a stray cell); a phone typed by hand is meant as one.
  const phoneFlags = input.phone && phones.phones.length === 0 && !phones.flags.includes("invalid_phone")
    ? [...phones.flags, "invalid_phone" as const]
    : phones.flags;
  const issues = issuesFromChecks([...name.flags, ...emails.flags, ...phoneFlags], [...emails.suggestions, ...phones.suggestions], {
    company: name.company_name ?? null,
    contact: input.contact_name,
  });

  const typed = Object.fromEntries(
    (Object.keys(LABELS) as (keyof typeof LABELS)[]).flatMap((k) => {
      const value = input[k];
      return value ? [[LABELS[k], value] as const] : [];
    }),
  );
  const row = {
    id: where.id,
    upload_id: where.uploadId,
    file_id: null,
    position: 1,
    company_name: name.company_name ?? null,
    brand_name: input.brand_name,
    contact_name: input.contact_name,
    email,
    other_emails: otherEmails,
    phone: phone ?? null,
    other_phones: otherPhones,
    city: input.city,
    state: input.state,
    category: input.category,
    issues,
  };
  return {
    ...row,
    check_status: checkStatus(row),
    extracted: {
      manual: typed,
      evidence: {
        fileName: ADDED_BY_HAND,
        readFromImage: false,
        cells: Object.entries(typed).map(([cell, text]) => ({ cell, text })),
      },
    },
  };
}
