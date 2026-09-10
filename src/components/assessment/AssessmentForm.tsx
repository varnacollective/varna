"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { ChevronRight, ChevronLeft, Send, CheckCircle2 } from "lucide-react";
import { EASE_SMOOTH } from "@/lib/motion";

import Step1EnterpriseOverview from "./steps/Step1EnterpriseOverview";
import Step2Products from "./steps/Step2Products";
import Step3Environment from "./steps/Step3Environment";
import Step4People from "./steps/Step4People";
import Step5Legal from "./steps/Step5Legal";
import Step6Craft from "./steps/Step6Craft";
import Step7Management from "./steps/Step7Management";

// ─── Master Zod Schema ───────────────────────────────────────────────────────
// Required fields are marked; all others optional (for save-and-continue UX).
export const assessmentSchema = z.object({
  // Step 1
  legal_name: z.string().min(2, "Legal name is required"),
  trade_name: z.string().optional(),
  udyam_number: z.string().optional(),
  udyam_certificate_link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  year_established: z.string().optional(),
  legal_structure: z.string().optional(),
  registered_address: z.string().optional(),
  operating_address: z.string().optional(),
  annual_turnover: z.string().optional(),
  employee_count: z.string().optional(),
  founder_name: z.string().optional(),
  founders_story: z.string().optional(),
  primary_contact_name: z.string().min(2, "Contact name is required"),
  primary_contact_email: z.string().email("Enter a valid email"),
  primary_contact_phone: z.string().optional(),
  // Step 2
  primary_product_categories: z.string().optional(),
  product_description: z.string().optional(),
  raw_materials: z.string().optional(),
  production_process: z.string().optional(),
  production_video_link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  // Step 3
  water_source: z.string().optional(),
  water_recycling: z.string().optional(),
  carbon_footprint_tracked: z.string().optional(),
  energy_sources: z.string().optional(),
  chemical_usage: z.string().optional(),
  chemical_disposal: z.string().optional(),
  environmental_certifications: z.string().optional(),
  // Step 4
  total_workers: z.string().optional(),
  women_workers_pct: z.string().optional(),
  artisan_workers_pct: z.string().optional(),
  minimum_wage_compliance: z.string().optional(),
  esi_pf_coverage: z.string().optional(),
  esi_documents_link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  health_safety_measures: z.string().optional(),
  community_programs: z.string().optional(),
  // Step 5
  gst_registered: z.string().optional(),
  gst_number: z.string().optional(),
  legal_disputes: z.string().optional(),
  ethics_policy: z.string().optional(),
  ethics_policy_document_link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  // Step 6
  craft_traditions: z.string().optional(),
  gi_tags: z.string().optional(),
  pehchaan_card: z.string().optional(),
  artisan_training: z.string().optional(),
  heritage_documentation_link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  // Step 7
  sdg_alignment: z.string().optional(),
  sustainability_tracking: z.string().optional(),
  sustainability_goals: z.string().optional(),
  additional_certifications: z.string().optional(),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;

// Per-step required field keys for inline validation on "Next"
const STEP_REQUIRED_FIELDS: (keyof AssessmentFormData)[][] = [
  ["legal_name", "primary_contact_name", "primary_contact_email"], // Step 1
  [], // Step 2
  [], // Step 3
  [], // Step 4
  [], // Step 5
  [], // Step 6
  [], // Step 7
];

const STEPS = [
  { number: 1, label: "Enterprise Overview", short: "Overview" },
  { number: 2, label: "Products Overview", short: "Products" },
  { number: 3, label: "Environment", short: "Environment" },
  { number: 4, label: "People & Community", short: "People" },
  { number: 5, label: "Legal & Compliance", short: "Legal" },
  { number: 6, label: "Craft & Heritage", short: "Heritage" },
  { number: 7, label: "Sustainability Management", short: "Management" },
];

const STEP_COMPONENTS = [
  Step1EnterpriseOverview,
  Step2Products,
  Step3Environment,
  Step4People,
  Step5Legal,
  Step6Craft,
  Step7Management,
];

// ─── Step transition — fade + directional slide using app EASE_SMOOTH ────────
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
};

interface AssessmentFormProps {
  uuid: string;
  enterpriseName: string;
}

// ─── Varna brand mark — official logo + wordmark, matching the app header ──
function VarnaBrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <Image
        src="/varna-logo.svg"
        alt="Varna Collective Logo"
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
        priority
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-warm-stone leading-none">
          Varna Collective
        </span>
        <span className="text-[8px] tracking-[0.22em] uppercase text-slate-mist leading-none">
          Enterprise Assessment
        </span>
      </div>
    </div>
  );
}

export default function AssessmentForm({ uuid, enterpriseName }: AssessmentFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    mode: "onBlur",
    defaultValues: {
      legal_name: "",
      trade_name: "",
      udyam_number: "",
      udyam_certificate_link: "",
      year_established: "",
      legal_structure: "",
      registered_address: "",
      operating_address: "",
      annual_turnover: "",
      employee_count: "",
      founder_name: "",
      founders_story: "",
      primary_contact_name: "",
      primary_contact_email: "",
      primary_contact_phone: "",
      primary_product_categories: "",
      product_description: "",
      raw_materials: "",
      production_process: "",
      production_video_link: "",
      water_source: "",
      water_recycling: "",
      carbon_footprint_tracked: "",
      energy_sources: "",
      chemical_usage: "",
      chemical_disposal: "",
      environmental_certifications: "",
      total_workers: "",
      women_workers_pct: "",
      artisan_workers_pct: "",
      minimum_wage_compliance: "",
      esi_pf_coverage: "",
      esi_documents_link: "",
      health_safety_measures: "",
      community_programs: "",
      gst_registered: "",
      gst_number: "",
      legal_disputes: "",
      ethics_policy: "",
      ethics_policy_document_link: "",
      craft_traditions: "",
      gi_tags: "",
      pehchaan_card: "",
      artisan_training: "",
      heritage_documentation_link: "",
      sdg_alignment: "",
      sustainability_tracking: "",
      sustainability_goals: "",
      additional_certifications: "",
    },
  });

  const { trigger, getValues } = methods;
  const progressPct = ((currentStep + 1) / STEPS.length) * 100;

  const goNext = async () => {
    const fieldsToValidate = STEP_REQUIRED_FIELDS[currentStep];
    if (fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate);
      if (!valid) return;
    }
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = async () => {
    const valid = await trigger();
    if (!valid) return;

    setSubmitting(true);
    setSubmitError(null);

    const values = getValues();

    try {
      const res = await fetch("/api/submit-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, uuid, enterprise_name: enterpriseName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Submission failed. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#181A1D] flex items-center justify-center px-6 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-sage-mineral/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-deep-clay/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_SMOOTH }}
          className="text-center max-w-md z-10"
        >
          <div className="w-16 h-16 border border-sage-mineral/40 bg-sage-mineral/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-8 h-8 text-sage-mineral" />
          </div>
          <VarnaBrandMark className="justify-center mb-6" />
          <h1 className="text-3xl font-serif font-light text-warm-stone tracking-tight mb-4">
            Assessment Submitted
          </h1>
          <p className="text-sm text-slate-mist font-light leading-relaxed mb-2">
            Thank you, <span className="text-warm-stone">{enterpriseName}</span>. Your enterprise
            assessment has been received and logged to our review system.
          </p>
          <p className="text-xs text-slate-mist/60 font-light">
            Our team will review your submission and reach out within 5–7 business days.
          </p>
        </motion.div>
      </div>
    );
  }

  const StepComponent = STEP_COMPONENTS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-[#181A1D] text-warm-stone font-sans flex flex-col relative overflow-hidden">
      {/* ── Ambient background texture (quiet luxury, no legibility impact) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-deep-clay/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-sage-mineral/4 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-midnight-blue/10 rounded-full blur-[140px]" />
      </div>

      {/* ── Top progress bar — glowing clay fill ─────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-slate-mist/10">
        <motion.div
          className="h-full bg-deep-clay"
          style={{ boxShadow: "0 0 16px 2px rgba(122, 63, 30, 0.65)" }}
          initial={{ width: `${(1 / STEPS.length) * 100}%` }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.55, ease: EASE_SMOOTH }}
        />
      </div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-mist/12 bg-[#181A1D]/96 backdrop-blur-md px-6 sm:px-10 h-16 flex items-center justify-between">
        <VarnaBrandMark />

        <div className="text-right">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-warm-stone/80 leading-none">
            {enterpriseName}
          </p>
          <p className="text-[9px] font-mono text-slate-mist/60 mt-0.5 leading-none">
            Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep].label}
          </p>
        </div>
      </header>

      {/* ── Desktop step navigator ───────────────────────────────────────── */}
      <div className="hidden md:block relative z-10 border-b border-slate-mist/10 bg-[#181A1D]/80">
        <div className="flex items-center justify-center px-6 overflow-x-auto">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isComplete = idx < currentStep;
            return (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => {
                    if (idx < currentStep) {
                      setDirection(-1);
                      setCurrentStep(idx);
                    }
                  }}
                  disabled={idx > currentStep}
                  className={`flex items-center gap-2 px-3.5 py-4 text-[10px] font-mono uppercase tracking-widest transition-all duration-200 border-b-2 whitespace-nowrap cursor-pointer disabled:cursor-default ${
                    isActive
                      ? "text-warm-stone border-deep-clay"
                      : isComplete
                      ? "text-slate-mist/70 border-transparent hover:text-warm-stone/70 hover:border-slate-mist/30"
                      : "text-slate-mist/25 border-transparent"
                  }`}
                >
                  {/* Step number badge */}
                  <span
                    className={`w-[18px] h-[18px] flex items-center justify-center text-[9px] font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-deep-clay text-warm-stone"
                        : isComplete
                        ? "bg-sage-mineral/20 text-sage-mineral border border-sage-mineral/40"
                        : "border border-slate-mist/20 text-slate-mist/30"
                    }`}
                  >
                    {isComplete ? (
                      <svg width="8" height="7" viewBox="0 0 8 7" fill="none" aria-hidden="true">
                        <path d="M1 3.5L3 5.5L7 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </span>
                  {step.short}
                </button>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-6 h-px mx-0.5 shrink-0 transition-colors duration-300 ${
                      idx < currentStep ? "bg-sage-mineral/35" : "bg-slate-mist/12"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Form content ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-8 pb-36 relative z-10">
        <div className="w-full max-w-2xl">
          <FormProvider {...methods}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease: EASE_SMOOTH }}
              >
                <StepComponent />
              </motion.div>
            </AnimatePresence>
          </FormProvider>
        </div>
      </main>

      {/* ── Sticky bottom navigation bar ────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-mist/12 bg-[#181A1D]/98 backdrop-blur-md px-6 sm:px-10 h-[64px] flex items-center justify-between">
        {/* Previous */}
        <button
          id="assessment-prev-btn"
          onClick={goPrev}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest text-slate-mist border border-slate-mist/20 hover:border-warm-stone/30 hover:text-warm-stone transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>

        {/* Centre: progress dots (both mobile + desktop) */}
        <div className="flex items-center gap-2">
          {/* Mobile: "X / 7" text */}
          <span className="text-[10px] font-mono text-slate-mist sm:hidden">
            {currentStep + 1} / {STEPS.length}
          </span>

          {/* Dot indicators — same system as top stepper, visually unified */}
          <div className="hidden sm:flex items-center gap-1.5">
            {STEPS.map((_, idx) => (
              <motion.div
                key={idx}
                animate={{
                  width: idx === currentStep ? 20 : 6,
                  backgroundColor:
                    idx === currentStep
                      ? "#7A3F1E"
                      : idx < currentStep
                      ? "rgba(115, 134, 120, 0.55)"
                      : "rgba(111, 132, 143, 0.18)",
                }}
                transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                className="h-1.5 rounded-none"
              />
            ))}
          </div>
        </div>

        {/* Next / Submit */}
        {isLastStep ? (
          <button
            id="assessment-submit-btn"
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2.5 px-6 py-2.5 bg-warm-stone text-carbon-ink text-xs font-serif tracking-[0.18em] uppercase transition-all duration-200 hover:bg-[#E4DEC9] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{ boxShadow: "0 0 22px -4px rgba(216, 207, 184, 0.25)" }}
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border border-carbon-ink/40 border-t-carbon-ink rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Submit Assessment
              </>
            )}
          </button>
        ) : (
          <button
            id="assessment-next-btn"
            onClick={goNext}
            className="flex items-center gap-2.5 px-6 py-2.5 bg-warm-stone text-carbon-ink text-xs font-serif tracking-[0.18em] uppercase transition-all duration-200 hover:bg-[#E4DEC9] active:scale-[0.99] cursor-pointer group"
            style={{ boxShadow: "0 0 22px -4px rgba(216, 207, 184, 0.25)" }}
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Submit error toast */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-700/50 text-red-300 text-xs font-sans px-5 py-3 backdrop-blur-sm whitespace-nowrap"
          >
            {submitError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
