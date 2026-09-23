"use client";

import { Info } from "lucide-react";

export default function FooterDisclaimerV2() {
  return (
    <div className="w-full mt-8 mb-6 p-4 rounded-[18px] bg-[#F4EACF] dark:bg-[#2B2720] border border-[#E8DFC5] dark:border-[#F4EACF]/14 flex items-center justify-center gap-2.5 text-center text-xs text-[#5B564E] dark:text-[#C2BCB0] font-normal leading-relaxed">
      <Info className="w-4 h-4 text-[#7D3F1E] dark:text-[#E07A57] shrink-0" strokeWidth={1.8} />
      <span>
        Varna scores are not certifications. They are evidence-based assessments of the information and documentation provided to Varna at the time of review.
      </span>
    </div>
  );
}
