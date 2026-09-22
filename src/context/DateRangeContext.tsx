"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";

export type DatePreset = "all_time" | "this_month" | "this_quarter" | "last_6_months" | "this_year" | "custom";

export interface DateRangeState {
  preset: DatePreset;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD
}

interface DateRangeContextType {
  state: DateRangeState;
  label: string;
  setDateRange: (newRange: { preset: DatePreset; startDate?: string | null; endDate?: string | null }) => void;
  resetDateRange: () => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

// Helper function to format date strings for display
export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Calculate preset date ranges
export function getPresetDates(preset: DatePreset): { startDate: string | null; endDate: string | null; label: string } {
  const now = new Date();
  const currentYear = now.getFullYear(); // 2026
  const currentMonth = now.getMonth();   // 0-indexed

  switch (preset) {
    case "this_month": {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const start = firstDay.toISOString().split("T")[0];
      const end = lastDay.toISOString().split("T")[0];
      return {
        startDate: start,
        endDate: end,
        label: `${formatDateForDisplay(start)} – ${formatDateForDisplay(end)}`,
      };
    }
    case "this_quarter": {
      // Q2 2026: Apr 1 - Jun 30, 2026 or current calendar quarter
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      const firstDay = new Date(currentYear, quarterStartMonth, 1);
      const lastDay = new Date(currentYear, quarterStartMonth + 3, 0);
      const start = firstDay.toISOString().split("T")[0];
      const end = lastDay.toISOString().split("T")[0];
      return {
        startDate: start,
        endDate: end,
        label: `${formatDateForDisplay(start)} – ${formatDateForDisplay(end)}`,
      };
    }
    case "last_6_months": {
      const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
      const today = new Date(currentYear, currentMonth + 1, 0);
      const start = sixMonthsAgo.toISOString().split("T")[0];
      const end = today.toISOString().split("T")[0];
      return {
        startDate: start,
        endDate: end,
        label: `${formatDateForDisplay(start)} – ${formatDateForDisplay(end)}`,
      };
    }
    case "this_year": {
      const start = `${currentYear}-01-01`;
      const end = `${currentYear}-12-31`;
      return {
        startDate: start,
        endDate: end,
        label: `${formatDateForDisplay(start)} – ${formatDateForDisplay(end)}`,
      };
    }
    case "all_time":
    default:
      return {
        startDate: null,
        endDate: null,
        label: "All time",
      };
  }
}

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DateRangeState>({
    preset: "all_time",
    startDate: null,
    endDate: null,
  });

  // Read URL query params on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    const to = params.get("to");
    const presetParam = params.get("preset") as DatePreset | null;

    if (presetParam && ["all_time", "this_month", "this_quarter", "last_6_months", "this_year"].includes(presetParam)) {
      const presetInfo = getPresetDates(presetParam);
      setState({
        preset: presetParam,
        startDate: presetInfo.startDate,
        endDate: presetInfo.endDate,
      });
    } else if (from || to) {
      setState({
        preset: "custom",
        startDate: from || null,
        endDate: to || null,
      });
    }
  }, []);

  const setDateRange = ({ preset, startDate, endDate }: { preset: DatePreset; startDate?: string | null; endDate?: string | null }) => {
    let newStart = startDate ?? null;
    let newEnd = endDate ?? null;

    if (preset !== "custom") {
      const presetInfo = getPresetDates(preset);
      newStart = presetInfo.startDate;
      newEnd = presetInfo.endDate;
    }

    const newState: DateRangeState = {
      preset,
      startDate: newStart,
      endDate: newEnd,
    };

    setState(newState);

    // Update URL query parameters seamlessly
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (preset === "all_time") {
        url.searchParams.delete("from");
        url.searchParams.delete("to");
        url.searchParams.delete("preset");
      } else {
        if (newStart) url.searchParams.set("from", newStart);
        else url.searchParams.delete("from");

        if (newEnd) url.searchParams.set("to", newEnd);
        else url.searchParams.delete("to");

        url.searchParams.set("preset", preset);
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  const resetDateRange = () => {
    setDateRange({ preset: "all_time" });
  };

  const label = useMemo(() => {
    if (state.preset === "all_time") {
      return "All time";
    }
    if (state.preset !== "custom") {
      return getPresetDates(state.preset).label;
    }
    if (state.startDate && state.endDate) {
      return `${formatDateForDisplay(state.startDate)} – ${formatDateForDisplay(state.endDate)}`;
    }
    if (state.startDate) {
      return `From ${formatDateForDisplay(state.startDate)}`;
    }
    if (state.endDate) {
      return `Until ${formatDateForDisplay(state.endDate)}`;
    }
    return "All time";
  }, [state]);

  return (
    <DateRangeContext.Provider value={{ state, label, setDateRange, resetDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
}
