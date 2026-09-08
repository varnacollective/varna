"use client";

import { StepWrapper, Field, TextareaField, SelectField, DriveUploadField } from "../FormFields";

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const YES_NO_PARTIAL = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "partially", label: "Partially / In Progress" },
];

export default function Step5Legal() {
  return (
    <StepWrapper
      stepNumber={5}
      title="Legal & Compliance"
      subtitle="We verify your tax registration, legal standing, and ethical business practices."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <SelectField
          name="gst_registered"
          label="GST Registered?"
          options={YES_NO}
          hint="Are you registered under India's Goods & Services Tax regime?"
        />
        <Field
          name="gst_number"
          label="GST Number"
          placeholder="22AAAAA0000A1Z5"
          hint="Leave blank if not GST registered."
        />
      </div>

      <TextareaField
        name="legal_disputes"
        label="Pending Legal Disputes or Non-Compliances"
        placeholder="Disclose any pending civil, criminal, or regulatory proceedings relevant to your business operations."
        hint="If none, write 'None'. Honesty here builds trust — undisclosed disputes identified later may disqualify your enterprise."
        rows={3}
      />

      <SelectField
        name="ethics_policy"
        label="Do you have a written Ethics / Code of Conduct Policy?"
        options={YES_NO_PARTIAL}
        hint="A formal policy covering anti-corruption, child labour prohibition, forced labour, and non-discrimination."
      />

      <DriveUploadField
        name="ethics_policy_document_link"
        label="Ethics / Code of Conduct Document (Drive Link)"
        hint="If you have a written policy, upload it to Google Drive and paste the shareable link. Not mandatory but strongly recommended."
      />
    </StepWrapper>
  );
}
