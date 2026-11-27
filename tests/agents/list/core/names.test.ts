import { describe, expect, it } from "vitest";
import {
  checkCompanyName,
  coreName,
  normaliseCompanyName,
  similarity,
} from "@/agents/list/core/names";

describe("normaliseCompanyName", () => {
  it("standardises the many ways of writing Private Limited", () => {
    for (const name of [
      "Example Handloom Private Limited",
      "Example Handloom Pvt. Ltd.",
      "EXAMPLE HANDLOOM PVT LTD",
      "Example Handloom P. Ltd",
      "Example Handloom (P) Ltd.",
      "Example Handloom Pvt Limited",
      "Example Handloom Private Ltd",
    ]) {
      expect(normaliseCompanyName(name)).toBe("example handloom pvt ltd");
    }
  });

  it("standardises Limited and LLP", () => {
    expect(normaliseCompanyName("Example Mills Limited")).toBe(
      "example mills ltd",
    );
    expect(normaliseCompanyName("Example Crafts L.L.P.")).toBe(
      "example crafts llp",
    );
  });

  it("removes the M/s prefix and punctuation, and writes & as and", () => {
    expect(normaliseCompanyName("M/s. Rao & Sons")).toBe("rao and sons");
    expect(normaliseCompanyName("  Shree   Ganesh,  Textiles ")).toBe(
      "shree ganesh textiles",
    );
  });

  it("keeps non-Latin scripts", () => {
    expect(normaliseCompanyName("श्री गणेश हस्तशिल्प")).toBe("श्री गणेश हस्तशिल्प");
  });
});

describe("coreName", () => {
  it("removes legal-form words from the end", () => {
    expect(coreName("example handloom pvt ltd")).toBe("example handloom");
    expect(coreName("example crafts llp")).toBe("example crafts");
  });

  it("never removes the whole name", () => {
    expect(coreName("limited")).toBe("limited");
  });
});

describe("similarity", () => {
  it("is 1 for identical and lower for different strings", () => {
    expect(similarity("example", "example")).toBe(1);
    expect(similarity("example handloom", "example handlooms")).toBeGreaterThan(
      0.9,
    );
    expect(similarity("example handloom", "other weavers")).toBeLessThan(0.5);
  });
});

describe("checkCompanyName", () => {
  it("keeps the name as written (tidied) and adds the matching key", () => {
    expect(checkCompanyName("  Example   Handloom Pvt. Ltd. ")).toEqual({
      company_name: "Example Handloom Pvt. Ltd.",
      company_name_normalised: "example handloom pvt ltd",
      flags: [],
    });
  });

  it("flags missing_name for empty, placeholder or punctuation-only names", () => {
    for (const value of [undefined, "", "  ", "N/A", "-", "..."]) {
      expect(checkCompanyName(value)).toEqual({ flags: ["missing_name"] });
    }
  });
});
