import React from "react";
import GroupSidebar from "@/components/GroupSidebar";

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#121316] text-[#1A1F26] dark:text-[#FAF8F5] transition-colors duration-300 font-sans">
      {/* ── Persistent Group Sidebar ─────────────────────────────────────────── */}
      <GroupSidebar />

      {/* ── Dynamic Child Route Content Area ─────────────────────────────────── */}
      <div className="varna-grp-main flex-1 flex flex-col min-w-0">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
