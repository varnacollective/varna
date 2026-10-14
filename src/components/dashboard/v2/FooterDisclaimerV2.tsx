"use client";

import { Info } from "lucide-react";

export default function FooterDisclaimerV2() {
  return (
    <footer className="
      w-full
      bg-[#F5EFE6] dark:bg-[#201C18]
      text-[#78716C] dark:text-[#A8A29E]
      px-6 py-4 rounded-xl text-center text-xs sm:text-[13px]
      border border-[#E8E3DA] dark:border-[#2E2823]
      font-normal flex items-center justify-center gap-2.5 mb-8
    ">
      <Info className="w-4 h-4 text-[#9A4A2E] dark:text-[#E07A57] shrink-0" />
      <span>
        Varna scores are not certifications. They are evidence-based assessments of the information and documentation provided to Varna at the time of review.
      </span>
    </footer>
  );
}
