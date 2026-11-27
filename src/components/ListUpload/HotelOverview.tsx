import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { hotelHref, NO_HOTEL, type HotelRow } from "@/lib/list-uploads/hotels";
import Count from "./Count";
import { formatWhen } from "./format";

/** Every hotel with its lists and suppliers counted; each opens the hotel. */
export default function HotelOverview({ hotels }: { hotels: HotelRow[] }) {
  if (hotels.length === 0) {
    return <p className="sa-card p-8 text-center text-[13px] text-[var(--sa-muted)]">No hotels yet. Add one with “New hotel”.</p>;
  }
  return (
    <div className="@container sa-card overflow-x-auto">
      {/* Wide enough: a table. */}
      <table className="sa-table hidden @3xl:table">
        <thead>
          <tr>
            <th>Hotel</th>
            <th className="text-right">Lists</th>
            <th className="text-right">Suppliers</th>
            <th className="text-right">Ready</th>
            <th className="text-right">Needs attention</th>
            <th className="text-right">Missing email</th>
            <th className="text-right">Invited</th>
            <th className="hidden @5xl:table-cell">Last upload</th>
            <th className="w-10"><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((h) => (
            <tr key={h.id} className="relative">
              <td className="max-w-64">
                {/* The whole row is the link, for mouse and keyboard alike. */}
                <Link href={hotelHref(h.id)} className="block truncate font-medium text-[var(--sa-ink)] after:absolute after:inset-0 hover:text-[var(--sa-accent)]">
                  <span className={h.id === NO_HOTEL ? "italic text-[var(--sa-muted)]" : undefined}>{h.name}</span>
                </Link>
              </td>
              <td className="text-right"><Count value={h.uploads} /></td>
              <td className="text-right"><Count value={h.counts.total} /></td>
              <td className="text-right"><Count value={h.counts.ready} /></td>
              <td className="text-right"><Count value={h.counts.needs_attention} tone="attention" /></td>
              <td className="text-right"><Count value={h.counts.missing_contact} tone="attention" /></td>
              <td className="text-right"><Count value={h.counts.invited} /></td>
              <td className="hidden whitespace-nowrap text-[var(--sa-muted)] @5xl:table-cell">
                {h.lastUploadAt ? formatWhen(h.lastUploadAt, false) : "—"}
              </td>
              <td className="text-[var(--sa-muted)]"><ChevronRight className="h-4 w-4" aria-hidden /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Narrow: cards. */}
      <ul className="divide-y divide-[var(--sa-border)] @3xl:hidden">
        {hotels.map((h) => (
          <li key={h.id}>
            <Link href={hotelHref(h.id)} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--sa-sand)]">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={`truncate text-[14px] font-medium ${h.id === NO_HOTEL ? "italic text-[var(--sa-muted)]" : "text-[var(--sa-ink)]"}`}>{h.name}</span>
                <span className="truncate text-xs text-[var(--sa-muted)]">
                  {h.uploads === 0
                    ? "No lists yet"
                    : `${h.uploads} ${h.uploads === 1 ? "list" : "lists"} · ${h.counts.total} suppliers · ${h.counts.ready} ready · ${h.counts.invited} invited`}
                </span>
                {h.counts.needs_attention + h.counts.missing_contact > 0 && (
                  <span className="text-xs font-medium text-[var(--sa-warning-fg)]">
                    {h.counts.needs_attention + h.counts.missing_contact} to check
                  </span>
                )}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sa-muted)]" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
