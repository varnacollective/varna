"use client";

import { StepWrapper, Field, TextareaField, SelectField, DriveUploadField } from "../FormFields";

const YES_NO_PARTIAL = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "partially", label: "Partially / In Progress" },
];

const WAGE_OPTIONS = [
  { value: "above_minimum", label: "Above State Minimum Wage" },
  { value: "at_minimum", label: "At State Minimum Wage" },
  { value: "below_minimum", label: "Below Minimum Wage" },
  { value: "piece_rate", label: "Piece-rate / Commission-based" },
  { value: "living_wage", label: "Living Wage (as per international benchmarks)" },
];

export default function Step4People() {
  return (
    <StepWrapper
      stepNumber={4}
      title="People & Community"
      subtitle="We evaluate workforce composition, fair wages, safety standards, and community impact."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <Field
          name="total_workers"
          label="Total Workers (Incl. contract)"
          type="number"
          placeholder="Total headcount"
        />
        <Field
          name="women_workers_pct"
          label="% Women Workers"
          type="number"
          placeholder="e.g. 65"
          hint="Approximate percentage of female workforce."
        />
        <Field
          name="artisan_workers_pct"
          label="% Trained Artisan Workers"
          type="number"
          placeholder="e.g. 80"
          hint="Workers with traditional craft training."
        />
      </div>

      <SelectField
        name="minimum_wage_compliance"
        label="Wage Structure"
        options={WAGE_OPTIONS}
        hint="Select the wage level relative to the applicable state minimum wage."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <SelectField
          name="esi_pf_coverage"
          label="ESI / PF Coverage for Workers"
          options={YES_NO_PARTIAL}
          hint="Are workers enrolled under Employees' State Insurance and Provident Fund schemes?"
        />
        <DriveUploadField
          name="esi_documents_link"
          label="ESI / PF Documents (Drive Link)"
          hint="Upload latest ESI/PF challan or registration certificate to Google Drive and paste link."
        />
      </div>

      <TextareaField
        name="health_safety_measures"
        label="Health & Safety Measures"
        placeholder="Describe the health and safety practices in your workplace…"
        hint="Include fire safety, PPE availability, ventilation, drinking water access, first aid, and any safety audits conducted."
        rows={4}
      />

      <TextareaField
        name="community_programs"
        label="Community & Social Impact Programmes"
        placeholder="Describe any community development, skill-building, or social welfare initiatives you run or participate in…"
        hint="e.g. Artisan training programmes, women's SHG partnerships, fair trade practices, local employment."
        rows={4}
      />
    </StepWrapper>
  );
}
