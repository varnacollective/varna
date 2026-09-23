"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Check, X } from "lucide-react";
import { useDateRange, DatePreset } from "@/context/DateRangeContext";

interface DateRangeFilterProps {
  className?: string;
  variant?: "pill" | "hero";
}

const PRESET_OPTIONS: { id: DatePreset; label: string }[] = [
  { id: "all_time", label: "All time" },
  { id: "this_month", label: "This month" },
  { id: "this_quarter", label: "This quarter" },
  { id: "last_6_months", label: "Last 6 months" },
  { id: "this_year", label: "This year" },
];

export default function DateRangeFilter({ className = "", variant = "pill" }: DateRangeFilterProps) {
  const { state, label, isUserSelected, setDateRange } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Local state for custom date pickers before applying
  const [customStart, setCustomStart] = useState(state.startDate || "");
  const [customEnd, setCustomEnd] = useState(state.endDate || "");
  const [activePreset, setActivePreset] = useState<DatePreset>(state.preset);

  // Update local state when context state changes
  useEffect(() => {
    setCustomStart(state.startDate || "");
    setCustomEnd(state.endDate || "");
    setActivePreset(state.preset);
  }, [state]);

  // Click outside listener to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectPreset = (preset: DatePreset) => {
    setActivePreset(preset);
    if (preset !== "custom") {
      setDateRange({ preset });
      setIsOpen(false);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (activePreset === "custom" || customStart || customEnd) {
      setDateRange({
        preset: "custom",
        startDate: customStart || null,
        endDate: customEnd || null,
      });
    } else {
      setDateRange({ preset: activePreset });
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setCustomStart(state.startDate || "");
    setCustomEnd(state.endDate || "");
    setActivePreset(state.preset);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={popoverRef}>
      {/* Date Range Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-full
          bg-white dark:bg-[#1E2028]
          border border-black/10 dark:border-white/15
          text-xs text-[#5B564E] dark:text-[#C2BCB0] font-medium tracking-wide
          shadow-xs hover:border-[#7D3F1E]/50 dark:hover:border-[#E07A57]/50
          transition-all duration-200 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[#7D3F1E]/30
        "
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Calendar className="w-3.5 h-3.5 text-[#7D3F1E] dark:text-[#E07A57]" strokeWidth={1.8} />
        <span className="text-[11px] tracking-wider font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
          {label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6F6A61] dark:text-[#9A948A] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="
            absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl
            bg-white dark:bg-[#20242B]
            border border-black/10 dark:border-white/15
            shadow-xl z-50 p-4 space-y-4
            animate-in fade-in zoom-in-95 duration-150
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1F1B16] dark:text-[#F3EFE7]">
              Select Date Range
            </span>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 rounded-full text-[#6F6A61] dark:text-[#9A948A] hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-1 gap-1">
            {PRESET_OPTIONS.map((option) => {
              const isSelected = isUserSelected && activePreset === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectPreset(option.id)}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left
                    ${
                      isSelected
                        ? "bg-[#7D3F1E]/10 dark:bg-[#E07A57]/15 text-[#7D3F1E] dark:text-[#E07A57] font-semibold"
                        : "text-[#5B564E] dark:text-[#C2BCB0] hover:bg-black/5 dark:hover:bg-white/5"
                    }
                  `}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range Section */}
          <form onSubmit={handleApplyCustom} className="pt-2 border-t border-black/5 dark:border-white/10 space-y-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#6F6A61] dark:text-[#9A948A] block">
              Custom Range
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#6F6A61] dark:text-[#9A948A] block mb-1">From</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => {
                    setCustomStart(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="
                    w-full px-2.5 py-1.5 rounded-lg text-xs
                    bg-[#F7F3EA] dark:bg-[#181B20]
                    border border-black/10 dark:border-white/15
                    text-[#1F1B16] dark:text-[#F3EFE7]
                    focus:outline-none focus:ring-1 focus:ring-[#7D3F1E]
                  "
                />
              </div>

              <div>
                <label className="text-[10px] text-[#6F6A61] dark:text-[#9A948A] block mb-1">To</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => {
                    setCustomEnd(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="
                    w-full px-2.5 py-1.5 rounded-lg text-xs
                    bg-[#F7F3EA] dark:bg-[#181B20]
                    border border-black/10 dark:border-white/15
                    text-[#1F1B16] dark:text-[#F3EFE7]
                    focus:outline-none focus:ring-1 focus:ring-[#7D3F1E]
                  "
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="
                  px-3 py-1.5 rounded-full text-xs font-medium
                  text-[#6F6A61] dark:text-[#9A948A]
                  hover:bg-black/5 dark:hover:bg-white/10 transition-colors
                "
              >
                Cancel
              </button>
              <button
                type="submit"
                className="
                  px-4 py-1.5 rounded-full text-xs font-medium
                  bg-[#7D3F1E] dark:bg-[#E07A57] text-white
                  hover:opacity-90 transition-opacity shadow-xs
                "
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
