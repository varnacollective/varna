/** Shapes shared by the list upload pages and their API routes. */

export const CHECK_STATUSES = ["ready", "needs_attention", "missing_contact"] as const;
export type CheckStatus = (typeof CHECK_STATUSES)[number];

export const DECISIONS = ["pending", "approved", "rejected"] as const;
export type Decision = (typeof DECISIONS)[number];

export type UploadStatus = "reading" | "review" | "done" | "failed" | "cancelled";

/** "attention": a person must look before approving. "info": worth knowing. */
export interface Issue {
  code: string;
  level: "attention" | "info";
  message: string;
  /** Other suppliers in this upload the issue is about (duplicates, shared email). */
  related?: RelatedRow[];
}

/** Another supplier an issue points to, and where it is in the files. */
export interface RelatedRow {
  id: string;
  /** "row 7", "page 2", or "vendor-list.pdf, page 1" when in another file. */
  place: string;
}

/** Where a supplier was found, and the text of every cell in its rows. */
export interface Evidence {
  fileName: string;
  sheet?: string;
  row?: number;
  page?: number;
  readFromImage: boolean;
  cells: { cell: string; text: string }[];
}

export interface FailedPart {
  fileName: string;
  part: string;
  message: string;
}

export interface UploadSummary {
  id: string;
  clientId: string | null;
  clientName: string | null;
  status: UploadStatus;
  createdAt: string;
  finishedAt: string | null;
  model: string | null;
  visionModel: string | null;
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  /** At Google's paid prices, in US dollars; null if a model's price is unknown. */
  paidCostUsd: number | null;
  failedParts: FailedPart[];
  error: string | null;
  files: { id: string; name: string; sizeBytes: number; pageCount: number | null }[];
}

/** The fields a reviewer can change. */
export const EDITABLE_FIELDS = [
  "company_name",
  "contact_name",
  "email",
  "phone",
  "city",
  "state",
] as const;
export type EditableField = (typeof EDITABLE_FIELDS)[number];

export interface ReviewSupplier {
  id: string;
  upload_id: string;
  file_id: string | null;
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
  check_status: CheckStatus;
  issues: Issue[];
  evidence: Evidence;
  decision: Decision;
  duplicate_of: string | null;
  invitation_id: string | null;
}

/** Streamed by the read route, one JSON object per line. */
export type ReadEvent =
  | { type: "file"; index: number; total: number; name: string }
  | { type: "progress"; stage: "pages" | "rows"; done: number; total: number }
  | { type: "done"; suppliers: number; failedParts: number }
  | { type: "error"; message: string };
