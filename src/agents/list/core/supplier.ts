import { z } from "zod/v4";

/**
 * One supplier extracted from a hotel's supplier list.
 *
 * Rules this schema encodes:
 * - Typed fields (emails, phones, gstin, udyam_number, …) hold only values that
 *   passed their format check. Everything exactly as written in the source is
 *   kept in `raw_values`, so nothing is ever lost or silently changed.
 * - Meaning-changing corrections are never applied automatically: they are
 *   recorded in `suggestions` for a human to confirm.
 * - Rows are never merged. Likely duplicates share a `duplicate_group_id`.
 * - Every row points back to where it came from (`source`).
 */

export const SUPPLIER_STATUSES = [
  "READY",
  "MISSING_CONTACT",
  "NEEDS_ATTENTION",
  "DUPLICATE",
] as const;
export const SupplierStatus = z.enum(SUPPLIER_STATUSES);
export type SupplierStatus = z.infer<typeof SupplierStatus>;

export const SUPPLIER_FLAGS = [
  "missing_name",
  "missing_email",
  "invalid_email",
  "invalid_phone",
  "generic_email",
  "shared_email",
  "possible_duplicate",
  "invalid_gstin",
  "invalid_udyam",
  "low_confidence",
  "unverified_value",
  "not_a_supplier",
  "multiple_suppliers_in_cell",
  "id_in_wrong_field",
  "corrupted_value",
  "read_from_image",
] as const;
export const SupplierFlag = z.enum(SUPPLIER_FLAGS);
export type SupplierFlag = z.infer<typeof SupplierFlag>;

export const EXTRACTION_METHODS = [
  "deterministic",
  "ai_text",
  "ai_vision",
  "ocr+ai",
] as const;
export const ExtractionMethod = z.enum(EXTRACTION_METHODS);
export type ExtractionMethod = z.infer<typeof ExtractionMethod>;

/** Phone number in E.164 format, e.g. +919876543210. */
export const E164_PHONE = /^\+[1-9]\d{6,14}$/;

/** GSTIN shape: 2-digit state code, PAN, entity number, "Z", check character. Checksum is validated separately. */
export const GSTIN_FORMAT = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/** Udyam registration number, e.g. UDYAM-KR-03-0142405. */
export const UDYAM_FORMAT = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;

const nonEmptyText = z.string().trim().min(1);

/** Where a supplier row came from. */
export const SupplierSource = z.strictObject({
  file_id: z.uuid(),
  file_name: nonEmptyText,
  sheet: nonEmptyText.optional(),
  /** 1-based row number in the sheet. */
  row: z.int().positive().optional(),
  /** 1-based page number in a PDF or scan. */
  page: z.int().positive().optional(),
  /** Character offsets into the file's extracted text. */
  text_span: z
    .strictObject({
      start: z.int().nonnegative(),
      end: z.int().nonnegative(),
    })
    .refine((span) => span.end > span.start, {
      error: "text_span.end must be after text_span.start",
    })
    .optional(),
});
export type SupplierSource = z.infer<typeof SupplierSource>;

/** A proposed correction for a human to confirm. Never applied automatically. */
export const Suggestion = z.strictObject({
  /** Field the issue is about, e.g. "gstin". */
  field: nonEmptyText,
  /** What looks wrong, in plain words, e.g. "looks like a CIN, not a GSTIN". */
  issue: nonEmptyText,
  /** Field the value probably belongs in, e.g. "other_ids.cin". */
  suggested_field: nonEmptyText.optional(),
  /** Corrected value, if one can be proposed. */
  suggested_value: nonEmptyText.optional(),
});
export type Suggestion = z.infer<typeof Suggestion>;

export const Supplier = z
  .strictObject({
    id: z.uuid(),
    client_id: z.uuid(),
    programme_id: z.uuid(),
    upload_id: z.uuid(),

    /** Legal or registered name, as written in the source. Missing → flagged missing_name, row kept. */
    company_name: nonEmptyText.optional(),
    /** Lowercased, legal suffixes standardised; used for duplicate checks and the registry. */
    company_name_normalised: nonEmptyText.optional(),
    /** Trading/brand name, if different from the company name. */
    brand_name: nonEmptyText.optional(),

    contact_name: nonEmptyText.optional(),
    /** Valid, lowercased emails. First is primary. */
    emails: z.array(z.email()),
    /** E.164 phone numbers. First is primary. */
    phones: z.array(z.string().regex(E164_PHONE, "phone must be E.164")),
    website: nonEmptyText.optional(),

    address: nonEmptyText.optional(),
    city: nonEmptyText.optional(),
    district: nonEmptyText.optional(),
    state: nonEmptyText.optional(),
    country: nonEmptyText.optional(),

    /** What they supply, e.g. "linen", "bamboo amenities". */
    category: nonEmptyText.optional(),

    gstin: z.string().regex(GSTIN_FORMAT, "invalid GSTIN format").optional(),
    udyam_number: z
      .string()
      .regex(UDYAM_FORMAT, "invalid Udyam format")
      .optional(),
    /** Other IDs found, e.g. { pan: "...", cin: "..." }. */
    other_ids: z.record(nonEmptyText, nonEmptyText).optional(),

    notes: nonEmptyText.optional(),

    /** Every original value exactly as found, keyed by its label in the source. */
    raw_values: z.record(z.string(), z.string()),
    suggestions: z.array(Suggestion),

    source: SupplierSource,
    /** Per-field confidence from 0 to 1 (1 for deterministic parses). */
    field_confidence: z.record(z.string(), z.number().min(0).max(1)),
    flags: z.array(SupplierFlag),
    status: SupplierStatus,
    /** Rows that look like the same supplier share this id. Rows are never merged. */
    duplicate_group_id: z.uuid().optional(),
    extraction_method: ExtractionMethod,
    created_at: z.iso.datetime({ offset: true }),
  })
  .superRefine((supplier, ctx) => {
    if (supplier.company_name === undefined) {
      if (!supplier.flags.includes("missing_name")) {
        ctx.addIssue({
          code: "custom",
          path: ["flags"],
          message: "a row without company_name must be flagged missing_name",
        });
      }
      if (supplier.status === "READY") {
        ctx.addIssue({
          code: "custom",
          path: ["status"],
          message: "a row without company_name cannot be READY",
        });
      }
    } else if (supplier.company_name_normalised === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["company_name_normalised"],
        message: "company_name_normalised is required when company_name is set",
      });
    }
    if (supplier.emails.length === 0 && supplier.status === "READY") {
      ctx.addIssue({
        code: "custom",
        path: ["status"],
        message: "a row without a valid email cannot be READY",
      });
    }
    const needsGroup =
      supplier.status === "DUPLICATE" ||
      supplier.flags.includes("possible_duplicate");
    if (needsGroup && supplier.duplicate_group_id === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["duplicate_group_id"],
        message:
          "duplicate_group_id is required when status is DUPLICATE or flagged possible_duplicate",
      });
    }
    if (new Set(supplier.flags).size !== supplier.flags.length) {
      ctx.addIssue({
        code: "custom",
        path: ["flags"],
        message: "flags must not repeat",
      });
    }
  });
export type Supplier = z.infer<typeof Supplier>;
