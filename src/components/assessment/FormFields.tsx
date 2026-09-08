"use client";

import { useFormContext } from "react-hook-form";
import type { AssessmentFormData } from "@/components/assessment/AssessmentForm";

// ─── Shared input class — matches the login page's filled-input treatment ─────
// bg: subtle dark fill | border: slate-mist bottom-only on idle, full ring on focus
const INPUT_BASE =
  "w-full px-4 py-3 bg-[#141517] border border-slate-mist/20 text-warm-stone " +
  "placeholder:text-slate-mist/30 focus:border-warm-stone/50 focus:bg-[#18191C] " +
  "focus:outline-none focus:ring-1 focus:ring-warm-stone/20 " +
  "transition-all duration-200 text-sm font-sans";

const INPUT_ERROR =
  "border-red-500/50 focus:border-red-400/60 focus:ring-red-500/15";

// ─── Label ───────────────────────────────────────────────────────────────────
const LABEL_BASE =
  "block text-[10px] font-semibold tracking-[0.22em] uppercase text-warm-stone/60";

// ─── Hint ────────────────────────────────────────────────────────────────────
const HINT_BASE =
  "text-[11px] text-slate-mist/55 font-light leading-relaxed -mt-0.5 mb-1";

// ─────────────────────────────────────────────────────────────────────────────

interface FieldProps {
  name: keyof AssessmentFormData;
  label: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "url" | "number";
}

export function Field({
  name,
  label,
  hint,
  placeholder,
  required,
  type = "text",
}: FieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<AssessmentFormData>();

  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={`field-${name}`} className={LABEL_BASE}>
          {label}
          {required && <span className="text-deep-clay ml-1">*</span>}
        </label>
      )}
      {hint && <p className={HINT_BASE}>{hint}</p>}
      <input
        id={`field-${name}`}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`${INPUT_BASE} ${error ? INPUT_ERROR : ""}`}
      />
      {error && (
        <p className="text-[11px] text-red-400 font-light flex items-center gap-1.5 mt-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface TextareaFieldProps extends Omit<FieldProps, "type"> {
  rows?: number;
}

export function TextareaField({
  name,
  label,
  hint,
  placeholder,
  required,
  rows = 3,
}: TextareaFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<AssessmentFormData>();

  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={`field-${name}`} className={LABEL_BASE}>
          {label}
          {required && <span className="text-deep-clay ml-1">*</span>}
        </label>
      )}
      {hint && <p className={HINT_BASE}>{hint}</p>}
      <textarea
        id={`field-${name}`}
        rows={rows}
        placeholder={placeholder}
        {...register(name)}
        className={`${INPUT_BASE} resize-none leading-relaxed ${error ? INPUT_ERROR : ""}`}
      />
      {error && (
        <p className="text-[11px] text-red-400 font-light flex items-center gap-1.5 mt-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface SelectFieldProps extends Omit<FieldProps, "type" | "placeholder"> {
  options: { value: string; label: string }[];
}

export function SelectField({ name, label, hint, required, options }: SelectFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<AssessmentFormData>();

  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={`field-${name}`} className={LABEL_BASE}>
          {label}
          {required && <span className="text-deep-clay ml-1">*</span>}
        </label>
      )}
      {hint && <p className={HINT_BASE}>{hint}</p>}
      <div className="relative">
        <select
          id={`field-${name}`}
          {...register(name)}
          className={`${INPUT_BASE} cursor-pointer appearance-none pr-10 ${error ? INPUT_ERROR : ""}`}
        >
          <option value="" className="bg-[#141517] text-slate-mist">
            — Select —
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#141517] text-warm-stone">
              {o.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-mist/50">
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-red-400 font-light flex items-center gap-1.5 mt-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// ─── Drive link upload helper ────────────────────────────────────────────────
export function DriveUploadField({
  name,
  label,
  hint,
}: {
  name: keyof AssessmentFormData;
  label: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      {label && <label htmlFor={`field-${name}`} className={LABEL_BASE}>{label}</label>}
      <p className={HINT_BASE}>
        {hint ??
          "Upload the document to Google Drive and paste the shareable link below. Ensure 'Anyone with the link' can view it."}
      </p>
      <Field
        name={name}
        label=""
        type="url"
        placeholder="https://drive.google.com/file/d/..."
      />
    </div>
  );
}

// ─── Section divider used inside step cards ──────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-px flex-1 bg-slate-mist/12" />
      <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-mist/50 whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-mist/12" />
    </div>
  );
}

// ─── Step wrapper — elevated card surface matching app elevation system ───────
export function StepWrapper({
  stepNumber,
  title,
  subtitle,
  children,
}: {
  stepNumber: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-4">
      {/* ── Step section header (above the card) ── */}
      <div className="mb-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-deep-clay mb-2.5">
          Section {stepNumber} of 7
        </p>
        <h2 className="text-3xl sm:text-[2.25rem] font-serif font-light text-warm-stone tracking-tight leading-[1.05]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2.5 text-sm text-slate-mist font-light leading-relaxed max-w-lg">
            {subtitle}
          </p>
        )}
        <div className="mt-4 w-10 h-px bg-deep-clay/50" />
      </div>

      {/* ── Elevated card surface — matches elevation-dark-mid from globals.css ── */}
      <div
        className="bg-[#1D1F24] border border-slate-mist/12 p-6 sm:p-8"
        style={{
          boxShadow:
            "0 14px 44px -4px rgba(0,0,0,0.75), 0 0 0 1px rgba(140,157,168,0.10)",
        }}
      >
        <div className="space-y-7">{children}</div>
      </div>
    </div>
  );
}

// Re-export SectionDivider so step files can use it
export { SectionDivider };
