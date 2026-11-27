import type { Supplier } from "../core/supplier";
import type { ExtractionRun } from "../pipeline/extract-workbook";

/**
 * Turns a run into things a person can look at: a CSV of suppliers (opens in
 * Excel) and a short text summary. The full run, with every raw value and AI
 * answer, is saved separately as JSON.
 */

const COLUMNS: [string, (s: Supplier) => string][] = [
  ["status", (s) => s.status],
  ["flags", (s) => s.flags.join("; ")],
  ["company_name", (s) => s.company_name ?? ""],
  ["brand_name", (s) => s.brand_name ?? ""],
  ["contact_name", (s) => s.contact_name ?? ""],
  ["emails", (s) => s.emails.join("; ")],
  ["phones", (s) => s.phones.join("; ")],
  ["website", (s) => s.website ?? ""],
  ["address", (s) => s.address ?? ""],
  ["city", (s) => s.city ?? ""],
  ["district", (s) => s.district ?? ""],
  ["state", (s) => s.state ?? ""],
  ["country", (s) => s.country ?? ""],
  ["category", (s) => s.category ?? ""],
  ["gstin", (s) => s.gstin ?? ""],
  ["udyam_number", (s) => s.udyam_number ?? ""],
  [
    "other_ids",
    (s) =>
      Object.entries(s.other_ids ?? {})
        .map(([k, v]) => `${k}: ${v}`)
        .join("; "),
  ],
  ["notes", (s) => s.notes ?? ""],
  [
    "suggestions",
    (s) =>
      s.suggestions
        .map((g) =>
          g.suggested_value === undefined
            ? `${g.field}: ${g.issue}`
            : `${g.field}: ${g.issue} (suggested: ${g.suggested_value})`,
        )
        .join("; "),
  ],
  ["duplicate_group", (s) => s.duplicate_group_id ?? ""],
  ["sheet", (s) => s.source.sheet ?? ""],
  ["page", (s) => (s.source.page === undefined ? "" : String(s.source.page))],
  ["row", (s) => (s.source.row === undefined ? "" : String(s.source.row))],
];

/** UTF-8 CSV with a byte-order mark, so Excel shows Hindi and other scripts. */
export function suppliersToCsv(suppliers: readonly Supplier[]): string {
  const lines = [
    COLUMNS.map(([name]) => name),
    ...suppliers.map((s) => COLUMNS.map(([, get]) => get(s))),
  ].map((cells) => cells.map(csvCell).join(","));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

/**
 * A text starting with = + - @ would run as a formula in Excel. Values come
 * from untrusted files, so such cells get a leading apostrophe, which Excel
 * hides and treats as "show as text". The exact values are in the run JSON.
 */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

export interface RunSummary {
  suppliers: number;
  byStatus: Record<string, number>;
  byFlag: Record<string, number>;
  otherRows: number;
  failedRows: number;
  /** Pages of a PDF or photo the AI could not read. */
  failedPages: number;
  aiCalls: number;
  aiAttempts: number;
  inputTokens: number;
  outputTokens: number;
  /** Part of outputTokens spent thinking. */
  thinkingTokens: number;
  models: string[];
}

export function summarise(run: ExtractionRun): RunSummary {
  const count = (keys: string[]) => {
    const out: Record<string, number> = {};
    for (const k of keys) out[k] = (out[k] ?? 0) + 1;
    return out;
  };
  const attempts = run.aiCalls.flatMap((c) => c.attempts);
  return {
    suppliers: run.suppliers.length,
    byStatus: count(run.suppliers.map((s) => s.status)),
    byFlag: count(run.suppliers.flatMap((s) => s.flags)),
    otherRows: run.otherRows.length,
    failedRows: run.failed.reduce((n, f) => n + f.rows.length, 0),
    failedPages: run.failed.filter((f) => f.page !== undefined).length,
    aiCalls: run.aiCalls.length,
    aiAttempts: attempts.length,
    inputTokens: attempts.reduce((n, a) => n + a.inputTokens, 0),
    outputTokens: attempts.reduce((n, a) => n + a.outputTokens, 0),
    thinkingTokens: attempts.reduce((n, a) => n + (a.thinkingTokens ?? 0), 0),
    models: [...new Set(attempts.flatMap((a) => (a.model ? [a.model] : [])))],
  };
}

export function formatSummary(summary: RunSummary): string {
  const list = (counts: Record<string, number>) =>
    Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([k, n]) => `    ${k}: ${String(n)}`);
  return [
    `Suppliers found: ${String(summary.suppliers)}`,
    ...list(summary.byStatus),
    ...(Object.keys(summary.byFlag).length > 0
      ? ["  Flags:", ...list(summary.byFlag)]
      : []),
    `Other rows (headings, notes, totals…): ${String(summary.otherRows)}`,
    `Rows that failed (need a person): ${String(summary.failedRows)}`,
    ...(summary.failedPages > 0
      ? [
          `Pages that could not be read (need a person): ${String(summary.failedPages)}`,
        ]
      : []),
    `AI calls: ${String(summary.aiCalls)} (${String(summary.aiAttempts)} attempts incl. retries)`,
    `Tokens: ${String(summary.inputTokens)} in, ${String(summary.outputTokens)} out (${String(summary.thinkingTokens)} of them thinking)`,
    `Model: ${summary.models.join(", ") || "none"}`,
  ].join("\n");
}
