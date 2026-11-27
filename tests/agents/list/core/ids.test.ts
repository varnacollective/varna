import { describe, expect, it } from "vitest";
import {
  checkGstin,
  checkUdyam,
  detectIdType,
  gstinCheckCharacter,
  isValidGstin,
  normaliseUdyam,
} from "@/agents/list/core/ids";

// Synthetic IDs. Valid GSTIN check characters were computed independently.
const VALID_GSTINS = [
  "08ABCDE1234F1Z0",
  "27AAAAA0000A1Z2",
  "29ZZZZZ9999Z2Z3",
  "07PQRSX4321K1ZM",
];

describe("GSTIN checksum", () => {
  it("computes the check character", () => {
    for (const gstin of VALID_GSTINS) {
      expect(gstinCheckCharacter(gstin.slice(0, 14))).toBe(gstin.charAt(14));
    }
  });

  it("accepts valid GSTINs", () => {
    for (const gstin of VALID_GSTINS) expect(isValidGstin(gstin)).toBe(true);
  });

  it("rejects a GSTIN with one mistyped character", () => {
    expect(isValidGstin("08ABCDE1235F1Z0")).toBe(false);
    expect(isValidGstin("08ABCDE1234F1Z1")).toBe(false);
  });

  it("rejects an unknown state code", () => {
    const first14 = "45ABCDE1234F1Z";
    expect(isValidGstin(first14 + gstinCheckCharacter(first14))).toBe(false);
  });
});

describe("checkGstin", () => {
  it("accepts a valid GSTIN written with spaces or lowercase", () => {
    expect(checkGstin(" 08abcde 1234 f1z0 ").value).toBe("08ABCDE1234F1Z0");
  });

  it("flags an invalid GSTIN and keeps no value", () => {
    const result = checkGstin("08ABCDE1234F1Z1");
    expect(result.value).toBeUndefined();
    expect(result.flags).toEqual(["invalid_gstin"]);
  });

  it("flags a CIN in the GSTIN field with a suggestion, moving nothing", () => {
    const result = checkGstin("U74999RJ2019PTC000001");
    expect(result.value).toBeUndefined();
    expect(result.flags).toEqual(["id_in_wrong_field"]);
    expect(result.suggestions).toEqual([
      {
        field: "gstin",
        issue: '"U74999RJ2019PTC000001" looks like a CIN, not a GSTIN',
        suggested_field: "other_ids.cin",
        suggested_value: "U74999RJ2019PTC000001",
      },
    ]);
  });

  it("flags a PAN in the GSTIN field", () => {
    const result = checkGstin("ABCDE1234F");
    expect(result.flags).toEqual(["id_in_wrong_field"]);
    expect(result.suggestions[0]?.suggested_field).toBe("other_ids.pan");
  });

  it("suggests checking the state when it doesn't match the GSTIN state code", () => {
    const result = checkGstin("08ABCDE1234F1Z0", "Karnataka");
    expect(result.value).toBe("08ABCDE1234F1Z0");
    expect(result.suggestions).toEqual([
      {
        field: "state",
        issue: 'GSTIN state code 08 is Rajasthan, but state is "Karnataka"',
      },
    ]);
  });

  it("accepts a matching state written differently", () => {
    expect(checkGstin("08ABCDE1234F1Z0", " rajasthan ").suggestions).toEqual(
      [],
    );
  });

  it("ignores placeholders", () => {
    expect(checkGstin("N/A")).toEqual({ flags: [], suggestions: [] });
  });
});

describe("checkUdyam", () => {
  it("accepts a valid Udyam number", () => {
    expect(checkUdyam("UDYAM-RJ-17-0000001").value).toBe("UDYAM-RJ-17-0000001");
  });

  it("normalises spaces, case and missing hyphens", () => {
    expect(normaliseUdyam("udyam rj 17 0000001")).toBe("UDYAM-RJ-17-0000001");
    expect(checkUdyam("UDYAMRJ170000001").value).toBe("UDYAM-RJ-17-0000001");
  });

  it("flags a malformed Udyam number", () => {
    const result = checkUdyam("UDYAM-RJ-17-123");
    expect(result.value).toBeUndefined();
    expect(result.flags).toEqual(["invalid_udyam"]);
  });

  it("flags a GSTIN in the Udyam field", () => {
    const result = checkUdyam("08ABCDE1234F1Z0");
    expect(result.flags).toEqual(["id_in_wrong_field"]);
    expect(result.suggestions[0]?.suggested_field).toBe("gstin");
  });
});

describe("detectIdType", () => {
  it("recognises each ID type", () => {
    expect(detectIdType("08ABCDE1234F1Z0")).toBe("gstin");
    expect(detectIdType("U74999RJ2019PTC000001")).toBe("cin");
    expect(detectIdType("ABCDE1234F")).toBe("pan");
    expect(detectIdType("UDYAM-RJ-17-0000001")).toBe("udyam");
    expect(detectIdType("hello")).toBe("unknown");
  });
});
