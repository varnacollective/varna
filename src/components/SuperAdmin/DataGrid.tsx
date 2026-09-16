"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Check,
  Search,
  RefreshCw,
  Download,
  AlertCircle,
  Database,
  Trash2,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

interface DataGridProps {
  tableName: string;
  initialData: any[];
  primaryKeyColumn?: string;
  title?: string;
  subtitle?: string;
  readOnlyColumns?: string[];
  allowDelete?: boolean;
  allowAdd?: boolean;
  onRefresh?: () => Promise<void> | void;
}

export default function DataGrid({
  tableName,
  initialData,
  primaryKeyColumn,
  title,
  subtitle,
  readOnlyColumns = ["id", "created_at"],
  allowDelete = true,
  allowAdd = true,
  onRefresh,
}: DataGridProps) {
  const supabase = createClient();
  const [data, setData] = useState<any[]>(initialData || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [savingCell, setSavingCell] = useState<{ rowIndex: number; colKey: string } | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<any>(null);

  // Sync state if initialData changes from parent
  useEffect(() => {
    setData(initialData || []);
  }, [initialData]);

  // Derive columns dynamically from data keys
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    const keysSet = new Set<string>();
    data.forEach((row) => {
      if (row && typeof row === "object") {
        Object.keys(row).forEach((k) => keysSet.add(k));
      }
    });

    const allKeys = Array.from(keysSet);
    
    // Sort columns so identified primary keys come first, followed by others
    return allKeys.sort((a, b) => {
      if (a === "id" || a === primaryKeyColumn) return -1;
      if (b === "id" || b === primaryKeyColumn) return 1;
      if (a.endsWith("_id")) return -1;
      if (b.endsWith("_id")) return 1;
      return a.localeCompare(b);
    });
  }, [data, primaryKeyColumn]);

  // Detect primary key column if not explicitly supplied
  const detectedPrimaryKey = useMemo(() => {
    if (primaryKeyColumn) return primaryKeyColumn;
    if (columns.includes("id")) return "id";
    const idCol = columns.find((c) => c.endsWith("_id"));
    if (idCol) return idCol;
    return columns[0] || "id";
  }, [primaryKeyColumn, columns]);

  // Toast dispatch
  const addToast = (type: "success" | "error" | "info", title: string, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Filtered rows based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      )
    );
  }, [data, searchQuery]);

  // Begin cell edit
  const handleCellClick = (rowIndex: number, colKey: string, currentValue: any) => {
    if (readOnlyColumns.includes(colKey)) {
      addToast("info", "Read-Only Field", `Column '${colKey}' is protected and cannot be edited directly.`);
      return;
    }
    setEditingCell({ rowIndex, colKey });
    setEditValue(currentValue === null || currentValue === undefined ? "" : String(currentValue));
  };

  // Parse typed string to appropriate SQL datatype
  const parseValueForDb = (val: string, originalVal: any) => {
    if (val.trim() === "") return null;
    if (typeof originalVal === "number") {
      const num = Number(val);
      return isNaN(num) ? val : num;
    }
    if (typeof originalVal === "boolean") {
      return val.toLowerCase() === "true" || val === "1";
    }
    // Handle JSON/Array strings if originally object
    if (typeof originalVal === "object" && originalVal !== null) {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  };

  // Commit change and trigger Supabase update()
  const handleSaveCell = async (rowIndex: number, colKey: string) => {
    const targetRow = filteredData[rowIndex];
    if (!targetRow) {
      setEditingCell(null);
      return;
    }

    const originalValue = targetRow[colKey];
    const parsedNewValue = parseValueForDb(editValue, originalValue);

    // Cancel if value didn't actually change
    const originalStr = originalValue === null || originalValue === undefined ? "" : String(originalValue);
    if (originalStr === editValue.trim()) {
      setEditingCell(null);
      return;
    }

    const pkValue = targetRow[detectedPrimaryKey];
    if (pkValue === undefined || pkValue === null) {
      addToast("error", "Save Failed", `Cannot identify row: missing primary key '${detectedPrimaryKey}'.`);
      setEditingCell(null);
      return;
    }

    setSavingCell({ rowIndex, colKey });

    try {
      // Execute Supabase update
      const { error } = await supabase
        .from(tableName)
        .update({ [colKey]: parsedNewValue })
        .eq(detectedPrimaryKey, pkValue);

      if (error) {
        console.error("Supabase update error:", error);
        addToast("error", "Update Error", error.message || "Failed to update record in Supabase.");
      } else {
        // Update local state smoothly
        setData((prevData) =>
          prevData.map((row) => {
            if (row[detectedPrimaryKey] === pkValue) {
              return { ...row, [colKey]: parsedNewValue };
            }
            return row;
          })
        );

        addToast(
          "success",
          "Synced to Supabase",
          `Updated '${colKey}' on ${detectedPrimaryKey}=${pkValue}`
        );
      }
    } catch (err: any) {
      console.error("Unexpected update exception:", err);
      addToast("error", "Network Error", err.message || "Failed to sync update.");
    } finally {
      setSavingCell(null);
      setEditingCell(null);
    }
  };

  // Delete row handler
  const handleDeleteRow = async (pkValue: any) => {
    if (!confirm(`Are you sure you want to delete record where ${detectedPrimaryKey}=${pkValue}?`)) {
      return;
    }

    setDeletingId(pkValue);
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(detectedPrimaryKey, pkValue);

      if (error) {
        addToast("error", "Delete Failed", error.message);
      } else {
        setData((prev) => prev.filter((r) => r[detectedPrimaryKey] !== pkValue));
        addToast("success", "Row Deleted", `Removed record ${detectedPrimaryKey}=${pkValue}`);
      }
    } catch (err: any) {
      addToast("error", "Error", err.message || "Delete operation failed.");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle reload
  const handleReload = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    } else {
      const { data: freshData, error } = await supabase.from(tableName).select("*");
      if (!error && freshData) {
        setData(freshData);
        addToast("info", "Data Refreshed", `Loaded ${freshData.length} records from ${tableName}.`);
      }
    }
    setRefreshing(false);
  };

  // CSV Export
  const handleExportCsv = () => {
    if (data.length === 0) return;
    const header = columns.join(",");
    const rows = data.map((row) =>
      columns
        .map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${tableName}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("info", "Export Complete", `Exported ${data.length} rows to CSV.`);
  };

  return (
    <div className="space-y-4 font-sans text-carbon-ink dark:text-warm-stone">
      {/* Toast Notifications Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto px-4 py-3 rounded-none border shadow-2xl flex items-start gap-3 min-w-[320px] max-w-md ${
                toast.type === "success"
                  ? "bg-[#1E2621] border-[#738678]/50 text-warm-stone"
                  : toast.type === "error"
                  ? "bg-[#291B1C] border-red-700/50 text-red-200"
                  : "bg-[#1F242D] border-slate-mist/40 text-warm-stone"
              }`}
            >
              <div className="mt-0.5">
                {toast.type === "success" && <Check className="w-4 h-4 text-sage-mineral" />}
                {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
                {toast.type === "info" && <Database className="w-4 h-4 text-slate-mist" />}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-semibold tracking-wider uppercase">
                  {toast.title}
                </p>
                <p className="text-xs text-warm-stone/80 font-light truncate mt-0.5">
                  {toast.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Grid Controls Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#202124] border border-slate-mist/30 dark:border-midnight-blue p-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-deep-clay dark:bg-warm-stone rotate-45" />
            <h2 className="text-lg font-sans font-medium text-carbon-ink dark:text-warm-stone tracking-tight">
              {title || tableName}
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-warm-stone/20 dark:bg-black/30 border border-slate-mist/20 text-slate-mist dark:text-warm-stone/60">
              {data.length} records &bull; {columns.length} cols
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-mist dark:text-warm-stone/50 font-light mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-mist" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#F9F9F8] dark:bg-[#18191B] border border-slate-mist/25 text-xs text-carbon-ink dark:text-warm-stone placeholder-slate-mist/60 focus:border-deep-clay dark:focus:border-warm-stone outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-mist hover:text-carbon-ink dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleReload}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-mist/30 bg-white dark:bg-[#2A2B2E] text-slate-mist dark:text-warm-stone/80 hover:text-carbon-ink dark:hover:text-white hover:border-slate-mist transition-colors cursor-pointer disabled:opacity-50"
            title="Reload table from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-deep-clay dark:text-warm-stone" : ""}`} />
            <span>Reload</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-midnight-blue text-white hover:bg-carbon-ink dark:bg-warm-stone dark:text-carbon-ink dark:hover:bg-[#E4DEC9] transition-colors cursor-pointer"
            title="Export view to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Container with Smooth Horizontal Scroll */}
      <div className="relative bg-white dark:bg-[#202124] border border-slate-mist/30 dark:border-midnight-blue shadow-sm overflow-hidden">
        {/* Helper tip banner */}
        <div className="px-4 py-2 border-b border-slate-mist/15 dark:border-midnight-blue/60 bg-[#F9F9F8] dark:bg-[#191A1D] flex items-center justify-between text-[10px] text-slate-mist dark:text-warm-stone/50 font-mono tracking-wider uppercase">
          <span>&bull; Click any editable cell to modify value &bull; Press Enter or click away to commit</span>
          <span>Primary Key: [{detectedPrimaryKey}]</span>
        </div>

        <div className="overflow-x-auto max-h-[640px] overflow-y-auto no-scrollbar [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse min-w-max text-xs">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 z-20 bg-[#F3EFE6] dark:bg-[#18191B] border-b border-slate-mist/30 dark:border-midnight-blue">
              <tr>
                <th className="p-3 w-12 text-center text-[10px] font-mono font-medium text-slate-mist/80 border-r border-slate-mist/20 dark:border-midnight-blue sticky left-0 bg-[#F3EFE6] dark:bg-[#18191B] z-30">
                  #
                </th>
                {columns.map((colKey) => {
                  const isPk = colKey === detectedPrimaryKey;
                  const isReadOnly = readOnlyColumns.includes(colKey);
                  return (
                    <th
                      key={colKey}
                      className={`p-3 text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap border-r border-slate-mist/20 dark:border-midnight-blue ${
                        isPk
                          ? "text-deep-clay dark:text-warm-stone font-bold bg-deep-clay/5 dark:bg-warm-stone/5"
                          : "text-slate-mist dark:text-warm-stone/70"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{colKey}</span>
                        {isPk && <span className="text-[8px] font-mono px-1 bg-deep-clay/10 text-deep-clay dark:text-warm-stone">PK</span>}
                        {isReadOnly && !isPk && <span className="text-[8px] text-slate-mist/50 font-normal">LOCK</span>}
                      </div>
                    </th>
                  );
                })}
                {allowDelete && (
                  <th className="p-3 text-[10px] font-semibold uppercase text-slate-mist text-center w-16">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-mist/15 dark:divide-midnight-blue/50">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (allowDelete ? 2 : 1)}
                    className="p-12 text-center text-slate-mist dark:text-warm-stone/50 font-light"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Database className="w-8 h-8 opacity-40 text-deep-clay dark:text-warm-stone mb-1" />
                      <p className="text-sm font-sans font-medium">No records found in {tableName}</p>
                      <p className="text-xs text-slate-mist/70">
                        {searchQuery ? "Try refining your search filter." : "This table does not have any active records."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rIdx) => {
                  const pkVal = row[detectedPrimaryKey];
                  return (
                    <tr
                      key={pkVal ?? rIdx}
                      className="hover:bg-[#F9F9F8] dark:hover:bg-[#26272B] transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="p-2.5 text-center font-mono text-[10px] text-slate-mist/60 border-r border-slate-mist/15 dark:border-midnight-blue sticky left-0 bg-white dark:bg-[#202124] group-hover:bg-[#F9F9F8] dark:group-hover:bg-[#26272B] z-10 select-none">
                        {rIdx + 1}
                      </td>

                      {/* Columns */}
                      {columns.map((colKey) => {
                        const cellVal = row[colKey];
                        const isEditing = editingCell?.rowIndex === rIdx && editingCell?.colKey === colKey;
                        const isSaving = savingCell?.rowIndex === rIdx && savingCell?.colKey === colKey;
                        const isReadOnly = readOnlyColumns.includes(colKey);
                        const isPk = colKey === detectedPrimaryKey;

                        const displayStr =
                          cellVal === null || cellVal === undefined
                            ? "null"
                            : typeof cellVal === "object"
                            ? JSON.stringify(cellVal)
                            : String(cellVal);

                        const isNull = cellVal === null || cellVal === undefined;

                        return (
                          <td
                            key={colKey}
                            onClick={() => !isReadOnly && handleCellClick(rIdx, colKey, cellVal)}
                            className={`p-2.5 border-r border-slate-mist/15 dark:border-midnight-blue/50 max-w-xs truncate transition-all duration-150 ${
                              isPk
                                ? "font-mono font-medium text-slate-mist dark:text-warm-stone/70 bg-warm-stone/5 dark:bg-black/10"
                                : isReadOnly
                                ? "text-slate-mist/70 cursor-not-allowed"
                                : "cursor-cell hover:bg-deep-clay/5 dark:hover:bg-warm-stone/5"
                            } ${isEditing ? "p-1 bg-deep-clay/10 dark:bg-warm-stone/10 ring-1 ring-deep-clay dark:ring-warm-stone" : ""}`}
                            title={displayStr}
                          >
                            {isEditing ? (
                              <input
                                autoFocus
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleSaveCell(rIdx, colKey)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveCell(rIdx, colKey);
                                  } else if (e.key === "Escape") {
                                    setEditingCell(null);
                                  }
                                }}
                                className="w-full px-2 py-1 bg-white dark:bg-[#141517] border border-deep-clay dark:border-warm-stone text-xs text-carbon-ink dark:text-white outline-none rounded-none font-sans"
                              />
                            ) : (
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`truncate ${
                                    isNull
                                      ? "text-slate-mist/40 italic text-[11px]"
                                      : "text-carbon-ink dark:text-warm-stone font-light"
                                  }`}
                                >
                                  {displayStr}
                                </span>
                                {isSaving && (
                                  <Loader2 className="w-3 h-3 text-deep-clay dark:text-warm-stone animate-spin shrink-0" />
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Actions */}
                      {allowDelete && (
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteRow(pkVal)}
                            disabled={deletingId === pkVal}
                            className="text-slate-mist/60 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors cursor-pointer disabled:opacity-30"
                            title="Delete Row"
                          >
                            {deletingId === pkVal ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
