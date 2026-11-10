"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Trash2, Calendar, AlertCircle } from "lucide-react";
import { PartnerDocument } from "./types";

interface FileUploadSlotProps {
  slug: string;
  questionRef: string;
  label: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  documents: PartnerDocument[];
  onDocumentsChange: (docs: PartnerDocument[]) => void;
  allowLater?: boolean;
  laterDate?: string;
  onLaterDateChange?: (date: string) => void;
  allowDontHave?: boolean;
  dontHave?: boolean;
  onDontHaveChange?: (val: boolean) => void;
}

export function FileUploadSlot({
  slug,
  questionRef,
  label,
  hint,
  accept = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv",
  multiple = true,
  documents,
  onDocumentsChange,
  allowLater = true,
  laterDate = "",
  onLaterDateChange,
  allowDontHave = false,
  dontHave = false,
  onDontHaveChange,
}: FileUploadSlotProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showLaterPicker, setShowLaterPicker] = useState(Boolean(laterDate));

  // Filter docs matching this questionRef
  const matchedDocs = documents.filter((d) => d.question_ref === questionRef);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const newDocs: PartnerDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("questionRef", questionRef);

      try {
        const res = await fetch(`/api/invitation/${slug}/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }
        if (data.document) {
          newDocs.push(data.document);
        }
      } catch (err: any) {
        setUploadError(err.message || "Failed to upload file");
      }
    }

    if (newDocs.length > 0) {
      onDocumentsChange([...documents, ...newDocs]);
    }
    setIsUploading(false);
    // Reset input
    e.target.value = "";
  };

  const handleDelete = async (docId: string) => {
    try {
      await fetch(`/api/invitation/${slug}/upload?documentId=${docId}`, {
        method: "DELETE",
      });
      onDocumentsChange(documents.filter((d) => d.id !== docId));
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <label className="text-sm font-semibold text-[#1E1A16]">{label}</label>
        <span className="text-xs text-[#9A8E84]">Max 25 MB · PDF, image, Word, Excel</span>
      </div>

      {hint && <p className="text-xs text-[#6B6259]">{hint}</p>}

      {/* Upload Box */}
      <div className="relative border-2 border-dashed border-[#E7DFD3] hover:border-[#9A4A2E] rounded-xl p-5 bg-[#FAF7F2]/50 hover:bg-[#FDF0EB]/30 transition-all text-center">
        <input
          type="file"
          id={`upload-${questionRef}`}
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          disabled={isUploading || dontHave}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E7DFD3] flex items-center justify-center text-[#9A4A2E] shadow-sm">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1E1A16]">
              {isUploading ? "Uploading file..." : "Click or drag files here to upload"}
            </p>
            <p className="text-xs text-[#6B6259] mt-0.5">
              Supports scans, phone photos, or digital documents
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 text-xs text-[#C0392B] bg-[#FEE2E2] p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Uploaded Documents List */}
      {matchedDocs.length > 0 && (
        <div className="space-y-2 pt-1">
          {matchedDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2.5 bg-[#FFFFFF] border border-[#E7DFD3] rounded-lg text-xs"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-[#9A4A2E] flex-shrink-0" />
                <span className="font-medium text-[#1E1A16] truncate max-w-[240px] sm:max-w-md">
                  {doc.file_name}
                </span>
                <span className="text-[#9A8E84] flex-shrink-0">
                  {doc.file_size ? `(${(doc.file_size / (1024 * 1024)).toFixed(2)} MB)` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2D7D46] bg-[#EAF7ED] px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Uploaded
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 text-[#9A8E84] hover:text-[#C0392B] rounded transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alternative Options: Add Later & Don't Have */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
        {allowLater && (
          <div className="flex items-center gap-2">
            {!showLaterPicker ? (
              <button
                type="button"
                onClick={() => setShowLaterPicker(true)}
                className="text-[#9A4A2E] hover:underline font-medium flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                I will add this later
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 px-3 rounded-lg border border-[#E7DFD3]">
                <span className="text-[#6B6259]">Will upload by:</span>
                <input
                  type="date"
                  value={laterDate}
                  onChange={(e) => onLaterDateChange?.(e.target.value)}
                  className="bg-[#FFFFFF] border border-[#E7DFD3] rounded px-2 py-0.5 text-xs text-[#1E1A16]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowLaterPicker(false);
                    onLaterDateChange?.("");
                  }}
                  className="text-[#9A8E84] hover:text-[#C0392B] text-xs font-semibold ml-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {allowDontHave && (
          <label className="flex items-center gap-1.5 text-[#6B6259] cursor-pointer">
            <input
              type="checkbox"
              checked={dontHave}
              onChange={(e) => onDontHaveChange?.(e.target.checked)}
              className="rounded border-[#E7DFD3] text-[#9A4A2E] focus:ring-[#9A4A2E]"
            />
            <span>I do not have this document (creates review item for Varna team)</span>
          </label>
        )}
      </div>
    </div>
  );
}
