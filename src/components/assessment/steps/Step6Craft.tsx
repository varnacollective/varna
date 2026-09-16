"use client";

import { StepWrapper, Field, TextareaField, SelectField } from "../FormFields";

const YES_NO_NA = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "applied", label: "Applied / In Progress" },
  { value: "na", label: "Not Applicable" },
];

export default function Step6Craft() {
  return (
    <StepWrapper
      stepNumber={6}
      title="Craft & Cultural Heritage"
      subtitle="Varna deeply values living craft traditions. Help us understand the heritage embedded in your enterprise."
    >
      <TextareaField
        name="craft_traditions"
        label="Craft Traditions Practised"
        placeholder="e.g. Ajrakh block printing (Kutch, Gujarat), Pattachitra painting (Odisha), Banarasi brocade weaving (Varanasi)…"
        hint="Name the specific craft forms, techniques, or traditions practised. Include the region and community of origin where relevant."
        rows={4}
      />

      <TextareaField
        name="gi_tags"
        label="Geographical Indication (GI) Tags"
        placeholder="e.g. Pochampally Ikat (GI No. 36), Darjeeling Tea (GI No. 1)… or 'None'"
        hint="List any GI tags that cover your products. Include the GI registration number if known."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <SelectField
          name="pehchaan_card"
          label="Pehchaan Card (IIHT Artisan Identity)"
          options={YES_NO_NA}
          hint="Are your artisans registered under the O/o DC Handicrafts Pehchaan scheme?"
        />
        <Field
          name="artisan_training"
          label="No. of Artisans Formally Trained"
          type="number"
          placeholder="0"
          hint="Total artisans who have received structured craft training in the last 3 years."
        />
      </div>
    </StepWrapper>
  );
}
