"use client";

import { useRef, useState, type PointerEvent } from "react";
import { LETTERS, nearestLetter } from "./letters";

interface Props {
  /** Letters that have hotels. */
  present: ReadonlySet<string>;
  /** Shows the hotels under this letter. */
  onJump: (letter: string) => void;
}

/**
 * A–Z beside the list. Tap a letter, or press and drag along the strip like a
 * scrollbar; a letter with no hotels goes to the nearest one that has some.
 */
export default function LetterStrip({ present, onJump }: Props) {
  const [dragging, setDragging] = useState<string | null>(null);
  const last = useRef<string | null>(null);
  // Where the strip was when pressed. The page scrolls while dragging and the
  // strip may slide up to stick at the top; measuring from here keeps each
  // finger position on the same letter, like a scrollbar.
  const pressedAt = useRef<DOMRect | null>(null);

  function jumpAt(clientY: number) {
    const box = pressedAt.current;
    if (!box) return;
    const index = Math.floor(((clientY - box.top) / box.height) * LETTERS.length);
    const target = nearestLetter(index, present);
    // The bubble shows the letter under the finger; the list shows the nearest hotels.
    setDragging(LETTERS[Math.min(Math.max(index, 0), LETTERS.length - 1)] ?? null);
    if (target && target !== last.current) {
      last.current = target;
      onJump(target);
    }
  }

  function start(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pressedAt.current = event.currentTarget.getBoundingClientRect();
    last.current = null;
    jumpAt(event.clientY);
  }

  function end() {
    setDragging(null);
    pressedAt.current = null;
    last.current = null;
  }

  return (
    <div className="sticky top-4 shrink-0 self-start">
      <div
        role="navigation"
        aria-label="Jump to a letter"
        onPointerDown={start}
        onPointerMove={(e) => {
          if (dragging !== null) jumpAt(e.clientY);
        }}
        onPointerUp={end}
        onPointerCancel={end}
        className="flex cursor-pointer touch-none select-none flex-col rounded-full py-1 hover:bg-[var(--sa-accent-tint)]"
      >
        {LETTERS.map((l) => (
          <button
            key={l}
            type="button"
            // Keyboard: Tab to a letter, Enter to jump. Pointer presses are handled by the strip.
            onClick={(e) => {
              if (e.detail === 0) {
                const target = nearestLetter(LETTERS.indexOf(l), present);
                if (target) onJump(target);
              }
            }}
            aria-label={l === "#" ? "Other hotels" : `Hotels starting with ${l}`}
            className={`w-6 rounded py-px text-center text-[11px] font-semibold leading-4 ${
              present.has(l) ? "text-[var(--sa-accent)]" : "text-[var(--sa-caption)]"
            } ${dragging === l ? "scale-125" : ""}`}
          >
            {l}
          </button>
        ))}
      </div>
      {dragging && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-9 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--sa-accent)] text-xl font-semibold text-white shadow-[var(--sa-shadow-md)]"
        >
          {dragging}
        </span>
      )}
    </div>
  );
}
