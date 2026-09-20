"use client";

import { Info } from "lucide-react";

export default function FooterDisclaimerV2() {
  return (
    <footer className="
      w-full
      bg-[#F4EACF] dark:bg-[#2B2720]
      text-[#5B564E] dark:text-[#C2BCB0]
      px-6 py-4 rounded-[18px] text-center text-xs sm:text-[13px]
      border border-[#E8DFC5] dark:border-[#F4EACF]/14
      font-normal flex items-center justify-center gap-2 mb-8
    ">
      <Info className="w-4 h-4 text-[#7D3F1E] dark:text-[#E07A57] shrink-0" />
      <span>
        Varna scores are not certifications. They are evidence-based assessments of the information and documentation provided to Varna at the time of review.
      </span>
    </footer>
  );
}
