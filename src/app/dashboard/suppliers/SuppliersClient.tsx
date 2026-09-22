"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import BrandWatermark from "@/components/ui/BrandWatermark";
import ChatWidget from "@/components/ChatWidget";
import Card from "@/components/ui/Card";
import VarnaScoreHoverCard from "@/components/ui/VarnaScoreHoverCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { SupplierConfidenceData } from "@/lib/mock-data";
import { SUPPLIER_CONFIDENCE_CHECKLISTS } from "@/lib/mock-data";
import SupplierProfileCard from "./SupplierProfileCard";
import {
  Calendar,
  Star,
  Sun,
  Moon,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Category spend dataset matching requested spec (Brand Palette only)
const CATEGORY_DATA = [
  { name: "Organic Toiletries", value: 16800, percentage: 42, color: "#7A3F1E" }, // deep-clay
  { name: "Artisan Ceramics", value: 9600, percentage: 24, color: "#738678" },  // sage-mineral
  { name: "Handmade Soap", value: 8000, percentage: 20, color: "#6F848F" },     // slate-mist
  { name: "Eco-Packaging", value: 5600, percentage: 14, color: "#2F3C52" },     // midnight-blue
];

function formatSpend(val: number): string {
  return `$${(val / 1000).toFixed(1)}K`;
}



// ─────────────── Main Suppliers View ───────────────

import ClientSuppliersV2 from "@/components/dashboard/suppliers/v2/ClientSuppliersV2";

import { DateRangeProvider } from "@/context/DateRangeContext";

export default function SuppliersClient({
  suppliersData,
  liveConfidenceData,
}: {
  suppliersData: any[];
  liveConfidenceData: Record<string, SupplierConfidenceData>;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSectionChange = (section: string) => {
    if (section === "algorithm") {
      router.push("/algorithm");
    } else if (section !== "suppliers") {
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
          activeSection="suppliers"
          onSectionChange={handleSectionChange}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="varna-main flex-1 ml-24 p-8 max-w-[1760px] overflow-x-hidden relative z-10">
          <ClientSuppliersV2
            suppliersData={suppliersData}
            liveConfidenceData={liveConfidenceData}
          />
        </main>

        {/* Varna Chat Assistant */}
        <ChatWidget dashboardData={liveConfidenceData} />
      </div>
    </DateRangeProvider>
  );
}
