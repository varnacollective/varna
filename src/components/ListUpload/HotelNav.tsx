"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { hotelHref, NO_HOTEL, type HotelRow } from "@/lib/list-uploads/hotels";
import NewHotelDialog from "./NewHotelDialog";

interface Props {
  hotels: HotelRow[];
  selectedId: string | null;
}

/** Hotels to choose from: a list beside the page on wide screens, a menu on phones. */
export default function HotelNav({ hotels, selectedId }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const q = query.trim().toLowerCase();
  const shown = hotels.filter((h) => !q || h.name.toLowerCase().includes(q) || h.id.toLowerCase().includes(q));

  const newHotel = (
    <button
      type="button"
      onClick={() => setAdding(true)}
      className="cursor-pointer sa-btn-secondary justify-center whitespace-nowrap"
    >
      <Plus className="h-4 w-4" aria-hidden /> New hotel
    </button>
  );

  return (
    <>
      {/* Phones and tablets: a menu. */}
      <div className="flex items-end gap-2 lg:hidden">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="hotel-menu" className="sa-label">Hotel</label>
          <select
            id="hotel-menu"
            className="cursor-pointer sa-input"
            value={selectedId ?? ""}
            onChange={(e) => router.push(hotelHref(e.target.value || null))}
          >
            <option value="">All hotels</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
                {h.counts.total > 0 ? ` (${h.counts.total})` : ""}
              </option>
            ))}
          </select>
        </div>
        {newHotel}
      </div>

      {/* Wide screens: a list. */}
      <nav aria-label="Hotels" className="sa-card hidden flex-col gap-3 self-start p-3 lg:sticky lg:top-4 lg:flex">
        {hotels.length > 8 && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sa-caption)]" aria-hidden />
            <input
              type="search"
              className="sa-input"
              style={{ paddingLeft: 34 }}
              placeholder="Find a hotel"
              aria-label="Find a hotel"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}
        <ul className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto">
          <li>
            <HotelLink href={hotelHref()} active={!selectedId} name="All hotels" />
          </li>
          {shown.map((h) => (
            <li key={h.id}>
              <HotelLink
                href={hotelHref(h.id)}
                active={h.id === selectedId}
                name={h.name}
                muted={h.id === NO_HOTEL}
                count={h.counts.total}
              />
            </li>
          ))}
          {shown.length === 0 && <li className="px-3 py-2 text-[13px] text-[var(--sa-muted)]">No hotel matches.</li>}
        </ul>
        {newHotel}
      </nav>

      {adding && (
        <NewHotelDialog
          onClose={() => setAdding(false)}
          onCreated={(hotel) => {
            setAdding(false);
            router.push(hotelHref(hotel.id));
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function HotelLink({ href, active, name, muted = false, count }: { href: string; active: boolean; name: string; muted?: boolean; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between gap-2 rounded-[var(--sa-radius-sm)] px-3 py-2 text-[13px] transition-colors ${
        active
          ? "bg-[var(--sa-accent-tint)] font-medium text-[var(--sa-accent)]"
          : `${muted ? "italic text-[var(--sa-muted)]" : "text-[var(--sa-ink-2)]"} hover:bg-[var(--sa-sand)]`
      }`}
    >
      <span className="min-w-0 truncate">{name}</span>
      {count !== undefined && count > 0 && (
        <span className="shrink-0 text-xs tabular-nums opacity-70">{count}</span>
      )}
    </Link>
  );
}
