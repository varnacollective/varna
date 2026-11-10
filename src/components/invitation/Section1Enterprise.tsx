"use client";

import React, { useState } from "react";
import { FormAnswers } from "./types";
import { Check, Info } from "lucide-react";

interface Section1Props {
  answers: FormAnswers;
  onChange: (updates: Partial<FormAnswers>) => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi (NCT)", "Jammu and Kashmir", "Ladakh",
  "Puducherry", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep", "Andaman and Nicobar Islands"
];

const ENTERPRISE_DESCRIPTIONS = [
  {
    id: "craft",
    label: "Craft-based production: we make products by hand using traditional skills or artisan techniques",
  },
  {
    id: "sustainable",
    label: "Sustainable materials: our products are made from natural, recycled, or plant-based materials",
  },
  {
    id: "innovation",
    label: "Innovation-led: we use new materials or processes to reduce environmental impact (for example: products made from agricultural waste, biomaterials, or circular inputs)",
  },
  {
    id: "responsible",
    label: "Responsible manufacturing: we focus on ethical working conditions, fair wages, and certified processes",
  },
  {
    id: "combo",
    label: "We combine more than one of the above",
  },
];

const WOMEN_OPTIONS = [
  "Yes: more than 50% is owned by women",
  "Yes: the business is led and managed by women (even if ownership is shared)",
  "Both: owned and led by women",
  "No",
];

const TURNOVER_OPTIONS = [
  "Up to ₹3 crore per year",
  "₹3 crore to ₹10 crore per year",
  "₹10 crore to ₹100 crore per year",
  "₹100 crore to ₹500 crore per year",
];

export function Section1Enterprise({ answers, onChange }: Section1Props) {
  const [stateSearch, setStateSearch] = useState("");
  const filteredStates = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const selectedDescriptions = answers.q1_10_description || [];

  const toggleDescription = (label: string) => {
    if (selectedDescriptions.includes(label)) {
      onChange({ q1_10_description: selectedDescriptions.filter((item) => item !== label) });
    } else {
      onChange({ q1_10_description: [...selectedDescriptions, label] });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-[#E7DFD3] pb-4">
        <h2 className="text-2xl font-serif text-[#1E1A16] font-normal">
          SECTION 1: About your enterprise
        </h2>
        <p className="text-sm text-[#6B6259]">
          Basic identification, ownership structure, and your founding story.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1.1 Legal Name */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            1.1 Full legal name of your enterprise <span className="text-[#9A4A2E]">*</span>
          </label>
          <p className="inv-hint">
            Hint: As it appears on your GST or Udyam registration certificate.
          </p>
          <input
            type="text"
            required
            value={answers.q1_1_legal_name || ""}
            onChange={(e) => onChange({ q1_1_legal_name: e.target.value })}
            placeholder="e.g. Bare Necessities Zero Waste Solutions Pvt Ltd"
            className="inv-input"
          />
        </div>

        {/* 1.2 Brand Name */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            1.2 Brand name or trading name
          </label>
          <p className="inv-hint">
            Hint: The name you use on your products and packaging. Leave blank if it is the same as your legal name.
          </p>
          <input
            type="text"
            value={answers.q1_2_brand_name || ""}
            onChange={(e) => onChange({ q1_2_brand_name: e.target.value })}
            placeholder="e.g. Bare Necessities"
            className="inv-input"
          />
        </div>

        {/* 1.3 Year Founded */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            1.3 Year founded or formally registered <span className="text-[#9A4A2E]">*</span>
          </label>
          <p className="inv-hint">Example: 2018</p>
          <input
            type="number"
            min={1800}
            max={new Date().getFullYear()}
            value={answers.q1_3_year_founded || ""}
            onChange={(e) => onChange({ q1_3_year_founded: e.target.value })}
            placeholder="YYYY"
            className="inv-input max-w-xs"
          />
        </div>

        {/* 1.4 & 1.5 Location: District & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="inv-card p-5 space-y-2">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              1.4 Which district are you based in? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">Example: Bagru, Kutch, Wayanad, Mandi</p>
            <input
              type="text"
              required
              value={answers.q1_4_district || ""}
              onChange={(e) => onChange({ q1_4_district: e.target.value })}
              placeholder="Enter district"
              className="inv-input"
            />
          </div>

          <div className="inv-card p-5 space-y-2">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              1.5 Which state? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">Select your state or union territory</p>
            <select
              value={answers.q1_5_state || ""}
              onChange={(e) => onChange({ q1_5_state: e.target.value })}
              className="inv-select"
            >
              <option value="">Select state...</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1.6 & 1.7 Contact: Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="inv-card p-5 space-y-2">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              1.6 Primary contact email address <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Hint: This is where we will send your assessment report and profile for review.
            </p>
            <input
              type="email"
              required
              value={answers.q1_6_email || ""}
              onChange={(e) => onChange({ q1_6_email: e.target.value })}
              placeholder="contact@yourbusiness.com"
              className="inv-input"
            />
          </div>

          <div className="inv-card p-5 space-y-2">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              1.7 Primary contact phone number <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Hint: Include country code if outside India. Example: +91 98765 43210.
            </p>
            <input
              type="tel"
              required
              value={answers.q1_7_phone || ""}
              onChange={(e) => onChange({ q1_7_phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="inv-input"
            />
          </div>
        </div>

        {/* 1.8 Udyam Registration */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            1.8 Udyam Registration Number
          </label>
          <p className="inv-hint">
            Hint: Your MSME registration number from the Udyam portal. Looks like UDYAM-RJ-14-0012345.
            If you have applied but not received it yet, write "Applied". If you have not registered
            yet, write "Not yet registered".
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => onChange({ q1_8_udyam: "Applied" })}
              className={`inv-chip ${answers.q1_8_udyam === "Applied" ? "active" : ""}`}
            >
              Applied
            </button>
            <button
              type="button"
              onClick={() => onChange({ q1_8_udyam: "Not yet registered" })}
              className={`inv-chip ${answers.q1_8_udyam === "Not yet registered" ? "active" : ""}`}
            >
              Not yet registered
            </button>
          </div>
          <input
            type="text"
            value={answers.q1_8_udyam || ""}
            onChange={(e) => onChange({ q1_8_udyam: e.target.value })}
            placeholder="UDYAM-XX-00-0000000"
            className="inv-input"
          />
          <div className="inv-why-box">
            <strong>Why we ask:</strong> Udyam registration is one of the things we verify to
            confirm your enterprise's legal standing. It is free to register at udyam.gov.in and takes
            about 5 minutes if you have your Aadhaar and PAN ready.
          </div>
        </div>

        {/* 1.9 GSTIN */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            1.9 GSTIN (GST Identification Number)
          </label>
          <p className="inv-hint">
            Hint: Your 15-digit GST number. Example: 08AABCA1234B1Z5. If your turnover is below the
            GST threshold and you are not registered, write "Not registered".
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onChange({ q1_9_gstin: "Not registered" })}
              className={`inv-chip ${answers.q1_9_gstin === "Not registered" ? "active" : ""}`}
            >
              Not registered
            </button>
          </div>
          <input
            type="text"
            value={answers.q1_9_gstin || ""}
            onChange={(e) => onChange({ q1_9_gstin: e.target.value.toUpperCase() })}
            placeholder="08AABCA1234B1Z5"
            maxLength={15}
            className="inv-input"
          />
        </div>

        {/* 1.10 Enterprise Description (Multi) */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              1.10 Which of the following best describes your enterprise? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">Select all that apply.</p>
          </div>
          <div className="space-y-2 pt-1">
            {ENTERPRISE_DESCRIPTIONS.map((item) => {
              const isSelected = selectedDescriptions.includes(item.label);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleDescription(item.label)}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-square">
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1.11 Women-Owned / Women-Led */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              1.11 Is your enterprise women-owned or women-led? <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Hint: Women-owned = more than 50% of the enterprise is owned by women. Women-led = the
              business is led and managed by a woman, even if ownership is shared.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {WOMEN_OPTIONS.map((opt) => {
              const isSelected = answers.q1_11_women_owned === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q1_11_women_owned: opt })}
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

        {/* 1.12 Cooperative / SHG / Collective */}
        <div className="inv-card p-5 space-y-3">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            1.12 Is your enterprise a cooperative, self-help group (SHG), or artisan collective?{" "}
            <span className="text-[#9A4A2E]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3 pt-1">
            {["Yes", "No"].map((opt) => {
              const isSelected = answers.q1_12_cooperative === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q1_12_cooperative: opt })}
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

        {/* 1.13 Conditional Cooperative Description */}
        {answers.q1_12_cooperative === "Yes" && (
          <div className="inv-card p-5 space-y-2 bg-[#FAF7F2] border-[#9A4A2E]/40 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              1.13 Briefly describe how your cooperative or collective is structured
            </label>
            <p className="inv-hint">
              Hint: How many members are part of it? Who makes decisions about the business?
              Example: "We are a cooperative of 22 women weavers. Each member owns an equal share.
              Decisions are made by a committee of 5 elected members who meet every month."
            </p>
            <textarea
              rows={3}
              value={answers.q1_13_cooperative_desc || ""}
              onChange={(e) => onChange({ q1_13_cooperative_desc: e.target.value })}
              className="inv-textarea"
              placeholder="Describe member count, decision-making committee, profit sharing..."
            />
          </div>
        )}

        {/* 1.14 Annual Turnover */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              1.14 Approximate annual turnover (total sales per year) <span className="text-[#9A4A2E]">*</span>
            </label>
            <p className="inv-hint">
              Hint: Kept completely confidential, used only for classification purposes, never shared
              publicly. If you are not sure, give your best estimate.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {TURNOVER_OPTIONS.map((opt) => {
              const isSelected = answers.q1_14_turnover === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q1_14_turnover: opt })}
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

        {/* 1.15 Total Workers */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            1.15 How many people work in your enterprise in total? <span className="text-[#9A4A2E]">*</span>
          </label>
          <p className="inv-hint">
            Hint: Count everyone who works regularly: full time, part time, and regular piece-rate
            workers. Do not include people you hired once or twice for a specific one-off task.
            Example: If you have 12 weavers who work with you every month plus 3 people managing the
            business, your answer is 15.
          </p>
          <input
            type="number"
            min={0}
            required
            value={answers.q1_15_workers_count ?? ""}
            onChange={(e) => onChange({ q1_15_workers_count: e.target.value })}
            placeholder="e.g. 15"
            className="inv-input max-w-xs"
          />
        </div>

        {/* 1.16 Founding Story */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            1.16 Tell us your founding story <span className="text-[#9A4A2E]">*</span>
          </label>
          <p className="inv-hint">
            Why did you start this enterprise? What were you trying to create or continue? We will
            use parts of this answer to build your brand profile and story. There is no wrong answer
            here. A simple honest story in the brand/founders voice is the most powerful one.
          </p>
          <textarea
            rows={5}
            required
            value={answers.q1_16_founding_story || ""}
            onChange={(e) => onChange({ q1_16_founding_story: e.target.value })}
            placeholder="Share the journey, vision, and origins of your enterprise..."
            className="inv-textarea"
          />
        </div>

        {/* 1.17 Differentiation */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            1.17 What makes your products different from products a hotel could buy from a conventional supplier?
          </label>
          <p className="inv-hint">
            What do you do that others do not? What would be lost if a hotel bought from someone else
            instead of you? Example: "Our soap bars are made entirely from cold-pressed coconut oil
            and plant-based essential oils. No synthetic chemicals. They are wrapped in handmade paper.
            A conventional supplier uses petroleum-based ingredients and plastic packaging."
          </p>
          <textarea
            rows={4}
            value={answers.q1_17_differentiation || ""}
            onChange={(e) => onChange({ q1_17_differentiation: e.target.value })}
            placeholder="Describe your unique materials, process, or values..."
            className="inv-textarea"
          />
        </div>
      </div>
    </div>
  );
}
