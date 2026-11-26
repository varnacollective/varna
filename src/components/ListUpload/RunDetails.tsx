import type { ReactNode } from "react";
import type { UploadSummary } from "@/lib/list-uploads/types";
import UploadedFiles from "./UploadedFiles";

const number = (n: number) => n.toLocaleString("en-IN");

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Two significant figures under $1 ($0.044), cents above ($12.40). */
function dollars(usd: number): string {
  if (usd < 0.001) return "under $0.001";
  return usd < 1 ? `$${usd.toPrecision(2)}` : `$${usd.toFixed(2)}`;
}

/** How the list was read: files, model, tokens and what it would cost. */
export default function RunDetails({ upload }: { upload: UploadSummary }) {
  const models =
    upload.visionModel && upload.visionModel !== upload.model
      ? `${upload.model} (pages and photos: ${upload.visionModel})`
      : upload.model;
  const rows: [string, ReactNode][] = [
    [
      "Files",
      <UploadedFiles
        key="files"
        uploadId={upload.id}
        files={upload.files.map((f) => ({
          id: f.id,
          name: f.name,
          detail: `${formatSize(f.sizeBytes)}${f.pageCount ? `, ${f.pageCount} pages` : ""}`,
        }))}
      />,
    ],
    ["AI model", models ?? "—"],
    [
      "Tokens",
      `${number(upload.inputTokens)} in, ${number(upload.outputTokens)} out${
        upload.thinkingTokens ? ` (${number(upload.thinkingTokens)} of them thinking)` : ""
      }`,
    ],
    ...(upload.paidCostUsd === null
      ? []
      : ([["AI cost", `${dollars(upload.paidCostUsd)} at Google's paid prices`]] as [string, ReactNode][])),
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
    </details>
  );
}
