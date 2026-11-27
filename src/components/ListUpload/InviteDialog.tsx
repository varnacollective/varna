"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Send, X } from "lucide-react";
import type { ReviewSupplier } from "@/lib/list-uploads/types";
import { errorFrom } from "./read-stream";

interface Props {
  uploadId: string;
  suppliers: ReviewSupplier[];
  onInvited: (supplierId: string, invitationId: string) => void;
  onClose: () => void;
}

interface Preview {
  subject: string;
  html: string;
}

/** The email server allows 5 a minute; one every 13 s stays under it. */
const SEND_GAP_MS = 13_000;

/** Waits `ms`, or less if `signal` is aborted first. Never throws. */
const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });

type Ending = "done" | "stopped" | "offline";

/** Preview each approved supplier's email, then send them one by one. */
export default function InviteDialog({ uploadId, suppliers, onInvited, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stopper = useRef<AbortController | null>(null);
  const [queue] = useState(suppliers);
  const [index, setIndex] = useState(0);
  const [previews, setPreviews] = useState<Record<string, Preview | { error: string }>>({});
  const [sending, setSending] = useState<{ done: number; failed: { name: string; error: string }[] } | null>(null);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [stopping, setStopping] = useState(false);
  const current = queue[index];
  const finished = ending !== null;
  const busy = sending !== null && !finished;

  // While sending: warn before the tab is closed or reloaded, and if this
  // window goes away anyway (another page), stop after the current email.
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);
  useEffect(() => () => stopper.current?.abort(), []);

  // Open as a modal once mounted. No close() on cleanup: its "close" event
  // would tell the parent to remove this dialog again.
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  useEffect(() => {
    if (!current || previews[current.id]) return;
    const stop = new AbortController();
    void (async () => {
      const response = await fetch(`/api/superadmin/list-uploads/${uploadId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId: current.id, action: "preview" }),
      });
      const result = response.ok
        ? (({ subject, preview_html }) => ({ subject, html: preview_html }))(
            (await response.json()) as { subject: string; preview_html: string },
          )
        : { error: await errorFrom(response) };
      if (!stop.signal.aborted) setPreviews((p) => ({ ...p, [current.id]: result }));
    })();
    return () => {
      stop.abort();
    };
  }, [current, previews, uploadId]);

  /**
   * One email at a time, 13 s apart. Stop takes effect between emails: an
   * email already on its way is finished and recorded, never cut off halfway.
   */
  async function sendAll() {
    const stop = new AbortController();
    stopper.current = stop;
    const failed: { name: string; error: string }[] = [];
    let done = 0;
    let end: Ending = "done";
    setSending({ done, failed });
    for (const [i, supplier] of queue.entries()) {
      if (i > 0) await wait(SEND_GAP_MS, stop.signal);
      if (stop.signal.aborted) {
        end = "stopped";
        break;
      }
      let response: Response;
      try {
        response = await fetch(`/api/superadmin/list-uploads/${uploadId}/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supplierId: supplier.id, action: "send" }),
        });
      } catch {
        // No connection: the rest would fail the same way.
        end = "offline";
        break;
      }
      const body = (await response.json().catch(() => ({}))) as { invitation_id?: string; error?: string };
      if (body.invitation_id) onInvited(supplier.id, body.invitation_id);
      if (!response.ok) failed.push({ name: supplier.company_name ?? "Supplier", error: body.error ?? "Sending failed." });
      done = i + 1;
      setSending({ done, failed: [...failed] });
    }
    stopper.current = null;
    setEnding(end);
  }

  function stopSending() {
    setStopping(true);
    stopper.current?.abort();
  }

  const preview = current ? previews[current.id] : undefined;
  const remaining = sending ? queue.length - sending.done : queue.length;
  const minutesLeft = Math.ceil((remaining * SEND_GAP_MS) / 60_000);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      aria-labelledby="invite-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-3xl overflow-hidden rounded-[var(--sa-radius-lg)] border border-[var(--sa-border)] bg-[var(--sa-white)] p-0 text-[var(--sa-ink)] shadow-[var(--sa-shadow-lg)] backdrop:bg-[rgba(30,26,22,0.4)] backdrop:backdrop-blur-[2px]"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="flex items-center gap-3 border-b border-[var(--sa-border)] px-5 py-4">
          <h2 id="invite-title" className="flex-1 text-[17px] font-semibold">
            Invite {queue.length === 1 ? "1 supplier" : `${queue.length} suppliers`}
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            disabled={busy}
            aria-label="Close"
            className="cursor-pointer disabled:cursor-not-allowed! rounded p-1 text-[var(--sa-muted)] hover:bg-[var(--sa-sand)] disabled:opacity-40"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        {sending ? (
          <div className="flex flex-col gap-3 px-5 py-6" aria-live="polite">
            <p className="flex items-center gap-2 text-[13px]">
              {!finished && <Loader2 className="h-4 w-4 animate-spin text-[var(--sa-accent)]" aria-hidden />}
              {finished
                ? endingText(ending, sending.done - sending.failed.length, queue.length - sending.done)
                : stopping
                  ? "Stopping after the email being sent now…"
                  : `Sending ${sending.done + 1} of ${queue.length}… about ${minutesLeft} min left. Keep this page open.`}
            </p>
            <div role="progressbar" aria-label="Sending" aria-valuemin={0} aria-valuemax={queue.length} aria-valuenow={sending.done} className="h-2 overflow-hidden rounded-full bg-[var(--sa-sand)]">
              <div className="h-full rounded-full bg-[var(--sa-accent)] transition-[width]" style={{ width: `${(sending.done / queue.length) * 100}%` }} />
            </div>
            {sending.failed.length > 0 && (
              <ul className="list-disc pl-5 text-[13px] text-[var(--sa-danger-fg)]">
                {sending.failed.map((f, i) => (
                  <li key={i}>{f.name}: {f.error}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--sa-border)] bg-[var(--sa-canvas)] px-5 py-2.5 text-[13px]">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{current?.company_name}</p>
                <p className="truncate text-xs text-[var(--sa-muted)]">To: {current?.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className="cursor-pointer disabled:cursor-not-allowed! rounded p-1.5 hover:bg-[var(--sa-sand)] disabled:opacity-40" disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label="Previous email">
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <span className="text-xs tabular-nums text-[var(--sa-muted)]">{index + 1} of {queue.length}</span>
                <button type="button" className="cursor-pointer disabled:cursor-not-allowed! rounded p-1.5 hover:bg-[var(--sa-sand)] disabled:opacity-40" disabled={index >= queue.length - 1} onClick={() => setIndex(index + 1)} aria-label="Next email">
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
            <div className="min-h-[320px] flex-1 overflow-hidden">
              {!preview ? (
                <p className="flex h-full min-h-[320px] items-center justify-center gap-2 text-[13px] text-[var(--sa-muted)]">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading preview…
                </p>
              ) : "error" in preview ? (
                <p role="alert" className="p-5 text-[13px] text-[var(--sa-danger-fg)]">{preview.error}</p>
              ) : (
                <div className="flex h-full flex-col">
                  <p className="border-b border-[var(--sa-border)] px-5 py-2 text-[13px]"><span className="text-[var(--sa-muted)]">Subject:</span> {preview.subject}</p>
                  <iframe title={`Email to ${current?.company_name ?? "supplier"}`} srcDoc={preview.html} sandbox="" className="h-[55dvh] w-full border-0 bg-white" />
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="flex flex-wrap items-center gap-3 border-t border-[var(--sa-border)] px-5 py-3">
          {sending ? (
            finished ? (
              <button type="button" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-primary ml-auto" onClick={() => dialog.current?.close()}>Close</button>
            ) : (
              <button type="button" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-secondary ml-auto disabled:opacity-50" disabled={stopping} onClick={stopSending}>Stop sending</button>
            )
          ) : (
            <>
              <p className="flex-1 text-xs text-[var(--sa-muted)]">
                Each email is sent with the supplier&apos;s own details. About {minutesLeft} min for all, because of the email limit.
              </p>
              <button type="button" className="cursor-pointer sa-btn-primary" onClick={() => void sendAll()}>
                <Send className="h-4 w-4" aria-hidden /> Send {queue.length === 1 ? "invitation" : `${queue.length} invitations`}
              </button>
            </>
          )}
        </footer>
      </div>
    </dialog>
  );
}

/** The summary once sending ends. Unsent suppliers stay approved, so they can be sent later. */
function endingText(ending: Ending | null, sent: number, unsent: number): string {
  const total = `${String(sent)} sent.`;
  const later = `${unsent === 1 ? "1 was" : `${String(unsent)} were`} not sent: they stay approved, so you can send them later.`;
  if (ending === "stopped" && unsent > 0) return `Stopped. ${total} ${later}`;
  if (ending === "offline") return `Lost the connection to the server. ${total} ${later}`;
  return `Done: ${total}`;
}
