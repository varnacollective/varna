import { PDFDocument } from "@cantoo/pdf-lib";

/**
 * Split a PDF into one small PDF per page, so each page is sent to the AI on
 * its own. Sending the whole file for every page would cost pages × pages:
 * a 50-page file read 50 times.
 *
 * Nothing on the page is changed: each page is copied as it is, with the
 * fonts and images it uses.
 *
 * Returns undefined when the file can't be split (damaged, or protected by a
 * password): the caller then sends the whole file, which the AI may still
 * be able to read.
 */
export async function splitPdfPages(
  file: Uint8Array,
): Promise<Uint8Array[] | undefined> {
  try {
    const source = await PDFDocument.load(file, { updateMetadata: false });
    const pages: Uint8Array[] = [];
    for (const index of source.getPageIndices()) {
      const single = await PDFDocument.create({ updateMetadata: false });
      const [page] = await single.copyPages(source, [index]);
      if (!page) return undefined;
      single.addPage(page);
      pages.push(await single.save());
    }
    return pages.length > 0 ? pages : undefined;
  } catch {
    // Damaged or password-protected: the whole file is sent instead.
    return undefined;
  }
}
