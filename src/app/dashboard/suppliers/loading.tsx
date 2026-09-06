"use client";

import Sidebar from "@/components/layout/Sidebar";

export default function SuppliersLoading() {
  return (
    <div className="min-h-screen flex bg-ambient-mesh-light dark:bg-ambient-mesh-dark text-[#222326] dark:text-[#FAF6EE] font-sans selection:bg-[#7A3F1E] selection:text-[#D8CFB8] overflow-x-hidden">
      <Sidebar activeSection="suppliers" onSectionChange={() => {}} onLogout={() => {}} />
      <main className="flex-1 ml-24 p-8 max-w-[1400px]">
        {/* Header Skeleton */}
        <div className="h-16 bg-[#E4DEC9]/50 dark:bg-[#22252B]/50 animate-pulse rounded-none mb-8 border border-[#6F848F]/20 dark:border-[#8C9DA8]/15" />
        
        {/* KPI Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="h-28 bg-[#E4DEC9]/40 dark:bg-[#22252B]/40 animate-pulse rounded-none border border-[#6F848F]/15 dark:border-[#8C9DA8]/10" />
          <div className="h-28 bg-[#E4DEC9]/40 dark:bg-[#22252B]/40 animate-pulse rounded-none border border-[#6F848F]/15 dark:border-[#8C9DA8]/10" />
          <div className="h-28 bg-[#E4DEC9]/40 dark:bg-[#22252B]/40 animate-pulse rounded-none border border-[#6F848F]/15 dark:border-[#8C9DA8]/10" />
        </div>

        {/* Carousel Skeleton */}
        <div className="h-80 bg-[#E4DEC9]/30 dark:bg-[#22252B]/30 animate-pulse rounded-none border border-[#6F848F]/15 dark:border-[#8C9DA8]/10" />
      </main>
    </div>
  );
}
