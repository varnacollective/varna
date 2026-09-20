"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EvidenceAlertV2Props {
  showAlert?: boolean;
  alertTitle?: string;
  alertBody?: string;
}

export default function EvidenceAlertV2({
  showAlert = true,
  alertTitle = "Evidence pending for orders #4 and #5",
  alertBody = "Bare Necessities has disclosed its company operations, but the laboratory batch certificate for these formulations hasn't arrived. Until it does, these claims carry a self-reported evidence weight of 0.75×.",
}: EvidenceAlertV2Props) {
  if (!showAlert) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="
        w-full mb-6
        bg-[#FFF8E7] dark:bg-[#2A2419]
        border border-[#E6D4B0] dark:border-[#5A4828]
        p-5 lg:p-6 rounded-[24px] shadow-sm
        flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
      "
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57] shrink-0 mt-0.5">
          <Clock className="w-5 h-5" strokeWidth={1.8} />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#1F1B16] dark:text-[#F1E6C8]">
            {alertTitle}
          </h4>
          <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] font-normal leading-relaxed max-w-4xl mt-0.5">
            {alertBody}
          </p>
        </div>
      </div>

      <Link
        href="/dashboard?section=orders"
        className="
          inline-flex items-center gap-1.5 text-xs font-semibold
          text-[#7D3F1E] dark:text-[#E07A57] underline underline-offset-4
          hover:text-[#663318] dark:hover:text-[#F1E6C8]
          shrink-0 min-h-[44px] px-3 items-center cursor-pointer transition-colors
        "
      >
        <span>View Orders</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}
