"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ClipboardPaste, FileText, Loader2, Plus, Upload, X } from "lucide-react";
import { ACCEPT_ATTRIBUTE, ACCEPTED_FILE, MAX_FILE_BYTES, MAX_FILES, UPLOAD_BUCKET } from "@/lib/list-uploads/files";
import type { ReadEvent } from "@/lib/list-uploads/types";
import { createClient } from "@/utils/supabase/client";
import { errorFrom, readEvents } from "./read-stream";

interface Client {
  id: string;
  name: string;
}

type Phase =
  | { kind: "choose" }
  | { kind: "uploading"; done: number; total: number }
  | {
      kind: "reading";
      file: number;
      files: number;
      name: string;
      stage: "pages" | "rows" | null;
      done: number;
      total: number;
      /** This file had pages to read first (a PDF or photo). */
      hadPages: boolean;
    };

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Number((bytes / 1024 / 1024).toFixed(1))} MB`;
}

/** Share of the work done, 0 to 1. Pages are read first, then rows. */
function share(phase: Phase): number {
  if (phase.kind === "uploading") return phase.total ? (phase.done / phase.total) * 0.1 : 0;
  if (phase.kind !== "reading") return 0;
  const part = phase.total ? phase.done / phase.total : 0;
  const within = phase.stage === "pages" ? part * 0.5 : phase.hadPages ? 0.5 + part * 0.5 : part;
  return 0.1 + 0.9 * ((phase.file + within) / phase.files);
}

function describe(phase: Phase): string {
  if (phase.kind === "uploading") return `Uploading file ${Math.min(phase.done + 1, phase.total)} of ${phase.total}…`;
  if (phase.kind !== "reading") return "";
  const file = phase.files > 1 ? `File ${phase.file + 1} of ${phase.files} (${phase.name}): ` : "";
  if (phase.stage === "pages") return `${file}reading page ${Math.min(phase.done + 1, phase.total)} of ${phase.total}…`;
  if (phase.stage === "rows") return `${file}finding suppliers, part ${Math.min(phase.done + 1, phase.total)} of ${phase.total}…`;
  return `${file}opening…`;
}

export default function UploadForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const stopper = useRef<AbortController | null>(null);
  const [clientId, setClientId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [pasted, setPasted] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "choose" });
  const [error, setError] = useState<string | null>(null);
  const busy = phase.kind !== "choose";

  function addFiles(list: Iterable<File>) {
    const problems: string[] = [];
    const next = [...files];
    for (const file of list) {
      if (!ACCEPTED_FILE.test(file.name)) problems.push(`${file.name}: this kind of file can't be read.`);
      else if (file.size > MAX_FILE_BYTES) problems.push(`${file.name}: over ${formatBytes(MAX_FILE_BYTES)}.`);
      else if (file.size === 0) problems.push(`${file.name}: the file is empty.`);
      else if (next.length >= MAX_FILES) problems.push(`Up to ${MAX_FILES} files at a time.`);
      else if (!next.some((f) => f.name === file.name && f.size === file.size)) next.push(file);
    }
    setFiles(next);
    setError(problems.length ? [...new Set(problems)].join(" ") : null);
  }

  function addPasted() {
    if (!pasted.trim()) return;
    const count = files.filter((f) => f.name.startsWith("Pasted text")).length;
    addFiles([new File([pasted], `Pasted text${count ? ` ${count + 1}` : ""}.txt`, { type: "text/plain" })]);
    setPasted("");
    setPasteOpen(false);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (!busy) addFiles(event.dataTransfer.files);
  }

  async function start() {
    setError(null);
    const stop = new AbortController();
    stopper.current = stop;
    try {
      setPhase({ kind: "uploading", done: 0, total: files.length });
      const created = await fetch("/api/superadmin/list-uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        }),
        signal: stop.signal,
      });
      if (!created.ok) throw new Error(await errorFrom(created));
      const { uploadId, files: targets } = (await created.json()) as {
        uploadId: string;
        files: { path: string; token: string }[];
      };

      const storage = createClient().storage.from(UPLOAD_BUCKET);
      for (const [i, file] of files.entries()) {
        stop.signal.throwIfAborted();
        const target = targets[i];
        if (!target) throw new Error("The upload could not be prepared. Try again.");
        const { error: uploadError } = await storage.uploadToSignedUrl(target.path, target.token, file, {
          contentType: file.type || "application/octet-stream",
        });
        if (uploadError) throw new Error(`${file.name} could not be uploaded: ${uploadError.message}`);
        setPhase({ kind: "uploading", done: i + 1, total: files.length });
      }

      let finished = false;
      const read = await fetch(`/api/superadmin/list-uploads/${uploadId}/read`, { method: "POST", signal: stop.signal });
      if (!read.ok) throw new Error(await errorFrom(read));
      await readEvents(read, (event: ReadEvent) => {
        if (event.type === "file") {
          setPhase({ kind: "reading", file: event.index, files: event.total, name: event.name, stage: null, done: 0, total: 0, hadPages: false });
        } else if (event.type === "progress") {
          setPhase((p) =>
            p.kind === "reading"
              ? { ...p, stage: event.stage, done: event.done, total: event.total, hadPages: p.hadPages || event.stage === "pages" }
              : p,
          );
        } else if (event.type === "error") {
          throw new Error(event.message);
        } else {
          finished = true;
        }
      });
      if (!finished) throw new Error("The connection was lost before the list was read. Try again.");
      router.push(`/superadmin/partners/invitations/upload/${uploadId}`);
    } catch (caught) {
      setPhase({ kind: "choose" });
      if (!stop.signal.aborted) setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      stopper.current = null;
    }
  }

  const percent = Math.round(share(phase) * 100);

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div className="sa-card flex flex-col gap-4 p-4 sm:p-6">
        {/* Only shown when hotels are set up (Partners → Clients). */}
        {clients.length > 0 && (
          <div className="flex flex-col gap-1.5 sm:max-w-sm">
            <label htmlFor="list-client" className="sa-label">Hotel (optional)</label>
            <select
              id="list-client"
              className="sa-input"
              value={clientId}
              disabled={busy}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">General Pool (no hotel)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center gap-3 rounded-[var(--sa-radius-md)] border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging ? "border-[var(--sa-accent)] bg-[var(--sa-accent-tint)]" : "border-[var(--sa-border-strong)] bg-[var(--sa-canvas)]"
          }`}
        >
          <Upload className="h-6 w-6 text-[var(--sa-accent)]" aria-hidden />
          <p className="text-[13px] text-[var(--sa-ink-2)]">
            Drop files here, or{" "}
            <button
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
              className="font-medium text-[var(--sa-accent)] underline underline-offset-2 hover:text-[var(--sa-accent-hover)] disabled:opacity-50"
            >
              choose files
            </button>
          </p>
          <p className="text-xs text-[var(--sa-caption)]">
            Excel, CSV, PDF, photos (JPG, PNG, HEIC) or text · up to {formatBytes(MAX_FILE_BYTES)} each · several files at once is fine
          </p>
          <input
            ref={input}
            type="file"
            multiple
            accept={ACCEPT_ATTRIBUTE}
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose files"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {pasteOpen ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="list-paste" className="sa-label">Pasted text</label>
            <textarea
              id="list-paste"
              className="sa-input min-h-40 font-mono text-xs"
              placeholder="Paste the list from an email, chat or document"
              value={pasted}
              disabled={busy}
              onChange={(e) => setPasted(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" className="sa-btn-primary disabled:opacity-50" disabled={!pasted.trim() || busy} onClick={addPasted}>
                <Plus className="h-4 w-4" aria-hidden /> Add text
              </button>
              <button type="button" className="sa-btn-secondary" onClick={() => setPasteOpen(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setPasteOpen(true)}
            className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-[var(--sa-accent)] hover:underline disabled:opacity-50"
          >
            <ClipboardPaste className="h-4 w-4" aria-hidden /> Paste text instead
          </button>
        )}

        {files.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="sa-label">{files.length === 1 ? "1 file" : `${files.length} files`}</p>
            <ul className="flex flex-col divide-y divide-[var(--sa-border)] rounded-[var(--sa-radius-sm)] border border-[var(--sa-border)]">
              {files.map((file, i) => (
                <li key={`${file.name}-${file.size}`} className="flex items-center gap-3 px-3 py-2">
                  <FileText className="h-4 w-4 shrink-0 text-[var(--sa-muted)]" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--sa-ink)]" title={file.name}>{file.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--sa-caption)]">{formatBytes(file.size)}</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="rounded p-1 text-[var(--sa-muted)] hover:bg-[var(--sa-sand)] hover:text-[var(--sa-ink)] disabled:opacity-50"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={busy || files.length >= MAX_FILES}
              onClick={() => input.current?.click()}
              className="sa-btn-secondary w-fit disabled:opacity-50"
            >
              <Plus className="h-4 w-4" aria-hidden /> Add more files
            </button>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-[var(--sa-radius-sm)] border border-[var(--sa-danger)] bg-[var(--sa-danger-tint)] px-4 py-3 text-[13px] text-[var(--sa-danger-fg)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {busy ? (
        <div className="sa-card flex flex-col gap-3 p-4 sm:p-6" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2 text-[13px] text-[var(--sa-ink)]">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--sa-accent)]" aria-hidden />
              <span className="truncate">{describe(phase)}</span>
            </p>
            <span className="shrink-0 text-xs tabular-nums text-[var(--sa-muted)]">{percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Reading the list"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-2 overflow-hidden rounded-full bg-[var(--sa-sand)]"
          >
            <div className="h-full rounded-full bg-[var(--sa-accent)] transition-[width] duration-500" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--sa-caption)]">Keep this page open. A long list can take a few minutes.</p>
            <button type="button" className="sa-btn-secondary" onClick={() => stopper.current?.abort()}>Stop</button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button type="button" className="sa-btn-primary disabled:cursor-not-allowed disabled:opacity-50" disabled={files.length === 0} onClick={start}>
            Read {files.length === 1 ? "the file" : files.length > 1 ? `${files.length} files` : "the list"}
          </button>
        </div>
      )}
    </div>
  );
}
