"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Building2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";

const CERTIFICATE_CATEGORIES = [
  { value: "Governance", label: "Governance (e.g., ISO 37001, Anti-Bribery, Corporate Ethics)" },
  { value: "Environment", label: "Environment (e.g., ISO 14001, OEKO-TEX, GOTS, Carbon Neutral)" },
  { value: "Social & Labor", label: "Social & Labor (e.g., Fair Trade, SA8000, SMETA, WRAP)" },
  { value: "Quality & Safety", label: "Quality & Safety (e.g., ISO 9001, GMP, Product Safety)" },
  { value: "Sourcing & Traceability", label: "Sourcing & Traceability (e.g., FSC, Conflict-Free, GRS)" },
  { value: "Other", label: "Other Compliance & Industry Certification" },
];

export default function PartnerUploadCertificatePage() {
  const [partnerName, setPartnerName] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    partner_name: string;
    certificate_type: string;
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
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setErrorMessage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setPartnerName("");
    setCertificateType("");
    setFile(null);
    setSuccessData(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!partnerName.trim()) {
      setErrorMessage("Please enter your company or partner name.");
      return;
    }

    if (!certificateType) {
      setErrorMessage("Please select a certificate type category.");
      return;
    }

    if (!file) {
      setErrorMessage("Please select or drop a certificate document to upload.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("partnerName", partnerName.trim());
      formData.append("certificateType", certificateType);
      formData.append("file", file);

      const response = await fetch("/api/upload-certificate", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload certificate. Please try again.");
      }

      setSuccessData({
        partner_name: partnerName.trim(),
        certificate_type: certificateType,
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
    <div className="min-h-screen bg-[#121316] text-[#D8CFB8] flex flex-col justify-between selection:bg-[#7A3F1E] selection:text-[#D8CFB8]">
      {/* Top Navigation / Brand Header */}
      <header className="border-b border-white/10 bg-[#161719]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7A3F1E]/20 border border-[#7A3F1E]/40 flex items-center justify-center text-[#D8CFB8]">
              <ShieldCheck className="w-5 h-5 text-[#B85333]" />
            </div>
            <div>
              <span className="font-serif tracking-wider text-base font-semibold text-[#D8CFB8]">
                VARNA COLLECTIVE
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-[#6F848F] uppercase tracking-wider">
                • Partner Verification
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[#6F848F]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Secure Vault
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Page Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7A3F1E]/20 border border-[#7A3F1E]/40 text-[#D8CFB8] text-xs font-mono mb-3">
            <FileCheck className="w-3.5 h-3.5 text-[#B85333]" />
            Official Certificate Intake
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#FAF8F5] tracking-tight mb-3">
            Partner Certificate Submission
          </h1>
          <p className="text-sm text-[#96AAB4] max-w-lg mx-auto font-light leading-relaxed">
            Upload your sustainability, quality, and governance credentials. Documents are verified by the Varna Collective compliance team and permanently archived to the enterprise registry.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Submission Failed</p>
              <p className="text-xs text-red-300/90 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form or Success State */}
        {successData ? (
          <div className="bg-[#1C1D21] border border-emerald-500/30 rounded-2xl p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#FAF8F5]">Certificate Submitted Successfully</h2>
              <p className="text-xs text-[#96AAB4] mt-1">
                Your certificate has been securely transferred to the Varna Cloud Vault and registered under review.
              </p>
            </div>

            {/* Submission Summary Card */}
            <div className="bg-[#121316] rounded-xl p-5 border border-white/5 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[#6F848F]">Partner / Company:</span>
                <span className="text-[#FAF8F5] font-semibold">{successData.partner_name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[#6F848F]">Certificate Category:</span>
                <span className="text-[#B85333] font-medium">{successData.certificate_type}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[#6F848F]">Review Status:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Pending Superadmin Verification
                </span>
              </div>
              {successData.drive_webview_link && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#6F848F]">Storage Vault:</span>
                  <a
                    href={successData.drive_webview_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#D8CFB8] hover:text-white underline underline-offset-2 transition-colors"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#7A3F1E] hover:bg-[#B85333] text-white font-medium text-sm transition-all shadow-lg hover:shadow-[#7A3F1E]/30"
              >
                <RefreshCw className="w-4 h-4" />
                Submit Another Certificate
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-[#1C1D21] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
          >
            {/* Field 1: Partner / Company Name */}
            <div className="space-y-2">
              <label
                htmlFor="partnerName"
                className="block text-xs font-mono uppercase tracking-wider text-[#96AAB4]"
              >
                Company / Partner Name <span className="text-[#B85333]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F848F]">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  id="partnerName"
                  type="text"
                  required
                  disabled={loading}
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g., Artisan Heritage Weavers Ltd."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121316] border border-white/10 text-sm text-[#FAF8F5] placeholder-[#6F848F] focus:outline-none focus:border-[#7A3F1E] focus:ring-1 focus:ring-[#7A3F1E] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Field 2: Certificate Type */}
            <div className="space-y-2">
              <label
                htmlFor="certificateType"
                className="block text-xs font-mono uppercase tracking-wider text-[#96AAB4]"
              >
                Certificate Type <span className="text-[#B85333]">*</span>
              </label>
              <div className="relative">
                <select
                  id="certificateType"
                  required
                  disabled={loading}
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121316] border border-white/10 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#7A3F1E] focus:ring-1 focus:ring-[#7A3F1E] transition-all disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#121316] text-[#6F848F]">
                    Select certification domain...
                  </option>
                  {CERTIFICATE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-[#121316] text-[#FAF8F5]">
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6F848F]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Field 3: File Input Element */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#96AAB4]">
                Certificate Document (PDF or Image) <span className="text-[#B85333]">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                id="certificateFile"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />

              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#B85333] bg-[#7A3F1E]/10"
                      : "border-white/10 hover:border-white/20 bg-[#121316]/50 hover:bg-[#121316]"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#7A3F1E]/20 text-[#D8CFB8] mx-auto flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6 text-[#B85333]" />
                  </div>
                  <p className="text-sm font-medium text-[#FAF8F5]">
                    Click to browse or drag and drop your document
                  </p>
                  <p className="text-xs text-[#6F848F] mt-1">
                    Supports PDF, PNG, JPG, JPEG, WEBP (Max 25MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#121316] border border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#7A3F1E]/20 text-[#B85333] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#FAF8F5] truncate">{file.name}</p>
                      <p className="text-xs text-[#6F848F] font-mono">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!loading && (
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 rounded-lg text-[#6F848F] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#7A3F1E] hover:bg-[#B85333] text-[#FAF8F5] font-medium text-sm transition-all shadow-lg hover:shadow-[#7A3F1E]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Encrypting & Uploading to Drive...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Certificate for Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-[#6F848F]">
        <p>© {new Date().getFullYear()} Varna Collective. All partner documents are securely stored and verified.</p>
      </footer>
    </div>
  );
}
