"use client";

import React, { useState } from "react";
import { ArrowRight, CheckSquare, Clock, ShieldCheck, Mail, Share2, AlertTriangle, Copy, Check } from "lucide-react";
import { PartnerInvitation } from "./types";

interface WelcomeStepProps {
  invitation: PartnerInvitation;
  onStart: () => void;
  onDecline: (reason: string) => Promise<void>;
}

export function WelcomeStep({ invitation, onStart, onDecline }: WelcomeStepProps) {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleConfirmDecline = async () => {
    setIsDeclining(true);
    await onDecline(declineReason);
    setIsDeclining(false);
    setShowDeclineModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Introduction Card */}
      <div className="inv-card p-6 sm:p-10 border-[#E7DFD3] space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EEE6] text-[#9A4A2E] text-xs font-semibold tracking-wide uppercase">
            <span>Part A · Brand Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1E1A16] font-normal tracking-tight">
            Varna Enterprise Assessment
          </h1>
          <p className="text-base text-[#6B6259]">
            Prepared for <strong className="text-[#1E1A16]">{invitation.enterprise_name}</strong>
            {invitation.brand_name && ` (${invitation.brand_name})`}
          </p>
        </div>

        {/* Welcome Letter Verbatim */}
        <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E7DFD3] space-y-4">
          <p className="font-serif italic text-lg text-[#1E1A16]">Dear Partner,</p>
          <div className="space-y-3 text-sm text-[#3D3630] leading-relaxed">
            <p>
              At Varna one of the things we've been working on developing is a proprietary
              Sustainability Standard framework that we believe is global in its methodology and
              rigor yet captures the nuances of the Indian context and the various kinds of
              businesses that are different in their approaches to sustainability.
            </p>
            <p>
              The idea is not to grade, but to evaluate our partner capabilities using a transparent
              scientific process which will enable us to showcase your brands for a global appeal
              and build consumer confidence while preserving the nuances of your businesses.
            </p>
            <p>
              Thank you for taking the time out to do this. This is a one time exercise and a part of
              our brand onboarding process. We've tried to simplify the questions as much as we can as
              well as add prompts for understanding, however if at any point you need assistance
              please reach out to our Impact Lead, Yuvraj at{" "}
              <a
                href="mailto:yuvraj@varnacollective.com"
                className="text-[#9A4A2E] underline font-medium"
              >
                yuvraj@varnacollective.com
              </a>{" "}
              and he'd be happy to assist.
            </p>
            <p className="font-medium text-[#1E1A16] pt-1">
              Thank You, <br />
              <span className="font-serif italic">Team Varna</span>
            </p>
          </div>
        </div>

        {/* Things to Keep in Mind Verbatim */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold tracking-wide uppercase text-[#1E1A16] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#9A4A2E]" />
            Things to keep in mind while answering the questionnaire:
          </h3>
          <ul className="space-y-2 text-sm text-[#6B6259] pl-1">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9A4A2E] mt-2 flex-shrink-0" />
              <span>
                This form is designed to be completed by anyone in your team, you do not need to be a
                sustainability expert.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9A4A2E] mt-2 flex-shrink-0" />
              <span>
                Every question has plain language and at least one example. If you are unsure of an
                answer, give your best estimate and tell us so. An honest approximate answer is always
                better than leaving a question blank.
              </span>
            </li>
          </ul>
        </div>

        {/* Keep These Handy Checklist */}
        <div className="p-5 bg-[#F3EEE6]/60 rounded-xl border border-[#E7DFD3] space-y-3">
          <h3 className="text-xs font-bold tracking-wider uppercase text-[#1E1A16] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#9A4A2E]" />
            Keep these handy (recommended documents):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#3D3630]">
            <div className="flex items-center gap-2">
              <span className="text-[#9A4A2E]">✓</span>
              <span>GST & Udyam registration certificates</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#9A4A2E]">✓</span>
              <span>Environmental or organic certificates (if any)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#9A4A2E]">✓</span>
              <span>Social or Fair Trade certificates, ESI records</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#9A4A2E]">✓</span>
              <span>Ethics or responsible sourcing policy (if written)</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <span className="text-[#9A4A2E]">✓</span>
              <span>Production process video and workspace photos (for craft enterprises)</span>
            </div>
          </div>
          <p className="text-[11px] text-[#9A8E84] italic pt-1">
            Don't worry if you don't have all of these right now. You can upload them later or mark
            "I'll add this later".
          </p>
        </div>

        {/* Primary CTA & Secondary Options */}
        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[#E7DFD3]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inv-btn-secondary text-xs py-2 px-3.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#2D7D46]" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#6B6259]" />
                  <span>Send to a Colleague</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowDeclineModal(true)}
              className="inv-btn-ghost text-xs text-[#9A8E84] hover:text-[#C0392B]"
            >
              We don't supply this client
            </button>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="inv-btn-primary py-3 px-8 text-base shadow-md group"
          >
            <span>Begin Assessment</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-[#1E1A16]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7DFD3] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-[#C0392B]">
              <div className="p-2 rounded-full bg-[#FEE2E2]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#1E1A16]">
                Decline Invitation
              </h3>
            </div>
            <p className="text-xs text-[#6B6259]">
              If your enterprise does not work with this client or cannot participate in this
              assessment, let us know below. This link will be archived.
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#1E1A16] mb-1">
                Reason (optional)
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
                placeholder="e.g. We no longer supply this property, or we do not have capacity at this time..."
                className="inv-textarea text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="inv-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={isDeclining}
                className="bg-[#C0392B] hover:bg-[#991B1B] text-[#FFFFFF] text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {isDeclining ? "Submitting..." : "Confirm & Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
