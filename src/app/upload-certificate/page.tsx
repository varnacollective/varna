"use client";

import React, { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Plus,
} from "lucide-react";

function UploadCertificateContent() {
  const searchParams = useSearchParams();
  const rawPartner = searchParams.get("partner") || searchParams.get("partnerName");
  const partnerName = rawPartner ? decodeURIComponent(rawPartner).trim() : "Partner Verification";
  const folderId = searchParams.get("folderId") || searchParams.get("folder_id") || "";

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    partner_name: string;
    file_count: number;
    file_names: string[];
    drive_webview_link?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
      setErrorMessage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      setErrorMessage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const resetForm = () => {
    setFiles([]);
    setSuccessData(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (files.length === 0) {
      setErrorMessage("Please select or drop at least one certificate document to upload.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("partnerName", partnerName);
      if (folderId) {
        formData.append("folderId", folderId);
      }
      formData.append("certificateType", "Sustainability & Compliance");

      // Append each file to 'files'
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Backward compatibility fallback for single-file API handlers
      formData.append("file", files[0]);

      const response = await fetch("/api/upload-certificate", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload certificate. Please try again.");
      }

      setSuccessData({
        partner_name: partnerName,
        file_count: files.length,
        file_names: files.map((f) => f.name),
        drive_webview_link: result.data?.drive_webview_link,
      });
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage(err.message || "An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 flex flex-col justify-between selection:bg-[#B44C22]/20 selection:text-[#B44C22]">
      {/* Top Navigation / Brand Header */}
      <header className="border-b border-gray-200 bg-[#FAF8F5]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">

            <div>
              <span className="font-serif tracking-wider text-base font-semibold text-gray-900">
                VARNA COLLECTIVE
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-gray-500 uppercase tracking-wider">
                Partner Verification
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Dynamic Partner Name Header */}
        <div className="text-center mb-8">

          <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 tracking-tight mb-2">
            {partnerName}
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto font-light leading-relaxed">
            Upload your sustainability and compliance documents
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Submission Failed</p>
              <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form or Success State */}
        {successData ? (
          <div className="bg-white shadow-sm border border-emerald-200 rounded-2xl p-8 sm:p-10 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-serif text-gray-900">Documents Submitted Successfully</h2>
              <p className="text-xs text-gray-600 mt-1">
                Your compliance documents have been securely uploaded to the Varna Cloud Vault and queued for verification.
              </p>
            </div>

            {/* Submission Summary Card */}
            <div className="bg-[#FAF8F5] rounded-xl p-5 border border-gray-200 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500">Partner / Organization:</span>
                <span className="text-gray-900 font-semibold">{successData.partner_name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500">Documents Uploaded:</span>
                <span className="text-[#B44C22] font-semibold">{successData.file_count} file(s)</span>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <span className="text-gray-500 block mb-1">Files:</span>
                <ul className="space-y-1 pl-2">
                  {successData.file_names.map((name, i) => (
                    <li key={i} className="text-gray-700 truncate flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500">Review Status:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Pending Superadmin Verification
                </span>
              </div>
              {successData.drive_webview_link && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-500">Storage Vault:</span>
                  <a
                    href={successData.drive_webview_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#B44C22] hover:text-[#8A3716] font-medium underline underline-offset-2 transition-colors"
                  >
                    View in Google Drive
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#B44C22] hover:bg-[#8A3716] text-white font-medium text-sm transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Upload More Documents
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Multi-File Dropzone */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-600">
                  Certificate Documents <span className="text-[#B44C22]">*</span>
                </label>
                {files.length > 0 && (
                  <span className="text-xs font-mono text-gray-500">
                    {files.length} {files.length === 1 ? "file" : "files"} selected
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                id="certificateFiles"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                multiple
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                  ? "border-[#B44C22] bg-[#B44C22]/5"
                  : "border-gray-300 hover:border-gray-400 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]"
                  }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#B44C22]/10 border border-[#B44C22]/20 text-[#B44C22] mx-auto flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Click to browse or drag and drop your files
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports multiple PDFs, PNGs, JPGs, or WEBPs (Max 25MB each)
                </p>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                    <span>Selected Files</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#B44C22] hover:text-[#8A3716] flex items-center gap-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add more files
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {files.map((selectedFile, index) => (
                      <div
                        key={`${selectedFile.name}-${index}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-gray-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#B44C22]/10 text-[#B44C22] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        {!loading && (
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || files.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#B44C22] hover:bg-[#8A3716] text-white font-medium text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading {files.length} document{files.length > 1 ? "s" : ""} to Drive...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Submit {files.length > 0 ? `${files.length} ` : ""}Certificate{files.length > 1 ? "s" : ""} for Verification
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Varna Collective. All partner documents are securely stored and verified.</p>
      </footer>
    </div>
  );
}

export default function PartnerUploadCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#B44C22]" />
        </div>
      }
    >
      <UploadCertificateContent />
    </Suspense>
  );
}
