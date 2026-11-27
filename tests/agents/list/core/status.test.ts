import { describe, expect, it } from "vitest";
import {
  combineFlags,
  decideStatus,
  isExcluded,
  isLowConfidence,
  type StatusInput,
} from "@/agents/list/core/status";

function input(extra: Partial<StatusInput> = {}): StatusInput {
  return {
    flags: [],
    emails: ["owner@example.com"],
    suggestions: [],
    ...extra,
  };
}

describe("decideStatus", () => {
  it("is READY with a name, an email and no problems", () => {
    expect(decideStatus(input())).toBe("READY");
  });

  it("stays READY with informational flags only", () => {
    expect(
      decideStatus(
        input({
          flags: [
            "generic_email",
            "invalid_gstin",
            "invalid_phone",
            "corrupted_value",
          ],
        }),
      ),
    ).toBe("READY");
  });

  it("is MISSING_CONTACT without a valid email (email is mandatory)", () => {
    expect(decideStatus(input({ emails: [], flags: ["missing_email"] }))).toBe(
      "MISSING_CONTACT",
    );
  });

  it("MISSING_CONTACT wins over other problems", () => {
    expect(
      decideStatus(
        input({ emails: [], flags: ["missing_email", "possible_duplicate"] }),
      ),
    ).toBe("MISSING_CONTACT");
  });

  it("is NEEDS_ATTENTION without a company name", () => {
    expect(decideStatus(input({ flags: ["missing_name"] }))).toBe(
      "NEEDS_ATTENTION",
    );
  });

  it("is NEEDS_ATTENTION for each attention flag", () => {
    for (const flag of [
      "missing_name",
      "invalid_email",
      "shared_email",
      "possible_duplicate",
      "low_confidence",
      "id_in_wrong_field",
      "read_from_image",
    ] as const) {
      expect(decideStatus(input({ flags: [flag] }))).toBe("NEEDS_ATTENTION");
    }
  });

  it("is NEEDS_ATTENTION when a suggestion awaits a human", () => {
    expect(
      decideStatus(
        input({
          suggestions: [{ field: "emails", issue: "possible typo" }],
        }),
      ),
    ).toBe("NEEDS_ATTENTION");
  });

  it("ignores suggestions about phones (phone is optional)", () => {
    expect(
      decideStatus(
        input({
          flags: ["invalid_phone"],
          suggestions: [{ field: "phones", issue: "valid for AE" }],
        }),
      ),
    ).toBe("READY");
  });

  it("never returns DUPLICATE (only a human confirms duplicates)", () => {
    expect(decideStatus(input({ flags: ["possible_duplicate"] }))).not.toBe(
      "DUPLICATE",
    );
  });
});

describe("isLowConfidence", () => {
  it("is true when a key field is below the threshold", () => {
    expect(isLowConfidence({ company_name: 0.6 })).toBe(true);
  });

  it("ignores non-key fields (incl. phones) and missing fields", () => {
    expect(
      isLowConfidence({ notes: 0.1, phones: 0.2, company_name: 0.95 }),
    ).toBe(false);
    expect(isLowConfidence({})).toBe(false);
  });

  it("uses the configured threshold", () => {
    expect(
      isLowConfidence({ emails: 0.85 }, { lowConfidenceThreshold: 0.9 }),
    ).toBe(true);
  });
});

describe("isExcluded and combineFlags", () => {
  it("excludes rows that are not suppliers", () => {
    expect(isExcluded(["not_a_supplier"])).toBe(true);
    expect(isExcluded(["generic_email"])).toBe(false);
  });

  it("combines flags without repeats", () => {
    expect(
      combineFlags(["generic_email"], ["invalid_phone", "generic_email"]),
    ).toEqual(["generic_email", "invalid_phone"]);
  });
});
