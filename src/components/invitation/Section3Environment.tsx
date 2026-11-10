"use client";

import React from "react";
import { FormAnswers, PartnerDocument } from "./types";
import { FileUploadSlot } from "./FileUploadSlot";
import { Check } from "lucide-react";

interface Section3Props {
  slug: string;
  answers: FormAnswers;
  onChange: (updates: Partial<FormAnswers>) => void;
  documents: PartnerDocument[];
  onDocumentsChange: (docs: PartnerDocument[]) => void;
}

const WATER_SOURCES = [
  "Municipal or piped water supply (water that comes through a tap from the government supply)",
  "Borewell or groundwater (a pump connected to underground water)",
  "Rainwater that is collected and stored",
  "A river, lake, or other surface water source nearby",
  "We use very little or no water in our production",
];

const WATER_REDUCTION_OPTIONS = [
  "No: we have not focused on this yet",
  "We have made some small informal changes",
  "Yes: we have specific practices that reduce our water use",
  "Yes: we formally measure and track our water usage and have been reducing it over time",
];

const WATER_MEASURED_OPTIONS = [
  "Yes: a third party measured or audited our water use",
  "Yes: we measure it ourselves regularly",
  "No: we have not formally measured this",
  "We are in the process of measuring this now",
  "Other",
];

const CARBON_FOOTPRINT_OPTIONS = [
  "Yes: a third-party consultant or certification body calculated it for us",
  "Yes: we calculated it ourselves using a recognised methodology",
  "No: we have not done this yet",
  "We are in the process of doing this now",
  "Other",
];

const CHEMICALS_LIST = [
  "Synthetic chemical dyes (for example: Reactive dyes, Disperse dyes, Acid dyes)",
  "Natural dyes (for example: indigo, turmeric, pomegranate rind, marigold, henna)",
  "Bleaching agents",
  "Chemical adhesives or bonding agents",
  "Preservatives or stabilisers",
  "Industrial cleaning chemicals",
  "Other",
];

const CHEMICAL_APPROACH_OPTIONS = [
  "We use some chemicals that could be harmful and we do not have specific controls in place",
  "We are aware of the concern and are working to replace or reduce harmful chemicals",
  "We have mostly moved to safe, natural inputs: very little or nothing harmful used",
  "Everything we use is non-toxic and safe: we have completely moved away from harmful chemicals",
];

const ENV_CERTS = [
  "GOTS (Global Organic Textile Standard)",
  "OEKO-TEX Standard 100",
  "Organic certification",
  "ISO 14001 Environmental Management System",
  "BIS certification",
  "None at the moment",
  "Other",
];

const LCA_OPTIONS = [
  "Yes: a full LCA has been completed by a third-party firm",
  "Yes: a simplified or screening LCA has been done",
  "No: we have not done an LCA",
  "I am not sure what this is",
];

export function Section3Environment({
  slug,
  answers,
  onChange,
  documents,
  onDocumentsChange,
}: Section3Props) {
  // Check conditions
  const show3_2a =
    answers.q3_2_water_reduction_action &&
    answers.q3_2_water_reduction_action !== "No: we have not focused on this yet";

  const showWaterFollowUps =
    answers.q3_2b_water_measured &&
    answers.q3_2b_water_measured.startsWith("Yes");

  const showCarbonFollowUps =
    answers.q3_2f_carbon_footprint_done &&
    answers.q3_2f_carbon_footprint_done.startsWith("Yes");

  const showLcaUpload =
    answers.q3_6a_lca_done && answers.q3_6a_lca_done.startsWith("Yes");

  const selectedCerts = answers.q3_6_environmental_certs || [];

  const toggleCert = (cert: string) => {
    if (cert === "None at the moment") {
      onChange({ q3_6_environmental_certs: ["None at the moment"] });
      return;
    }
    const cleanList = selectedCerts.filter((c) => c !== "None at the moment");
    if (cleanList.includes(cert)) {
      onChange({ q3_6_environmental_certs: cleanList.filter((c) => c !== cert) });
    } else {
      onChange({ q3_6_environmental_certs: [...cleanList, cert] });
    }
  };

  const selectedChemicals = answers.q3_4_chemicals_list || [];

  const toggleChemical = (chem: string) => {
    if (selectedChemicals.includes(chem)) {
      onChange({ q3_4_chemicals_list: selectedChemicals.filter((c) => c !== chem) });
    } else {
      onChange({ q3_4_chemicals_list: [...selectedChemicals, chem] });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-[#E7DFD3] pb-4">
        <h2 className="text-2xl font-serif text-[#1E1A16] font-normal">
          SECTION 3: Your environment
        </h2>
        <p className="text-sm text-[#6B6259]">
          Intro: These questions help us understand the environmental impact of your products
          including manufacturing and end-of-life impact. You do not need to know any technical
          terms, just describe what you actually do. If you are not sure about something, give your
          best answer and say so. If there are any associated certifications the business currently
          has, please upload them at the end of the section.
        </p>
      </div>

      <div className="space-y-6">
        {/* 3.1 Water Source */}
        <div className="inv-card p-5 space-y-3">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            3.1 Main source of water usage in your manufacturing facility{" "}
            <span className="text-[#9A4A2E]">*</span>
          </label>
          <div className="space-y-2 pt-1">
            {WATER_SOURCES.map((src) => {
              const isSelected = answers.q3_1_water_source === src;
              return (
                <div
                  key={src}
                  onClick={() => onChange({ q3_1_water_source: src })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{src}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3.2 Water Reduction Actions */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              3.2 Have you taken any actions to reduce the water consumption in your production?{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Hint: For example: reusing water from one process in the next, switching to a
              technique that needs less water, fixing leaks, collecting rainwater.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {WATER_REDUCTION_OPTIONS.map((opt) => {
              const isSelected = answers.q3_2_water_reduction_action === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q3_2_water_reduction_action: opt })}
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

        {/* 3.2a Conditional Water Reduction Description */}
        {show3_2a && (
          <div className="inv-card p-5 space-y-2 bg-[#FAF7F2] border-[#9A4A2E]/40 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              3.2a If you have taken steps to reduce your water consumption describe briefly what you do
            </label>
            <p className="inv-hint">
              Example: "We recycle the water from our dyeing process and reuse it for the next wash
              cycle. This reduces our water use by about half."
            </p>
            <textarea
              rows={3}
              value={answers.q3_2a_water_reduction_desc || ""}
              onChange={(e) => onChange({ q3_2a_water_reduction_desc: e.target.value })}
              className="inv-textarea"
              placeholder="Describe your water-saving practices..."
            />
          </div>
        )}

        {/* 3.2b Water Measured */}
        <div className="inv-card p-5 space-y-3">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            3.2b Has your enterprise ever formally measured your water consumption or water footprint?{" "}
            <span className="text-[#9A4A2E]">*</span>
          </label>
          <div className="space-y-2 pt-1">
            {WATER_MEASURED_OPTIONS.map((opt) => {
              const isSelected = answers.q3_2b_water_measured === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q3_2b_water_measured: opt })}
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

        {/* 3.2c, 3.2d, 3.2e Conditional on Water Measured = Yes */}
        {showWaterFollowUps && (
          <div className="space-y-4 p-5 bg-[#FAF7F2] border border-[#9A4A2E]/30 rounded-xl animate-in fade-in">
            <h4 className="text-sm font-bold text-[#9A4A2E] uppercase tracking-wider">
              Water Measurement Details
            </h4>

            {/* 3.2c */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#1E1A16]">
                3.2c Approximate water consumption per unit of product? <span className="text-[#9A4A2E]">*</span>
              </label>
              <p className="inv-hint">
                Write the number and unit. If you only have a total monthly figure that is fine too.
                Examples: "12 litres per metre of fabric dyed" · "850 litres per month total
                production water" · "3.2 litres per soap bar produced"
              </p>
              <input
                type="text"
                value={answers.q3_2c_water_consumption_per_unit || ""}
                onChange={(e) => onChange({ q3_2c_water_consumption_per_unit: e.target.value })}
                className="inv-input"
                placeholder="e.g. 12 litres per metre"
              />
            </div>

            {/* 3.2d */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#1E1A16]">
                3.2d How does this compare to conventional production in your category? (optional)
              </label>
              <p className="inv-hint">
                If you know the comparison, share it. If not, leave it blank, we will calculate the
                comparison for you. Example: "Conventional block printing uses approximately 40
                litres per metre. We use 12 litres, a 70% reduction."
              </p>
              <textarea
                rows={2}
                value={answers.q3_2d_water_comparison || ""}
                onChange={(e) => onChange({ q3_2d_water_comparison: e.target.value })}
                className="inv-textarea"
                placeholder="Optional comparison..."
              />
            </div>

            {/* 3.2e */}
            <FileUploadSlot
              slug={slug}
              questionRef="3.2e_water_report"
              label="3.2e Upload your water measurement report if you have one"
              hint="Upload any third-party audit, internal measurement sheet, or summary."
              documents={documents}
              onDocumentsChange={onDocumentsChange}
              allowLater={true}
              laterDate={answers.q3_2e_water_report_later || ""}
              onLaterDateChange={(date) => onChange({ q3_2e_water_report_later: date })}
            />
          </div>
        )}

        {/* 3.2f Formal Carbon Footprint */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              3.2f Has your enterprise ever had a formal carbon footprint calculation done for your
              products or operations? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Hint: A carbon footprint calculation tells you how much CO2 your production emits. It
              may have been done by a consultant, a certification body, an NGO, or your own team
              using a recognised methodology.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {CARBON_FOOTPRINT_OPTIONS.map((opt) => {
              const isSelected = answers.q3_2f_carbon_footprint_done === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q3_2f_carbon_footprint_done: opt })}
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

        {/* 3.2g, 3.2h, 3.2i Conditional on Carbon Footprint = Yes */}
        {showCarbonFollowUps && (
          <div className="space-y-4 p-5 bg-[#FAF7F2] border border-[#9A4A2E]/30 rounded-xl animate-in fade-in">
            <h4 className="text-sm font-bold text-[#9A4A2E] uppercase tracking-wider">
              Carbon Footprint Findings
            </h4>

            {/* 3.2g */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#1E1A16]">
                3.2g What is the carbon footprint of your main product?
              </label>
              <p className="inv-hint">
                Write the number and unit exactly as the report states it. If it covers your whole
                operation rather than a single product, write that instead. Examples: "0.46 kg CO2e
                per amenity pouch" · "232 kg CO2e per month total operations" · "4.2 tonnes CO2e per
                year"
              </p>
              <input
                type="text"
                value={answers.q3_2g_carbon_footprint_val || ""}
                onChange={(e) => onChange({ q3_2g_carbon_footprint_val: e.target.value })}
                className="inv-input"
                placeholder="e.g. 0.46 kg CO2e per unit"
              />
            </div>

            {/* 3.2h */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#1E1A16]">
                3.2h Who calculated or verified this carbon footprint?
              </label>
              <p className="inv-hint">
                Name of the organisation, consultant, or methodology used. Examples: "Calculated by
                Green Audits India using GHG Protocol methodology" · "Self-calculated using the
                Carbon Trust SME Calculator" · "Verified by Bureau Veritas as part of our ISO 14001
                audit"
              </p>
              <input
                type="text"
                value={answers.q3_2h_carbon_footprint_verifier || ""}
                onChange={(e) => onChange({ q3_2h_carbon_footprint_verifier: e.target.value })}
                className="inv-input"
                placeholder="e.g. Green Audits India / Bureau Veritas"
              />
            </div>

            {/* 3.2i */}
            <FileUploadSlot
              slug={slug}
              questionRef="3.2i_carbon_report"
              label="3.2i Upload your carbon footprint report or calculation"
              hint="Any document that shows the methodology and the result, even a one-page summary counts."
              documents={documents}
              onDocumentsChange={onDocumentsChange}
              allowLater={true}
              laterDate={answers.q3_2i_carbon_report_later || ""}
              onLaterDateChange={(date) => onChange({ q3_2i_carbon_report_later: date })}
            />
          </div>
        )}

        {/* 3.3 Chemicals Used */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              3.3 Do you use any chemicals in your production process? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Chemicals include: dyes, bleaches, adhesives, varnishes, preservatives, industrial
              cleaning products, finishing agents.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            {["Yes", "No"].map((opt) => {
              const isSelected = answers.q3_3_uses_chemicals === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q3_3_uses_chemicals: opt })}
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

        {/* 3.4 Conditional on Chemicals = Yes */}
        {answers.q3_3_uses_chemicals === "Yes" && (
          <div className="inv-card p-5 space-y-3 bg-[#FAF7F2] border-[#9A4A2E]/40 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              3.4 Which of the following do you use?
            </label>
            <div className="space-y-2 pt-1">
              {CHEMICALS_LIST.map((chem) => {
                const isSelected = selectedChemicals.includes(chem);
                return (
                  <div
                    key={chem}
                    onClick={() => toggleChemical(chem)}
                    className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                  >
                    <div className="inv-choice-square">
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-[#1E1A16]">{chem}</span>
                  </div>
                );
              })}
            </div>
            {selectedChemicals.includes("Other") && (
              <input
                type="text"
                placeholder="Describe other chemicals used..."
                value={answers.q3_4_chemicals_other || ""}
                onChange={(e) => onChange({ q3_4_chemicals_other: e.target.value })}
                className="inv-input mt-2"
              />
            )}
          </div>
        )}

        {/* 3.5 Chemical Approach */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              3.5 How would you describe your approach to the chemicals or inputs you use?{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Choose the option that best matches your current situation. (Be honest, we use this to
              understand where you are today, not to judge you.)
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {CHEMICAL_APPROACH_OPTIONS.map((opt) => {
              const isSelected = answers.q3_5_chemical_approach === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q3_5_chemical_approach: opt })}
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

        {/* 3.6 Environmental Certifications */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              3.6 Do you have any environmental certifications? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Hint: Not sure what these are? Most enterprises starting out do not have these yet.
              Select "None at the moment" and continue, this does not disqualify you. GOTS = Global
              Organic Textile Standard (for organic textiles) · OEKO-TEX = confirms no harmful
              chemicals in the product · ISO 14001 = international standard for environmental
              management systems.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {ENV_CERTS.map((cert) => {
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
              placeholder="Name of other environmental certification..."
              value={answers.q3_6_certs_other || ""}
              onChange={(e) => onChange({ q3_6_certs_other: e.target.value })}
              className="inv-input mt-2"
            />
          )}
        </div>

        {/* 3.6a Life Cycle Assessment */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              3.6a Has your enterprise had any formal Life Cycle Assessment (LCA) done?
            </label>
            <p className="inv-hint">
              Hint: An LCA is a detailed analysis of the environmental impact of a product across
              its entire life, from raw material to production to disposal. It is more comprehensive
              than a basic carbon footprint calculation. Not sure what this is? Most young
              enterprises may not have one. Select No and continue.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {LCA_OPTIONS.map((opt) => {
              const isSelected = answers.q3_6a_lca_done === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q3_6a_lca_done: opt })}
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

        {/* 3.6c Conditional on LCA = Yes */}
        {showLcaUpload && (
          <div className="inv-card p-5 space-y-3 bg-[#FAF7F2] border-[#9A4A2E]/40 animate-in fade-in">
            <FileUploadSlot
              slug={slug}
              questionRef="3.6c_lca_report"
              label="3.6c Upload your LCA report"
              hint="Attach your formal or screening Life Cycle Assessment study."
              documents={documents}
              onDocumentsChange={onDocumentsChange}
              allowLater={true}
              laterDate={answers.q3_6c_lca_later || ""}
              onLaterDateChange={(date) => onChange({ q3_6c_lca_later: date })}
            />
          </div>
        )}

        {/* 3.7 Environmental Certificates Upload Slot */}
        <div className="inv-card p-5 space-y-3">
          <FileUploadSlot
            slug={slug}
            questionRef="3.7_env_certificates"
            label="3.7 Environmental certificates: upload"
            hint="Please upload your environmental certificates here (e.g. GOTS, OEKO-TEX, ISO 14001, organic test reports)."
            documents={documents}
            onDocumentsChange={onDocumentsChange}
            allowLater={true}
            laterDate={answers.q3_7_env_certs_later || ""}
            onLaterDateChange={(date) => onChange({ q3_7_env_certs_later: date })}
          />
        </div>
      </div>
    </div>
  );
}
