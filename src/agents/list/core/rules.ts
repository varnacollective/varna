import type { CountryCode } from "libphonenumber-js";

/** Configurable rules for cleaning and checking supplier lists. */
export interface ListRules {
  /** Country assumed for phone numbers written without a country code. */
  defaultCountry: CountryCode;
  /**
   * Other countries a number might belong to. If a number is invalid for the
   * default country but valid for one of these, it is suggested (never applied).
   */
  alternativeCountries: readonly CountryCode[];
  /** Key fields with confidence below this get the low_confidence flag. */
  lowConfidenceThreshold: number;
  /** Name similarity (0–1) at or above which two rows may be the same supplier. */
  fuzzyNameThreshold: number;
}

export const DEFAULT_RULES: ListRules = {
  defaultCountry: "IN",
  alternativeCountries: ["AE"],
  lowConfidenceThreshold: 0.8,
  fuzzyNameThreshold: 0.9,
};
