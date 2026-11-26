"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/** The most pages drawn in a preview (the reader accepts up to 50). */
const MAX_PAGES = 50;

/**
 * Draws each page of a PDF with pdf.js, so it looks the same in every
 * browser, phones included (many can't show a PDF inside a page).
 * Scrolls to `page` once it is drawn.
 */
export default function PdfPages({ data, page }: { data: Blob; page?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ drawn: number; total: number } | { error: string } | null>(null);

  useEffect(() => {
    const container = box.current;
    if (!container) return;
    let cancelled = false;
    let destroy: (() => void) | undefined;

    void (async () => {
      try {
        // The legacy build works in older browsers too (Safari on older iPhones).
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
        const task = pdfjs.getDocument({ data: new Uint8Array(await data.arrayBuffer()) });
        destroy = () => void task.destroy();
        const doc = await task.promise;
        const total = Math.min(doc.numPages, MAX_PAGES);
        const ratio = window.devicePixelRatio || 1;
        const width = Math.max(240, container.clientWidth - 32);

        for (let n = 1; n <= total && !cancelled; n++) {
          const pdfPage = await doc.getPage(n);
          const base = pdfPage.getViewport({ scale: 1 });
          const scale = Math.min(width / base.width, 1.6);
          const viewport = pdfPage.getViewport({ scale: scale * ratio });

          const figure = document.createElement("figure");
          figure.className = "flex flex-col items-center gap-1";
          figure.dataset.page = String(n);
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${Math.floor(viewport.width / ratio)}px`;
          canvas.style.height = `${Math.floor(viewport.height / ratio)}px`;
          canvas.className = "max-w-full bg-white shadow-[var(--sa-shadow-md)]";
          canvas.setAttribute("role", "img");
          canvas.setAttribute("aria-label", `Page ${n}`);
          const caption = document.createElement("figcaption");
          caption.className = "text-xs text-[var(--sa-caption)]";
          caption.textContent = `Page ${n} of ${doc.numPages}`;
          figure.append(canvas, caption);
          container.append(figure);

          await pdfPage.render({ canvas, viewport }).promise;
          if (cancelled) return;
          setState({ drawn: n, total });
          if (n === page) figure.scrollIntoView({ block: "start" });
        }
      } catch (error) {
        if (cancelled) return;
        console.warn("PDF preview failed:", error);
        setState({ error: "This PDF could not be shown. Download it to open it." });
      }
    })();

    return () => {
      cancelled = true;
      destroy?.();
      container.replaceChildren();
    };
  }, [data, page]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div ref={box} className="flex flex-col gap-6" />
      {state === null || ("drawn" in state && state.drawn < state.total) ? (
        <p className="flex items-center justify-center gap-2 text-[13px] text-[var(--sa-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Drawing pages…
        </p>
      ) : "error" in state ? (
        <p role="alert" className="text-[13px] text-[var(--sa-danger-fg)]">{state.error}</p>
      ) : null}
    </div>
  );
}
