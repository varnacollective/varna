"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, X } from "lucide-react";
import PdfPages from "./PdfPages";

/**
 * A quick look at a list file, inside the app: photos as they are, PDF pages
 * drawn with pdf.js, text as text, spreadsheets as a table (first rows of each sheet).
 */

/** What to preview. Keep one object per open preview (e.g. in state), so it loads once. */
export interface PreviewTarget {
  name: string;
  /** Gets the file: a file picked on this computer, or one already uploaded. */
  load: () => Promise<Blob>;
  /** Open a PDF at this page. */
  page?: number;
  /** Open a spreadsheet at this sheet and row (or pasted text at this line), highlighted. */
  sheet?: string;
  row?: number;
}

type Props = PreviewTarget & { onClose: () => void };

type Kind = "image" | "pdf" | "text" | "sheet" | "none";

const MAX_ROWS = 200;

function kindOf(name: string): Kind {
  if (/\.(png|jpe?g|webp|gif)$/i.test(name)) return "image";
  if (/\.pdf$/i.test(name)) return "pdf";
  if (/\.(txt|text)$/i.test(name)) return "text";
  if (/\.(xlsx|xlsm|xls|ods|csv|tsv)$/i.test(name)) return "sheet";
  return "none"; // HEIC: most browsers can't show it
}

type Content =
  | { kind: "image" | "none"; url: string }
  | { kind: "pdf"; url: string; blob: Blob }
  | { kind: "text"; url: string; text: string }
  | { kind: "sheet"; url: string; sheets: { name: string; first: number; rows: string[][]; more: boolean; marked: number | undefined }[] };

async function readSheets(blob: Blob, markSheet?: string, markRow?: number) {
  // Loaded only when a spreadsheet is previewed, to keep pages light.
  const XLSX = await import("xlsx");
  const book = XLSX.read(await blob.arrayBuffer(), { type: "array", sheetRows: MAX_ROWS + 1 });
  return book.SheetNames.map((name) => {
    const sheet = book.Sheets[name];
    // Blank rows kept, numbered from where the sheet starts, so "row 5" here
    // is row 5 in the file.
    const rows = sheet
      ? XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: "", blankrows: true })
      : [];
    const first = sheet?.["!ref"] ? XLSX.utils.decode_range(sheet["!ref"]).s.r + 1 : 1;
    const marked = name === markSheet ? markRow : undefined;
    return { name, first, rows: rows.slice(0, MAX_ROWS), more: rows.length > MAX_ROWS, marked };
  });
}

export default function FilePreview({ name, load, page, sheet: startSheet, row: mark, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState(0);

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  useEffect(() => {
    let url: string | null = null;
    let live = true;
    void (async () => {
      try {
        const blob = await load();
        url = URL.createObjectURL(blob);
        const kind = kindOf(name);
        const next: Content =
          kind === "text"
            ? { kind, url, text: await blob.text() }
            : kind === "sheet"
              ? { kind, url, sheets: await readSheets(blob, startSheet, mark) }
              : kind === "pdf"
                ? { kind, url, blob }
                : { kind, url };
        if (!live) return;
        if (next.kind === "sheet") setSheet(Math.max(0, next.sheets.findIndex((x) => x.marked !== undefined)));
        setContent(next);
      } catch {
        if (live) setError("The file could not be opened.");
      }
    })();
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [load, name, startSheet, mark]);

  const current = content?.kind === "sheet" ? content.sheets[sheet] : undefined;

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label={`Preview of ${name}`}
      className="m-auto h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-5xl overflow-hidden rounded-[var(--sa-radius-lg)] border border-[var(--sa-border)] bg-[var(--sa-white)] p-0 text-[var(--sa-ink)] shadow-[var(--sa-shadow-lg)] backdrop:bg-[rgba(30,26,22,0.4)] backdrop:backdrop-blur-[2px]"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center gap-2 border-b border-[var(--sa-border)] px-4 py-3 sm:px-5">
          <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold" title={name}>{name}</h2>
          {content && (
            <a
              href={page && content.kind === "pdf" ? `${content.url}#page=${page}` : content.url}
              target="_blank"
              rel="noopener"
              aria-label="Open in a new tab"
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[13px] text-[var(--sa-ink-2)] hover:bg-[var(--sa-sand)]"
            >
              <ExternalLink className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">New tab</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close preview"
            className="cursor-pointer rounded p-1 text-[var(--sa-muted)] hover:bg-[var(--sa-sand)]"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-[var(--sa-canvas)]">
          {error ? (
            <p role="alert" className="p-6 text-[13px] text-[var(--sa-danger-fg)]">{error}</p>
          ) : !content ? (
            <p className="flex h-full items-center justify-center gap-2 text-[13px] text-[var(--sa-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Opening…
            </p>
          ) : content.kind === "image" ? (
            <div className="flex min-h-full items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- a local file, not a site image */}
              <img src={content.url} alt={name} className="max-h-full max-w-full object-contain shadow-[var(--sa-shadow-md)]" />
            </div>
          ) : content.kind === "pdf" ? (
            <PdfPages data={content.blob} {...(page ? { page } : {})} />
          ) : content.kind === "text" ? (
            <ol className="p-3 font-mono text-xs leading-relaxed text-[var(--sa-ink)]">
              {content.text.split(/\r?\n/).map((line, i) => (
                <li
                  key={i}
                  ref={mark === i + 1 ? (el) => el?.scrollIntoView({ block: "center" }) : undefined}
                  className={`flex gap-3 rounded px-2 ${mark === i + 1 ? "bg-[var(--sa-accent-tint)] outline-2 -outline-offset-2 outline-[var(--sa-accent)]" : ""}`}
                >
                  <span className="w-8 shrink-0 select-none text-right tabular-nums text-[var(--sa-caption)]">{i + 1}</span>
                  <span className="min-w-0 whitespace-pre-wrap break-words">{line || " "}</span>
                </li>
              ))}
            </ol>
          ) : content.kind === "sheet" ? (
            <div className="flex min-h-full flex-col">
              {content.sheets.length > 1 && (
                <div role="tablist" aria-label="Sheets" className="flex gap-1 overflow-x-auto border-b border-[var(--sa-border)] bg-[var(--sa-white)] px-3 pt-2">
                  {content.sheets.map((s, i) => (
                    <button
                      key={s.name}
                      type="button"
                      role="tab"
                      aria-selected={i === sheet}
                      onClick={() => setSheet(i)}
                      className={`cursor-pointer whitespace-nowrap rounded-t px-3 py-1.5 text-xs font-medium ${
                        i === sheet ? "bg-[var(--sa-accent-tint)] text-[var(--sa-accent)]" : "text-[var(--sa-muted)] hover:bg-[var(--sa-sand)]"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
              {current && current.rows.length > 0 ? (
                <table className="border-collapse bg-[var(--sa-white)] text-xs">
                  <tbody>
                    {current.rows.map((row, r) => (
                      <tr
                        key={r}
                        ref={current.marked === current.first + r ? (el) => el?.scrollIntoView({ block: "center" }) : undefined}
                        className={current.marked === current.first + r ? "outline-2 -outline-offset-2 outline-[var(--sa-accent)] [&>td]:bg-[var(--sa-accent-tint)]" : undefined}
                      >
                        <th scope="row" className="sticky left-0 border border-[var(--sa-border)] bg-[var(--sa-sand)] px-2 py-1 text-right font-normal tabular-nums text-[var(--sa-caption)]">
                          {current.first + r}
                        </th>
                        {row.map((cell, c) => (
                          <td key={c} className="max-w-64 truncate border border-[var(--sa-border)] px-2 py-1 text-[var(--sa-ink-2)]" title={cell}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-6 text-[13px] text-[var(--sa-muted)]">This sheet is empty.</p>
              )}
              {current?.more && (
                <p className="p-3 text-xs text-[var(--sa-caption)]">
                  Showing the first {MAX_ROWS} rows.
                </p>
              )}
            </div>
          ) : (
            <p className="p-6 text-[13px] text-[var(--sa-muted)]">
              This kind of photo (HEIC) can&apos;t be shown in the browser. It can still be read.
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}
