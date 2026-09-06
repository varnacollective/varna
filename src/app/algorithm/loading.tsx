"use client";

import Sidebar from "@/components/layout/Sidebar";

export default function AlgorithmLoading() {
  return (
    <div className="min-h-screen flex bg-ambient-mesh-light dark:bg-ambient-mesh-dark text-[#222326] dark:text-[#FAF6EE] font-sans selection:bg-[#7A3F1E] selection:text-[#D8CFB8] overflow-x-hidden">
      <Sidebar activeSection="algorithm" onSectionChange={() => {}} onLogout={() => {}} />
      <main className="flex-1 ml-24 p-8 max-w-[1400px]">
        <div className="h-16 bg-[#E4DEC9]/50 dark:bg-[#22252B]/50 animate-pulse rounded-none mb-8 border border-[#6F848F]/20 dark:border-[#8C9DA8]/15" />
        <div className="h-96 bg-[#E4DEC9]/30 dark:bg-[#22252B]/30 animate-pulse rounded-none border border-[#6F848F]/15 dark:border-[#8C9DA8]/10" />
      </main>
    </div>
  );
}
