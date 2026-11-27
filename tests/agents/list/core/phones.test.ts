import { describe, expect, it } from "vitest";
import { checkPhones } from "@/agents/list/core/phones";

// Synthetic numbers only.
describe("checkPhones", () => {
  it("formats an Indian mobile without country code as E.164", () => {
    const result = checkPhones("98765 43210");
    expect(result.phones).toEqual(["+919876543210"]);
    expect(result.flags).toEqual([]);
  });

  it("accepts numbers with country code in different styles", () => {
    expect(checkPhones("+91-98765-43210").phones).toEqual(["+919876543210"]);
    expect(checkPhones("0091 98765 43210").phones).toEqual(["+919876543210"]);
    expect(checkPhones("+971 50 123 4567").phones).toEqual(["+971501234567"]);
  });

  it("handles Indian landlines with STD codes", () => {
    expect(checkPhones("080-23456789").phones).toEqual(["+918023456789"]);
    expect(checkPhones("022 2345 6789").phones).toEqual(["+912223456789"]);
  });

  it("splits several numbers in one cell", () => {
    const result = checkPhones("98765 43210 / 080-23456789, +971501234567");
    expect(result.phones).toEqual([
      "+919876543210",
      "+918023456789",
      "+971501234567",
    ]);
  });

  it("reads numbers from several cells and removes duplicates", () => {
    const result = checkPhones(["9876543210", "+91 98765 43210"]);
    expect(result.phones).toEqual(["+919876543210"]);
  });

  it("undoes a spreadsheet's trailing .0 (lossless)", () => {
    expect(checkPhones("9876543210.0").phones).toEqual(["+919876543210"]);
  });

  it("flags scientific notation as corrupted, keeping it as written", () => {
    const result = checkPhones("8.29957277E8");
    expect(result.phones).toEqual([]);
    expect(result.corrupted).toEqual(["8.29957277E8"]);
    expect(result.flags).toEqual(["corrupted_value"]);
  });

  it("flags a number-like value that is not a valid phone", () => {
    const result = checkPhones("12345 67");
    expect(result.phones).toEqual([]);
    expect(result.invalid).toEqual(["12345 67"]);
    expect(result.flags).toEqual(["invalid_phone"]);
  });

  it("suggests a UAE number rather than guessing", () => {
    const result = checkPhones("050 123 4567");
    expect(result.phones).toEqual([]);
    expect(result.flags).toEqual(["invalid_phone"]);
    expect(result.suggestions).toEqual([
      {
        field: "phones",
        issue: '"050 123 4567" is not a valid IN number but is valid for AE',
        suggested_value: "+971501234567",
      },
    ]);
  });

  it("uses the configured default country", () => {
    const result = checkPhones("050 123 4567", {
      defaultCountry: "AE",
      alternativeCountries: [],
    });
    expect(result.phones).toEqual(["+971501234567"]);
  });

  it("ignores empty and placeholder values", () => {
    for (const value of ["", "-", "NA", "nil"]) {
      const result = checkPhones(value);
      expect(result.phones).toEqual([]);
      expect(result.flags).toEqual([]);
    }
  });
});
