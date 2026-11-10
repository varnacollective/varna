"use client";

import React, { useState } from "react";
import { FormAnswers, PartnerDocument, PartnerInvitation } from "./types";
import { CheckCircle2, AlertCircle, Edit3, ArrowRight, ShieldCheck, FileText, Send } from "lucide-react";

interface ReviewStepProps {
  invitation: PartnerInvitation;
  answers: FormAnswers;
  documents: PartnerDocument[];
  onGoToStep: (stepNumber: number) => void;
  onSubmit: () => Promise<void>;
}

export function ReviewStep({
  invitation,
  answers,
  documents,
  onGoToStep,
  onSubmit,
}: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine craft enterprise
  const descList = answers.q1_10_description || [];
  const isCraft = descList.some(
    (d) =>
      d.includes("Craft-based production") ||
      d.includes("We combine more than one of the above")
  );

  // Check outstanding mandatory items
  const missingItems: { label: string; step: number }[] = [];

  if (!answers.q1_1_legal_name) missingItems.push({ label: "1.1 Full legal name", step: 1 });
  if (!answers.q1_3_year_founded) missingItems.push({ label: "1.3 Year founded", step: 1 });
  if (!answers.q1_4_district) missingItems.push({ label: "1.4 District", step: 1 });
  if (!answers.q1_5_state) missingItems.push({ label: "1.5 State", step: 1 });
  if (!answers.q1_6_email) missingItems.push({ label: "1.6 Contact email", step: 1 });
  if (!answers.q1_7_phone) missingItems.push({ label: "1.7 Contact phone", step: 1 });
  if (!answers.q1_10_description || answers.q1_10_description.length === 0)
    missingItems.push({ label: "1.10 Enterprise description", step: 1 });
  if (!answers.q1_11_women_owned) missingItems.push({ label: "1.11 Women-owned/led declaration", step: 1 });
  if (!answers.q1_12_cooperative) missingItems.push({ label: "1.12 Cooperative structure", step: 1 });
  if (!answers.q1_14_turnover) missingItems.push({ label: "1.14 Annual turnover", step: 1 });
  if (answers.q1_15_workers_count === undefined || answers.q1_15_workers_count === "")
    missingItems.push({ label: "1.15 Total workforce count", step: 1 });
  if (!answers.q1_16_founding_story) missingItems.push({ label: "1.16 Founding story", step: 1 });

  if (!answers.q2_1_products_overview) missingItems.push({ label: "2.1 Product overview & categories", step: 2 });

  if (!answers.q3_1_water_source) missingItems.push({ label: "3.1 Water source", step: 3 });
  if (!answers.q3_2_water_reduction_action) missingItems.push({ label: "3.2 Water reduction actions", step: 3 });
  if (!answers.q3_2b_water_measured) missingItems.push({ label: "3.2b Water measurement status", step: 3 });
  if (!answers.q3_2f_carbon_footprint_done) missingItems.push({ label: "3.2f Carbon footprint status", step: 3 });
  if (!answers.q3_3_uses_chemicals) missingItems.push({ label: "3.3 Chemicals usage declaration", step: 3 });
  if (!answers.q3_5_chemical_approach) missingItems.push({ label: "3.5 Chemical approach", step: 3 });
  if (!answers.q3_6_environmental_certs || answers.q3_6_environmental_certs.length === 0)
    missingItems.push({ label: "3.6 Environmental certifications", step: 3 });

  if (answers.q4_1_women_workers_count === undefined || answers.q4_1_women_workers_count === "")
    missingItems.push({ label: "4.1 Women workers count", step: 4 });
  if (!answers.q4_2_primary_income_source) missingItems.push({ label: "4.2 Primary livelihood indicator", step: 4 });
  if (!answers.q4_3_minimum_wage) missingItems.push({ label: "4.3 Minimum wage assurance", step: 4 });
  if (!answers.q4_4_esi_enrolled) missingItems.push({ label: "4.4 ESI registration", step: 4 });
  if (!answers.q4_5_written_agreements) missingItems.push({ label: "4.5 Worker written agreements", step: 4 });
  if (!answers.q4_6_health_safety) missingItems.push({ label: "4.6 Workplace health & safety", step: 4 });
  if (!answers.q4_7_social_certs || answers.q4_7_social_certs.length === 0)
    missingItems.push({ label: "4.7 Social certifications", step: 4 });
  if (!answers.q4_9_community_support) missingItems.push({ label: "4.9 Community support story", step: 4 });

  if (!answers.q5_1_gst_registered) missingItems.push({ label: "5.1 GST status", step: 5 });
  if (!answers.q5_2_udyam_registered) missingItems.push({ label: "5.2 Udyam registration status", step: 5 });
  if (!answers.q5_3_legal_cases) missingItems.push({ label: "5.3 Active legal proceedings declaration", step: 5 });
  if (!answers.q5_4_product_recalls) missingItems.push({ label: "5.4 Product recall history", step: 5 });
  if (!answers.q5_6_pay_suppliers_on_time) missingItems.push({ label: "5.6 Supplier payment timeliness", step: 5 });

  if (isCraft && !answers.q6_14_craft_story)
    missingItems.push({ label: "6.14 Craft tradition story", step: 6 });

  if (!answers.q7_1_track_energy) missingItems.push({ label: "7.1 Energy tracking status", step: 7 });
  if (!answers.q7_2_environmental_changes) missingItems.push({ label: "7.2 Environmental impact changes", step: 7 });
  if (!answers.q7_2b_sustainability_report) missingItems.push({ label: "7.2b Sustainability report status", step: 7 });
  if (!answers.q7_4_supplier_consideration) missingItems.push({ label: "7.4 Responsible sourcing approach", step: 7 });
  if (!answers.q7_5_all_certifications) missingItems.push({ label: "7.5 Certifications & schemes list", step: 7 });
  if (!answers.q7_6_sdgs || answers.q7_6_sdgs.length === 0)
    missingItems.push({ label: "7.6 UN SDG alignment", step: 7 });
  if (!answers.q7_7_sdg_contribution_sentence)
    missingItems.push({ label: "7.7 One-sentence SDG contribution", step: 7 });

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-[#E7DFD3] pb-4">
        <h2 className="text-3xl font-serif text-[#1E1A16] font-normal">
          Review Your Assessment
        </h2>
        <p className="text-sm text-[#6B6259]">
          Please review your information below before submitting. You can click "Edit" on any
          section to make revisions.
        </p>
      </div>

      {/* Outstanding Items Banner (submission still allowed per PRD MAN-3) */}
      {missingItems.length > 0 ? (
        <div className="p-5 bg-[#FAF7F2] border border-[#B45309]/30 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-[#B45309]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-semibold text-sm">
              {missingItems.length} Recommended or Mandatory Items Pending
            </h3>
          </div>
          <p className="text-xs text-[#6B6259] leading-relaxed">
            Per standard procedure, you are allowed to submit now even with items outstanding. Any
            pending documents or information can be verified with your relationship manager during
            review.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {missingItems.slice(0, 8).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onGoToStep(item.step)}
                className="inv-chip text-xs hover:border-[#9A4A2E]"
              >
                <span>{item.label}</span>
                <span className="text-[#9A4A2E] ml-1">Edit →</span>
              </button>
            ))}
            {missingItems.length > 8 && (
              <span className="text-xs text-[#6B6259] self-center">
                +{missingItems.length - 8} more
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#EAF7ED] border border-[#2D7D46]/30 rounded-xl flex items-center gap-3 text-[#1A5C30]">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">All mandatory questions answered!</span>
            <p>Your responses are complete and ready for final submission.</p>
          </div>
        </div>
      )}

      {/* Summary Cards by Section */}
      <div className="space-y-4">
        {/* Section 1 Card */}
        <div className="inv-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7DFD3] pb-2.5">
            <div>
              <span className="text-xs font-bold text-[#9A4A2E] uppercase tracking-wider">
                Section 1
              </span>
              <h4 className="text-base font-serif font-medium text-[#1E1A16]">
                About your enterprise
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="inv-btn-secondary text-xs py-1.5 px-3"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1 text-[#6B6259]" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#9A8E84]">Legal Name:</span>
              <p className="font-medium text-[#1E1A16]">{answers.q1_1_legal_name || "—"}</p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Brand Name:</span>
              <p className="font-medium text-[#1E1A16]">{answers.q1_2_brand_name || "Same as legal"}</p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Location:</span>
              <p className="font-medium text-[#1E1A16]">
                {answers.q1_4_district ? `${answers.q1_4_district}, ${answers.q1_5_state}` : "—"}
              </p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Workforce:</span>
              <p className="font-medium text-[#1E1A16]">
                {answers.q1_15_workers_count ? `${answers.q1_15_workers_count} total workers` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2 Card */}
        <div className="inv-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7DFD3] pb-2.5">
            <div>
              <span className="text-xs font-bold text-[#9A4A2E] uppercase tracking-wider">
                Section 2
              </span>
              <h4 className="text-base font-serif font-medium text-[#1E1A16]">
                Your products
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="inv-btn-secondary text-xs py-1.5 px-3"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1 text-[#6B6259]" /> Edit
            </button>
          </div>
          <div className="text-xs space-y-1">
            <span className="text-[#9A8E84]">Product Overview & Offerings:</span>
            <p className="text-[#1E1A16] whitespace-pre-line line-clamp-3">
              {answers.q2_1_products_overview || "—"}
            </p>
          </div>
        </div>

        {/* Section 3 Card */}
        <div className="inv-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7DFD3] pb-2.5">
            <div>
              <span className="text-xs font-bold text-[#9A4A2E] uppercase tracking-wider">
                Section 3
              </span>
              <h4 className="text-base font-serif font-medium text-[#1E1A16]">
                Your environment
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="inv-btn-secondary text-xs py-1.5 px-3"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1 text-[#6B6259]" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#9A8E84]">Water Source:</span>
              <p className="font-medium text-[#1E1A16] truncate">{answers.q3_1_water_source || "—"}</p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Chemicals Approach:</span>
              <p className="font-medium text-[#1E1A16] truncate">{answers.q3_5_chemical_approach || "—"}</p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Carbon Calculation:</span>
              <p className="font-medium text-[#1E1A16]">{answers.q3_2f_carbon_footprint_done || "—"}</p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Certifications:</span>
              <p className="font-medium text-[#1E1A16]">
                {answers.q3_6_environmental_certs?.join(", ") || "None"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4 Card */}
        <div className="inv-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7DFD3] pb-2.5">
            <div>
              <span className="text-xs font-bold text-[#9A4A2E] uppercase tracking-wider">
                Section 4
              </span>
              <h4 className="text-base font-serif font-medium text-[#1E1A16]">
                Your people and community
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(4)}
              className="inv-btn-secondary text-xs py-1.5 px-3"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1 text-[#6B6259]" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#9A8E84]">Women Workers:</span>
              <p className="font-medium text-[#1E1A16]">
                {answers.q4_1_women_workers_count !== undefined
                  ? `${answers.q4_1_women_workers_count} women`
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Primary Livelihood:</span>
              <p className="font-medium text-[#1E1A16] truncate">{answers.q4_2_primary_income_source || "—"}</p>
            </div>
            <div>
              <span className="text-[#9A8E84]">ESI Enrolled:</span>
              <p className="font-medium text-[#1E1A16] truncate">{answers.q4_4_esi_enrolled || "—"}</p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Minimum Wage:</span>
              <p className="font-medium text-[#1E1A16]">{answers.q4_3_minimum_wage || "—"}</p>
            </div>
          </div>
        </div>

        {/* Section 5 Card */}
        <div className="inv-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7DFD3] pb-2.5">
            <div>
              <span className="text-xs font-bold text-[#9A4A2E] uppercase tracking-wider">
                Section 5
              </span>
              <h4 className="text-base font-serif font-medium text-[#1E1A16]">
                Legal and compliance
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(5)}
              className="inv-btn-secondary text-xs py-1.5 px-3"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1 text-[#6B6259]" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#9A8E84]">GST Registered:</span>
              <p className="font-medium text-[#1E1A16] truncate">{answers.q5_1_gst_registered || "—"}</p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Udyam Registered:</span>
              <p className="font-medium text-[#1E1A16] truncate">{answers.q5_2_udyam_registered || "—"}</p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Active Legal Cases:</span>
              <p className="font-medium text-[#1E1A16]">{answers.q5_3_legal_cases || "No"}</p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Supplier Timely Payments:</span>
              <p className="font-medium text-[#1E1A16] truncate">{answers.q5_6_pay_suppliers_on_time || "—"}</p>
            </div>
          </div>
        </div>

        {/* Section 6 Card (if craft) */}
        {isCraft && (
          <div className="inv-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E7DFD3] pb-2.5">
              <div>
                <span className="text-xs font-bold text-[#9A4A2E] uppercase tracking-wider">
                  Section 6
                </span>
                <h4 className="text-base font-serif font-medium text-[#1E1A16]">
                  Craft and cultural heritage
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(6)}
                className="inv-btn-secondary text-xs py-1.5 px-3"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1 text-[#6B6259]" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#9A8E84]">Craft Forms:</span>
                <p className="font-medium text-[#1E1A16]">{answers.q6_1_craft_forms || "—"}</p>
              </div>
              <div>
                <span className="text-[#9A8E84]">GI Tag / Registry:</span>
                <p className="font-medium text-[#1E1A16]">{answers.q6_4_gi_tag_held || "—"}</p>
              </div>
              <div>
                <span className="text-[#9A8E84]">Pehchaan / Craftmark:</span>
                <p className="font-medium text-[#1E1A16]">
                  {answers.q6_6_pehchaan_card || answers.q6_8_craftmark_cert || "—"}
                </p>
              </div>
              <div>
                <span className="text-[#9A8E84]">Production Video Mode:</span>
                <p className="font-medium text-[#1E1A16] capitalize">{answers.q6_9_video_mode || "Upload"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Section 7 Card */}
        <div className="inv-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7DFD3] pb-2.5">
            <div>
              <span className="text-xs font-bold text-[#9A4A2E] uppercase tracking-wider">
                Section 7
              </span>
              <h4 className="text-base font-serif font-medium text-[#1E1A16]">
                How you manage your sustainability
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(7)}
              className="inv-btn-secondary text-xs py-1.5 px-3"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1 text-[#6B6259]" /> Edit
            </button>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <span className="text-[#9A8E84]">UN SDGs Selected:</span>
              <p className="font-medium text-[#1E1A16]">
                {answers.q7_6_sdgs?.join(", ") || "None"}
              </p>
            </div>
            <div>
              <span className="text-[#9A8E84]">Strongest SDG Contribution:</span>
              <p className="font-serif italic text-sm text-[#1E1A16]">
                "{answers.q7_7_sdg_contribution_sentence || "—"}"
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Summary */}
        <div className="inv-card p-5 space-y-3 bg-[#FAF7F2]">
          <div className="flex items-center justify-between border-b border-[#E7DFD3] pb-2.5">
            <h4 className="text-sm font-bold text-[#1E1A16] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9A4A2E]" />
              Uploaded Documents ({documents.length})
            </h4>
          </div>
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2 bg-[#FFFFFF] rounded-lg border border-[#E7DFD3] flex items-center justify-between"
                >
                  <span className="truncate max-w-[200px] text-[#1E1A16]">{doc.file_name}</span>
                  <span className="text-[11px] text-[#2D7D46] bg-[#EAF7ED] px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6B6259] italic">
              No files uploaded yet. You can upload them now in their respective sections or supply
              them later during document review.
            </p>
          )}
        </div>
      </div>

      {/* Final Submit Action */}
      <div className="p-6 bg-[#FFFFFF] border border-[#E7DFD3] rounded-2xl shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#2D7D46] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif text-base font-medium text-[#1E1A16]">
              Ready to submit your assessment?
            </h4>
            <p className="text-xs text-[#6B6259]">
              Submitting locks your answers as Version 1. Our evaluation team will review your
              documentation and compute your preliminary ESG scores. You will see your score first
              before anything is published.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="inv-btn-primary py-3 px-8 text-base shadow-md group"
          >
            <Send className="w-4 h-4 mr-1" />
            <span>{isSubmitting ? "Submitting Assessment..." : "Submit Assessment"}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
