"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Search } from "lucide-react";
import { hotelHref, NO_HOTEL, type HotelRow } from "@/lib/list-uploads/hotels";
import NewHotelDialog from "./NewHotelDialog";

const LETTERS = [...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), "#"];

function letterOf(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return first >= "A" && first <= "Z" ? first : "#";
}

/** What a hotel has, in words. */
function describe(h: HotelRow): string {
  if (h.uploads === 0) return "No lists yet";
  const toCheck = h.counts.needs_attention + h.counts.missing_contact;
  return [
    `${h.uploads} ${h.uploads === 1 ? "list" : "lists"}`,
    `${h.counts.total} ${h.counts.total === 1 ? "supplier" : "suppliers"}`,
    ...(toCheck > 0 ? [`${toCheck} to check`] : []),
    `${h.counts.invited} invited`,
  ].join(" · ");
}

/** Every hotel A–Z: search, jump to a letter, or add a new hotel. */
export default function HotelDirectory({ hotels }: { hotels: HotelRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<{ name: string } | null>(null);

  const q = query.trim().toLowerCase();
  const noHotel = hotels.find((h) => h.id === NO_HOTEL);
  const groups = useMemo(() => {
    const byLetter = new Map<string, HotelRow[]>();
    for (const h of hotels) {
      if (h.id === NO_HOTEL) continue;
      if (q && !h.name.toLowerCase().includes(q) && !h.id.toLowerCase().includes(q)) continue;
      const letter = letterOf(h.name);
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), h]);
    }
    return LETTERS.filter((l) => byLetter.has(l)).map((l) => ({ letter: l, hotels: byLetter.get(l) ?? [] }));
  }, [hotels, q]);
  const present = new Set(groups.map((g) => g.letter));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sa-caption)]" aria-hidden />
          <input
            type="search"
            className="sa-input"
            style={{ paddingLeft: 34 }}
            placeholder="Search hotels"
            aria-label="Search hotels"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="button" onClick={() => setAdding({ name: "" })} className="cursor-pointer sa-btn-secondary justify-center whitespace-nowrap">
          <Plus className="h-4 w-4" aria-hidden /> New hotel
        </button>
      </div>

      <div className="flex gap-2">
        <div className="sa-card min-w-0 flex-1 overflow-hidden">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center text-[13px] text-[var(--sa-muted)]">
              <p>{q ? `No hotel matches “${query.trim()}”.` : "No hotels yet."}</p>
              <button type="button" onClick={() => setAdding({ name: query.trim() })} className="cursor-pointer sa-btn-secondary">
                <Plus className="h-4 w-4" aria-hidden /> {q ? `Add “${query.trim()}” as a new hotel` : "New hotel"}
              </button>
            </div>
          ) : (
            groups.map((g) => (
              <section key={g.letter} aria-labelledby={`letter-${g.letter}`}>
                <h2
                  id={`letter-${g.letter}`}
                  className="scroll-mt-20 border-y border-[var(--sa-border)] bg-[var(--sa-canvas)] px-4 py-1 text-xs font-semibold text-[var(--sa-muted)] first:border-t-0"
                >
                  {g.letter}
                </h2>
                <ul className="divide-y divide-[var(--sa-border)]">
                  {g.hotels.map((h) => (
                    <li key={h.id}>
                      <HotelLink hotel={h} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <nav aria-label="Jump to a letter" className="sticky top-4 flex shrink-0 flex-col self-start">
          {LETTERS.map((l) => (
            <button
              key={l}
              type="button"
              disabled={!present.has(l)}
              aria-label={l === "#" ? "Other hotels" : `Hotels starting with ${l}`}
              onClick={() => document.getElementById(`letter-${l}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="cursor-pointer disabled:cursor-default! w-6 rounded py-px text-center text-[11px] font-semibold leading-4 text-[var(--sa-accent)] hover:bg-[var(--sa-accent-tint)] disabled:text-[var(--sa-border-strong)] disabled:hover:bg-transparent"
            >
              {l}
            </button>
          ))}
        </nav>
      </div>

      {noHotel && !q && (
        <div className="sa-card overflow-hidden">
          <HotelLink hotel={noHotel} label="Lists uploaded without a hotel" />
        </div>
      )}

      {adding && (
        <NewHotelDialog
          initialName={adding.name}
          onClose={() => setAdding(null)}
          onCreated={(hotel) => {
            setAdding(null);
            router.push(hotelHref(hotel.id));
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function HotelLink({ hotel, label }: { hotel: HotelRow; label?: string }) {
  const toCheck = hotel.counts.needs_attention + hotel.counts.missing_contact;
  return (
    <Link href={hotelHref(hotel.id)} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--sa-sand)]">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[14px] font-medium text-[var(--sa-ink)]">{label ?? hotel.name}</span>
        <span className={`truncate text-xs ${toCheck > 0 ? "text-[var(--sa-ink-2)]" : "text-[var(--sa-muted)]"}`}>{describe(hotel)}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sa-muted)]" aria-hidden />
    </Link>
  );
}
