"use client";

import React from "react";
import type { ClientOrderItem } from "@/lib/mock-data";
import BrandLogo from "@/components/ui/BrandLogo";
import { CheckCircle2, Clock, AlertCircle, ShieldAlert, FileText, Check } from "lucide-react";

interface OrderDetailPanelProps {
  order: ClientOrderItem;
  onClose?: () => void;
}

export default function OrderDetailPanel({ order, onClose }: OrderDetailPanelProps) {
  const valueUsd = Math.round(order.orderValue / 83);
  const isAwaiting = order.evidenceStatus === "Awaiting certificate";
  const isVerified = order.evidenceStatus === "Verified";

  return (
    <div
      className="
        varna-order-detail-card
        bg-white dark:bg-[#20242B]
        border border-black/[0.07] dark:border-white/[0.08]
        shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
        dark:shadow-none dark:border-t-white/[0.12]
        rounded-[24px] p-6 lg:p-7
        flex flex-col justify-between h-full w-full
        animate-in fade-in-50 duration-200
      "
    >
      <div>
        {/* Panel Header */}
        <div className="flex items-start justify-between pb-5 border-b border-black/[0.07] dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <BrandLogo
              logoPath={order.supplierLogo}
              name={order.supplierName}
              size="md"
              className="rounded-xl border border-black/10 dark:border-white/10"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
                  Order {order.orderNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    order.fulfilmentStatus === "Complete"
                      ? "bg-[#55705A]/15 text-[#55705A] dark:bg-[#9DB4A0]/20 dark:text-[#9DB4A0]"
                      : "bg-[#7D3F1E]/15 text-[#7D3F1E] dark:bg-[#E07A57]/20 dark:text-[#E07A57]"
                  }`}
                >
                  {order.fulfilmentStatus}
                </span>
              </div>
              <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] mt-0.5">
                {order.supplierName} · {order.orderDate}
              </p>
            </div>
          </div>
        </div>

        {/* Order Economics */}
        <div className="grid grid-cols-2 gap-3 py-4 border-b border-black/[0.07] dark:border-white/[0.08]">
          <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
            <span className="text-[10px] uppercase tracking-wider text-[#6F6A61] dark:text-[#9A948A] font-medium block">
              Order Value (USD)
            </span>
            <span className="text-xl font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums mt-0.5 block">
              ${valueUsd.toLocaleString("en-US")}
            </span>
            <span className="text-[10px] text-[#6F6A61] dark:text-[#9A948A] font-normal">
              ₹{order.orderValue.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
            <span className="text-[10px] uppercase tracking-wider text-[#6F6A61] dark:text-[#9A948A] font-medium block">
              Evidence Weight
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight tabular-nums">
                {order.evidenceWeight.toFixed(2)}×
              </span>
              <span className="text-[10px] text-[#6F6A61] dark:text-[#9A948A]">
                ({order.evidenceStatusLabel})
              </span>
            </div>
            <span className="text-[10px] text-[#6F6A61] dark:text-[#9A948A] font-normal block truncate">
              {isVerified ? "Full 1.00× weight applied" : "Discounted for self-disclosure"}
            </span>
          </div>
        </div>

        {/* Pending Notice / Certificate Status */}
        {isAwaiting && (
          <div className="my-4 p-3 rounded-xl bg-[#7D3F1E]/8 dark:bg-[#E07A57]/10 border border-[#7D3F1E]/25 dark:border-[#E07A57]/30 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#7D3F1E] dark:text-[#E07A57] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-[#7D3F1E] dark:text-[#E07A57] block">
                Awaiting Certificate
              </span>
              <p className="text-[#5B564E] dark:text-[#C2BCB0] mt-0.5 leading-relaxed">
                {order.pendingItemNote || "Awaiting laboratory or third-party audit documentation for this order."}
              </p>
            </div>
          </div>
        )}

        {/* Verification Checklist */}
        <div className="py-2">
          <span className="text-xs uppercase tracking-[0.14em] font-semibold text-[#6F6A61] dark:text-[#9A948A] block mb-3">
            Verification Checklist
          </span>

          <div className="space-y-3">
            {order.checklist && order.checklist.length > 0 ? (
              order.checklist.map((item, idx) => {
                const isComplete = item.status === "complete";
                const isPending = item.status === "pending";

                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-black/[0.015] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.05]"
                  >
                    <div className="mt-0.5 shrink-0">
                      {isComplete ? (
                        <div className="w-4 h-4 rounded-full bg-[#55705A]/20 text-[#55705A] dark:text-[#9DB4A0] flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : isPending ? (
                        <div className="w-4 h-4 rounded-full bg-[#7D3F1E]/20 text-[#7D3F1E] dark:text-[#E07A57] flex items-center justify-center">
                          <Clock className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/10 text-[#9A948A] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#9A948A]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[#1F1B16] dark:text-[#F3EFE7] truncate">
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] font-semibold capitalize shrink-0 ${
                            isComplete
                              ? "text-[#55705A] dark:text-[#9DB4A0]"
                              : isPending
                              ? "text-[#7D3F1E] dark:text-[#E07A57]"
                              : "text-[#9A948A]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6F6A61] dark:text-[#9A948A] mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#9A948A]">No checklist items on record.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Related Orders */}
      <div className="pt-4 border-t border-black/[0.07] dark:border-white/[0.08] flex items-center justify-between text-xs text-[#6F6A61] dark:text-[#9A948A]">
        {order.relatedOrderNumbers && order.relatedOrderNumbers.length > 0 ? (
          <span className="text-[11px]">
            Linked Formulation: Orders {order.relatedOrderNumbers.join(", ")}
          </span>
        ) : (
          <span className="text-[11px]">Single batch procurement</span>
        )}
        <div className="flex items-center gap-1.5 text-[#7D3F1E] dark:text-[#E07A57] font-semibold text-[11px]">
          <FileText className="w-3.5 h-3.5" />
          <span>Sutra Audit Trail</span>
        </div>
      </div>
    </div>
  );
}
