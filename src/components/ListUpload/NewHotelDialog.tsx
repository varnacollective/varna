"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import type { HotelOption } from "@/lib/list-uploads/hotels";
import { errorFrom } from "./read-stream";

interface Props {
  onCreated: (hotel: HotelOption) => void;
  onClose: () => void;
}

/** Adds a hotel (the same as Partners → Clients → add). */
export default function NewHotelDialog({ onCreated, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open as a modal once mounted. No close() on cleanup: its "close" event
  // would tell the parent to remove this dialog again.
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter the hotel's name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/superadmin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact_name: contactName.trim() || null,
          contact_email: contactEmail.trim() || null,
        }),
      });
      if (!response.ok) throw new Error(await errorFrom(response));
      const { client } = (await response.json()) as { client: { id: string; name: string } };
      onCreated({ id: client.id, name: client.name });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The hotel could not be added.");
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onCancel={(e) => {
        if (saving) e.preventDefault();
      }}
      aria-labelledby="new-hotel-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md overflow-auto rounded-[var(--sa-radius-lg)] border border-[var(--sa-border)] bg-[var(--sa-white)] p-0 text-[var(--sa-ink)] shadow-[var(--sa-shadow-lg)] backdrop:bg-[rgba(30,26,22,0.4)] backdrop:backdrop-blur-[2px]"
    >
      <form onSubmit={(e) => void save(e)} className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="new-hotel-title" className="sa-section-title">New hotel</h2>
            <p className="mt-1 text-[13px] text-[var(--sa-muted)]">It gets a hotel code and appears under Partners → Clients.</p>
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            disabled={saving}
            aria-label="Close"
            className="cursor-pointer disabled:cursor-not-allowed! rounded p-1 text-[var(--sa-muted)] hover:bg-[var(--sa-sand)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="hotel-name" className="sa-label">Hotel name</label>
          <input id="hotel-name" className="sa-input" required autoFocus value={name} disabled={saving} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hotel-contact" className="sa-label">Contact person (optional)</label>
          <input id="hotel-contact" className="sa-input" autoComplete="off" value={contactName} disabled={saving} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hotel-email" className="sa-label">Contact email (optional)</label>
          <input id="hotel-email" type="email" className="sa-input" autoComplete="off" value={contactEmail} disabled={saving} onChange={(e) => setContactEmail(e.target.value)} />
        </div>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-[var(--sa-radius-sm)] border border-[var(--sa-danger)] bg-[var(--sa-danger-tint)] px-3 py-2 text-[13px] text-[var(--sa-danger-fg)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-secondary" disabled={saving} onClick={() => dialog.current?.close()}>
            Cancel
          </button>
          <button type="submit" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-primary disabled:opacity-50" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Add hotel
          </button>
        </div>
      </form>
    </dialog>
  );
}
