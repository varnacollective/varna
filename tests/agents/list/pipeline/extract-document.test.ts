import { PDFDocument } from "@cantoo/pdf-lib";
import { describe, expect, it } from "vitest";
import { ApiExecutor } from "@/agents/list/ai/api-executor";
import { MockProvider, type MockReply } from "@/agents/list/ai/mock-provider";
import type { LLMRequest } from "@/agents/list/ai/provider";
import { Supplier } from "@/agents/list/core/supplier";
import {
  extractDocument,
  pagesToWorkbook,
  transcriptText,
} from "@/agents/list/pipeline/extract-document";
import { splitPdfPages } from "@/agents/list/parsers/pdf-pages";
import type { RunContext } from "@/agents/list/pipeline/extract-workbook";

// Synthetic data only. `pdf` is just a header that can't be split, so it
// takes the whole-file path; `realPdf` (built in memory) is split per page.

const context: RunContext = {
  client_id: "00000000-0000-4000-8000-00000000000c",
  programme_id: "00000000-0000-4000-8000-00000000000a",
  upload_id: "00000000-0000-4000-8000-00000000000b",
  file_id: "00000000-0000-4000-8000-00000000000f",
  file_name: "vendors.pdf",
};
const pdf = new TextEncoder().encode("%PDF-1.4\n");
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function ids() {
  let n = 0;
  return () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;
}
const options = {
  newId: ids(),
  now: () => new Date("2026-11-25T10:00:00Z"),
};

const PAGES: Record<number, string[]> = {
  1: ["Approved Vendors", "Name\tEmail", "Example Linen\tanil@example.com"],
  2: ["Example Soaps\tsales@example.in"],
};

const isTranscribe = (r: LLMRequest) => r.system.startsWith("You transcribe");
const lastText = (r: LLMRequest) => r.messages.at(-1)?.content ?? "";

/** Mock AI: transcribes PAGES (a 2-page PDF) and extracts the one supplier on each page. */
function mockAi(
  transcribe: (page: number, r: LLMRequest) => MockReply = (page) =>
    JSON.stringify({ page_count: 2, page, lines: PAGES[page] }),
) {
  return new MockProvider((r) => {
    if (isTranscribe(r)) {
      const page = Number(/page (\d+)/.exec(lastText(r))?.[1] ?? "1");
      return transcribe(page, r);
    }
    const input = r.messages[0]?.content ?? "";
    if (input.includes("Example Linen")) {
      return JSON.stringify({
        suppliers: [{ company_name: "A3", email: "B3" }],
        other_rows: [
          { row: 1, kind: "title" },
          { row: 2, kind: "heading" },
        ],
      });
    }
    return JSON.stringify({
      suppliers: [{ company_name: "A1", email: "B1" }],
      other_rows: [],
    });
  });
}

async function realPdf(pages: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 1; i <= pages; i++)
    doc.addPage().drawText(`Example ${String(i)}`);
  return doc.save();
}

const sameBytes = (a: Uint8Array | undefined, b: Uint8Array) =>
  a !== undefined && Buffer.from(a).equals(Buffer.from(b));

describe("extractDocument: a PDF that can be split", () => {
  it("sends each page on its own, all at once, and maps answers to their pages", async () => {
    const file = await realPdf(2);
    const split = (await splitPdfPages(file)) ?? [];
    // The mock knows a page by its bytes; each request must carry one page.
    const provider = mockAi();
    const transcribeSplit = new MockProvider((r) => {
      const sent = r.messages[0]?.files?.[0]?.data;
      const page = split.findIndex((p) => sameBytes(sent, p)) + 1;
      return JSON.stringify({ page_count: 1, page: 1, lines: PAGES[page] });
    });
    const seen: string[] = [];
    const run = await extractDocument(
      file,
      new ApiExecutor(provider),
      context,
      {
        ...options,
        transcriber: new ApiExecutor(transcribeSplit),
        onProgress: (p) =>
          seen.push(`${p.stage} ${String(p.done)}/${String(p.total)}`),
      },
    );

    expect(seen.slice(0, 3)).toEqual(["pages 0/2", "pages 1/2", "pages 2/2"]);
    expect(seen.at(-1)).toMatch(/^rows (\d+)\/\1$/);
    expect(run.failed).toEqual([]);
    expect(run.pageCount).toBe(2);
    expect(run.pages).toEqual([
      { page: 1, lines: PAGES[1] },
      { page: 2, lines: PAGES[2] },
    ]);
    expect(run.suppliers.map((s) => [s.company_name, s.source.page])).toEqual([
      ["Example Linen", 1],
      ["Example Soaps", 2],
    ]);
    expect(transcribeSplit.requests).toHaveLength(2);
    for (const r of transcribeSplit.requests) {
      expect(lastText(r)).toBe("Transcribe page 1 of this PDF.");
      const sent = r.messages[0]?.files?.[0]?.data ?? new Uint8Array();
      expect(sent.length).toBeLessThan(file.length);
    }
  });

  it("refuses a PDF longer than the page limit before calling the AI", async () => {
    const provider = mockAi();
    await expect(
      extractDocument(await realPdf(3), new ApiExecutor(provider), context, {
        ...options,
        maxPages: 2,
      }),
    ).rejects.toThrow(/3 pages/);
    expect(provider.requests).toEqual([]);
  });
});

describe("extractDocument: whole file (a photo, or a PDF that can't be split)", () => {
  it("reads each page, then extracts from the text, citing page and line", async () => {
    const provider = mockAi();
    const run = await extractDocument(
      pdf,
      new ApiExecutor(provider),
      context,
      options,
    );

    expect(run.failed).toEqual([]);
    expect(run.pageCount).toBe(2);
    expect(run.pages).toEqual([
      { page: 1, lines: PAGES[1] },
      { page: 2, lines: PAGES[2] },
    ]);
    expect(run.suppliers.map((s) => s.company_name)).toEqual([
      "Example Linen",
      "Example Soaps",
    ]);
    expect(run.suppliers[1]?.source).toEqual({
      file_id: context.file_id,
      file_name: "vendors.pdf",
      sheet: "Page 2",
      row: 1,
      page: 2,
    });
    for (const s of run.suppliers) {
      expect(() => Supplier.parse(s)).not.toThrow();
      expect(s.extraction_method).toBe("ai_vision");
      // No original text to compare with: a person checks against the page.
      expect(s.flags).toContain("read_from_image");
      expect(s.status).toBe("NEEDS_ATTENTION");
    }
    // 2 transcriptions + 2 extractions, all recorded as evidence.
    expect(run.aiCalls.map((c) => [c.taskType, c.sheet])).toEqual([
      ["transcribe_page", "Page 1"],
      ["transcribe_page", "Page 2"],
      ["extract_suppliers", "Page 1"],
      ["extract_suppliers", "Page 2"],
    ]);
    // The file goes with every transcription request, never with extraction.
    const transcriptions = provider.requests.filter(isTranscribe);
    expect(transcriptions[0]?.messages[0]?.files?.[0]?.mimeType).toBe(
      "application/pdf",
    );
    expect(
      provider.requests
        .filter((r) => !isTranscribe(r))
        .every((r) => r.messages.every((m) => !m.files)),
    ).toBe(true);
  });

  it("sends back a page that disagrees on the page count", async () => {
    let tries = 0;
    const run = await extractDocument(
      pdf,
      new ApiExecutor(
        mockAi((page) => {
          if (page === 2 && tries++ === 0) {
            return JSON.stringify({ page_count: 3, page, lines: PAGES[page] });
          }
          return JSON.stringify({ page_count: 2, page, lines: PAGES[page] });
        }),
      ),
      context,
      options,
    );
    expect(run.failed).toEqual([]);
    expect(run.aiCalls[1]?.attempts[0]?.problems[0]).toMatch(/has 2 page/);
    expect(run.suppliers).toHaveLength(2);
  });

  it("reports a page that can't be read and keeps the others", async () => {
    const run = await extractDocument(
      pdf,
      new ApiExecutor(
        mockAi((page) =>
          page === 2
            ? "not json"
            : JSON.stringify({ page_count: 2, page, lines: PAGES[page] }),
        ),
      ),
      context,
      options,
    );
    expect(run.failed).toEqual([
      expect.objectContaining({ sheet: "Page 2", page: 2, rows: [] }),
    ]);
    expect(run.pages.map((p) => p.page)).toEqual([1]);
    expect(run.suppliers.map((s) => s.company_name)).toEqual(["Example Linen"]);
  });

  it("can read pages with a different model than the extraction", async () => {
    const reader = mockAi();
    const extractor = mockAi();
    const run = await extractDocument(
      pdf,
      new ApiExecutor(extractor),
      context,
      {
        ...options,
        transcriber: new ApiExecutor(reader),
      },
    );
    expect(run.suppliers).toHaveLength(2);
    expect(reader.requests.every(isTranscribe)).toBe(true);
    expect(reader.requests).toHaveLength(2);
    expect(extractor.requests.some(isTranscribe)).toBe(false);
  });

  it("refuses a PDF longer than the page limit", async () => {
    await expect(
      extractDocument(pdf, new ApiExecutor(mockAi()), context, {
        ...options,
        maxPages: 1,
      }),
    ).rejects.toThrow(/2 pages/);
  });

  it("reads a photo as one page", async () => {
    const provider = mockAi((page) =>
      JSON.stringify({ page_count: 1, page, lines: PAGES[1] }),
    );
    const run = await extractDocument(
      png,
      new ApiExecutor(provider),
      { ...context, file_name: "vendors.png" },
      options,
    );
    expect(run.pageCount).toBe(1);
    expect(run.suppliers).toHaveLength(1);
    expect(lastText(provider.requests[0] as LLMRequest)).toBe(
      "Transcribe this image (page 1 of 1).",
    );
  });

  it("refuses a file that is not a PDF or an image, before calling the AI", async () => {
    const provider = mockAi();
    await expect(
      extractDocument(
        new TextEncoder().encode("hello"),
        new ApiExecutor(provider),
        context,
        options,
      ),
    ).rejects.toThrow(/Not a PDF/);
    expect(provider.requests).toEqual([]);
  });
});

describe("pagesToWorkbook", () => {
  it("makes one sheet per page; tabs split columns; line breaks add rows", () => {
    const workbook = pagesToWorkbook([
      { page: 1, lines: ["Title", "A\tB"] },
      { page: 3, lines: ["two\nlines"] },
    ]);
    expect(workbook.sheets.map((s) => [s.index, s.name, s.page])).toEqual([
      [0, "Page 1", 1],
      [1, "Page 3", 3],
    ]);
    expect(workbook.sheets[0]?.cells.map((c) => c.address)).toEqual([
      "A1",
      "A2",
      "B2",
    ]);
    expect(workbook.sheets[1]?.cells.map((c) => c.text)).toEqual([
      "two",
      "lines",
    ]);
  });
});

describe("transcriptText", () => {
  it("writes each page under a heading", () => {
    expect(
      transcriptText([
        { page: 1, lines: ["a", "b"] },
        { page: 2, lines: [] },
      ]),
    ).toBe("===== Page 1 =====\na\nb\n\n===== Page 2 =====\n\n");
  });
});
