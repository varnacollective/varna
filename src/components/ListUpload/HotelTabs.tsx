import Link from "next/link";
import { hotelHref, type HotelRow, type Tab } from "@/lib/list-uploads/hotels";

const STATS: { key: "total" | "ready" | "needs_attention" | "missing_contact" | "invited"; label: string; attention?: boolean }[] = [
  { key: "total", label: "Suppliers" },
  { key: "ready", label: "Ready" },
  { key: "needs_attention", label: "Needs attention", attention: true },
  { key: "missing_contact", label: "Missing email", attention: true },
  { key: "invited", label: "Invited" },
];

/** A hotel's supplier counts, then the Suppliers / Uploaded lists tabs. */
export default function HotelTabs({ hotel, tab }: { hotel: HotelRow; tab: Tab }) {
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "suppliers", label: "Suppliers", count: hotel.counts.total },
    { key: "lists", label: "Uploaded lists", count: hotel.uploads },
  ];
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-3 gap-2 sm:gap-3 xl:grid-cols-5">
        {STATS.map((s) => {
          const value = hotel.counts[s.key];
          return (
            <div key={s.key} className="sa-stat-card px-3! py-2.5! sm:px-4! sm:py-3.5!">
              <dd className={`sa-stat-value text-[22px]! sm:text-[28px]! ${s.attention && value > 0 ? "text-[var(--sa-warning-fg)]!" : ""}`}>{value}</dd>
              <dt className="sa-stat-label text-[10px]! leading-tight sm:text-[11px]!">{s.label}</dt>
            </div>
          );
        })}
      </dl>

      <nav aria-label="Hotel sections" className="flex gap-1 border-b border-[var(--sa-border)]">
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <Link
              key={t.key}
              href={hotelHref(hotel.id, t.key)}
              aria-current={active ? "page" : undefined}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? "border-[var(--sa-accent)] text-[var(--sa-accent)]"
                  : "border-transparent text-[var(--sa-muted)] hover:text-[var(--sa-ink)]"
              }`}
            >
              {t.label} <span className="tabular-nums opacity-70">{t.count}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
