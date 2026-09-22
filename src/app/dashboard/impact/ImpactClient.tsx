"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import BrandWatermark from "@/components/ui/BrandWatermark";
import ChatWidget from "@/components/ChatWidget";
import ClientImpactV2 from "@/components/dashboard/impact/v2/ClientImpactV2";
import type { DashboardData } from "@/lib/mock-data";

import { DateRangeProvider } from "@/context/DateRangeContext";

export default function ImpactClient({
  dashboardData,
  supplierImpactData,
}: {
  dashboardData?: DashboardData | null;
  supplierImpactData?: any[];
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSectionChange = (section: string) => {
    if (section === "algorithm") {
      router.push("/algorithm");
    } else if (section !== "impact") {
      router.push(`/dashboard?section=${section}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("varna_client");
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <DateRangeProvider>
      <div className="min-h-screen flex bg-ambient-mesh-light dark:bg-ambient-mesh-dark text-[#1A1F26] dark:text-[#FAF8F5] transition-colors duration-300 selection:bg-[#B85333] selection:text-white font-sans relative overflow-x-hidden">
        {/* Subtle brand crystal mark in page corner */}
        <BrandWatermark position="bottom-right" size={600} opacity={0.035} />

        {/* Sidebar navigation */}
        <Sidebar
          activeSection="impact"
          onSectionChange={handleSectionChange}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="varna-main flex-1 ml-24 p-8 max-w-[1760px] overflow-x-hidden relative z-10">
          <ClientImpactV2
            dashboardData={dashboardData}
            supplierImpactData={supplierImpactData}
          />
        </main>

        {/* Varna Chat Assistant */}
        <ChatWidget dashboardData={dashboardData} />
      </div>
    </DateRangeProvider>
  );
}
