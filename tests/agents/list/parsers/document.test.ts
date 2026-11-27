import { describe, expect, it } from "vitest";
import {
  DOCUMENT_EXTENSIONS,
  DocumentReadError,
  MAX_DOCUMENT_BYTES,
  detectDocument,
  readDocument,
} from "@/agents/list/parsers/document";

const bytes = (...parts: (string | number[])[]) =>
  new Uint8Array(
    parts.flatMap((p) =>
      typeof p === "string" ? Array.from(new TextEncoder().encode(p)) : p,
    ),
  );

describe("detectDocument", () => {
  it("recognises PDFs, also with junk bytes before the header", () => {
    expect(detectDocument(bytes("%PDF-1.7\n"))).toEqual({
      kind: "pdf",
      mimeType: "application/pdf",
    });
    expect(detectDocument(bytes([0xef, 0xbb, 0xbf], "%PDF-1.4"))?.kind).toBe(
      "pdf",
    );
  });

  it("recognises PNG, JPEG, WebP, HEIC and HEIF images by their bytes", () => {
    const type = (data: Uint8Array) => detectDocument(data)?.mimeType;
    expect(type(bytes([0x89], "PNG", [0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
      "image/png",
    );
    expect(type(bytes([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(type(bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 "))).toBe("image/webp");
    expect(type(bytes([0, 0, 0, 0x18], "ftypheic"))).toBe("image/heic");
    expect(type(bytes([0, 0, 0, 0x18], "ftypmif1"))).toBe("image/heif");
  });

  it("never trusts the name: other bytes are not a document", () => {
    expect(detectDocument(bytes("PK\x03\x04 a spreadsheet"))).toBeUndefined();
    expect(detectDocument(bytes("hello"))).toBeUndefined();
    expect(detectDocument(new Uint8Array())).toBeUndefined();
    expect(detectDocument(bytes([0, 0, 0, 0x18], "ftypmp42"))).toBeUndefined();
  });
});

describe("readDocument", () => {
  it("refuses unknown files and files too big to send", () => {
    expect(() => readDocument(bytes("hello"))).toThrow(DocumentReadError);
    const big = new Uint8Array(MAX_DOCUMENT_BYTES + 1);
    big.set(bytes("%PDF-1.4"));
    expect(() => readDocument(big)).toThrow(/MB/);
  });
});

describe("DOCUMENT_EXTENSIONS", () => {
  it("matches PDF and photo file names, any case", () => {
    for (const name of [
      "a.pdf",
      "B.PDF",
      "c.jpg",
      "d.JPEG",
      "e.png",
      "f.webp",
      "g.heic",
      "h.heif",
    ]) {
      expect(DOCUMENT_EXTENSIONS.test(name), name).toBe(true);
    }
    for (const name of ["a.xlsx", "b.txt", "pdf", "c.pdf.txt"]) {
      expect(DOCUMENT_EXTENSIONS.test(name), name).toBe(false);
    }
  });
});
