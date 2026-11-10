"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PartnerInvitation, FormAnswers, PartnerDocument } from "./types";
import { WelcomeStep } from "./WelcomeStep";
import { Section1Enterprise } from "./Section1Enterprise";
import { Section2Products } from "./Section2Products";
import { Section3Environment } from "./Section3Environment";
import { Section4People } from "./Section4People";
import { Section5Legal } from "./Section5Legal";
import { Section6Craft } from "./Section6Craft";
import { Section7Sustainability } from "./Section7Sustainability";
import { ReviewStep } from "./ReviewStep";
import { ThankYouStep } from "./ThankYouStep";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";

interface OnboardingFormProps {
  invitation: PartnerInvitation;
  initialData?: FormAnswers;
  initialDocs?: PartnerDocument[];
}

export function OnboardingForm({
  invitation,
  initialData = {},
  initialDocs = [],
}: OnboardingFormProps) {
  // Step 0 = Welcome, 1-7 = Sections, 8 = Review, 9 = Thank you
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Initialize form answers with prefill defaults from invitation
  const [answers, setAnswers] = useState<FormAnswers>(() => ({
    q1_1_legal_name: invitation.enterprise_name || "",
    q1_2_brand_name: invitation.brand_name || "",
    q1_6_email: invitation.contact_email || "",
    q1_7_phone: invitation.phone || "",
    q1_5_state: invitation.state || "",
    ...initialData,
  }));

  const [documents, setDocuments] = useState<PartnerDocument[]>(initialDocs);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // Determine if craft section applies
  const descList = answers.q1_10_description || [];
  const isCraft = descList.some(
    (d) =>
      d.includes("Craft-based production") ||
      d.includes("We combine more than one of the above")
  );

  // Autosave function
  const triggerSave = useCallback(
    async (dataToSave: FormAnswers) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/invitation/${invitation.slug}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: dataToSave }),
        });
        if (res.ok) {
          setSaveStatus("saved");
          setTimeout(() => {
            setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
          }, 3000);
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.error("Autosave error:", err);
        setSaveStatus("error");
      }
    },
    [invitation.slug]
  );

  // Debounced autosave on answers change
  const handleAnswersChange = (updates: Partial<FormAnswers>) => {
    setAnswers((prev) => {
      const next = { ...prev, ...updates };

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        triggerSave(next);
      }, 1200);

      return next;
    });
  };

  // Decline handler
  const handleDecline = async (reason: string) => {
    try {
      const res = await fetch(`/api/invitation/${invitation.slug}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Decline error:", err);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/invitation/${invitation.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        setCurrentStep(9);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // Navigation helpers
  const goToNextStep = () => {
    let next = currentStep + 1;
    // If not craft, skip from step 5 directly to step 7
    if (!isCraft && currentStep === 5) {
      next = 7;
    }
    setCurrentStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPrevStep = () => {
    let prev = currentStep - 1;
    // If not craft, skip from step 7 back to step 5
    if (!isCraft && currentStep === 7) {
      prev = 5;
    }
    setCurrentStep(prev);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate progress %
  const totalVisibleSections = isCraft ? 7 : 6;
  let currentVisibleSection = currentStep;
  if (!isCraft && currentStep >= 7) {
    currentVisibleSection = currentStep - 1;
  }
  const progressPercent =
    currentStep === 0
      ? 0
      : currentStep === 8
      ? 95
      : currentStep === 9
      ? 100
      : Math.round((currentVisibleSection / totalVisibleSections) * 100);

  return (
    <div className="space-y-6">
      {/* Sticky Top Stepper Bar for Steps 1 through 8 */}
      {currentStep >= 1 && currentStep <= 8 && (
        <div className="sticky top-16 z-20 bg-[#FAF7F2]/95 backdrop-blur-sm pt-2 pb-4 border-b border-[#E7DFD3] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B6259]">
            <span className="font-semibold text-[#1E1A16]">
              {currentStep <= 7 ? `Section ${currentStep} of 7` : "Review & Submit"} ·{" "}
              {progressPercent}% complete
            </span>

            <div className="flex items-center gap-2">
              {saveStatus === "saving" && (
                <span className="text-[11px] text-[#9A8E84] flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#9A4A2E] animate-ping" />
                  Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="inv-saved-badge">
                  <Check className="w-3 h-3" /> Saved ✓
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-[11px] text-[#C0392B]">Error saving draft</span>
              )}
            </div>
          </div>

          <div className="inv-progress-track">
            <div
              className="inv-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Router */}
      {currentStep === 0 && (
        <WelcomeStep
          invitation={invitation}
          onStart={() => {
            setCurrentStep(1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDecline={handleDecline}
        />
      )}

      {currentStep === 1 && (
        <Section1Enterprise
          answers={answers}
          onChange={handleAnswersChange}
        />
      )}

      {currentStep === 2 && (
        <Section2Products
          answers={answers}
          onChange={handleAnswersChange}
        />
      )}

      {currentStep === 3 && (
        <Section3Environment
          slug={invitation.slug}
          answers={answers}
          onChange={handleAnswersChange}
          documents={documents}
          onDocumentsChange={setDocuments}
        />
      )}

      {currentStep === 4 && (
        <Section4People
          slug={invitation.slug}
          answers={answers}
          onChange={handleAnswersChange}
          documents={documents}
          onDocumentsChange={setDocuments}
        />
      )}

      {currentStep === 5 && (
        <Section5Legal
          slug={invitation.slug}
          answers={answers}
          onChange={handleAnswersChange}
          documents={documents}
          onDocumentsChange={setDocuments}
        />
      )}

      {currentStep === 6 && (
        <Section6Craft
          slug={invitation.slug}
          answers={answers}
          onChange={handleAnswersChange}
          documents={documents}
          onDocumentsChange={setDocuments}
        />
      )}

      {currentStep === 7 && (
        <Section7Sustainability
          slug={invitation.slug}
          answers={answers}
          onChange={handleAnswersChange}
          documents={documents}
          onDocumentsChange={setDocuments}
        />
      )}

      {currentStep === 8 && (
        <ReviewStep
          invitation={invitation}
          answers={answers}
          documents={documents}
          onGoToStep={(s) => {
            setCurrentStep(s);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onSubmit={handleSubmit}
        />
      )}

      {currentStep === 9 && (
        <ThankYouStep invitation={invitation} />
      )}

      {/* Navigation Controls (Steps 1 to 7) */}
      {currentStep >= 1 && currentStep <= 7 && (
        <div className="pt-6 border-t border-[#E7DFD3] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goToPrevStep}
            className="inv-btn-secondary text-xs sm:text-sm py-2.5 px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => triggerSave(answers)}
              className="inv-btn-ghost text-xs text-[#6B6259]"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={goToNextStep}
              className="inv-btn-primary text-xs sm:text-sm py-2.5 px-6 shadow-sm group"
            >
              <span>{currentStep === 7 ? "Continue to Review" : "Next Section"}</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      )}

      {/* Gentle autosave footer note */}
      {currentStep >= 1 && currentStep <= 8 && (
        <p className="text-center text-[11px] text-[#9A8E84] pt-2">
          Your answers are saved automatically. You can return anytime using your invitation link.
        </p>
      )}
    </div>
  );
}
