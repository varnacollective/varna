"use client";

import { StepWrapper, TextareaField, SelectField, SectionDivider } from "../FormFields";

const YES_NO_PARTIAL = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "partially", label: "Partially / In Progress" },
];

const WATER_SOURCE_OPTIONS = [
  { value: "municipal", label: "Municipal / Piped Supply" },
  { value: "borewell", label: "Borewell / Groundwater" },
  { value: "rainwater_harvesting", label: "Rainwater Harvesting" },
  { value: "river", label: "River / Open Water Body" },
  { value: "tanker", label: "Tanker Supply" },
  { value: "multiple", label: "Multiple Sources" },
];

const ENERGY_OPTIONS = [
  { value: "grid", label: "Grid Electricity Only" },
  { value: "solar", label: "Solar (Partial or Full)" },
  { value: "solar_full", label: "100% Solar / Renewable" },
  { value: "diesel", label: "Diesel Generator" },
  { value: "biomass", label: "Biomass / Firewood" },
  { value: "mixed", label: "Mixed Sources" },
];

export default function Step3Environment() {
  return (
    <StepWrapper
      stepNumber={3}
      title="Environment"
      subtitle="We assess your water use, energy sources, chemical management, and environmental certifications."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <SelectField
          name="water_source"
          label="Primary Water Source"
          options={WATER_SOURCE_OPTIONS}
          hint="Select the primary source of water used in production."
        />
        <SelectField
          name="water_recycling"
          label="Do you recycle or treat wastewater?"
          options={YES_NO_PARTIAL}
        />
      </div>

      <SelectField
        name="carbon_footprint_tracked"
        label="Do you track your carbon footprint or GHG emissions?"
        options={YES_NO_PARTIAL}
        hint="This includes Scope 1 (direct) and Scope 2 (electricity-related) emissions."
      />

      <SelectField
        name="energy_sources"
        label="Primary Energy Source"
        options={ENERGY_OPTIONS}
        hint="Select the primary source of energy used in your operations."
      />

      <SectionDivider label="Chemical Use &amp; Disposal" />
      <div className="space-y-6">
        <TextareaField
            name="chemical_usage"
            label="Chemicals & Dyes Used in Production"
            placeholder="List any dyes, fixatives, finishing agents, or other chemicals used. Note 'None' if not applicable."
            hint="Include both natural and synthetic inputs. Be specific, for example: 'Azo-free reactive dyes', 'natural indigo, pomegranate rind tannin'."
            rows={3}
          />
          <TextareaField
            name="chemical_disposal"
            label="Chemical Waste Disposal Method"
            placeholder="Describe how chemical waste or effluent is managed and disposed of."
            hint="e.g. 'Effluent treatment plant on-site', 'third-party waste contractor', 'No chemical waste generated'."
            rows={3}
          />
      </div>
    </StepWrapper>
  );
}
