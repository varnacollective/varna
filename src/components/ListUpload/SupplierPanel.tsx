"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, Check, Eye, FileSearch, Info, Undo2, X } from "lucide-react";
import {
  EDITABLE_FIELDS,
  type Decision,
  type EditableField,
  type ReviewSupplier,
} from "@/lib/list-uploads/types";
import { FIELD_LABELS, viewInfo, viewOf } from "./labels";
import FilePreview, { type PreviewTarget } from "./FilePreview";
import { errorFrom } from "./read-stream";
import { uploadedFile } from "./uploaded-file";

interface Props {
  uploadId: string;
  supplier: ReviewSupplier;
  onSaved: (supplier: ReviewSupplier) => void;
  onClose: () => void;
}

type Draft = Record<EditableField, string>;

const draftOf = (s: ReviewSupplier): Draft =>
  Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, s[f] ?? ""])) as Draft;

/** One supplier: what was found, where it came from, and the decision. */
export default function SupplierPanel({ uploadId, supplier, onSaved, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft>(() => draftOf(supplier));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewTarget | null>(null);
  const locked = !!supplier.invitation_id;
  const view = viewInfo(viewOf(supplier));
  const changed = EDITABLE_FIELDS.filter((f) => draft[f].trim() !== (supplier[f] ?? ""));

  // Open as a modal once mounted. No close() on cleanup: its "close" event
  // would tell the parent to remove this dialog again.
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  // A saved supplier comes back from the server: show its values.
  const [shownSupplier, setShownSupplier] = useState(supplier);
  if (supplier !== shownSupplier) {
    setShownSupplier(supplier);
    setDraft(draftOf(supplier));
  }

  async function save(body: { fields?: Partial<Record<EditableField, string | null>>; decision?: Decision }) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/superadmin/list-uploads/${uploadId}/suppliers/${supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await errorFrom(response));
      onSaved(((await response.json()) as { supplier: ReviewSupplier }).supplier);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  const fields = () => Object.fromEntries(changed.map((f) => [f, draft[f].trim() || null]));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (changed.length > 0) void save({ fields: fields() });
  }

  /** Saves any edits together with the decision, so nothing typed is lost. */
  function decide(decision: Decision) {
    void save({ ...(changed.length > 0 ? { fields: fields() } : {}), decision });
  }

  const { evidence } = supplier;
  const where = [
    evidence.fileName,
    evidence.page ? `page ${evidence.page}` : evidence.sheet && evidence.sheet !== "Text" ? `sheet "${evidence.sheet}"` : null,
    evidence.row ? `row ${evidence.row}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="supplier-title"
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-[520px] overflow-hidden border-l border-[var(--sa-border)] bg-[var(--sa-white)] p-0 text-[var(--sa-ink)] shadow-[var(--sa-shadow-lg)] backdrop:bg-[rgba(30,26,22,0.4)] backdrop:backdrop-blur-[2px]"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start gap-3 border-b border-[var(--sa-border)] px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="supplier-title" className="break-words text-[17px] font-semibold">
              {supplier.company_name ?? "No company name"}
            </h2>
            <span className={`sa-pill mt-1 ${view.pill}`}>{view.label}</span>
          </div>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="cursor-pointer disabled:cursor-not-allowed! rounded p-1 text-[var(--sa-muted)] hover:bg-[var(--sa-sand)]">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {supplier.issues.length > 0 && (
            <ul className="mb-5 flex flex-col gap-1.5">
              {supplier.issues.map((issue, i) => (
                <li
                  key={`${issue.code}-${i}`}
                  className={`flex items-start gap-2 rounded-[var(--sa-radius-sm)] px-3 py-2 text-[13px] ${
                    issue.level === "attention"
                      ? "bg-[var(--sa-warning-tint)] text-[var(--sa-warning-fg)]"
                      : "bg-[var(--sa-sand)] text-[var(--sa-ink-2)]"
                  }`}
                >
                  {issue.level === "attention" ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  ) : (
                    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  )}
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          )}

          <form id="supplier-form" onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EDITABLE_FIELDS.map((field) => (
              <div key={field} className={`flex flex-col gap-1 ${field === "company_name" || field === "email" ? "sm:col-span-2" : ""}`}>
                <label htmlFor={`field-${field}`} className="sa-label">{FIELD_LABELS[field]}</label>
                <input
                  id={`field-${field}`}
                  className="sa-input"
                  type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                  value={draft[field]}
                  disabled={locked || saving}
                  onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
                />
                {field === "email" && supplier.other_emails.length > 0 && (
                  <OtherValues
                    values={supplier.other_emails}
                    disabled={locked || saving}
                    onUse={(email) => setDraft({ ...draft, email })}
                  />
                )}
                {field === "phone" && supplier.other_phones.length > 0 && (
                  <OtherValues
                    values={supplier.other_phones}
                    disabled={locked || saving}
                    onUse={(phone) => setDraft({ ...draft, phone })}
                  />
                )}
              </div>
            ))}
          </form>

          <section aria-labelledby="evidence-title" className="mt-6 rounded-[var(--sa-radius-md)] border border-[var(--sa-border)] bg-[var(--sa-canvas)] p-4">
            <h3 id="evidence-title" className="flex items-center gap-2 text-[13px] font-semibold">
              <FileSearch className="h-4 w-4 text-[var(--sa-accent)]" aria-hidden /> Where did this come from?
            </h3>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 break-words text-xs text-[var(--sa-muted)]">{where}</p>
              {supplier.file_id && (
                <button
                  type="button"
                  onClick={() =>
                    setPreview({
                      name: evidence.fileName,
                      load: uploadedFile(uploadId, supplier.file_id ?? ""),
                      ...(evidence.page
                        ? { page: evidence.page }
                        : { ...(evidence.sheet ? { sheet: evidence.sheet } : {}), ...(evidence.row ? { row: evidence.row } : {}) }),
                    })
                  }
                  className="cursor-pointer inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-[var(--sa-accent)] hover:bg-[var(--sa-accent-tint)]"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden /> Open file{evidence.page ? ` at page ${evidence.page}` : evidence.row ? ` at row ${evidence.row}` : ""}
                </button>
              )}
            </div>
            {evidence.readFromImage && (
              <p className="mt-2 text-xs text-[var(--sa-warning-fg)]">Read by AI from a PDF or photo. Compare with the original page.</p>
            )}
            {evidence.cells.length > 0 && (
              <table className="mt-3 w-full text-xs">
                <caption className="sr-only">Text of the cells this supplier came from</caption>
                <tbody>
                  {evidence.cells.map(({ cell, text }) => (
                    <tr key={cell} className="border-t border-[var(--sa-border)] first:border-t-0">
                      <th scope="row" className="w-12 py-1.5 pr-3 text-left align-top font-mono font-normal text-[var(--sa-caption)]">{cell}</th>
                      <td className="whitespace-pre-wrap break-words py-1.5 text-[var(--sa-ink-2)]">{text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {error && (
            <p role="alert" className="mt-4 rounded-[var(--sa-radius-sm)] bg-[var(--sa-danger-tint)] px-3 py-2 text-[13px] text-[var(--sa-danger-fg)]">
              {error}
            </p>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-[var(--sa-border)] px-5 py-3">
          {locked ? (
            <p className="text-[13px] text-[var(--sa-muted)]">Invited. Changes are made from the Invitations list.</p>
          ) : (
            <>
              {changed.length > 0 && (
                <button type="submit" form="supplier-form" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-secondary mr-auto disabled:opacity-50" disabled={saving}>
                  Save changes
                </button>
              )}
              <div className="ml-auto flex gap-2">
                {supplier.decision === "pending" ? (
                  <>
                    <button type="button" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-secondary disabled:opacity-50" disabled={saving} onClick={() => decide("rejected")}>
                      Reject
                    </button>
                    <button type="button" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-primary disabled:opacity-50" disabled={saving} onClick={() => decide("approved")}>
                      <Check className="h-4 w-4" aria-hidden /> Approve
                    </button>
                  </>
                ) : (
                  <button type="button" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-secondary disabled:opacity-50" disabled={saving} onClick={() => decide("pending")}>
                    <Undo2 className="h-4 w-4" aria-hidden /> Undo {supplier.decision === "approved" ? "approval" : "rejection"}
                  </button>
                )}
              </div>
            </>
          )}
        </footer>
      </div>
      {preview && <FilePreview {...preview} onClose={() => setPreview(null)} />}
    </dialog>
  );
}

function OtherValues({ values, disabled, onUse }: { values: string[]; disabled: boolean; onUse: (v: string) => void }) {
  return (
    <p className="flex flex-wrap items-center gap-1 text-xs text-[var(--sa-muted)]">
      Also in the list:
      {values.map((v) => (
        <button
          key={v}
          type="button"
          disabled={disabled}
          onClick={() => onUse(v)}
          className="cursor-pointer disabled:cursor-not-allowed! rounded bg-[var(--sa-sand)] px-1.5 py-0.5 text-[var(--sa-ink-2)] hover:bg-[var(--sa-sand-hover)] disabled:opacity-50"
          title="Use this one"
        >
          {v}
        </button>
      ))}
    </p>
  );
}
