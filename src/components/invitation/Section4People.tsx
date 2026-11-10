"use client";

import React from "react";
import { FormAnswers, PartnerDocument } from "./types";
import { FileUploadSlot } from "./FileUploadSlot";
import { Check, AlertTriangle } from "lucide-react";

interface Section4Props {
  slug: string;
  answers: FormAnswers;
  onChange: (updates: Partial<FormAnswers>) => void;
  documents: PartnerDocument[];
  onDocumentsChange: (docs: PartnerDocument[]) => void;
}

const PRIMARY_INCOME_OPTIONS = [
  "Yes: for most or all of them, this is their primary livelihood (main source of income)",
  "For some it is their main income, for others it is additional income on top of another activity",
  "For most of them this is additional income, they have another primary livelihood like farming",
  "I am not sure",
];

const ESI_OPTIONS = [
  "Yes: all our workers are enrolled in ESI",
  "Some workers are enrolled, not all",
  "No: we are not enrolled yet",
  "We are a cooperative or self-employed structure: ESI does not apply to us in the same way",
  "I am not sure whether we are registered",
  "No: ESIC is currently not applicable to us (we are below the required employee numbers)",
];

const WRITTEN_AGREEMENT_OPTIONS = [
  "No, we do not have formal agreements, we work on trust and verbal agreement.",
  "Yes: we have proper written agreements or employment contracts",
];

const SAFETY_OPTIONS = [
  "We do not have any specific health or safety measures in place",
  "We have some basic informal safety measures, for example protective equipment is available",
  "We have documented safety practices that workers follow regularly",
  "We have a strong safety system: documented, workers are trained, and we review it regularly",
];

const SOCIAL_CERTS = [
  "Fair Trade certified",
  "SA8000 Social Accountability certification",
  "WFTO: World Fair Trade Organization member",
  "None at the moment",
  "Other",
];

export function Section4People({
  slug,
  answers,
  onChange,
  documents,
  onDocumentsChange,
}: Section4Props) {
  const totalWorkers = Number(answers.q1_15_workers_count) || 0;
  const womenWorkers = Number(answers.q4_1_women_workers_count) || 0;
  const isWomenCountExceeded = totalWorkers > 0 && womenWorkers > totalWorkers;

  const selectedCerts = answers.q4_7_social_certs || [];

  const toggleCert = (cert: string) => {
    if (cert === "None at the moment") {
      onChange({ q4_7_social_certs: ["None at the moment"] });
      return;
    }
    const cleanList = selectedCerts.filter((c) => c !== "None at the moment");
    if (cleanList.includes(cert)) {
      onChange({ q4_7_social_certs: cleanList.filter((c) => c !== cert) });
    } else {
      onChange({ q4_7_social_certs: [...cleanList, cert] });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-[#E7DFD3] pb-4">
        <h2 className="text-2xl font-serif text-[#1E1A16] font-normal">
          SECTION 4: Your people and community
        </h2>
        <p className="text-sm text-[#6B6259]">
          Intro: These questions help us understand your organization and team structures, the
          livelihoods you create and the communities you support. This section covers your
          workforce, wages, and workplace safety. Upload ESI documents and social certifications at
          the end of this section.
        </p>
      </div>

      <div className="space-y-6">
        {/* 4.1 Women Workers */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            4.1 Of the total workers you mentioned in Section 1, how many are women?{" "}
            <span className="text-[#9A4A2E]">*</span>
          </label>
          <p className="inv-hint">
            Example: If you have 15 workers total and 12 are women, write 12. Write 0 if none of
            your workers are women.
            {totalWorkers > 0 && (
              <span className="text-[#9A4A2E] font-medium ml-1">
                (Total workers declared in 1.15: {totalWorkers})
              </span>
            )}
          </p>
          <input
            type="number"
            min={0}
            required
            value={answers.q4_1_women_workers_count ?? ""}
            onChange={(e) => onChange({ q4_1_women_workers_count: e.target.value })}
            placeholder="0"
            className="inv-input max-w-xs"
          />
          {isWomenCountExceeded && (
            <div className="flex items-center gap-2 text-xs text-[#C0392B] bg-[#FEE2E2] p-2.5 rounded-lg mt-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                Women workers ({womenWorkers}) cannot exceed total workers ({totalWorkers}). Please
                check your count.
              </span>
            </div>
          )}
        </div>

        {/* 4.2 Primary Income Source */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              4.2 Is this work the primary source of income for your employees?{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              We want to understand whether working here is the primary livelihood for your team,
              meaning this is how their families pay for food, education, and healthcare. (Both
              primary and supplementary livelihoods are valuable. We just want to understand the
              difference honestly.)
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {PRIMARY_INCOME_OPTIONS.map((opt) => {
              const isSelected = answers.q4_2_primary_income_source === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q4_2_primary_income_source: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4.3 Minimum Wage */}
        <div className="inv-card p-5 space-y-3">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            4.3 Does your organization ensure that all workers/employees are paid above the
            government minimum wage? <span className="text-[#9A4A2E]">*</span>
          </label>
          <div className="space-y-2 pt-1">
            {["Yes", "No", "Other"].map((opt) => {
              const isSelected = answers.q4_3_minimum_wage === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q4_3_minimum_wage: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm font-medium text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4.4 ESI Enrollment */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              4.4 Are your workers enrolled in ESI (Employees' State Insurance)?{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              ESI is a government health and insurance scheme for workers. If you have more than 10
              employees earning over ₹21,000 per month, you are required to register at esic.gov.in.
              Not sure if you are registered? Log in to esic.gov.in with your employer code, or
              check with your accountant. If you are not registered yet, select the appropriate
              option, this does not disqualify you.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {ESI_OPTIONS.map((opt) => {
              const isSelected = answers.q4_4_esi_enrolled === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q4_4_esi_enrolled: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4.5 Written Agreements */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              4.5 Do you have any written agreements with your workers about their pay and working
              conditions? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Even a simple signed letter counts. This does not have to be a formal legal contract.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {WRITTEN_AGREEMENT_OPTIONS.map((opt) => {
              const isSelected = answers.q4_5_written_agreements === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q4_5_written_agreements: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4.6 Health and Safety */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              4.6 How would you describe workplace health and safety in your production area?{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Examples of basic safety measures: providing masks, gloves, or protective clothing;
              keeping walkways clear; having a first aid kit available; ensuring good ventilation.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {SAFETY_OPTIONS.map((opt) => {
              const isSelected = answers.q4_6_health_safety === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q4_6_health_safety: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4.7 Social Certifications */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              4.7 Do you hold any social certifications? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Hint: Not sure what these are? Most enterprises do not have these at first. Select
              "None at the moment" and continue. Fair Trade = certification confirming fair wages
              and good working conditions · SA8000 = global standard for ethical workplaces · WFTO =
              World Fair Trade Organization membership.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {SOCIAL_CERTS.map((cert) => {
              const isSelected = selectedCerts.includes(cert);
              return (
                <div
                  key={cert}
                  onClick={() => toggleCert(cert)}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-square">
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{cert}</span>
                </div>
              );
            })}
          </div>
          {selectedCerts.includes("Other") && (
            <input
              type="text"
              placeholder="Describe other social certification..."
              value={answers.q4_7_certs_other || ""}
              onChange={(e) => onChange({ q4_7_certs_other: e.target.value })}
              className="inv-input mt-2"
            />
          )}
        </div>

        {/* 4.8 Social Certificates & ESI Upload Slot */}
        <div className="inv-card p-5 space-y-3">
          <FileUploadSlot
            slug={slug}
            questionRef="4.8_social_and_esi_docs"
            label="4.8 Social certificates and ESI documents: upload"
            hint="Upload your ESI enrollment certificate and any social certifications. If you do not have these documents yet, leave this blank."
            documents={documents}
            onDocumentsChange={onDocumentsChange}
            allowLater={true}
            laterDate={answers.q4_8_social_docs_later || ""}
            onLaterDateChange={(date) => onChange({ q4_8_social_docs_later: date })}
          />
        </div>

        {/* 4.9 Community Support Story */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            4.9 If your enterprise supports a local community through livelihood opportunities and other ways we would love to know about it.{" "}
            <span className="text-[#9A4A2E]">*</span>
          </label>
          <p className="inv-hint">
            Example: "All 18 of our artisans are women from Bagru village. Most of them learned block
            printing from their mothers. For 14 of the 18 families, this is their only source of
            income. The cooperative has helped several women send their children to school for the
            first time."
          </p>
          <textarea
            rows={4}
            required
            value={answers.q4_9_community_support || ""}
            onChange={(e) => onChange({ q4_9_community_support: e.target.value })}
            placeholder="Tell us about the local community, artisan families, or social impact you foster..."
            className="inv-textarea"
          />
        </div>
      </div>
    </div>
  );
}
