"use client";

import { StepWrapper, Field, TextareaField } from "../FormFields";

export default function Step2Products() {
  return (
    <StepWrapper
      stepNumber={2}
      title="Products Overview"
      subtitle="Describe what your enterprise makes — the materials, the process, and the craft behind your products."
    >
      <TextareaField
        name="primary_product_categories"
        label="Primary Product Categories"
        placeholder="e.g. Block-printed cotton textiles, Dhokra brass figurines, Handwoven silk sarees…"
        hint="List all categories of products you produce or supply. Separate with commas."
        rows={2}
      />

      <TextareaField
        name="product_description"
        label="Product Description"
        placeholder="Describe your flagship products, key features, and what distinguishes them."
        hint="Include details on design language, end use, and typical customers or markets served."
        rows={5}
      />

      <TextareaField
        name="raw_materials"
        label="Raw Materials & Sourcing"
        placeholder="e.g. Natural indigo from Rajasthan, reclaimed teak wood from certified salvage yards…"
        hint="Describe the primary raw materials you use and where / how they are sourced. Note any sustainable or local sourcing practices."
        rows={4}
      />

      <TextareaField
        name="production_process"
        label="Production Process"
        placeholder="Walk us through how a product is made — from raw material to finished good."
        hint="Describe the key steps, tools, and techniques involved. Highlight any traditional or handmade processes."
        rows={5}
      />

      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-mist">
          Production / Workshop Video Link
        </label>
        <p className="text-[11px] text-slate-mist/60 font-light leading-relaxed">
          Share a short video (2–10 min) of your production process or workshop. Paste a Google
          Drive, YouTube, or Vimeo link. Ensure the video is publicly viewable. This greatly
          strengthens your profile.
        </p>
        <Field
          name="production_video_link"
          label=""
          type="url"
          placeholder="https://drive.google.com/... or https://youtube.com/watch?v=..."
        />
      </div>
    </StepWrapper>
  );
}
