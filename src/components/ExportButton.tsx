"use client";

/**
 * ExportButton.tsx
 * Triggers PDF generation by calling the /api/export-report route handler,
 * which server-renders the PDF via @react-pdf/renderer and streams it back.
 * Zero @react-pdf imports on the client, which avoids the Turbopack ESM issue.
 */

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import type { DashboardData } from "@/lib/mock-data";
import { useDateRange } from "@/context/DateRangeContext";

interface ExportButtonProps {
  data: DashboardData;
  variant?: "topbar" | "inline";
  className?: string;
}

export default function ExportButton({
  data,
  variant = "topbar",
  className = "",
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state: dateState, label: dateLabel } = useDateRange();

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const clientId = data?.client?.clientId || "CLT-001";
      params.set("clientId", clientId);
      if (dateState?.startDate) params.set("startDate", dateState.startDate);
      if (dateState?.endDate) params.set("endDate", dateState.endDate);
      if (dateLabel) params.set("rangeLabel", dateLabel);

      const res = await fetch(`/api/export-report?${params.toString()}`);

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      // Stream the blob and trigger a browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const slug = data.client.clientName.toLowerCase().replace(/\s+/g, "-");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `varna-esg-report-${slug}-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[ExportButton] PDF export failed:", err);
      setError("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const topbarClass = `
    flex items-center gap-2.5 px-5 py-2.5 rounded-xl
    backdrop-blur-md bg-[#9A4A2E]/90 hover:bg-[#823C23]
    text-white dark:text-white
    text-xs font-sans uppercase tracking-widest font-medium
    transition-all duration-200 shadow-md cursor-pointer
    disabled:opacity-60 disabled:cursor-wait
    active:scale-[0.98]
    ${className}
  `;

  const inlineClass = `
    flex items-center gap-2 px-4 py-2.5
    border border-[#7A3F1E] text-[#7A3F1E] dark:border-[#FAF6EE]/60 dark:text-[#FAF6EE]/80
    text-xs font-semibold uppercase tracking-wider
    hover:bg-[#7A3F1E] hover:text-[#FAF6EE] dark:hover:bg-[#FAF6EE]/10
    transition-all duration-200 cursor-pointer
    disabled:opacity-60 disabled:cursor-wait
    ${className}
  `;

  const btnClass = variant === "topbar" ? topbarClass : inlineClass;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        id="export-report-btn"
        onClick={handleExport}
        disabled={loading}
        className={btnClass.trim()}
        title="Download ESG Report as PDF"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : variant === "inline" ? (
          <FileText className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
        ) : (
          <Download className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
        )}
        <span>{loading ? "Generating..." : "Export Report"}</span>
      </button>
      {error && (
        <p className="text-[10px] text-red-500 dark:text-red-400 font-light">{error}</p>
      )}
    </div>
  );
}
