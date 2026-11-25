import type { UploadSummary } from "@/lib/list-uploads/types";

const number = (n: number) => n.toLocaleString("en-IN");

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** How the list was read: files, model, tokens, time, and what was kept. */
export default function RunDetails({ upload }: { upload: UploadSummary }) {
  const models =
    upload.visionModel && upload.visionModel !== upload.model
      ? `${upload.model} (pages and photos: ${upload.visionModel})`
      : upload.model;
  const rows: [string, string][] = [
    ["Files", upload.files.map((f) => `${f.name} (${formatSize(f.sizeBytes)}${f.pageCount ? `, ${f.pageCount} pages` : ""})`).join(", ")],
    ["AI model", models ?? "—"],
    ["Instructions", upload.promptVersion ?? "—"],
    [
      "Tokens",
      `${number(upload.inputTokens)} in, ${number(upload.outputTokens)} out${
        upload.thinkingTokens ? ` (${number(upload.thinkingTokens)} of them thinking)` : ""
      }`,
    ],
    ["Time", upload.durationMs === null ? "—" : `${(upload.durationMs / 1000).toFixed(1)} s`],
  ];

  return (
    <details className="sa-card group p-4 sm:px-6">
      <summary className="cursor-pointer select-none text-[13px] font-medium text-[var(--sa-ink-2)] marker:text-[var(--sa-caption)]">
        Run details
      </summary>
      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-[max-content_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-[var(--sa-muted)]">{label}</dt>
            <dd className="mb-2 break-words text-[var(--sa-ink)] sm:mb-0">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-[var(--sa-border)] pt-3 text-xs text-[var(--sa-caption)]">
        The original files and every AI answer are kept with this upload, so any result can be traced back to its source.
      </p>
    </details>
  );
}
