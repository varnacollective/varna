import "server-only";
import { createAdminClient } from "@/utils/supabase/admin";
import { countByUpload, emptyCounts, NO_HOTEL, type HotelOption, type SupplierState, type UploadRow } from "./hotels";
import { REVIEW_SUPPLIER_COLUMNS } from "./queries";
import type { ReviewSupplier, UploadStatus } from "./types";

/** Database reads for the supplier lists page. Only the server can read these tables. */

/** Supabase returns at most 1,000 rows per request; read in pages. */
const PAGE = 1000;

async function readAll<T>(read: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await read(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

export async function listHotels(): Promise<HotelOption[]> {
  const { data, error } = await createAdminClient()
    .from("client_master")
    .select("id:client_id, name:client_name")
    .order("client_name")
    .overrideTypes<{ id: string; name: string | null }[], { merge: false }>();
  if (error) throw new Error(error.message);
  return data.map((h) => ({ id: h.id, name: h.name ?? h.id }));
}

interface RawUpload {
  id: string;
  client_id: string | null;
  source: UploadRow["source"];
  status: UploadStatus;
  created_at: string;
  files: { file_name: string; created_at: string }[];
}

/** Every upload, newest first, with its suppliers counted by state. */
export async function listUploads(): Promise<UploadRow[]> {
  const db = createAdminClient();
  const [uploads, suppliers] = await Promise.all([
    readAll((from, to) =>
      db
        .from("list_uploads")
        .select("id, client_id, source, status, created_at, files:list_upload_files(file_name, created_at)")
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to)
        .overrideTypes<RawUpload[], { merge: false }>(),
    ),
    readAll((from, to) =>
      db
        .from("list_upload_suppliers")
        .select("upload_id, check_status, decision, invitation_id")
        .order("id")
        .range(from, to)
        .overrideTypes<SupplierState[], { merge: false }>(),
    ),
  ]);
  const counts = countByUpload(suppliers);
  return uploads.map((u) => ({
    id: u.id,
    hotelId: u.client_id,
    source: u.source,
    status: u.status,
    createdAt: u.created_at,
    fileNames: [...u.files].sort((a, b) => a.created_at.localeCompare(b.created_at)).map((f) => f.file_name),
    counts: counts.get(u.id) ?? emptyCounts(),
  }));
}

/**
 * The suppliers of every reviewable list of a hotel (or of NO_HOTEL), oldest
 * list first, each list in file order.
 */
export async function getHotelSuppliers(hotelId: string, uploads: readonly UploadRow[]): Promise<ReviewSupplier[]> {
  const order = uploads
    .filter((u) => (u.hotelId ?? NO_HOTEL) === hotelId && (u.status === "review" || u.status === "done"))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((u) => u.id);
  if (order.length === 0) return [];
  const db = createAdminClient();
  const rows = await readAll((from, to) =>
    db
      .from("list_upload_suppliers")
      .select(REVIEW_SUPPLIER_COLUMNS)
      .in("upload_id", order)
      .order("upload_id")
      .order("position")
      .range(from, to)
      .overrideTypes<ReviewSupplier[], { merge: false }>(),
  );
  const rank = new Map(order.map((id, i) => [id, i]));
  return rows.sort((a, b) => (rank.get(a.upload_id) ?? 0) - (rank.get(b.upload_id) ?? 0) || a.position - b.position);
}

/** Product categories to choose from (the same list as the rest of the dashboard). */
export async function listCategories(): Promise<string[]> {
  const { data, error } = await createAdminClient()
    .from("category_master")
    .select("name")
    .eq("is_active", true)
    .order("name")
    .overrideTypes<{ name: string }[], { merge: false }>();
  if (error) throw new Error(error.message);
  return data.map((c) => c.name);
}
