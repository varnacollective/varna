/**
 * PDFs and photos can't be turned into text by code here: an AI reads them
 * (see `pipeline/extract-document.ts`). This file only recognises them, by
 * their first bytes (never trusting the file name), and checks their size.
 */

export type DocumentKind = "pdf" | "image";

export interface DocumentType {
  kind: DocumentKind;
  /** Media type sent to the AI, e.g. "application/pdf". */
  mimeType: string;
}

/**
 * Largest file sent inline to the AI. Requests are limited in size and the
 * file grows by a third when encoded, so this stays well under the limit.
 */
export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;

/** File name endings routed to the PDF/photo reader. */
export const DOCUMENT_EXTENSIONS = /\.(pdf|png|jpe?g|webp|heic|heif)$/i;

export class DocumentReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentReadError";
  }
}

/** What kind of file the bytes are, or undefined if not a PDF or a supported image. */
export function detectDocument(data: Uint8Array): DocumentType | undefined {
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...data.subarray(start, end));
  // A PDF may have a few junk bytes before its header.
  if (ascii(0, 1024).includes("%PDF-")) {
    return { kind: "pdf", mimeType: "application/pdf" };
  }
  if (
    data[0] === 0x89 &&
    ascii(1, 4) === "PNG" &&
    data[4] === 0x0d &&
    data[5] === 0x0a
  ) {
    return { kind: "image", mimeType: "image/png" };
  }
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return { kind: "image", mimeType: "image/jpeg" };
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return { kind: "image", mimeType: "image/webp" };
  }
  if (ascii(4, 8) === "ftyp") {
    const brand = ascii(8, 12);
    if (["heic", "heix", "heim", "heis"].includes(brand)) {
      return { kind: "image", mimeType: "image/heic" };
    }
    if (["mif1", "msf1", "heif"].includes(brand)) {
      return { kind: "image", mimeType: "image/heif" };
    }
  }
  return undefined;
}

/** Recognise a PDF or photo and check it can be sent; throws a plain-words error if not. */
export function readDocument(data: Uint8Array): DocumentType {
  const type = detectDocument(data);
  if (!type) {
    throw new DocumentReadError(
      "Not a PDF or a supported image (PNG, JPEG, WebP, HEIC).",
    );
  }
  if (data.length > MAX_DOCUMENT_BYTES) {
    const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
    throw new DocumentReadError(
      `File is ${mb(data.length)} MB; the most that can be read is ${mb(MAX_DOCUMENT_BYTES)} MB. Split it or lower the image size.`,
    );
  }
  return type;
}
