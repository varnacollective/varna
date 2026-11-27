import { describe, expect, it } from "vitest";
import {
  findDuplicates,
  type DuplicateCandidate,
} from "@/agents/list/core/duplicates";
import { normaliseCompanyName } from "@/agents/list/core/names";

function row(
  name: string,
  extra: Partial<DuplicateCandidate> = {},
): DuplicateCandidate {
  return {
    company_name_normalised: normaliseCompanyName(name),
    emails: [],
    ...extra,
  };
}

/** Deterministic ids for tests. */
function ids(): () => string {
  let n = 0;
  return () => `group-${String(++n)}`;
}

function run(rows: DuplicateCandidate[]) {
  return findDuplicates(rows, { fuzzyNameThreshold: 0.9 }, ids());
}

describe("findDuplicates", () => {
  it("leaves unique rows ungrouped", () => {
    const result = run([row("Alpha Weavers"), row("Beta Pottery")]);
    expect(result.groupIds).toEqual([undefined, undefined]);
  });

  it("links rows with the same GSTIN, even with different names and cities", () => {
    const result = run([
      row("Alpha Weavers", { gstin: "08ABCDE1234F1Z0", city: "Jaipur" }),
      row("AW Textiles", { gstin: "08ABCDE1234F1Z0", city: "Delhi" }),
    ]);
    expect(result.groupIds).toEqual(["group-1", "group-1"]);
  });

  it("links rows with the same Udyam number", () => {
    const result = run([
      row("Alpha Weavers", { udyam_number: "UDYAM-RJ-17-0000001" }),
      row("Beta", { udyam_number: "UDYAM-RJ-17-0000001" }),
    ]);
    expect(result.groupIds).toEqual(["group-1", "group-1"]);
  });

  it("links different spellings of the same name in the same city", () => {
    const result = run([
      row("Alpha Handloom Private Limited", { city: "Jaipur" }),
      row("ALPHA HANDLOOM PVT. LTD.", { city: "jaipur" }),
      row("Alpha Handlooms", { city: "Jaipur" }),
    ]);
    expect(result.groupIds).toEqual(["group-1", "group-1", "group-1"]);
  });

  it("does not link similar names in different cities", () => {
    const result = run([
      row("Alpha Handloom", { city: "Jaipur" }),
      row("Alpha Handloom", { city: "Varanasi" }),
    ]);
    expect(result.groupIds).toEqual([undefined, undefined]);
  });

  it("links a brand name to the legal name", () => {
    const result = run([
      row("Alpha Crafts India Private Limited"),
      row("Alpha Crafts India", { brand_name: "Alpha" }),
      row("Alpha", {}),
    ]);
    expect(result.groupIds).toEqual(["group-1", "group-1", "group-1"]);
  });

  it("links same email with similar names", () => {
    const result = run([
      row("Alpha Weavers", { emails: ["owner@alpha.example"], city: "Jaipur" }),
      row("Alpha Weavers Pvt Ltd", {
        emails: ["owner@alpha.example"],
        city: "Delhi",
      }),
    ]);
    expect(result.groupIds).toEqual(["group-1", "group-1"]);
    expect(result.sharedEmail).toEqual([false, false]);
  });

  it("marks shared_email when different companies use the same email", () => {
    const result = run([
      row("Alpha Weavers", { emails: ["agent@agency.example"] }),
      row("Beta Pottery", { emails: ["agent@agency.example"] }),
      row("Gamma Bamboo", { emails: ["gamma@gamma.example"] }),
    ]);
    expect(result.groupIds).toEqual([undefined, undefined, undefined]);
    expect(result.sharedEmail).toEqual([true, true, false]);
  });

  it("chains links into one group", () => {
    const result = run([
      row("Alpha Weavers", { gstin: "08ABCDE1234F1Z0" }),
      row("Alpha Weaving Co", {
        gstin: "08ABCDE1234F1Z0",
        udyam_number: "UDYAM-RJ-17-0000001",
      }),
      row("AWC", { udyam_number: "UDYAM-RJ-17-0000001" }),
      row("Beta Pottery"),
    ]);
    expect(result.groupIds).toEqual([
      "group-1",
      "group-1",
      "group-1",
      undefined,
    ]);
  });

  it("gives separate groups separate ids", () => {
    const result = run([
      row("Alpha", { gstin: "08ABCDE1234F1Z0" }),
      row("Beta", { gstin: "27AAAAA0000A1Z2" }),
      row("Alpha 2", { gstin: "08ABCDE1234F1Z0" }),
      row("Beta 2", { gstin: "27AAAAA0000A1Z2" }),
    ]);
    expect(result.groupIds).toEqual([
      "group-1",
      "group-2",
      "group-1",
      "group-2",
    ]);
  });

  it("links nameless rows by ID but not by (missing) name", () => {
    const result = run([
      { emails: [], gstin: "08ABCDE1234F1Z0" },
      { emails: [], gstin: "08ABCDE1234F1Z0" },
      { emails: [] },
      { emails: [] },
    ]);
    expect(result.groupIds).toEqual([
      "group-1",
      "group-1",
      undefined,
      undefined,
    ]);
  });

  it("handles a large list quickly, even when many names start alike", () => {
    // 10,000 rows whose names all start with "Shree", the worst case for
    // prefix blocking (common in Indian supplier lists).
    const rows = Array.from({ length: 10_000 }, (_, i) =>
      row(`Shree ${String(i)} Crafts`, { city: `City ${String(i % 50)}` }),
    );
    const started = Date.now();
    const result = run(rows);
    expect(Date.now() - started).toBeLessThan(3000);
    expect(result.groupIds).toHaveLength(10_000);
  });

  it("still finds similar names inside a large block", () => {
    const rows = [
      ...Array.from({ length: 2000 }, (_, i) =>
        row(`Shree ${String(i)} Crafts`),
      ),
      row("Shree Ganesh Handlooms"),
      row("Shree Ganesh Handloom"),
    ];
    const { groupIds } = run(rows);
    expect(groupIds[2000]).toBeDefined();
    expect(groupIds[2000]).toBe(groupIds[2001]);
  });
});
