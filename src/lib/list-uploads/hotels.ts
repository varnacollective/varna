import { viewOf, type View } from "@/components/ListUpload/labels";
import type { CheckStatus, Decision, UploadStatus } from "./types";

/**
 * Supplier lists grouped by hotel. Plain functions, so the page and the
 * tests share them; the database reads are in hotel-queries.ts.
 */

/** The "hotel" of uploads made before a hotel was required. */
export const NO_HOTEL = "none";

export interface HotelOption {
  id: string;
  name: string;
}

export type ViewCounts = Record<View, number> & { total: number };

export interface UploadRow {
  id: string;
  hotelId: string | null;
  status: UploadStatus;
  createdAt: string;
  fileNames: string[];
  counts: ViewCounts;
}

export interface HotelRow {
  /** A hotel code, or NO_HOTEL. */
  id: string;
  name: string;
  uploads: number;
  lastUploadAt: string | null;
  counts: ViewCounts;
}

export interface SupplierState {
  upload_id: string;
  check_status: CheckStatus;
  decision: Decision;
  invitation_id: string | null;
}

export function emptyCounts(): ViewCounts {
  return { total: 0, ready: 0, needs_attention: 0, missing_contact: 0, approved: 0, rejected: 0, invited: 0 };
}

function add(into: ViewCounts, from: ViewCounts): void {
  for (const key of Object.keys(into) as (keyof ViewCounts)[]) into[key] += from[key];
}

/** Counts each upload's suppliers by what the reviewer sees (Ready, Invited…). */
export function countByUpload(suppliers: readonly SupplierState[]): Map<string, ViewCounts> {
  const byUpload = new Map<string, ViewCounts>();
  for (const s of suppliers) {
    const counts = byUpload.get(s.upload_id) ?? emptyCounts();
    counts[viewOf(s)] += 1;
    counts.total += 1;
    byUpload.set(s.upload_id, counts);
  }
  return byUpload;
}

/**
 * One row per hotel, in name order, then "No hotel" last if any upload has
 * none. Hotels without uploads are listed too, so a new hotel can be picked.
 */
export function summariseHotels(hotels: readonly HotelOption[], uploads: readonly UploadRow[]): HotelRow[] {
  const rows = new Map<string, HotelRow>(
    [...hotels]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((h) => [h.id, { id: h.id, name: h.name, uploads: 0, lastUploadAt: null, counts: emptyCounts() }]),
  );
  for (const upload of uploads) {
    const id = upload.hotelId ?? NO_HOTEL;
    let row = rows.get(id);
    if (!row) {
      row = { id, name: id === NO_HOTEL ? "No hotel" : id, uploads: 0, lastUploadAt: null, counts: emptyCounts() };
      rows.set(id, row);
    }
    row.uploads += 1;
    if (!row.lastUploadAt || upload.createdAt > row.lastUploadAt) row.lastUploadAt = upload.createdAt;
    add(row.counts, upload.counts);
  }
  const noHotel = rows.get(NO_HOTEL);
  rows.delete(NO_HOTEL);
  return noHotel ? [...rows.values(), noHotel] : [...rows.values()];
}

export type Tab = "suppliers" | "lists";

/** Reads ?hotel= and ?tab=; anything unknown falls back to the overview. */
export function readSelection(
  params: { hotel?: string | string[]; tab?: string | string[] },
  hotels: readonly HotelRow[],
): { hotel: HotelRow | null; tab: Tab } {
  const id = typeof params.hotel === "string" ? params.hotel : undefined;
  const hotel = hotels.find((h) => h.id === id) ?? null;
  return { hotel, tab: params.tab === "lists" ? "lists" : "suppliers" };
}

/** A link to a hotel's page (or the overview, with no hotel). */
export function hotelHref(hotelId?: string | null, tab: Tab = "suppliers"): string {
  const base = "/superadmin/partners/invitations/upload";
  if (!hotelId) return base;
  const query = new URLSearchParams({ hotel: hotelId });
  if (tab !== "suppliers") query.set("tab", tab);
  return `${base}?${query.toString()}`;
}

/** The upload page, with the hotel already chosen when known. */
export function newListHref(hotelId?: string | null): string {
  const base = "/superadmin/partners/invitations/upload/new";
  return hotelId && hotelId !== NO_HOTEL ? `${base}?hotel=${encodeURIComponent(hotelId)}` : base;
}
