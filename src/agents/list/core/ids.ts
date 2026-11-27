import { GSTIN_FORMAT, UDYAM_FORMAT } from "./supplier";
import type { SupplierFlag, Suggestion } from "./supplier";
import { isPlaceholder } from "./text";

/** Company Identification Number (Ministry of Corporate Affairs). */
export const CIN_FORMAT = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
/** Permanent Account Number. */
export const PAN_FORMAT = /^[A-Z]{5}\d{4}[A-Z]$/;

const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** GSTIN state codes → state / union territory. */
export const GST_STATE_CODES: Readonly<Record<string, string>> = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman and Diu",
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  "28": "Andhra Pradesh",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "97": "Other Territory",
  "99": "Centre Jurisdiction",
};

/** Uppercase and remove spaces/hyphens. Lossless for an ID. */
export function compactId(value: string): string {
  return value
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[\s-]+/g, "");
}

/** The check character a GSTIN's first 14 characters should end with. */
export function gstinCheckCharacter(first14: string): string {
  let total = 0;
  for (let i = 0; i < first14.length; i++) {
    const product = CHARSET.indexOf(first14.charAt(i)) * (i % 2 === 0 ? 1 : 2);
    total += Math.floor(product / 36) + (product % 36);
  }
  return CHARSET.charAt((36 - (total % 36)) % 36);
}

export function isValidGstin(value: string): boolean {
  return (
    GSTIN_FORMAT.test(value) &&
    value.slice(0, 2) in GST_STATE_CODES &&
    gstinCheckCharacter(value.slice(0, 14)) === value.charAt(14)
  );
}

/** Normalise a Udyam number written with spaces or missing hyphens: UDYAM KR 03 0142405 → UDYAM-KR-03-0142405. */
export function normaliseUdyam(value: string): string {
  const compact = compactId(value);
  const match = /^UDYAM([A-Z]{2})(\d{2})(\d{7})$/.exec(compact);
  if (!match) return compact;
  const [, state = "", district = "", serial = ""] = match;
  return `UDYAM-${state}-${district}-${serial}`;
}

export type IdType = "gstin" | "cin" | "pan" | "udyam" | "unknown";

/** Recognise which kind of Indian business ID a value looks like. */
export function detectIdType(value: string): IdType {
  const compact = compactId(value);
  if (GSTIN_FORMAT.test(compact)) return "gstin";
  if (CIN_FORMAT.test(compact)) return "cin";
  if (PAN_FORMAT.test(compact)) return "pan";
  if (UDYAM_FORMAT.test(normaliseUdyam(value))) return "udyam";
  return "unknown";
}

const ID_FIELD: Record<Exclude<IdType, "unknown">, string> = {
  gstin: "gstin",
  udyam: "udyam_number",
  cin: "other_ids.cin",
  pan: "other_ids.pan",
};

export interface IdResult {
  /** The valid ID, if the value is one. */
  value?: string;
  flags: SupplierFlag[];
  suggestions: Suggestion[];
}

/**
 * Check a value found in a GSTIN column. Only a fully valid GSTIN (format,
 * state code, checksum) is accepted. Another ID type is flagged with a
 * suggestion; nothing is moved automatically.
 */
export function checkGstin(raw: string, state?: string): IdResult {
  if (isPlaceholder(raw)) return { flags: [], suggestions: [] };
  const value = compactId(raw);

  if (isValidGstin(value)) {
    const suggestions: Suggestion[] = [];
    const codeState = GST_STATE_CODES[value.slice(0, 2)];
    if (
      state !== undefined &&
      codeState !== undefined &&
      !sameState(state, codeState)
    ) {
      suggestions.push({
        field: "state",
        issue: `GSTIN state code ${value.slice(0, 2)} is ${codeState}, but state is "${state}"`,
      });
    }
    return { value, flags: [], suggestions };
  }

  const type = detectIdType(value);
  if (type !== "gstin" && type !== "unknown") {
    return wrongField("gstin", raw, type);
  }
  return {
    flags: ["invalid_gstin"],
    suggestions: [],
  };
}

/** Check a value found in a Udyam column. Same rules as checkGstin. */
export function checkUdyam(raw: string): IdResult {
  if (isPlaceholder(raw)) return { flags: [], suggestions: [] };
  const value = normaliseUdyam(raw);
  if (UDYAM_FORMAT.test(value)) return { value, flags: [], suggestions: [] };

  const type = detectIdType(raw);
  if (type !== "udyam" && type !== "unknown") {
    return wrongField("udyam_number", raw, type);
  }
  return { flags: ["invalid_udyam"], suggestions: [] };
}

function wrongField(
  field: string,
  raw: string,
  type: Exclude<IdType, "unknown">,
): IdResult {
  return {
    flags: ["id_in_wrong_field"],
    suggestions: [
      {
        field,
        issue: `"${raw.trim()}" looks like a ${type.toUpperCase()}, not a ${field === "gstin" ? "GSTIN" : "Udyam number"}`,
        suggested_field: ID_FIELD[type],
        suggested_value:
          type === "udyam" ? normaliseUdyam(raw) : compactId(raw),
      },
    ],
  };
}

function sameState(a: string, b: string): boolean {
  const simplify = (s: string) =>
    s
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z]/g, "");
  return simplify(a) === simplify(b);
}
