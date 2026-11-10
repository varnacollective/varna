"use client";

import React from "react";
import { FormAnswers, PartnerDocument } from "./types";
import { FileUploadSlot } from "./FileUploadSlot";
import { Check, Target, Info } from "lucide-react";

interface Section7Props {
  slug: string;
  answers: FormAnswers;
  onChange: (updates: Partial<FormAnswers>) => void;
  documents: PartnerDocument[];
  onDocumentsChange: (docs: PartnerDocument[]) => void;
}

const ENERGY_OPTIONS = [
  "No: we do not track this currently",
  "We have informal records, for example we keep our electricity bills",
  "Yes: we record our monthly energy use in a spreadsheet or logbook",
  "Yes: we have a formal energy management system and track renewable vs non-renewable energy",
];

const IMPACT_CHANGES_OPTIONS = [
  "No specific changes yet",
  "Yes: small changes to reduce waste or energy",
  "Yes: significant changes in our process, materials, or energy source",
  "Yes: our entire business was designed from the beginning to minimise environmental impact",
];

const WORKER_POLICIES_OPTIONS = [
  "Nothing written currently: we operate on trust and verbal agreement",
  "Yes, but the list is not exhaustive. We have a few key policies documented.",
  "Yes, we have documented HR policies and these are shared with everyone joining the company.",
  "Yes: our employment practices are documented and independently verified",
];

const SOURCING_CONSIDERATION_OPTIONS = [
  "We have not formally considered this yet",
  "We informally prefer good suppliers but have no written criteria",
  "Yes: we have basic criteria we apply when choosing suppliers",
  "Yes: we have a formal supplier code of conduct and review our suppliers against it",
];

const SDGS_LIST = [
  { id: "1", title: "SDG 1 No Poverty", desc: "Providing primary livelihoods, supporting low-income communities" },
  { id: "2", title: "SDG 2 Zero Hunger", desc: "Food security, sustainable agriculture, supporting farming communities" },
  { id: "3", title: "SDG 3 Good Health and Well-Being", desc: "Safe workplaces, non-toxic products, community health" },
  { id: "4", title: "SDG 4 Quality Education", desc: "Artisan skill training, knowledge transfer, youth apprenticeships" },
  { id: "5", title: "SDG 5 Gender Equality", desc: "Women ownership, women workforce, women-led cooperatives" },
  { id: "6", title: "SDG 6 Clean Water and Sanitation", desc: "Water reduction, clean production, water-safe inputs" },
  { id: "7", title: "SDG 7 Affordable and Clean Energy", desc: "Solar, clean energy use in production" },
  { id: "8", title: "SDG 8 Decent Work and Economic Growth", desc: "Fair wages, safe conditions, dignified employment" },
  { id: "9", title: "SDG 9 Industry, Innovation and Infrastructure", desc: "Material innovation, circular production systems" },
  { id: "10", title: "SDG 10 Reduced Inequalities", desc: "Rural employment, marginalised community support" },
  { id: "11", title: "SDG 11 Sustainable Cities and Communities", desc: "Local procurement, community resilience" },
  { id: "12", title: "SDG 12 Responsible Consumption and Production", desc: "Sustainable materials, circular economy, low waste" },
  { id: "13", title: "SDG 13 Climate Action", desc: "Carbon reduction, climate-resilient communities, low-impact production" },
  { id: "14", title: "SDG 14 Life Below Water", desc: "Ocean-safe inputs, plastic-free, no marine pollutants" },
  { id: "15", title: "SDG 15 Life on Land", desc: "Biodiversity-safe sourcing, forest-friendly materials, land stewardship" },
  { id: "16", title: "SDG 16 Peace, Justice and Strong Institutions", desc: "Legal compliance, ethical governance, fair trade" },
  { id: "17", title: "SDG 17 Partnerships for the Goals", desc: "Multi-stakeholder collaboration, fair supply chains" },
];

export function Section7Sustainability({
  slug,
  answers,
  onChange,
  documents,
  onDocumentsChange,
}: Section7Props) {
  const show7_2a =
    answers.q7_2_environmental_changes &&
    answers.q7_2_environmental_changes !== "No specific changes yet";

  const selectedSDGs = answers.q7_6_sdgs || [];

  const toggleSDG = (sdgTitle: string) => {
    if (selectedSDGs.includes(sdgTitle)) {
      onChange({ q7_6_sdgs: selectedSDGs.filter((s) => s !== sdgTitle) });
    } else {
      onChange({ q7_6_sdgs: [...selectedSDGs, sdgTitle] });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-[#E7DFD3] pb-4">
        <h2 className="text-2xl font-serif text-[#1E1A16] font-normal">
          SECTION 7: How you manage your sustainability
        </h2>
        <p className="text-sm text-[#6B6259]">
          Energy tracking, environmental improvements, SDG alignments, and final document uploads.
        </p>
      </div>

      <div className="space-y-6">
        {/* 7.1 Track Energy */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              7.1 Do you currently track your electricity or energy use? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              For example: keeping electricity bills together, recording units consumed each month,
              tracking diesel use for generators.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {ENERGY_OPTIONS.map((opt) => {
              const isSelected = answers.q7_1_track_energy === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q7_1_track_energy: opt })}
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

        {/* 7.2 Environmental Changes */}
        <div className="inv-card p-5 space-y-3">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            7.2 Have you made any specific changes to reduce your environmental impact?{" "}
            <span className="text-[#9A4A2E]">*</span>
          </label>
          <div className="space-y-2 pt-1">
            {IMPACT_CHANGES_OPTIONS.map((opt) => {
              const isSelected = answers.q7_2_environmental_changes === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q7_2_environmental_changes: opt })}
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

        {/* 7.2a Conditional on Environmental Changes */}
        {show7_2a && (
          <div className="inv-card p-5 space-y-2 bg-[#FAF7F2] border-[#9A4A2E]/40 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              7.2a Describe what you have done
            </label>
            <p className="inv-hint">
              Example: "We replaced our diesel generator with a 5 kW rooftop solar system in 2023. We
              now run our daytime production entirely on solar energy."
            </p>
            <textarea
              rows={3}
              value={answers.q7_2a_changes_desc || ""}
              onChange={(e) => onChange({ q7_2a_changes_desc: e.target.value })}
              className="inv-textarea"
              placeholder="Describe your energy, waste, or material improvements..."
            />
          </div>
        )}

        {/* 7.2b Formal Sustainability Report */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              7.2b Does your enterprise produce any formal sustainability/impact report?{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Hint: Even a simple annual summary shared with customers counts.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            {["Yes", "No"].map((opt) => {
              const isSelected = answers.q7_2b_sustainability_report === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q7_2b_sustainability_report: opt })}
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

        {/* 7.3 Worker Policies */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              7.3 Do you have any written policies about how you treat your workers?
            </label>
            <p className="inv-hint">
              For example: a document that says what wages you pay, how many hours the workday is,
              what leave workers get, how complaints are handled (e.g. an employee handbook or set of
              documented HR policies).
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {WORKER_POLICIES_OPTIONS.map((opt) => {
              const isSelected = answers.q7_3_worker_policies === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q7_3_worker_policies: opt })}
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

        {/* 7.4 Sourcing Consideration */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              7.4 When you buy materials from suppliers, do you think about where they come from or how they are produced?{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              For example: do you prefer suppliers who treat their workers fairly, who use
              sustainable practices, or who are based locally?
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {SOURCING_CONSIDERATION_OPTIONS.map((opt) => {
              const isSelected = answers.q7_4_supplier_consideration === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q7_4_supplier_consideration: opt })}
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

        {/* 7.5 List Every Certification */}
        <div className="inv-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              7.5 List every certification, registration, or government scheme you are part of.{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <button
              type="button"
              onClick={() => onChange({ q7_5_all_certifications: "None at the moment" })}
              className={`inv-chip ${answers.q7_5_all_certifications === "None at the moment" ? "active" : ""}`}
            >
              None at the moment
            </button>
          </div>
          <p className="inv-hint">
            Include everything: any government registration, any certification body, any scheme
            enrollment. Even if it seems small or obvious. Things to include: GI tag, Pehchaan Card,
            Craftmark, FSSAI, BIS, ISO certifications, Fair Trade, OEKO-TEX, GOTS, AHVY scheme,
            NRLM, any state government artisan scheme, any export certification. Not sure what
            counts? If the government or a recognised body gave you a certificate or registration
            number, include it.
          </p>
          <textarea
            rows={4}
            required
            value={answers.q7_5_all_certifications || ""}
            onChange={(e) => onChange({ q7_5_all_certifications: e.target.value })}
            className="inv-textarea"
            placeholder="List registrations, certifications, schemes, or memberships..."
          />
        </div>

        {/* 7.6 UN SDGs Multi Cards */}
        <div className="inv-card p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              7.6 Which UN Sustainable Development Goals does your enterprise most directly contribute to?{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Not sure which ones apply? Think about what your enterprise does: if you provide
              livelihoods for women, SDG 5 applies. If you use sustainable materials, SDG 12
              applies. Select what feels genuinely true, do not select all of them.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {SDGS_LIST.map((sdg) => {
              const isSelected = selectedSDGs.includes(sdg.title);
              return (
                <div
                  key={sdg.id}
                  onClick={() => toggleSDG(sdg.title)}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-square flex-shrink-0">
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#1E1A16]">{sdg.title}</p>
                    <p className="text-[11px] text-[#6B6259]">{sdg.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7.7 SDG Contribution In One Sentence */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            7.7 In one sentence, how does your enterprise contribute to the SDG you feel most strongly about?{" "}
            <span className="text-[#9A4A2E]">*</span>
          </label>
          <p className="inv-hint">
            Examples: "We contribute to SDG 5 — Gender Equality — by running a 100% women-led
            cooperative where craft production is the primary livelihood for 18 artisan families." ·
            "We contribute to SDG 12 — Responsible Consumption — by replacing conventional plastic
            amenity trays with a product made entirely from agricultural waste that would otherwise
            be burned."
          </p>
          <textarea
            rows={3}
            required
            value={answers.q7_7_sdg_contribution_sentence || ""}
            onChange={(e) => onChange({ q7_7_sdg_contribution_sentence: e.target.value })}
            className="inv-textarea"
            placeholder="In one clear sentence, explain your strongest SDG contribution..."
          />
        </div>

        {/* 7.8 All Certificates Upload Grouped */}
        <div className="inv-card p-5 space-y-5">
          <div className="border-b border-[#E7DFD3] pb-2">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              7.8 All certificates: upload <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Please upload every certificate and registration document you hold. Each certificate
              you upload will be listed on your Varna profile and contributes positively to your
              assessment score. Each slot supports "I'll add this later" with a date.
            </p>
          </div>

          <div className="space-y-6">
            <FileUploadSlot
              slug={slug}
              questionRef="7.8_gov_registrations"
              label="Government Registrations & Schemes"
              hint="Udyam, FSSAI, state artisan registry, MSME scheme approvals"
              documents={documents}
              onDocumentsChange={onDocumentsChange}
              allowLater={true}
            />

            <FileUploadSlot
              slug={slug}
              questionRef="7.8_craft_certifications"
              label="Craft & Artisan Certifications"
              hint="GI tag user cert, Pehchaan cards, Craftmark, artisan awards"
              documents={documents}
              onDocumentsChange={onDocumentsChange}
              allowLater={true}
            />

            <FileUploadSlot
              slug={slug}
              questionRef="7.8_social_env_certifications"
              label="Social, Environmental & Quality Certifications"
              hint="GOTS, OEKO-TEX, Fair Trade, ISO, organic certs, testing reports"
              documents={documents}
              onDocumentsChange={onDocumentsChange}
              allowLater={true}
            />
          </div>
        </div>

        {/* Final Notes for Relationship Manager */}
        <div className="inv-card p-5 space-y-2 bg-[#FAF7F2] border-[#E7DFD3]">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            Final: Any final notes or questions for your Varna relationship manager? (optional)
          </label>
          <p className="inv-hint">
            Use this space for anything you want to tell us that did not fit into the questions
            above.
          </p>
          <textarea
            rows={3}
            value={answers.q7_final_notes || ""}
            onChange={(e) => onChange({ q7_final_notes: e.target.value })}
            className="inv-textarea"
            placeholder="Share any special circumstances, upcoming certifications, or questions..."
          />
        </div>
      </div>
    </div>
  );
}
