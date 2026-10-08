"use client";

import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex bg-ambient-mesh-light dark:bg-ambient-mesh-dark text-[#222326] dark:text-[#FAF6EE] font-sans selection:bg-[#7A3F1E] selection:text-[#D8CFB8] overflow-x-hidden">
      <Sidebar activeSection="overview" onSectionChange={() => {}} onLogout={() => {}} />
      <main className="flex-1 ml-24 p-8 max-w-[1400px]">
        {/* TopBar Skeleton */}
        <div className="h-16 bg-[#EBE6DA]/50 dark:bg-[#20242B]/50 animate-pulse rounded-[20px] mb-8 border border-black/[0.06] dark:border-white/[0.08]" />
        
        {/* KPI Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="h-28 bg-[#EBE6DA]/40 dark:bg-[#20242B]/40 animate-pulse rounded-[24px] border border-black/[0.06] dark:border-white/[0.08]" />
          <div className="h-28 bg-[#EBE6DA]/40 dark:bg-[#20242B]/40 animate-pulse rounded-[24px] border border-black/[0.06] dark:border-white/[0.08]" />
          <div className="h-28 bg-[#EBE6DA]/40 dark:bg-[#20242B]/40 animate-pulse rounded-[24px] border border-black/[0.06] dark:border-white/[0.08]" />
          <div className="h-28 bg-[#EBE6DA]/40 dark:bg-[#20242B]/40 animate-pulse rounded-[24px] border border-black/[0.06] dark:border-white/[0.08]" />
        </div>

        {/* Pillars & Category Row (40/60) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-2 h-[420px] bg-[#EBE6DA]/35 dark:bg-[#20242B]/35 animate-pulse rounded-[24px] border border-black/[0.06] dark:border-white/[0.08]" />
          <div className="lg:col-span-3 h-[420px] bg-[#EBE6DA]/35 dark:bg-[#20242B]/35 animate-pulse rounded-[24px] border border-black/[0.06] dark:border-white/[0.08]" />
        </div>

        {/* Impact Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-[#EBE6DA]/30 dark:bg-[#20242B]/30 animate-pulse rounded-[24px] border border-black/[0.06] dark:border-white/[0.08]" />
          <div className="h-72 bg-[#EBE6DA]/30 dark:bg-[#20242B]/30 animate-pulse rounded-[24px] border border-black/[0.06] dark:border-white/[0.08]" />
        </div>
      </main>
    </div>
  );
}
