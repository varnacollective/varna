import { randomUUID } from "node:crypto";
import type { AiAttempt, AiExecutor } from "../ai/task";
import {
  DEFAULT_EXTRACT_OPTIONS,
  extractSuppliersTask,
  type ExtractSuppliersAnswer,
  type ExtractTaskOptions,
  type OtherRow,
} from "../ai/tasks/extract-suppliers";
import { cellTexts } from "../ai/tasks/check-extraction";
import { findDuplicates } from "../core/duplicates";
import { DEFAULT_RULES, type ListRules } from "../core/rules";
import { combineFlags, decideStatus } from "../core/status";
import {
  Supplier,
  type ExtractionMethod,
  type SupplierFlag,
} from "../core/supplier";
import {
  DEFAULT_CHUNK_OPTIONS,
  splitChunk,
  workbookToChunks,
  type ChunkOptions,
  type SheetChunk,
} from "../parsers/sheet-text";
import type { SheetData, WorkbookData } from "../parsers/spreadsheet";
import { buildSupplierFields, type SupplierFields } from "./build-supplier";

/**
 * The spreadsheet path, end to end:
 * workbook → chunks → AI (checked against the source) → M1 rules →
 * duplicates and status across the whole list → supplier records.
 *
 * - A chunk the AI keeps failing on is split in half and retried, up to
 *   `maxSplitDepth` times. Rows that still fail are reported in `failed` for
 *   a person, never guessed.
 * - A provider error (outage, rate limit) stops that chunk without splitting;
 *   it can be resumed later.
 * - Every AI call is recorded (raw answers, model, tokens) as evidence.
 */

export interface RunContext {
  client_id: string;
  programme_id: string;
  upload_id: string;
  file_id: string;
  file_name: string;
}

export interface ExtractOptions {
  chunk: ChunkOptions;
  task: ExtractTaskOptions;
  rules: ListRules;
  /** How many times a failing chunk may be halved (2: 50 → 25 → 13 rows). */
  maxSplitDepth: number;
  /** AI calls running at the same time. */
  concurrency: number;
  /**
   * How the text was read. "ai_vision": an AI read it from a PDF or photo, so
   * every supplier is flagged read_from_image for a person to check.
   */
  extractionMethod: ExtractionMethod;
  newId: () => string;
  now: () => Date;
  /** Called each time a part is read, so a caller can show progress. */
  onProgress?: (progress: Progress) => void;
  /** Stops before the next AI call when aborted (calls already sent finish). */
  signal?: AbortSignal;
}

/** "pages": PDF pages or photos being read; "rows": rows being extracted. */
export interface Progress {
  stage: "pages" | "rows";
  done: number;
  total: number;
}

export const DEFAULT_EXTRACT_RUN_OPTIONS: ExtractOptions = {
  chunk: DEFAULT_CHUNK_OPTIONS,
  task: DEFAULT_EXTRACT_OPTIONS,
  rules: DEFAULT_RULES,
  maxSplitDepth: 2,
  concurrency: 8,
  extractionMethod: "ai_text",
  newId: randomUUID,
  now: () => new Date(),
};

/** A row the AI labelled as not holding supplier values. Kept in the run log. */
export interface OtherRowRecord {
  sheet: string;
  row: number;
  kind: OtherRow["kind"];
  reason?: string;
}

/** Rows (or a whole page) that could not be read. A person needs to look at them. */
export interface FailedPart {
  sheet: string;
  /** Rows that failed; empty when a whole page could not be read. */
  rows: number[];
  /** Page that could not be read (PDF or photo). */
  page?: number;
  error: "invalid_answer" | "provider_error";
  message: string;
}

/** One AI call, kept as evidence and for cost tracking. */
export interface AiCallRecord {
  sheet: string;
  rows: number[];
  ok: boolean;
  taskType: string;
  promptVersion: string;
  executor: string;
  provider: string;
  attempts: AiAttempt[];
}

export interface ExtractionRun {
  suppliers: Supplier[];
  otherRows: OtherRowRecord[];
  failed: FailedPart[];
  aiCalls: AiCallRecord[];
}

export async function extractWorkbook(
  workbook: WorkbookData,
  executor: AiExecutor,
  context: RunContext,
  options: Partial<ExtractOptions> = {},
): Promise<ExtractionRun> {
  const opts = { ...DEFAULT_EXTRACT_RUN_OPTIONS, ...options };
  const sheets = new Map(workbook.sheets.map((s) => [s.index, s]));
  const chunks = workbookToChunks(workbook, opts.chunk);

  // Run every chunk (with the split fallback), keeping chunk order.
  const progress = progressReporter("rows", chunks.length, opts);
  const outcomes = await mapLimit(
    chunks,
    opts.concurrency,
    async (chunk) => {
      const sheet = sheets.get(chunk.sheetIndex);
      if (!sheet) {
        throw new Error(`sheet ${String(chunk.sheetIndex)} not found`);
      }
      const outcome = await runChunk(chunk, sheet, executor, opts, 0);
      progress();
      return outcome;
    },
    opts.signal,
  );

  const aiCalls = outcomes.flatMap((o) => o.calls);
  const failed = outcomes.flatMap((o) => o.failed);
  const otherRows: OtherRowRecord[] = [];
  const fields: SupplierFields[] = [];
  const cellsBySheet = new Map<number, Map<string, string>>();

  for (const { chunk, answer } of outcomes.flatMap((o) => o.answers)) {
    const sheet = sheets.get(chunk.sheetIndex);
    if (!sheet) continue;
    let cells = cellsBySheet.get(sheet.index);
    if (!cells) {
      cells = cellTexts(sheet);
      cellsBySheet.set(sheet.index, cells);
    }
    for (const found of answer.suppliers) {
      fields.push(
        buildSupplierFields(found, {
          file_id: context.file_id,
          file_name: context.file_name,
          sheet: sheet.name,
          ...(sheet.page === undefined ? {} : { page: sheet.page }),
          cells,
          rules: opts.rules,
        }),
      );
    }
    for (const other of answer.other_rows) {
      otherRows.push({
        sheet: sheet.name,
        row: other.row,
        kind: other.kind,
        ...(other.reason === undefined ? {} : { reason: other.reason }),
      });
    }
  }

  return {
    suppliers: finishSuppliers(fields, context, opts),
    otherRows,
    failed,
    aiCalls,
  };
}

interface ChunkOutcome {
  answers: { chunk: SheetChunk; answer: ExtractSuppliersAnswer }[];
  failed: FailedPart[];
  calls: AiCallRecord[];
}

async function runChunk(
  chunk: SheetChunk,
  sheet: SheetData,
  executor: AiExecutor,
  opts: ExtractOptions,
  depth: number,
): Promise<ChunkOutcome> {
  const result = await executor.run(
    extractSuppliersTask(chunk, sheet, opts.task),
  );
  const call: AiCallRecord = {
    sheet: sheet.name,
    rows: chunk.rows,
    ok: result.ok,
    taskType: result.taskType,
    promptVersion: result.promptVersion,
    executor: result.executor,
    provider: result.provider,
    attempts: result.attempts,
  };
  if (result.ok) {
    return {
      answers: [{ chunk, answer: result.output }],
      failed: [],
      calls: [call],
    };
  }

  const halves =
    result.error === "invalid_answer" && depth < opts.maxSplitDepth
      ? splitChunk(sheet, chunk, opts.chunk)
      : undefined;
  if (!halves) {
    return {
      answers: [],
      failed: [
        {
          sheet: sheet.name,
          rows: chunk.rows,
          error: result.error,
          message: result.message,
        },
      ],
      calls: [call],
    };
  }
  const parts = await Promise.all(
    halves.map((half) => runChunk(half, sheet, executor, opts, depth + 1)),
  );
  return {
    answers: parts.flatMap((p) => p.answers),
    failed: parts.flatMap((p) => p.failed),
    calls: [call, ...parts.flatMap((p) => p.calls)],
  };
}

/** Duplicates and status need the whole list. Every record is validated. */
function finishSuppliers(
  fields: readonly SupplierFields[],
  context: RunContext,
  opts: ExtractOptions,
): Supplier[] {
  const duplicates = findDuplicates(fields, opts.rules, opts.newId);
  const createdAt = opts.now().toISOString();

  return fields.map((f, i) => {
    const groupId = duplicates.groupIds[i];
    const extra: SupplierFlag[] = [];
    if (groupId !== undefined) extra.push("possible_duplicate");
    if (duplicates.sharedEmail[i] === true) extra.push("shared_email");
    if (opts.extractionMethod === "ai_vision") extra.push("read_from_image");
    const flags = combineFlags(f.flags, extra);
    // Throws if a record breaks the schema: that would be a bug in our code.
    return Supplier.parse({
      ...f,
      id: opts.newId(),
      client_id: context.client_id,
      programme_id: context.programme_id,
      upload_id: context.upload_id,
      flags,
      status: decideStatus({
        flags,
        emails: f.emails,
        suggestions: f.suggestions,
      }),
      ...(groupId === undefined ? {} : { duplicate_group_id: groupId }),
      extraction_method: opts.extractionMethod,
      created_at: createdAt,
    });
  });
}

/** Run `fn` over `items` with at most `limit` running at once, keeping order. */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
  signal?: AbortSignal,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      signal?.throwIfAborted();
      const index = next++;
      const item = items[index] as T;
      results[index] = await fn(item);
    }
  };
  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker),
  );
  return results;
}

/** Reports 0 of total now, then one more each time it is called. */
export function progressReporter(
  stage: Progress["stage"],
  total: number,
  { onProgress }: Pick<ExtractOptions, "onProgress">,
): () => void {
  let done = 0;
  onProgress?.({ stage, done, total });
  return () => {
    done += 1;
    onProgress?.({ stage, done, total });
  };
}
