/**
 * Hotels (clients) live in one table, client_master, keyed by a short code
 * such as CLT-001. Superadmin pages read them through these helpers.
 */

export type OutreachMode = "approve_once" | "standing_authorisation" | "client_sends_each_wave";

export const OUTREACH_MODES: readonly OutreachMode[] = [
  "approve_once",
  "standing_authorisation",
  "client_sends_each_wave",
];

/** Columns of client_master the superadmin pages use. */
export const CLIENT_COLUMNS =
  "client_id, client_name, procurement_contact_name, contact_email, account_status, outreach_mode, " +
  "authorisation_doc_url, reminder_max_count, reminder_window_days, created_at";

export interface ClientMasterRow {
  client_id: string;
  client_name: string | null;
  procurement_contact_name: string | null;
  contact_email: string | null;
  account_status: string | null;
  outreach_mode: OutreachMode;
  authorisation_doc_url: string | null;
  reminder_max_count: number;
  reminder_window_days: number;
  created_at: string;
}

/** The shape the Client Organisations page shows. */
export interface ClientRecord {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  status: "active" | "inactive";
  outreach_mode: OutreachMode;
  authorisation_doc_url?: string;
  reminder_max_count: number;
  reminder_window_days: number;
  created_at: string;
}

export function toClientRecord(row: ClientMasterRow): ClientRecord {
  return {
    id: row.client_id,
    name: row.client_name ?? row.client_id,
    contact_name: row.procurement_contact_name ?? undefined,
    contact_email: row.contact_email ?? undefined,
    status: row.account_status?.trim().toLowerCase() === "inactive" ? "inactive" : "active",
    outreach_mode: row.outreach_mode,
    authorisation_doc_url: row.authorisation_doc_url ?? undefined,
    reminder_max_count: row.reminder_max_count,
    reminder_window_days: row.reminder_window_days,
    created_at: row.created_at,
  };
}
