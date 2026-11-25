import {
  findPhoneNumbersInText,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";
import { DEFAULT_RULES, type ListRules } from "./rules";
import type { SupplierFlag, Suggestion } from "./supplier";
import { isPlaceholder, joinRaw } from "./text";

export interface PhoneResult {
  /** Valid E.164 numbers, unique, in source order. */
  phones: string[];
  /** Values damaged in the source (e.g. scientific notation), exactly as written. */
  corrupted: string[];
  /** Number-like values that are not valid phone numbers, exactly as written. */
  invalid: string[];
  flags: SupplierFlag[];
  suggestions: Suggestion[];
}

/** A number a spreadsheet turned into scientific notation, e.g. 8.29957277E8. Digits are lost. */
const SCIENTIFIC = /^\d+(\.\d+)?e\+?\d+$/i;
/** A whole number a spreadsheet stored as a decimal, e.g. 9876543210.0. Lossless to undo. */
const TRAILING_DECIMAL_ZERO = /^(\d+)\.0+$/;
const SEPARATORS = /[,;|/\n]+|\bor\b|\band\b/i;
const MIN_DIGITS = 6;

/**
 * Extract and check phone numbers from one or more raw cells.
 * Numbers are written in E.164 (lossless). A number that is only valid for
 * another country is suggested, never applied. Damaged numbers are flagged.
 */
export function checkPhones(
  raw: string | readonly string[],
  rules: Pick<
    ListRules,
    "defaultCountry" | "alternativeCountries"
  > = DEFAULT_RULES,
): PhoneResult {
  const phones: string[] = [];
  const corrupted: string[] = [];
  const invalid: string[] = [];
  const suggestions: Suggestion[] = [];

  for (const part of joinRaw(raw).split(SEPARATORS)) {
    const piece = part.trim();
    if (isPlaceholder(piece)) continue;

    if (SCIENTIFIC.test(piece)) {
      corrupted.push(piece);
      continue;
    }
    const text = piece.replace(TRAILING_DECIMAL_ZERO, "$1");

    const found = findPhoneNumbersInText(text, {
      defaultCountry: rules.defaultCountry,
    }).map((match) => match.number.number);
    if (found.length > 0) {
      for (const number of found) {
        if (!phones.includes(number)) phones.push(number);
      }
      continue;
    }

    if (countDigits(text) < MIN_DIGITS) continue;
    invalid.push(piece);
    for (const country of rules.alternativeCountries) {
      const parsed = parsePhoneNumberFromString(text, country);
      if (parsed?.isValid() === true) {
        suggestions.push({
          field: "phones",
          issue: `"${piece}" is not a valid ${rules.defaultCountry} number but is valid for ${country}`,
          suggested_value: parsed.number,
        });
        break;
      }
    }
  }

  const flags: SupplierFlag[] = [];
  if (corrupted.length > 0) flags.push("corrupted_value");
  if (invalid.length > 0) flags.push("invalid_phone");
  return { phones, corrupted, invalid, flags, suggestions };
}

function countDigits(text: string): number {
  return text.replace(/\D/g, "").length;
}
