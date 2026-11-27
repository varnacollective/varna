"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronRight, Search, Send, X } from "lucide-react";
import type { Decision, FailedPart, ReviewSupplier } from "@/lib/list-uploads/types";
import InviteDialog from "./InviteDialog";
import { VIEWS, viewInfo, viewOf, type View } from "./labels";
import { formatPhone } from "./format";
import { reasonsOf, type Reason } from "./reasons";
import { errorFrom } from "./read-stream";
import SupplierPanel from "./SupplierPanel";

interface Props {
  initialSuppliers: ReviewSupplier[];
  failedParts: FailedPart[];
  /** When suppliers come from several lists: each list's name, by upload id. */
  sources?: ReadonlyMap<string, string>;
  /** Shown when there are no suppliers at all. */
  emptyText?: string;
}

type Filter = "all" | View;

export default function ReviewView({ initialSuppliers, failedParts, sources, emptyText = "No suppliers were found in this list." }: Props) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const counts = useMemo(() => {
    const c = new Map<Filter, number>([["all", suppliers.length]]);
    for (const s of suppliers) c.set(viewOf(s), (c.get(viewOf(s)) ?? 0) + 1);
    return c;
  }, [suppliers]);

  const reasons = useMemo(() => new Map(suppliers.map((s) => [s.id, reasonsOf(s)])), [suppliers]);

  /** Every reason in this upload, with how many suppliers have it, in table order. */
  const reasonOptions = useMemo(() => {
    const options = new Map<string, { label: string; count: number }>();
    for (const list of reasons.values()) {
      for (const r of list) {
        const option = options.get(r.code);
        if (option) option.count += 1;
        else options.set(r.code, { label: r.label, count: 1 });
      }
    }
    return [...options].map(([code, o]) => ({ code, ...o })).sort((a, b) => a.label.localeCompare(b.label));
  }, [reasons]);
  const activeReason = reasonOptions.some((o) => o.code === reasonFilter) ? reasonFilter : "";

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suppliers.filter(
      (s) =>
        (filter === "all" || viewOf(s) === filter) &&
        (!activeReason || (reasons.get(s.id) ?? []).some((r) => r.code === activeReason)) &&
        (!q || [s.company_name, s.contact_name, s.email, s.phone, s.city, sources?.get(s.upload_id)].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [suppliers, filter, query, reasons, activeReason, sources]);

  const selectable = shown.filter((s) => !s.invitation_id);
  const allSelected = selectable.length > 0 && selectable.every((s) => selected.has(s.id));
  const toInvite = suppliers.filter((s) => s.decision === "approved" && !s.invitation_id);
  const byId = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);
  const open = (openId && byId.get(openId)) || null;

  function replace(updated: ReviewSupplier[]) {
    const byId = new Map(updated.map((s) => [s.id, s]));
    setSuppliers((list) => list.map((s) => byId.get(s.id) ?? s));
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function decide(decision: Decision) {
    setSaving(true);
    setMessage(null);
    try {
      // Decisions are saved per list.
      const byUpload = new Map<string, string[]>();
      for (const id of selected) {
        const uploadId = byId.get(id)?.upload_id;
        if (uploadId) byUpload.set(uploadId, [...(byUpload.get(uploadId) ?? []), id]);
      }
      const updated: string[] = [];
      const skipped: { id: string; reason: string }[] = [];
      for (const [uploadId, ids] of byUpload) {
        const response = await fetch(`/api/superadmin/list-uploads/${uploadId}/suppliers`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, decision }),
        });
        if (!response.ok) throw new Error(await errorFrom(response));
        const result = (await response.json()) as { updated: string[]; skipped: { id: string; reason: string }[] };
        updated.push(...result.updated);
        skipped.push(...result.skipped);
        // Show each list's result as soon as it is saved.
        const saved = new Set(result.updated);
        setSuppliers((list) => list.map((s) => (saved.has(s.id) ? { ...s, decision } : s)));
      }
      const done = new Set(updated);
      setSuppliers((list) => list.map((s) => (done.has(s.id) ? { ...s, decision } : s)));
      setSelected(new Set(skipped.map((s) => s.id)));
      if (skipped.length > 0) {
        setMessage({
          tone: "info",
          text: `${skipped.length} not ${decision === "approved" ? "approved" : "changed"}: ${[...new Set(skipped.map((s) => s.reason))].join(" ")} They are still selected.`,
        });
      }
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Saving failed." });
    } finally {
      setSaving(false);
    }
  }

  const filters: { key: Filter; label: string }[] = [{ key: "all", label: "All" }, ...VIEWS.map((v) => ({ key: v.view, label: v.label }))];

  // Nothing to filter, select or invite: just say so.
  if (suppliers.length === 0 && failedParts.length === 0) {
    return <p className="sa-card p-8 text-center text-[13px] text-[var(--sa-muted)]">{emptyText}</p>;
  }

  return (
    <div className="@container flex flex-col gap-4">
      {failedParts.length > 0 && (
        <div role="alert" className="flex gap-3 rounded-[var(--sa-radius-sm)] border border-[var(--sa-warning)] bg-[var(--sa-warning-tint)] px-4 py-3 text-[13px] text-[var(--sa-warning-fg)]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="font-medium">Some parts could not be read. Check them by hand:</p>
            <ul className="mt-1 list-disc pl-5">
              {failedParts.map((f, i) => (
                <li key={i} className="break-words">{f.fileName}, {f.part}: {f.message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 @7xl:flex-row @7xl:items-center @7xl:justify-between">
        <div role="group" aria-label="Show" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {filters.map(({ key, label }) => {
            const count = counts.get(key) ?? 0;
            if (key !== "all" && count === 0) return null;
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(key)}
                className={`cursor-pointer disabled:cursor-not-allowed! shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-[var(--sa-accent)] bg-[var(--sa-accent-tint)] text-[var(--sa-accent)]"
                    : "border-[var(--sa-border)] bg-[var(--sa-white)] text-[var(--sa-ink-2)] hover:bg-[var(--sa-sand)]"
                }`}
              >
                {label} <span className="tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 @xl:flex-row @xl:items-center">
          {reasonOptions.length > 0 && (
            <div className="@xl:w-52">
              <select
                className="sa-input"
                aria-label="Filter by reason"
                value={activeReason}
                onChange={(e) => setReasonFilter(e.target.value)}
              >
                <option value="">Any reason</option>
                {reasonOptions.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.label} ({o.count})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="relative @xl:min-w-48 @xl:flex-1 @7xl:w-64 @7xl:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sa-caption)]" aria-hidden />
            <input
              type="search"
              className="sa-input"
              style={{ paddingLeft: 34 }}
              placeholder="Search suppliers"
              aria-label="Search suppliers"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="cursor-pointer disabled:cursor-not-allowed! sa-btn-primary justify-center whitespace-nowrap disabled:opacity-50"
            disabled={toInvite.length === 0}
            onClick={() => setInviting(true)}
          >
            <Send className="h-4 w-4" aria-hidden /> Invite approved ({toInvite.length})
          </button>
        </div>
      </div>

      {message && (
        <div
          role={message.tone === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-3 rounded-[var(--sa-radius-sm)] border px-4 py-3 text-[13px] ${
            message.tone === "error"
              ? "border-[var(--sa-danger)] bg-[var(--sa-danger-tint)] text-[var(--sa-danger-fg)]"
              : "border-[var(--sa-info)] bg-[var(--sa-info-tint)] text-[var(--sa-info-fg)]"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss" className="cursor-pointer disabled:cursor-not-allowed! shrink-0 rounded p-0.5 hover:bg-black/5">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-[var(--sa-radius-md)] border border-[var(--sa-border-strong)] bg-[var(--sa-white)] px-4 py-2.5 shadow-[var(--sa-shadow-md)]">
          <span className="mr-auto text-[13px] font-medium text-[var(--sa-ink)]">{selected.size} selected</span>
          <button type="button" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-primary disabled:opacity-50" disabled={saving} onClick={() => void decide("approved")}>
            <Check className="h-4 w-4" aria-hidden /> Approve
          </button>
          <button type="button" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-secondary disabled:opacity-50" disabled={saving} onClick={() => void decide("rejected")}>
            Reject
          </button>
          <button type="button" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-secondary" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="sa-card p-8 text-center text-[13px] text-[var(--sa-muted)]">
          {suppliers.length === 0 ? emptyText : "No suppliers match."}
        </p>
      ) : (
        <div className="sa-card overflow-x-auto">
          {/* Wide enough: a table. */}
          <table className="sa-table hidden @2xl:table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all shown"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? new Set() : new Set(selectable.map((s) => s.id)))}
                    className="cursor-pointer disabled:cursor-not-allowed! h-4 w-4 accent-[var(--sa-accent)]"
                  />
                </th>
                <th>Status</th>
                <th>Reason</th>
                <th>Company</th>
                <th className="hidden @4xl:table-cell">Contact</th>
                <th>Email</th>
                <th className="hidden @6xl:table-cell">Phone</th>
                <th className="hidden @7xl:table-cell">City</th>
                {sources && <th className="hidden @5xl:table-cell">List</th>}
                <th className="w-10"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => {
                const view = viewInfo(viewOf(s));
                return (
                  <tr key={s.id} className="cursor-pointer" onClick={() => setOpenId(s.id)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${s.company_name ?? "supplier"}`}
                        disabled={!!s.invitation_id}
                        checked={selected.has(s.id)}
                        onChange={() => toggle(s.id)}
                        className="cursor-pointer disabled:cursor-not-allowed! h-4 w-4 accent-[var(--sa-accent)]"
                      />
                    </td>
                    <td><span className={`sa-pill whitespace-nowrap ${view.pill}`}>{view.label}</span></td>
                    <td className="max-w-60"><Reasons reasons={reasons.get(s.id) ?? []} /></td>
                    <td className="max-w-56 truncate font-medium text-[var(--sa-ink)]">{s.company_name ?? <Missing />}</td>
                    <td className="hidden max-w-40 truncate @4xl:table-cell">{s.contact_name ?? <Missing />}</td>
                    <td className="max-w-60 truncate">{s.email ?? <Missing />}</td>
                    <td className="hidden whitespace-nowrap @6xl:table-cell">{formatPhone(s.phone) ?? <Missing />}</td>
                    <td className="hidden max-w-32 truncate @7xl:table-cell">{s.city ?? <Missing />}</td>
                    {sources && (
                      <td className="hidden max-w-48 truncate text-[var(--sa-muted)] @5xl:table-cell" title={sources.get(s.upload_id)}>
                        {sources.get(s.upload_id) ?? <Missing />}
                      </td>
                    )}
                    <td>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenId(s.id);
                        }}
                        aria-label={`Open ${s.company_name ?? "supplier"}`}
                        className="cursor-pointer disabled:cursor-not-allowed! rounded p-1 text-[var(--sa-muted)] hover:bg-[var(--sa-sand-hover)]"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Narrow: cards. */}
          <ul className="divide-y divide-[var(--sa-border)] @2xl:hidden">
            {shown.map((s) => {
              const view = viewInfo(viewOf(s));
              // The card already says "No company name" / "No email" in their own lines.
              const cardReasons = (reasons.get(s.id) ?? []).filter((r) => r.code !== "missing_name" && r.code !== "missing_email");
              return (
                <li key={s.id} className="flex items-start gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${s.company_name ?? "supplier"}`}
                    disabled={!!s.invitation_id}
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                    className="cursor-pointer disabled:cursor-not-allowed! mt-1 h-4 w-4 shrink-0 accent-[var(--sa-accent)]"
                  />
                  <button type="button" onClick={() => setOpenId(s.id)} className="cursor-pointer disabled:cursor-not-allowed! flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-[14px] font-medium text-[var(--sa-ink)]">{s.company_name ?? "No company name"}</span>
                      <span className={`sa-pill shrink-0 ${view.pill}`}>{view.label}</span>
                    </span>
                    {cardReasons.length > 0 && (
                      <span className="w-full text-xs">
                        <Reasons reasons={cardReasons} />
                      </span>
                    )}
                    <span className="w-full truncate text-xs text-[var(--sa-ink-2)]">{s.email ?? "No email"}</span>
                    <span className="w-full truncate text-xs text-[var(--sa-muted)]">
                      {[s.contact_name, formatPhone(s.phone), s.city].filter(Boolean).join(" · ") || "No other details"}
                    </span>
                    {sources?.get(s.upload_id) && (
                      <span className="w-full truncate text-xs text-[var(--sa-caption)]">From {sources.get(s.upload_id)}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {open && (
        <SupplierPanel
          key={open.id}
          supplier={open}
          suppliers={byId}
          onSaved={replace}
          onOpen={setOpenId}
          onClose={() => setOpenId(null)}
        />
      )}
      {inviting && (
        <InviteDialog
          suppliers={toInvite}
          onInvited={(id, invitationId) =>
            setSuppliers((list) => list.map((s) => (s.id === id ? { ...s, invitation_id: invitationId } : s)))
          }
          onClose={() => setInviting(false)}
        />
      )}
    </div>
  );
}

/** The main reason in full, then how many more; all of them on hover and for screen readers. */
function Reasons({ reasons }: { reasons: readonly Reason[] }) {
  const [first, ...rest] = reasons;
  if (!first) return <Missing />;
  const all = reasons.map((r) => r.label).join(", ");
  return (
    <span title={rest.length > 0 ? all : undefined} className="flex min-w-0 items-baseline gap-1.5">
      <span
        className={`truncate ${first.level === "attention" ? "font-medium text-[var(--sa-warning-fg)]" : "text-[var(--sa-muted)]"}`}
        aria-hidden={rest.length > 0}
      >
        {first.label}
      </span>
      {rest.length > 0 && (
        <>
          <span className="shrink-0 whitespace-nowrap text-[var(--sa-caption)]" aria-hidden>
            +{rest.length} more
          </span>
          <span className="sr-only">{all}</span>
        </>
      )}
    </span>
  );
}

function Missing() {
  return <span className="text-[var(--sa-caption)]">—</span>;
}
