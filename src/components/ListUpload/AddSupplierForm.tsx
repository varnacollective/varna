"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { hotelCodeOf, hotelHref, NO_HOTEL, type HotelOption } from "@/lib/list-uploads/hotels";
import NewHotelDialog from "./NewHotelDialog";
import { errorFrom } from "./read-stream";

interface Props {
  hotels: HotelOption[];
  categories: string[];
  initialHotelId?: string;
}

const FIELDS = [
  { key: "company_name", label: "Company name", required: true, autoComplete: "organization" },
  { key: "brand_name", label: "Brand (if different)" },
  { key: "contact_name", label: "Contact person", autoComplete: "name" },
  { key: "email", label: "Email", type: "email", autoComplete: "email" },
  { key: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
] as const;
type Field = (typeof FIELDS)[number]["key"] | "category";

/** One supplier, typed in. Saved for review, like a supplier from a list; nothing is sent yet. */
export default function AddSupplierForm({ hotels: initialHotels, categories, initialHotelId }: Props) {
  const router = useRouter();
  const [hotels, setHotels] = useState(initialHotels);
  const [hotelId, setHotelId] = useState(initialHotels.some((h) => h.id === initialHotelId) ? (initialHotelId ?? "") : "");
  const [values, setValues] = useState<Record<Field, string>>({
    company_name: "", brand_name: "", contact_name: "", email: "", phone: "", city: "", state: "", category: "",
  });
  const [addingHotel, setAddingHotel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: Field, value: string) => setValues((v) => ({ ...v, [key]: value }));

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hotelId) {
      setError("Choose the hotel, or No hotel.");
      return;
    }
    if (!values.company_name.trim()) {
      setError("Enter the company name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/superadmin/list-uploads/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: hotelCodeOf(hotelId), ...values }),
      });
      if (!response.ok) throw new Error(await errorFrom(response));
      const { supplierId } = (await response.json()) as { supplierId: string };
      router.push(hotelHref(hotelId, "suppliers", supplierId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The supplier could not be saved.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void save(e)} className="flex flex-col gap-5" noValidate>
      <div className="sa-card flex flex-col gap-5 p-4 sm:p-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="add-hotel" className="sa-label">Hotel</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              id="add-hotel"
              className="cursor-pointer disabled:cursor-not-allowed! sa-input sm:max-w-sm"
              value={hotelId}
              required
              disabled={saving}
              onChange={(e) => setHotelId(e.target.value)}
            >
              <option value="" disabled>Choose the hotel, or No hotel</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={saving}
              onClick={() => setAddingHotel(true)}
              className="cursor-pointer disabled:cursor-not-allowed! sa-btn-secondary w-fit whitespace-nowrap disabled:opacity-50"
            >
              <Plus className="h-4 w-4" aria-hidden /> New hotel
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className={`flex flex-col gap-1.5 ${f.key === "company_name" ? "sm:col-span-2" : ""}`}>
              <label htmlFor={`add-${f.key}`} className="sa-label">
                {f.label}
                {"required" in f ? "" : <span className="font-normal normal-case tracking-normal text-[var(--sa-caption)]"> (optional)</span>}
              </label>
              <input
                id={`add-${f.key}`}
                className="sa-input"
                type={"type" in f ? f.type : "text"}
                autoComplete={"autoComplete" in f ? f.autoComplete : "off"}
                required={"required" in f}
                maxLength={300}
                value={values[f.key]}
                disabled={saving}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-category" className="sa-label">
              Category <span className="font-normal normal-case tracking-normal text-[var(--sa-caption)]">(optional)</span>
            </label>
            <select
              id="add-category"
              className="cursor-pointer sa-input"
              value={values.category}
              disabled={saving}
              onChange={(e) => set("category", e.target.value)}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-[var(--sa-caption)]">
          It is checked like a supplier from a list, then shown on the hotel&apos;s page to approve and invite. Nothing is sent yet.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-[var(--sa-radius-sm)] border border-[var(--sa-danger)] bg-[var(--sa-danger-tint)] px-4 py-3 text-[13px] text-[var(--sa-danger-fg)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" className="cursor-pointer disabled:cursor-not-allowed! sa-btn-primary disabled:opacity-50" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Add supplier
        </button>
      </div>

      {addingHotel && (
        <NewHotelDialog
          onClose={() => setAddingHotel(false)}
          onCreated={(hotel) => {
            setHotels((list) => {
              const [noHotel, ...named] = list;
              const sorted = [...named, hotel].sort((a, b) => a.name.localeCompare(b.name));
              return noHotel?.id === NO_HOTEL ? [noHotel, ...sorted] : sorted;
            });
            setHotelId(hotel.id);
            setAddingHotel(false);
          }}
        />
      )}
    </form>
  );
}
