"use client";

import { StepWrapper, TextareaField, SelectField } from "../FormFields";

const YES_NO_PARTIAL = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "partially", label: "Partially / In Progress" },
];

const SDG_OPTIONS = [
  { value: "sdg1", label: "SDG 1: No Poverty" },
  { value: "sdg2", label: "SDG 2: Zero Hunger" },
  { value: "sdg3", label: "SDG 3: Good Health & Well-being" },
  { value: "sdg4", label: "SDG 4: Quality Education" },
  { value: "sdg5", label: "SDG 5: Gender Equality" },
  { value: "sdg6", label: "SDG 6: Clean Water & Sanitation" },
  { value: "sdg7", label: "SDG 7: Affordable & Clean Energy" },
  { value: "sdg8", label: "SDG 8: Decent Work & Economic Growth" },
  { value: "sdg9", label: "SDG 9: Industry, Innovation & Infrastructure" },
  { value: "sdg10", label: "SDG 10: Reduced Inequalities" },
  { value: "sdg11", label: "SDG 11: Sustainable Cities & Communities" },
  { value: "sdg12", label: "SDG 12: Responsible Consumption & Production" },
  { value: "sdg13", label: "SDG 13: Climate Action" },
  { value: "sdg14", label: "SDG 14: Life Below Water" },
  { value: "sdg15", label: "SDG 15: Life on Land" },
  { value: "sdg16", label: "SDG 16: Peace, Justice & Strong Institutions" },
  { value: "sdg17", label: "SDG 17: Partnerships for the Goals" },
];

export default function Step7Management() {
  return (
    <StepWrapper
      stepNumber={7}
      title="Sustainability Management"
      subtitle="This is the final section. Tell us how you plan, track, and grow your sustainability practice."
    >
      <SelectField
        name="sdg_alignment"
        label="Primary UN Sustainable Development Goal Alignment"
        options={SDG_OPTIONS}
        hint="Select the SDG that most directly aligns with your enterprise's primary impact. You can describe additional SDGs in the field below."
      />

      <TextareaField
        name="sustainability_tracking"
        label="How do you currently track sustainability performance?"
        placeholder="e.g. Internal spreadsheet, third-party ESG audit, self-assessment, not currently tracked…"
        hint="Describe the tools, processes, or frameworks you use to measure and monitor your environmental and social impact."
        rows={4}
      />

      <TextareaField
        name="sustainability_goals"
        label="Sustainability Goals for the Next 3 Years"
        placeholder="e.g. Achieve GOTS certification by 2026, switch to 100% solar energy, onboard 20 new artisan families, reduce water consumption by 30%…"
        hint="Be specific and ambitious. These goals may be featured in our Varna Impact Reports."
        rows={4}
      />

      <TextareaField
        name="additional_certifications"
        label="Additional Certifications, Awards & Recognitions"
        placeholder="e.g. National Handicraft Award 2023, Craftmark, WFTO membership, B-Corp certification, ISO 9001…"
        hint="List any quality, sustainability, or craft certifications and industry recognitions not mentioned in earlier sections."
        rows={3}
      />

      {/* Final declaration notice */}
      <div className="mt-6 p-5 border border-slate-mist/15 bg-white/[0.02]">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-mist mb-2">
          Declaration
        </p>
        <p className="text-xs text-slate-mist font-light leading-relaxed">
          By submitting this assessment, you confirm that all information provided is accurate
          and truthful to the best of your knowledge. Varna Collective may request supporting
          documentation and conduct on-site verification as part of the due diligence process.
          Submission does not guarantee vendor registration.
        </p>
      </div>
    </StepWrapper>
  );
}
