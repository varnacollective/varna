"use client";

import type { ClientOrderItem } from "@/lib/mock-data";
import { CheckCircle2, Clock, Circle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface EvidencePanelV2Props {
  order: ClientOrderItem;
}

export default function EvidencePanelV2({ order }: EvidencePanelV2Props) {
  const {
    orderNumber,
    supplierName,
    evidenceWeight,
    evidenceStatusLabel,
    relatedOrderNumbers,
    checklist = [],
  } = order;

  // Active segment index: 0.50 -> 0, 0.75 -> 1, 1.00 -> 2
  const activeSegmentIndex =
    evidenceWeight >= 1.0 ? 2 : evidenceWeight >= 0.75 ? 1 : 0;

  // D4 Relation Hint Text
  const relatedHint =
    relatedOrderNumbers && relatedOrderNumbers.length > 0
      ? ` Also applies to order ${relatedOrderNumbers.join(", ")}.`
      : "";

  return (
    <div
      className="
        varna-evidence-panel-v2
        bg-white dark:bg-[#20242B]
        border border-black/[0.07] dark:border-white/[0.08]
        shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
        dark:shadow-none dark:border-t-white/[0.12]
        rounded-[24px] p-6 lg:p-8
        flex flex-col justify-between h-full w-full
        lg:sticky lg:top-24 lg:self-start
      "
      aria-live="polite"
    >
      <div>
        {/* Header Title and Subtitle with D4 Relation Hint */}
        <h2 className="text-xl lg:text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
          Order {orderNumber} Evidence
        </h2>
        <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] font-normal mt-1 leading-relaxed">
          {supplierName}.{relatedHint}
        </p>

        {/* Current Evidence Weight Display */}
        <div className="mt-6">
          <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#6F6A61] dark:text-[#9A948A] block mb-1">
            Current evidence weight
          </span>

          <div className="flex items-baseline justify-between gap-4">
            <div className="text-4xl lg:text-[48px] font-light text-[#7D3F1E] dark:text-[#E07A57] tracking-tight leading-none tabular-nums">
              {evidenceWeight.toFixed(2)}×
            </div>

            <div className="px-3 py-1 rounded-full bg-[#7D3F1E]/12 dark:bg-[#E07A57]/20 text-[#7D3F1E] dark:text-[#E07A57] text-xs font-semibold">
              {evidenceStatusLabel}
            </div>
          </div>
        </div>

        {/* 3-Segment Weight Scale Bar */}
        <div className="my-5">
          <div className="grid grid-cols-3 gap-2 h-2 mb-2">
            {[0, 1, 2].map((idx) => {
              const isActive = idx === activeSegmentIndex;
              return (
                <div
                  key={idx}
                  className={`
                    h-full rounded-full transition-colors duration-300
                    ${
                      isActive
                        ? "bg-[#7D3F1E] dark:bg-[#E07A57]"
                        : "bg-black/10 dark:bg-white/10"
                    }
                  `}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-1 text-[10px] text-[#6F6A61] dark:text-[#9A948A] text-center font-medium">
            <div>
              <span className="block">None or proxy</span>
              <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-semibold">0.50×</span>
            </div>
            <div>
              <span className="block">Self-reported</span>
              <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-semibold">0.75×</span>
            </div>
            <div>
              <span className="block">Third-party verified</span>
              <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-semibold">1.00×</span>
            </div>
          </div>
        </div>

        <div className="my-5 border-t border-black/[0.07] dark:border-white/[0.08]" />

        {/* Vertical Checklist Stepper */}
        <div className="space-y-5 my-2">
          {checklist.map((item, idx) => {
            const isComplete = item.status === "complete";
            const isPending = item.status === "pending";

            return (
              <div key={idx} className="flex items-start gap-3.5 relative">
                {/* Stepper Vertical Connector Line */}
                {idx < checklist.length - 1 && (
                  <div className="absolute left-3.5 top-7 bottom-0 w-[1px] bg-black/10 dark:bg-white/10 -ml-px" />
                )}

                {/* Status Icon */}
                <div className="relative z-10 shrink-0 mt-0.5">
                  {isComplete ? (
                    <div className="w-7 h-7 rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0]">
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                    </div>
                  ) : isPending ? (
                    <div className="w-7 h-7 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57]">
                      <Clock className="w-4 h-4" strokeWidth={2} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#6F6A61] dark:text-[#9A948A]">
                      <Circle className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                  )}
                </div>

                {/* Step Copy Stack */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
                    {item.title}
                  </div>
                  <p
                    className={`
                      text-xs mt-0.5 leading-relaxed font-normal
                      ${
                        isPending
                          ? "text-[#7D3F1E] dark:text-[#E07A57]"
                          : "text-[#6F6A61] dark:text-[#9A948A]"
                      }
                    `}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Supplier Scorecard Link */}
      <div className="pt-4 mt-6 border-t border-black/[0.07] dark:border-white/[0.08] flex items-center justify-between">
        <Link
          href="/dashboard/suppliers"
          className="text-xs font-semibold text-[#7D3F1E] dark:text-[#E07A57] hover:underline underline-offset-4 flex items-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <span>View {supplierName} Scorecard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
