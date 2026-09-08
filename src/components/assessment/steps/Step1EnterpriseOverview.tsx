"use client";

import { StepWrapper, Field, TextareaField, SelectField, DriveUploadField, SectionDivider } from "../FormFields";

const LEGAL_STRUCTURE_OPTIONS = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership Firm" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "private_limited", label: "Private Limited Company" },
  { value: "public_limited", label: "Public Limited Company" },
  { value: "section_8", label: "Section 8 / NGO / Trust" },
  { value: "cooperative", label: "Cooperative Society" },
  { value: "other", label: "Other" },
];

const TURNOVER_OPTIONS = [
  { value: "below_10L", label: "Below ₹10 Lakhs" },
  { value: "10L_to_50L", label: "₹10 Lakhs – ₹50 Lakhs" },
  { value: "50L_to_1Cr", label: "₹50 Lakhs – ₹1 Crore" },
  { value: "1Cr_to_5Cr", label: "₹1 Crore – ₹5 Crores" },
  { value: "above_5Cr", label: "Above ₹5 Crores" },
];

export default function Step1EnterpriseOverview() {
  return (
    <StepWrapper
      stepNumber={1}
      title="Enterprise Overview"
      subtitle="Tell us about your enterprise's legal identity, scale, and the people behind it."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field
          name="legal_name"
          label="Legal Entity Name"
          required
          placeholder="As registered with MCA / MSME"
        />
        <Field
          name="trade_name"
          label="Trade / Brand Name"
          placeholder="If different from legal name"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field
          name="udyam_number"
          label="Udyam Registration Number"
          placeholder="UDYAM-XX-00-0000000"
          hint="Leave blank if not registered under MSME."
        />
        <DriveUploadField
          name="udyam_certificate_link"
          label="Udyam Certificate (Drive Link)"
          hint="Upload your Udyam certificate to Google Drive and paste the shareable link."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field
          name="year_established"
          label="Year Established"
          type="number"
          placeholder="e.g. 2008"
        />
        <SelectField
          name="legal_structure"
          label="Legal Structure"
          options={LEGAL_STRUCTURE_OPTIONS}
        />
      </div>

      <TextareaField
        name="registered_address"
        label="Registered Address"
        placeholder="Full registered office address with PIN code"
        rows={2}
      />

      <TextareaField
        name="operating_address"
        label="Primary Operating / Workshop Address"
        placeholder="If different from registered address"
        rows={2}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SelectField
          name="annual_turnover"
          label="Annual Turnover (Last FY)"
          options={TURNOVER_OPTIONS}
        />
        <Field
          name="employee_count"
          label="Total Employees / Artisans"
          type="number"
          placeholder="Total headcount including part-time"
        />
      </div>

      {/* Founder Information */}
      <SectionDivider label="Founders & Story" />
      <div className="space-y-6">
        <Field
          name="founder_name"
          label="Founder / Key Promoter Name(s)"
          placeholder="Full names of founders"
        />
        <TextareaField
          name="founders_story"
          label="Founder's Story"
          placeholder="Tell us about your journey, what drives your enterprise, and why craft / sustainability matters to you."
          rows={5}
          hint="This narrative may appear in our supplier profiles. Write authentically — 150–400 words."
        />
      </div>

      {/* Primary Contact */}
      <SectionDivider label="Primary Contact" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Field
          name="primary_contact_name"
          label="Contact Name"
          required
          placeholder="Full name"
        />
        <Field
          name="primary_contact_email"
          label="Email Address"
          required
          type="email"
          placeholder="name@enterprise.com"
        />
        <Field
          name="primary_contact_phone"
          label="Phone / WhatsApp"
          type="tel"
          placeholder="+91 98765 43210"
        />
      </div>
    </StepWrapper>
  );
}
