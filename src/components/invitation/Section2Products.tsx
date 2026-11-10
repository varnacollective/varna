"use client";

import React from "react";
import { FormAnswers } from "./types";
import { Info } from "lucide-react";

interface Section2Props {
  answers: FormAnswers;
  onChange: (updates: Partial<FormAnswers>) => void;
}

const CATEGORY_CHIPS = [
  "Bathroom Amenities",
  "Spa & Wellness",
  "Disposables",
  "Textiles & Linen",
  "Food & Beverage",
  "Handicrafts & Decor",
  "Stationery",
  "Cleaning & Housekeeping",
  "Packaging",
  "Furniture & Furnishings",
];

export function Section2Products({ answers, onChange }: Section2Props) {
  const currentText = answers.q2_1_products_overview || "";

  const addCategoryToOverview = (cat: string) => {
    if (currentText.includes(cat)) return;
    const separator = currentText.trim().length > 0 ? ", " : "";
    onChange({ q2_1_products_overview: currentText ? `${currentText}${separator}${cat}` : cat });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-[#E7DFD3] pb-4">
        <h2 className="text-2xl font-serif text-[#1E1A16] font-normal">
          SECTION 2: Your products (overview)
        </h2>
        <p className="text-sm text-[#6B6259]">
          Intro: We will collect detailed product information separately using a Varna Product Line
          Sheet that your relationship manager will send you after this form. In this form we are
          just capturing an overview to understand your product offerings and the category better.
        </p>
      </div>

      <div className="inv-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#1E1A16]">
            2.1 Which category/categories do your products represent and give a brief product overview?{" "}
            <span className="text-[#9A4A2E]">*</span>
          </label>
          <p className="inv-hint">
            Hint: Select relevant category chips below or describe your product range in your own
            words. Example: "Bathroom Amenities & Packaging: We make plastic-free soap bars, bamboo
            toothbrushes, and handmade cotton laundry bags for guestrooms."
          </p>
        </div>

        {/* Quick Category Chips */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-[#6B6259]">Quick insert categories:</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_CHIPS.map((cat) => {
              const isInText = currentText.toLowerCase().includes(cat.toLowerCase());
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => addCategoryToOverview(cat)}
                  className={`inv-chip ${isInText ? "active" : ""}`}
                >
                  {cat} {isInText ? "✓" : "+"}
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          rows={6}
          required
          value={answers.q2_1_products_overview || ""}
          onChange={(e) => onChange({ q2_1_products_overview: e.target.value })}
          placeholder="List your product categories, key items offered, materials used, and typical packaging..."
          className="inv-textarea"
        />

        <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E7DFD3] flex items-start gap-2.5 text-xs text-[#6B6259]">
          <Info className="w-4 h-4 text-[#9A4A2E] flex-shrink-0 mt-0.5" />
          <span>
            Detailed SKU lists, pricing, minimum order quantities (MOQs), and ingredient sheets will
            be handled smoothly in the follow-up Product Line Sheet.
          </span>
        </div>
      </div>
    </div>
  );
}
