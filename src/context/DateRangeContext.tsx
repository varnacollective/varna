"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";

export type DatePreset = "all_time" | "this_month" | "this_quarter" | "this_financial_year" | "last_12_months" | "last_6_months" | "this_year" | "custom";

export interface DateRangeState {
  preset: DatePreset;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD
}

interface DateRangeContextType {
  state: DateRangeState;
  label: string;
  isUserSelected: boolean;
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

/**
 * Format a local-timezone Date as YYYY-MM-DD.
 * We deliberately avoid .toISOString() here because that converts to UTC,
 * which means a midnight IST date (UTC-5:30) appears as the previous calendar
 * day. All dashboard date arithmetic is in IST (India Standard Time, +05:30),
 * matching the operational context of this platform.
 * End dates produced here are INCLUSIVE — query layers must filter with
 * endDate T23:59:59 (already done in ClientOverviewV2, ClientOrdersV2).
 */
function toLocalDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Calculate preset date ranges
export function getPresetDates(preset: DatePreset): { startDate: string | null; endDate: string | null; label: string } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  switch (preset) {
    case "this_month": {
      // firstDay = first calendar day of current local month (1st)
      // lastDay  = last calendar day of current local month (28/29/30/31)
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const start = toLocalDateString(firstDay);
      const end = toLocalDateString(lastDay);
      return {
        startDate: start,
        endDate: end,
        label: `${formatDateForDisplay(start)} – ${formatDateForDisplay(end)}`,
      };
    }
    case "this_quarter": {
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      const firstDay = new Date(currentYear, quarterStartMonth, 1);
      const lastDay = new Date(currentYear, quarterStartMonth + 3, 0);
      const start = toLocalDateString(firstDay);
      const end = toLocalDateString(lastDay);
      return {
        startDate: start,
        endDate: end,
        label: `${formatDateForDisplay(start)} – ${formatDateForDisplay(end)}`,
      };
    }
    case "this_financial_year": {
      // Indian financial year: Apr 1 – Mar 31
      // If current month is Jan/Feb/Mar, FY started last April
      const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const start = `${fyStartYear}-04-01`;
      const end = `${fyStartYear + 1}-03-31`;
      return {
        startDate: start,
        endDate: end,
        label: `${formatDateForDisplay(start)} – ${formatDateForDisplay(end)}`,
      };
    }
    case "last_12_months": {
      const twelveMonthsAgo = new Date(currentYear, currentMonth - 11, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
      const start = toLocalDateString(twelveMonthsAgo);
      const end = toLocalDateString(endOfMonth);
      return {
        startDate: start,
        endDate: end,
        label: `${formatDateForDisplay(start)} – ${formatDateForDisplay(end)}`,
      };
    }
    case "last_6_months": {
      const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
      const start = toLocalDateString(sixMonthsAgo);
      const end = toLocalDateString(endOfMonth);
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
  const [isUserSelected, setIsUserSelected] = useState<boolean>(false);

  // Read URL query params on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    const to = params.get("to");
    const presetParam = params.get("preset") as DatePreset | null;

    if (presetParam && ["all_time", "this_month", "this_quarter", "this_financial_year", "last_12_months", "last_6_months", "this_year"].includes(presetParam)) {
      const presetInfo = getPresetDates(presetParam);
      setState({
        preset: presetParam,
        startDate: presetInfo.startDate,
        endDate: presetInfo.endDate,
      });
      setIsUserSelected(true);
    } else if (from || to) {
      setState({
        preset: "custom",
        startDate: from || null,
        endDate: to || null,
      });
      setIsUserSelected(true);
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

    setIsUserSelected(true);
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
    setIsUserSelected(false);
    setDateRange({ preset: "all_time" });
  };

  const label = useMemo(() => {
    if (!isUserSelected) {
      return "Select Period";
    }
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
  }, [state, isUserSelected]);

  return (
    <DateRangeContext.Provider value={{ state, label, isUserSelected, setDateRange, resetDateRange }}>
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
