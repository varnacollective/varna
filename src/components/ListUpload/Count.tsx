/** A count in a table; zero is shown faintly so the numbers that matter stand out. */
export default function Count({ value, tone }: { value: number; tone?: "attention" }) {
  if (value === 0) return <span className="text-[var(--sa-caption)]">0</span>;
  return (
    <span className={`tabular-nums ${tone === "attention" ? "font-medium text-[var(--sa-warning-fg)]" : "text-[var(--sa-ink)]"}`}>
      {value}
    </span>
  );
}
