"use client";

import React from "react";
import { CheckCircle2, ArrowRight, Mail, Clock, Award, ShieldCheck } from "lucide-react";
import { PartnerInvitation } from "./types";

interface ThankYouStepProps {
  invitation: PartnerInvitation;
}

export function ThankYouStep({ invitation }: ThankYouStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 py-6 max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-[#EAF7ED] text-[#2D7D46] flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-[#9A4A2E] tracking-wider uppercase">
          Assessment Submitted Successfully
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#1E1A16] font-normal">
          Thank you, {invitation.contact_person || invitation.enterprise_name}
        </h1>
        <p className="text-sm text-[#6B6259] max-w-md mx-auto">
          Your responses for <strong>{invitation.enterprise_name}</strong> have been locked as Version
          1 and securely received by our assessment team.
        </p>
      </div>

      {/* What Happens Next Roadmap */}
      <div className="inv-card p-6 text-left space-y-5 bg-[#FFFFFF]">
        <h3 className="font-serif text-lg font-medium text-[#1E1A16] border-b border-[#E7DFD3] pb-2">
          What happens next?
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#F3EEE6] text-[#9A4A2E] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-[#1E1A16]">Document & Evidence Review</span>
              <p className="text-[#6B6259]">
                Our evaluation team examines your registrations, certifications, and production
                media against our standard criteria.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#F3EEE6] text-[#9A4A2E] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-[#1E1A16]">Scientific Scoring & Normalisation</span>
              <p className="text-[#6B6259]">
                We calculate your Environmental, Social, Governance, and Craft pillar scores using
                verified methodologies tailored for India.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#F3EEE6] text-[#9A4A2E] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-[#1E1A16]">You See Your Score First</span>
              <p className="text-[#6B6259]">
                Before any score is shared with hotel procurement teams, you will receive a preview
                report to review and provide any corrections.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reassurance & Contact */}
      <div className="p-5 bg-[#FAF7F2] rounded-xl border border-[#E7DFD3] text-xs text-[#6B6259] space-y-2">
        <p>
          A confirmation has been recorded for{" "}
          <strong className="text-[#1E1A16]">{invitation.contact_email}</strong>. You can return to
          this page anytime using your original link to monitor your assessment progress.
        </p>
        <p>
          Questions or need to update a document? Contact our Impact Lead, Yuvraj at{" "}
          <a
            href="mailto:yuvraj@varnacollective.com"
            className="text-[#9A4A2E] font-medium hover:underline"
          >
            yuvraj@varnacollective.com
          </a>
        </p>
      </div>
    </div>
  );
}
