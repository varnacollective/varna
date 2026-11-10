"use client";

import React from "react";
import { PartnerInvitation, PartnerDocument, FormAnswers } from "./types";
import { CheckCircle2, Clock, FileText, AlertCircle, ShieldCheck, Mail } from "lucide-react";

interface StatusPageProps {
  invitation: PartnerInvitation;
  latestResponse: {
    answers: FormAnswers;
    version: number;
    submitted_at?: string;
  } | null;
  documents: PartnerDocument[];
}

export function StatusPage({ invitation, latestResponse, documents }: StatusPageProps) {
  const answers = latestResponse?.answers || {};
  const submittedAt = latestResponse?.submitted_at
    ? new Date(latestResponse.submitted_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently submitted";

  const pipelineStages = [
    { label: "Submitted", status: "completed", desc: submittedAt },
    { label: "Document Verification", status: "current", desc: "Assessment team reviewing files" },
    { label: "ESG Scoring", status: "upcoming", desc: "Scientific scoring & normalisation" },
    { label: "Score Sign-off", status: "upcoming", desc: "You review and approve first" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="inv-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7DFD3] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7ED] text-[#2D7D46] text-xs font-semibold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Assessment Locked · Version {latestResponse?.version || 1}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#1E1A16] font-normal">
              {invitation.enterprise_name}
            </h1>
            <p className="text-xs text-[#6B6259] mt-0.5">
              Contact: {invitation.contact_person} ({invitation.contact_email})
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-[#6B6259]">
            <span className="block text-[#9A8E84]">Submitted on:</span>
            <span className="font-medium text-[#1E1A16]">{submittedAt}</span>
          </div>
        </div>

        {/* Pipeline Stage Tracker */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1A16] mb-4">
            Assessment Status Pipeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {pipelineStages.map((stage, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border ${
                  stage.status === "completed"
                    ? "bg-[#EAF7ED]/50 border-[#2D7D46]/30 text-[#1A5C30]"
                    : stage.status === "current"
                    ? "bg-[#FAF7F2] border-[#9A4A2E] text-[#9A4A2E] ring-1 ring-[#9A4A2E]/20"
                    : "bg-[#FFFFFF] border-[#E7DFD3] text-[#9A8E84]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Stage {idx + 1}
                  </span>
                  {stage.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2D7D46]" />
                  ) : stage.status === "current" ? (
                    <Clock className="w-4 h-4 text-[#9A4A2E] animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#E7DFD3]" />
                  )}
                </div>
                <p className="text-xs font-semibold text-[#1E1A16]">{stage.label}</p>
                <p className="text-[11px] text-[#6B6259] mt-0.5">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Uploaded Documents Verification Status */}
      <div className="inv-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7DFD3] pb-3">
          <h3 className="font-serif text-lg font-medium text-[#1E1A16] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#9A4A2E]" />
            Uploaded Documents & Evidence ({documents.length})
          </h3>
        </div>

        {documents.length > 0 ? (
          <div className="divide-y divide-[#E7DFD3]">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-[#1E1A16]">{doc.file_name}</p>
                  <p className="text-[11px] text-[#6B6259]">
                    Slot: {doc.question_ref || "General"} · Uploaded on{" "}
                    {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {doc.status === "verified" || doc.status === "approved" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAF7ED] text-[#2D7D46] font-medium text-[11px]">
                      Verified ✓
                    </span>
                  ) : doc.status === "flagged" || doc.status === "re_upload_requested" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#C0392B] font-medium text-[11px]">
                      Action Required
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3CD] text-[#92400E] font-medium text-[11px]">
                      Awaiting Verification
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6B6259] py-3 italic">
            No files were directly attached during online submission. If your relationship manager
            requests certificates, you can email them directly.
          </p>
        )}
      </div>

      {/* Submitted Answers Summary */}
      <div className="inv-card p-6 space-y-4">
        <h3 className="font-serif text-lg font-medium text-[#1E1A16] border-b border-[#E7DFD3] pb-2">
          Summary of Submitted Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#9A8E84]">Primary Products & Category:</span>
            <p className="font-medium text-[#1E1A16] mt-0.5">
              {answers.q2_1_products_overview || "—"}
            </p>
          </div>
          <div>
            <span className="text-[#9A8E84]">Location:</span>
            <p className="font-medium text-[#1E1A16] mt-0.5">
              {answers.q1_4_district ? `${answers.q1_4_district}, ${answers.q1_5_state}` : "—"}
            </p>
          </div>
          <div>
            <span className="text-[#9A8E84]">Total Workers:</span>
            <p className="font-medium text-[#1E1A16] mt-0.5">
              {answers.q1_15_workers_count || 0} (Women: {answers.q4_1_women_workers_count || 0})
            </p>
          </div>
          <div>
            <span className="text-[#9A8E84]">UN SDGs Aligned:</span>
            <p className="font-medium text-[#1E1A16] mt-0.5">
              {answers.q7_6_sdgs?.join(", ") || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Callout */}
      <div className="p-5 bg-[#FAF7F2] border border-[#E7DFD3] rounded-xl flex items-start gap-3 text-xs text-[#6B6259]">
        <Mail className="w-5 h-5 text-[#9A4A2E] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#1E1A16]">Need assistance or want to update a document?</p>
          <p>
            Your responses are locked for evaluation. If you need to make changes or have questions
            regarding your scoring timeline, please contact our Impact Lead, Yuvraj at{" "}
            <a
              href="mailto:yuvraj@varnacollective.com"
              className="text-[#9A4A2E] font-medium hover:underline"
            >
              yuvraj@varnacollective.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
