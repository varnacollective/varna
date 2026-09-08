"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { ChevronRight, ChevronLeft, Send, CheckCircle2 } from "lucide-react";

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

// ─── Slide animation variants ────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

interface AssessmentFormProps {
  uuid: string;
  enterpriseName: string;
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
      <div className="min-h-screen bg-[#181A1D] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 border border-sage-mineral/40 bg-sage-mineral/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-8 h-8 text-sage-mineral" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 bg-deep-clay rotate-45 inline-block" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-mist">
              Varna Collective
            </span>
          </div>
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
    <div className="min-h-screen bg-[#181A1D] bg-ambient-mesh-dark text-warm-stone font-sans flex flex-col">
      {/* ── Top Progress Bar ─────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-slate-mist/10">
        <motion.div
          className="h-full bg-deep-clay"
          style={{ boxShadow: "0 0 12px 0 rgba(122, 63, 30, 0.7)" }}
          initial={{ width: `${(1 / STEPS.length) * 100}%` }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* ── Brand Header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-mist/10 bg-[#181A1D]/95 backdrop-blur-md px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-deep-clay rotate-45" />
          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-mist">
            Varna Collective
          </span>
          <span className="text-slate-mist/30 text-xs">·</span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-warm-stone/60 hidden sm:inline">
            Enterprise Assessment
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-slate-mist uppercase tracking-widest">
            {enterpriseName}
          </p>
          <p className="text-[9px] font-mono text-slate-mist/50">
            Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep].label}
          </p>
        </div>
      </header>

      {/* ── Step Navigator (desktop pill strip) ─────────────────────────── */}
      <div className="hidden md:flex items-center justify-center pt-8 pb-0 px-6 gap-0 overflow-x-auto">
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
                className={`flex items-center gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:cursor-default ${
                  isActive
                    ? "text-warm-stone border-b-2 border-deep-clay pb-[6px]"
                    : isComplete
                    ? "text-slate-mist hover:text-warm-stone/80"
                    : "text-slate-mist/30"
                }`}
              >
                <span
                  className={`w-4 h-4 flex items-center justify-center text-[9px] font-bold border ${
                    isActive
                      ? "border-deep-clay text-deep-clay bg-deep-clay/10"
                      : isComplete
                      ? "border-sage-mineral text-sage-mineral bg-sage-mineral/10"
                      : "border-slate-mist/20 text-slate-mist/30"
                  }`}
                >
                  {isComplete ? "✓" : step.number}
                </span>
                {step.short}
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-8 h-px mx-1 ${
                    idx < currentStep ? "bg-sage-mineral/40" : "bg-slate-mist/15"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Form Content ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-10 pb-32">
        <div className="w-full max-w-2xl">
          <FormProvider {...methods}>
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <StepComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </FormProvider>
        </div>
      </main>

      {/* ── Sticky Bottom Navigation ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-mist/10 bg-[#181A1D]/98 backdrop-blur-md px-6 sm:px-10 py-4 flex items-center justify-between">
        <button
          id="assessment-prev-btn"
          onClick={goPrev}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-slate-mist border border-slate-mist/20 hover:border-warm-stone/30 hover:text-warm-stone transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>

        <div className="flex items-center gap-3">
          {/* Mobile step indicator */}
          <span className="text-[10px] font-mono text-slate-mist md:hidden">
            {currentStep + 1} / {STEPS.length}
          </span>

          {/* Dot indicators */}
          <div className="hidden sm:flex items-center gap-1.5">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`transition-all duration-300 ${
                  idx === currentStep
                    ? "w-4 h-1.5 bg-deep-clay"
                    : idx < currentStep
                    ? "w-1.5 h-1.5 bg-sage-mineral/60"
                    : "w-1.5 h-1.5 bg-slate-mist/20"
                }`}
              />
            ))}
          </div>
        </div>

        {isLastStep ? (
          <button
            id="assessment-submit-btn"
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2.5 px-6 py-2.5 bg-deep-clay text-warm-stone text-xs font-mono uppercase tracking-widest transition-all duration-200 hover:bg-[#944D25] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{ boxShadow: "0 0 20px -4px rgba(122, 63, 30, 0.6)" }}
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border border-warm-stone/40 border-t-warm-stone rounded-full animate-spin" />
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
            className="flex items-center gap-2.5 px-6 py-2.5 bg-deep-clay text-warm-stone text-xs font-mono uppercase tracking-widest transition-all duration-200 hover:bg-[#944D25] cursor-pointer"
            style={{ boxShadow: "0 0 20px -4px rgba(122, 63, 30, 0.6)" }}
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-red-950/80 border border-red-700/50 text-red-300 text-xs font-sans px-5 py-3 backdrop-blur-sm">
          {submitError}
        </div>
      )}
    </div>
  );
}
