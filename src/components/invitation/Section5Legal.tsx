"use client";

import React from "react";
import { FormAnswers, PartnerDocument, SupplierRow } from "./types";
import { FileUploadSlot } from "./FileUploadSlot";

interface Section5Props {
  slug: string;
  answers: FormAnswers;
  onChange: (updates: Partial<FormAnswers>) => void;
  documents: PartnerDocument[];
  onDocumentsChange: (docs: PartnerDocument[]) => void;
}

const GST_OPTIONS = [
  "Yes: we are GST registered",
  "No: our turnover is below the threshold so we are not required to register",
  "I have applied and am waiting for registration",
];

const UDYAM_OPTIONS = [
  "Yes: we are Udyam registered",
  "No: we have not registered yet",
  "We have applied and am waiting for registration",
];

const PAYMENT_OPTIONS = [
  "Yes: we always pay on time or early",
  "Mostly yes: occasional delays happen",
  "Sometimes we are delayed in payment",
  "This is an area we need to improve",
];

const ETHICS_POLICY_OPTIONS = [
  "No: nothing written currently",
  "We have an informal written commitment (even a short internal document)",
  "Yes: we have a documented ethics or sourcing policy",
  "Yes: our ethics practices are independently verified and audited",
];

export function Section5Legal({
  slug,
  answers,
  onChange,
  documents,
  onDocumentsChange,
}: Section5Props) {
  // Initial 3 suppliers
  const suppliers: SupplierRow[] = answers.q5_5_top_suppliers && answers.q5_5_top_suppliers.length === 3
    ? answers.q5_5_top_suppliers
    : [
        { name: "", location: "", supplies: "", isSelfSourced: false },
        { name: "", location: "", supplies: "", isSelfSourced: false },
        { name: "", location: "", supplies: "", isSelfSourced: false },
      ];

  const updateSupplier = (index: number, updates: Partial<SupplierRow>) => {
    const next = [...suppliers];
    next[index] = { ...next[index], ...updates };
    onChange({ q5_5_top_suppliers: next });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-[#E7DFD3] pb-4">
        <h2 className="text-2xl font-serif text-[#1E1A16] font-normal">
          SECTION 5: Legal and compliance
        </h2>
        <p className="text-sm text-[#6B6259]">
          Intro: This section has some compliance based questions.
        </p>
      </div>

      <div className="space-y-6">
        {/* 5.1 GST Registration */}
        <div className="inv-card p-5 space-y-3">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            5.1 Is your enterprise registered under GST? <span className="text-[#9A4A2E]">*</span>
          </label>
          <div className="space-y-2 pt-1">
            {GST_OPTIONS.map((opt) => {
              const isSelected = answers.q5_1_gst_registered === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q5_1_gst_registered: opt })}
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

        {/* 5.2 Udyam Registration */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              5.2 Is your enterprise registered under Udyam (the government MSME registration)?{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              If you are not registered yet, you can do so free at udyam.gov.in. It takes about 15
              minutes and only requires your Aadhaar and PAN.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {UDYAM_OPTIONS.map((opt) => {
              const isSelected = answers.q5_2_udyam_registered === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q5_2_udyam_registered: opt })}
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

        {/* 5.3 Legal Cases */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              5.3 Are there any active legal cases or regulatory proceedings against your enterprise?{" "}
              <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              For example: a tax dispute, a labour complaint, an environmental fine, or any court or
              tribunal proceedings. This is a mandatory declaration. Please answer honestly.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            {["Yes", "No"].map((opt) => {
              const isSelected = answers.q5_3_legal_cases === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q5_3_legal_cases: opt })}
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

        {/* 5.3a Conditional on Legal Cases = Yes */}
        {answers.q5_3_legal_cases === "Yes" && (
          <div className="inv-card p-5 space-y-2 bg-[#FAF7F2] border-[#9A4A2E]/40 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              5.3a Briefly describe the nature of the proceedings
            </label>
            <textarea
              rows={3}
              value={answers.q5_3a_legal_cases_desc || ""}
              onChange={(e) => onChange({ q5_3a_legal_cases_desc: e.target.value })}
              className="inv-textarea"
              placeholder="Provide background, status, and any steps taken..."
            />
          </div>
        )}

        {/* 5.4 Product Safety Recalls */}
        <div className="inv-card p-5 space-y-3">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            5.4 Have there been any product safety complaints, recalls, or regulatory actions related to
            your products in the last 2 years? <span className="text-[#9A4A2E]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3 pt-1">
            {["Yes", "No"].map((opt) => {
              const isSelected = answers.q5_4_product_recalls === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q5_4_product_recalls: opt })}
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

        {/* 5.4a Conditional on Product Recalls = Yes */}
        {answers.q5_4_product_recalls === "Yes" && (
          <div className="inv-card p-5 space-y-2 bg-[#FAF7F2] border-[#9A4A2E]/40 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              5.4a Briefly describe what happened
            </label>
            <textarea
              rows={3}
              value={answers.q5_4a_product_recalls_desc || ""}
              onChange={(e) => onChange({ q5_4a_product_recalls_desc: e.target.value })}
              className="inv-textarea"
              placeholder="Explain the complaint, recall, or action and corrective measures implemented..."
            />
          </div>
        )}

        {/* 5.5 Top 3 Raw Material Suppliers */}
        <div className="inv-card p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              5.5 Who are your top 3 raw material suppliers? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Hint: The people or companies you buy your main materials from. Example rows: Ramesh
              Textiles | Ahmedabad, Gujarat | Handspun cotton yarn · Krishna Natural Dyes | Kutch,
              Gujarat | Natural indigo and pomegranate dye · Local farmers collective | Bagru
              district, Rajasthan | Raw cotton fabric
            </p>
          </div>

          <div className="space-y-4">
            {suppliers.map((sup, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#FAF7F2] border border-[#E7DFD3] rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9A4A2E]">
                    Supplier {idx + 1}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-[#6B6259] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(sup.isSelfSourced)}
                      onChange={(e) => updateSupplier(idx, { isSelfSourced: e.target.checked })}
                      className="rounded border-[#E7DFD3] text-[#9A4A2E]"
                    />
                    <span>Self-sourced / harvested directly</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1E1A16] mb-1">
                      {sup.isSelfSourced ? "Source Entity / Farm" : "Supplier Name"}
                    </label>
                    <input
                      type="text"
                      value={sup.name}
                      onChange={(e) => updateSupplier(idx, { name: e.target.value })}
                      placeholder={sup.isSelfSourced ? "e.g. Own organic farm" : "e.g. Ramesh Textiles"}
                      className="inv-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1E1A16] mb-1">
                      Location (City/District & State)
                    </label>
                    <input
                      type="text"
                      value={sup.location}
                      onChange={(e) => updateSupplier(idx, { location: e.target.value })}
                      placeholder="e.g. Ahmedabad, Gujarat"
                      className="inv-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1E1A16] mb-1">
                      What they supply to you
                    </label>
                    <input
                      type="text"
                      value={sup.supplies}
                      onChange={(e) => updateSupplier(idx, { supplies: e.target.value })}
                      placeholder="e.g. Handspun cotton yarn"
                      className="inv-input text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5.6 Pay Suppliers on Time */}
        <div className="inv-card p-5 space-y-3">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            5.6 Do you pay your suppliers on time? <span className="text-[#9A4A2E]">*</span>
          </label>
          <div className="space-y-2 pt-1">
            {PAYMENT_OPTIONS.map((opt) => {
              const isSelected = answers.q5_6_pay_suppliers_on_time === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q5_6_pay_suppliers_on_time: opt })}
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

        {/* 5.7 Written Ethics / Sourcing Policy */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              5.7 Does your enterprise have any written ethics or responsible sourcing policy?
            </label>
            <p className="inv-hint">
              Even a one-page internal document saying "we will not use child labour" or "we will
              source from fair suppliers" counts as a written policy.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {ETHICS_POLICY_OPTIONS.map((opt) => {
              const isSelected = answers.q5_7_ethics_policy === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q5_7_ethics_policy: opt })}
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

        {/* 5.8 Ethics Policy Upload */}
        <div className="inv-card p-5 space-y-3">
          <FileUploadSlot
            slug={slug}
            questionRef="5.8_ethics_policy"
            label="5.8 Ethics or sourcing policy: upload"
            hint="If you have a written ethics or sourcing policy, upload it. Leave blank if you do not have one yet."
            documents={documents}
            onDocumentsChange={onDocumentsChange}
            allowLater={true}
            laterDate={answers.q5_8_ethics_policy_later || ""}
            onLaterDateChange={(date) => onChange({ q5_8_ethics_policy_later: date })}
          />
        </div>

        {/* 5.9 Mandatory GST and Udyam Uploads */}
        <div className="inv-card p-5 space-y-5">
          <div className="border-b border-[#E7DFD3] pb-2">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              5.9 GST and Udyam certificates: upload <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              These are required for assessment verification. Each slot supports "I'll add this
              later" if you do not have the scan right now.
            </p>
          </div>

          <div className="space-y-6">
            <FileUploadSlot
              slug={slug}
              questionRef="5.9_gst_certificate"
              label="GST Registration Certificate"
              hint="Form GST REG-06 or official registration document"
              documents={documents}
              onDocumentsChange={onDocumentsChange}
              allowLater={true}
              laterDate={answers.q5_9_gst_later || ""}
              onLaterDateChange={(date) => onChange({ q5_9_gst_later: date })}
            />

            <FileUploadSlot
              slug={slug}
              questionRef="5.9_udyam_certificate"
              label="Udyam MSME Registration Certificate"
              hint="Ministry of MSME official certificate"
              documents={documents}
              onDocumentsChange={onDocumentsChange}
              allowLater={true}
              laterDate={answers.q5_9_udyam_later || ""}
              onLaterDateChange={(date) => onChange({ q5_9_udyam_later: date })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
