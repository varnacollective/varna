import {
  DEFAULT_TRANSCRIBE_OPTIONS,
  transcribePageTask,
  type TranscribeTaskOptions,
} from "../ai/tasks/transcribe-page";
import type { AiExecutor, AiResult } from "../ai/task";
import type { TranscribePageAnswer } from "../ai/tasks/transcribe-page";
import { readDocument, type DocumentType } from "../parsers/document";
import { splitPdfPages } from "../parsers/pdf-pages";
import type { SheetData, WorkbookData } from "../parsers/spreadsheet";
import { readText } from "../parsers/text";
import {
  DEFAULT_EXTRACT_RUN_OPTIONS,
  extractWorkbook,
  mapLimit,
  progressReporter,
  type AiCallRecord,
  type ExtractionRun,
  type ExtractOptions,
  type FailedPart,
  type RunContext,
} from "./extract-workbook";

/**
 * The PDF and photo path:
 * file → split into single pages → AI writes out each page's text (one call
 * per page, all pages at once) → each page
 * becomes a sheet ("Page 1", "Page 2"…, one line per row) → the normal
 * extraction, checked against that text → supplier records.
 *
 * Each call gets only its own page. If a PDF can't be split (damaged or
 * password-protected), the whole file goes with every call instead, and
 * page 1's answer gives the page count.
 *
 * Every supplier is flagged read_from_image: values are checked against the
 * transcript, but nothing can check the transcript against the page, so a
 * person compares them. The transcript is kept as evidence.
 */

export interface DocumentOptions extends ExtractOptions {
  transcribe: TranscribeTaskOptions;
  /** Longest PDF read, in pages. Longer files are refused, not cut short. */
  maxPages: number;
  /**
   * Runs the page reading, when it should use another model than the
   * extraction (reading crooked photos needs a stronger one). Default: the
   * same executor.
   */
  transcriber?: AiExecutor;
}

export const DEFAULT_DOCUMENT_OPTIONS: DocumentOptions = {
  ...DEFAULT_EXTRACT_RUN_OPTIONS,
  extractionMethod: "ai_vision",
  transcribe: DEFAULT_TRANSCRIBE_OPTIONS,
  maxPages: 50,
};

/** The text the AI read from one page, exactly as returned. */
export interface PageTranscript {
  page: number;
  lines: string[];
}

export interface DocumentRun extends ExtractionRun {
  /**
   * Pages in the file: counted by code, or reported by the AI when the PDF
   * couldn't be split (then undefined if page 1 failed).
   */
  pageCount?: number;
  pages: PageTranscript[];
}

export async function extractDocument(
  file: Uint8Array,
  executor: AiExecutor,
  context: RunContext,
  options: Partial<DocumentOptions> = {},
): Promise<DocumentRun> {
  const opts = { ...DEFAULT_DOCUMENT_OPTIONS, ...options };
  const type = readDocument(file);
  const reader: PageReader = {
    type,
    transcriber: opts.transcriber ?? executor,
    opts,
  };
  const { pageCount, results } =
    (type.kind === "pdf" ? await readSplitPages(file, reader) : undefined) ??
    (await readWholeFile(file, reader));

  const pages: PageTranscript[] = [];
  const failed: FailedPart[] = [];
  const calls: AiCallRecord[] = [];
  for (const { page, result } of results) {
    calls.push({
      sheet: pageName(page),
      rows: [],
      ok: result.ok,
      taskType: result.taskType,
      promptVersion: result.promptVersion,
      executor: result.executor,
      provider: result.provider,
      attempts: result.attempts,
    });
    if (result.ok) {
      pages.push({ page, lines: result.output.lines });
    } else {
      failed.push({
        sheet: pageName(page),
        rows: [],
        page,
        error: result.error,
        message: `page could not be read: ${result.message}`,
      });
    }
  }

  const run = await extractWorkbook(
    pagesToWorkbook(pages),
    executor,
    context,
    opts,
  );
  return {
    ...run,
    failed: [...failed, ...run.failed],
    aiCalls: [...calls, ...run.aiCalls],
    ...(pageCount === undefined ? {} : { pageCount }),
    pages,
  };
}

type PageResult = { page: number; result: AiResult<TranscribePageAnswer> };

interface PageReader {
  type: DocumentType;
  transcriber: AiExecutor;
  opts: DocumentOptions;
}

interface PagesRead {
  pageCount?: number;
  results: PageResult[];
}

/**
 * Split the PDF and send each page on its own (page 1 of 1), all at once.
 * Undefined if the PDF can't be split.
 */
async function readSplitPages(
  file: Uint8Array,
  { type, transcriber, opts }: PageReader,
): Promise<PagesRead | undefined> {
  const split = await splitPdfPages(file);
  if (!split) return undefined;
  checkPageCount(split.length, opts.maxPages);
  const progress = progressReporter("pages", split.length, opts);
  const results = await mapLimit(
    split.map((data, i) => ({ data, page: i + 1 })),
    opts.concurrency,
    async ({ data, page }) => {
      const result = await transcriber.run(
        transcribePageTask(
          { file: data, type, page: 1, expectedPageCount: 1 },
          opts.transcribe,
        ),
      );
      progress();
      return { page, result };
    },
    opts.signal,
  );
  return { pageCount: split.length, results };
}

/**
 * Send the whole file with every call (a photo, or a PDF that can't be
 * split). Page 1 also gives the page count; the other pages must agree.
 */
async function readWholeFile(
  file: Uint8Array,
  { type, transcriber, opts }: PageReader,
): Promise<PagesRead> {
  const transcribe = (page: number, expectedPageCount?: number) =>
    transcriber.run(
      transcribePageTask(
        {
          file,
          type,
          page,
          ...(expectedPageCount === undefined ? {} : { expectedPageCount }),
        },
        opts.transcribe,
      ),
    );
  opts.signal?.throwIfAborted();
  const first = await transcribe(1);
  const results: PageResult[] = [{ page: 1, result: first }];
  const pageCount = first.ok ? first.output.page_count : undefined;
  if (pageCount !== undefined) checkPageCount(pageCount, opts.maxPages);
  // The page count is only known once page 1 is read.
  const progress = progressReporter("pages", pageCount ?? 1, opts);
  progress();
  const rest = Array.from({ length: (pageCount ?? 1) - 1 }, (_, i) => i + 2);
  results.push(
    ...(await mapLimit(
      rest,
      opts.concurrency,
      async (page) => {
        const result = await transcribe(page, pageCount);
        progress();
        return { page, result };
      },
      opts.signal,
    )),
  );
  return { ...(pageCount === undefined ? {} : { pageCount }), results };
}

/** Longer files are refused before anything is sent, not cut short. */
function checkPageCount(pageCount: number, maxPages: number): void {
  if (pageCount > maxPages) {
    throw new Error(
      `The PDF has ${String(pageCount)} pages; the most that can be read is ${String(maxPages)}. Split it into smaller files.`,
    );
  }
}

export function pageName(page: number): string {
  return `Page ${String(page)}`;
}

/**
 * Each page becomes a sheet, read like pasted text: one line per row, tabs
 * split columns. A line the AI returned with line breaks inside becomes
 * several rows, exactly as the joined transcript reads.
 */
export function pagesToWorkbook(
  pages: readonly PageTranscript[],
): WorkbookData {
  const sheets: SheetData[] = pages.map((p, index) => {
    const [sheet] = readText(p.lines.join("\n")).sheets;
    if (!sheet) throw new Error("readText returned no sheet");
    return { ...sheet, index, name: pageName(p.page), page: p.page };
  });
  return { sheets };
}

/** The transcript as plain text, page by page, for a person to read. */
export function transcriptText(pages: readonly PageTranscript[]): string {
  return pages
    .map((p) => `===== ${pageName(p.page)} =====\n${p.lines.join("\n")}\n`)
    .join("\n");
}
