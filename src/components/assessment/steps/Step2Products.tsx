"use client";

import { StepWrapper, TextareaField } from "../FormFields";

export default function Step2Products() {
  return (
    <StepWrapper
      stepNumber={2}
      title="Products Overview"
      subtitle="Describe what your enterprise makes: the materials, the process, and the craft behind your products."
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
        placeholder="Walk us through how a product is made, from raw material to finished good."
        hint="Describe the key steps, tools, and techniques involved. Highlight any traditional or handmade processes."
        rows={5}
      />
    </StepWrapper>
  );
}
