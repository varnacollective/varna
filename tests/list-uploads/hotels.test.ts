import { describe, expect, it } from "vitest";
import {
  countByUpload,
  emptyCounts,
  hotelHref,
  newListHref,
  NO_HOTEL,
  readSelection,
  summariseHotels,
  type SupplierState,
  type UploadRow,
} from "@/lib/list-uploads/hotels";

// Synthetic data only.
const state = (upload_id: string, extra: Partial<SupplierState> = {}): SupplierState => ({
  upload_id,
  check_status: "ready",
  decision: "pending",
  invitation_id: null,
  ...extra,
});

const upload = (id: string, hotelId: string | null, createdAt: string, counts = emptyCounts()): UploadRow => ({
  id,
  hotelId,
  status: "review",
  createdAt,
  fileNames: [`${id}.xlsx`],
  counts,
});

describe("countByUpload", () => {
  it("counts each list's suppliers by what the reviewer sees", () => {
    const counts = countByUpload([
      state("u1"),
      state("u1", { check_status: "needs_attention" }),
      state("u1", { check_status: "missing_contact" }),
      state("u1", { decision: "approved" }),
      state("u1", { decision: "approved", invitation_id: "i1" }),
      state("u2", { decision: "rejected" }),
    ]);
    expect(counts.get("u1")).toEqual({ ...emptyCounts(), total: 5, ready: 1, needs_attention: 1, missing_contact: 1, approved: 1, invited: 1 });
    expect(counts.get("u2")).toEqual({ ...emptyCounts(), total: 1, rejected: 1 });
    expect(counts.has("u3")).toBe(false);
  });
});

describe("summariseHotels", () => {
  const hotels = [
    { id: "CLT-002", name: "Beta Hotel" },
    { id: "CLT-001", name: "Alpha Hotel" },
  ];

  it("lists every hotel by name, even with no lists, with no-hotel uploads last", () => {
    const rows = summariseHotels(hotels, [upload("u1", null, "2026-11-20T10:00:00Z")]);
    expect(rows.map((r) => r.id)).toEqual(["CLT-001", "CLT-002", NO_HOTEL]);
    expect(rows[0]).toMatchObject({ uploads: 0, lastUploadAt: null, counts: emptyCounts() });
    expect(rows[2]).toMatchObject({ name: "No hotel", uploads: 1 });
  });

  it("adds up a hotel's lists and keeps the latest upload time", () => {
    const one = { ...emptyCounts(), total: 3, ready: 2, invited: 1 };
    const two = { ...emptyCounts(), total: 2, needs_attention: 2 };
    const [alpha] = summariseHotels(hotels, [
      upload("u1", "CLT-001", "2026-11-25T10:00:00Z", one),
      upload("u2", "CLT-001", "2026-11-27T10:00:00Z", two),
    ]);
    expect(alpha).toMatchObject({
      id: "CLT-001",
      uploads: 2,
      lastUploadAt: "2026-11-27T10:00:00Z",
      counts: { ...emptyCounts(), total: 5, ready: 2, invited: 1, needs_attention: 2 },
    });
  });

  it("leaves out the no-hotel row when every list has a hotel", () => {
    expect(summariseHotels(hotels, [upload("u1", "CLT-002", "2026-11-27T10:00:00Z")]).map((r) => r.id)).toEqual(["CLT-001", "CLT-002"]);
  });

  it("keeps a list whose hotel is not in the hotel list, under its code", () => {
    const rows = summariseHotels(hotels, [upload("u1", "CLT-099", "2026-11-27T10:00:00Z")]);
    expect(rows.find((r) => r.id === "CLT-099")).toMatchObject({ name: "CLT-099", uploads: 1 });
  });
});

describe("readSelection", () => {
  const rows = summariseHotels([{ id: "CLT-001", name: "Alpha Hotel" }], [upload("u1", null, "2026-11-20T10:00:00Z")]);

  it("opens the chosen hotel on the Suppliers tab", () => {
    expect(readSelection({ hotel: "CLT-001" }, rows)).toMatchObject({ hotel: { id: "CLT-001" }, tab: "suppliers" });
    expect(readSelection({ hotel: NO_HOTEL, tab: "lists" }, rows)).toMatchObject({ hotel: { id: NO_HOTEL }, tab: "lists" });
  });

  it("falls back to the overview for a missing, unknown or repeated hotel", () => {
    expect(readSelection({}, rows).hotel).toBeNull();
    expect(readSelection({ hotel: "CLT-404" }, rows).hotel).toBeNull();
    expect(readSelection({ hotel: ["CLT-001", "CLT-001"] }, rows).hotel).toBeNull();
    expect(readSelection({ hotel: "CLT-001", tab: "other" }, rows).tab).toBe("suppliers");
  });
});

describe("links", () => {
  it("builds hotel and upload links", () => {
    expect(hotelHref()).toBe("/superadmin/partners/invitations/upload");
    expect(hotelHref("CLT-001")).toBe("/superadmin/partners/invitations/upload?hotel=CLT-001");
    expect(hotelHref("CLT-001", "lists")).toBe("/superadmin/partners/invitations/upload?hotel=CLT-001&tab=lists");
    expect(newListHref("CLT-001")).toBe("/superadmin/partners/invitations/upload/new?hotel=CLT-001");
    expect(newListHref(NO_HOTEL)).toBe("/superadmin/partners/invitations/upload/new");
    expect(newListHref(null)).toBe("/superadmin/partners/invitations/upload/new");
  });
});
