"use client";

import { useFormContext } from "react-hook-form";
import type { AssessmentFormData } from "@/components/assessment/AssessmentForm";

// ─── Shared field components used by all steps ───────────────────────────────

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
    <div className="space-y-1.5">
      <label
        htmlFor={`field-${name}`}
        className="block text-[10px] font-mono uppercase tracking-widest text-slate-mist"
      >
        {label}
        {required && <span className="text-deep-clay ml-1">*</span>}
      </label>
      {hint && (
        <p className="text-[11px] text-slate-mist/60 font-light -mt-0.5 mb-1 leading-relaxed">
          {hint}
        </p>
      )}
      <input
        id={`field-${name}`}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`w-full bg-transparent border-b py-2.5 text-sm text-warm-stone placeholder:text-slate-mist/30 outline-none transition-colors duration-200 font-sans focus:border-warm-stone/60 ${
          error ? "border-red-500/60" : "border-slate-mist/25"
        }`}
      />
      {error && (
        <p className="text-[11px] text-red-400 font-light mt-1">{error.message as string}</p>
      )}
    </div>
  );
}

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
    <div className="space-y-1.5">
      <label
        htmlFor={`field-${name}`}
        className="block text-[10px] font-mono uppercase tracking-widest text-slate-mist"
      >
        {label}
        {required && <span className="text-deep-clay ml-1">*</span>}
      </label>
      {hint && (
        <p className="text-[11px] text-slate-mist/60 font-light -mt-0.5 mb-1 leading-relaxed">
          {hint}
        </p>
      )}
      <textarea
        id={`field-${name}`}
        rows={rows}
        placeholder={placeholder}
        {...register(name)}
        className={`w-full bg-transparent border-b py-2.5 text-sm text-warm-stone placeholder:text-slate-mist/30 outline-none transition-colors duration-200 font-sans focus:border-warm-stone/60 resize-none ${
          error ? "border-red-500/60" : "border-slate-mist/25"
        }`}
      />
      {error && (
        <p className="text-[11px] text-red-400 font-light mt-1">{error.message as string}</p>
      )}
    </div>
  );
}

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
    <div className="space-y-1.5">
      <label
        htmlFor={`field-${name}`}
        className="block text-[10px] font-mono uppercase tracking-widest text-slate-mist"
      >
        {label}
        {required && <span className="text-deep-clay ml-1">*</span>}
      </label>
      {hint && (
        <p className="text-[11px] text-slate-mist/60 font-light -mt-0.5 mb-1 leading-relaxed">
          {hint}
        </p>
      )}
      <select
        id={`field-${name}`}
        {...register(name)}
        className={`w-full bg-[#1C1E22] border-b py-2.5 text-sm text-warm-stone outline-none transition-colors duration-200 font-sans focus:border-warm-stone/60 cursor-pointer appearance-none ${
          error ? "border-red-500/60" : "border-slate-mist/25"
        }`}
      >
        <option value="" className="bg-[#1C1E22] text-slate-mist">
          — Select —
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#1C1E22] text-warm-stone">
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-[11px] text-red-400 font-light mt-1">{error.message as string}</p>
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
    <div className="space-y-1.5">
      <label
        htmlFor={`field-${name}`}
        className="block text-[10px] font-mono uppercase tracking-widest text-slate-mist"
      >
        {label}
      </label>
      <p className="text-[11px] text-slate-mist/60 font-light leading-relaxed">
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

// ─── Step wrapper ────────────────────────────────────────────────────────────
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
      {/* Step header */}
      <div className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-deep-clay mb-3">
          Section {stepNumber} of 7
        </p>
        <h2 className="text-3xl sm:text-4xl font-serif font-light text-warm-stone tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-sm text-slate-mist font-light leading-relaxed max-w-lg">
            {subtitle}
          </p>
        )}
        <div className="mt-5 w-12 h-px bg-deep-clay/60" />
      </div>

      {/* Fields */}
      <div className="space-y-8">{children}</div>
    </div>
  );
}
