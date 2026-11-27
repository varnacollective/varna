import { PDFDocument } from "@cantoo/pdf-lib";
import { describe, expect, it } from "vitest";
import { splitPdfPages } from "@/agents/list/parsers/pdf-pages";

// Synthetic PDFs built in memory.

async function makePdf(sizes: [number, number][]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  sizes.forEach((size, i) => {
    doc.addPage(size).drawText(`Example page ${String(i + 1)}`);
  });
  return doc.save();
}

describe("splitPdfPages", () => {
  it("makes one single-page PDF per page, in order, pages unchanged", async () => {
    const sizes: [number, number][] = [
      [300, 400],
      [500, 600],
      [700, 800],
    ];
    const pages = await splitPdfPages(await makePdf(sizes));
    expect(pages).toHaveLength(3);
    for (const [i, bytes] of (pages ?? []).entries()) {
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount()).toBe(1);
      const { width, height } = doc.getPage(0).getSize();
      expect([width, height]).toEqual(sizes[i]);
    }
  });

  it("gives the same bytes every time (results can be compared and cached)", async () => {
    const pdf = await makePdf([
      [300, 400],
      [500, 600],
    ]);
    expect(await splitPdfPages(pdf)).toEqual(await splitPdfPages(pdf));
  });

  it("returns undefined for a file it can't open", async () => {
    expect(
      await splitPdfPages(new TextEncoder().encode("%PDF-1.4\n")),
    ).toBeUndefined();
    expect(await splitPdfPages(new Uint8Array())).toBeUndefined();
  });
});
