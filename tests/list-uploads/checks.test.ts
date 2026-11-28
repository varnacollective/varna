import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { markExistingSuppliers, markInOtherLists, type CheckedRow } from "@/lib/list-uploads/checks";

// Synthetic data only.

/** A fake query: records every filter, answers with `rows`. */
function fakeDb(rows: unknown[]) {
  const calls: { table: string; filters: unknown[][] } = { table: "", filters: [] };
  const builder = {
    select: () => builder,
    in: (...a: unknown[]) => (calls.filters.push(["in", ...a]), builder),
    neq: (...a: unknown[]) => (calls.filters.push(["neq", ...a]), builder),
    eq: (...a: unknown[]) => (calls.filters.push(["eq", ...a]), builder),
    is: (...a: unknown[]) => (calls.filters.push(["is", ...a]), builder),
    overrideTypes: () => Promise.resolve({ data: rows, error: null }),
  };
  const db = { from: (table: string) => ((calls.table = table), builder) } as unknown as SupabaseClient;
  return { db, calls };
}

const row = (email: string | null): CheckedRow => ({ company_name: "Example", email, issues: [], check_status: email ? "ready" : "missing_contact" });

describe("already among this hotel's suppliers", () => {
  it("flags an email already in another list or added by hand for the same hotel", async () => {
    const { db, calls } = fakeDb([{ email: "asha@example.com", place: "vendors.xlsx" }]);
    const rows = [row("Asha@Example.com"), row("other@example.com"), row(null)];
    await markInOtherLists(db, rows, { clientId: "CLT-001", uploadId: "u2" });
    expect(calls.table).toBe("list_upload_suppliers");
    expect(calls.filters).toEqual([
      ["in", "email", ["asha@example.com", "other@example.com"]],
      ["neq", "upload_id", "u2"],
      ["eq", "upload.client_id", "CLT-001"],
    ]);
    expect(rows[0]).toMatchObject({ check_status: "needs_attention", issues: [{ code: "in_other_list", level: "attention" }] });
    expect(rows[0]?.issues[0]?.message).toContain("vendors.xlsx");
    expect(rows[1]?.issues).toEqual([]);
  });

  it("compares No hotel only with No hotel", async () => {
    const { db, calls } = fakeDb([]);
    await markInOtherLists(db, [row("asha@example.com")], { clientId: null, uploadId: "u2" });
    expect(calls.filters).toContainEqual(["is", "upload.client_id", null]);
  });

  it("says nothing more when the email is already an invited supplier", async () => {
    const existing = fakeDb([{ id: "s1", contact_email: "asha@example.com" }]);
    const rows = [row("asha@example.com")];
    await markExistingSuppliers(existing.db, rows);
    await markInOtherLists(fakeDb([{ email: "asha@example.com", place: "vendors.xlsx" }]).db, rows, { clientId: "CLT-001", uploadId: "u2" });
    expect(rows[0]?.issues.map((i) => i.code)).toEqual(["already_supplier"]);
    expect(rows[0]?.duplicate_of).toBe("s1");
  });

  it("asks nothing when no row has an email", async () => {
    const { db, calls } = fakeDb([]);
    await markInOtherLists(db, [row(null)], { clientId: "CLT-001", uploadId: "u2" });
    expect(calls.table).toBe("");
  });
});
