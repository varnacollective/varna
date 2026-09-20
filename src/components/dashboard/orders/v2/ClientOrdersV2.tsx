"use client";

import { useState, useEffect } from "react";
import type { DashboardData, ClientOrderItem } from "@/lib/mock-data";
import { CLIENT_ORDERS_LIST } from "@/lib/mock-data";
import TopBarV2 from "@/components/dashboard/v2/TopBarV2";
import OrdersHeroV2 from "./OrdersHeroV2";
import OrdersKpiV2 from "./OrdersKpiV2";
import AllOrdersTableV2 from "./AllOrdersTableV2";
import EvidencePanelV2 from "./EvidencePanelV2";
import FooterDisclaimerV2 from "./FooterDisclaimerV2";
import { X } from "lucide-react";

interface ClientOrdersV2Props {
  dashboardData?: DashboardData | null;
}

export default function ClientOrdersV2({ dashboardData }: ClientOrdersV2Props) {
  const [orders] = useState<ClientOrderItem[]>(CLIENT_ORDERS_LIST);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("#5");
  const [activeFilter, setActiveFilter] = useState<"all" | "awaiting">("all");
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Client info fallbacks
  const clientName = dashboardData?.client?.clientName || "The Oberoi";
  const industry = dashboardData?.client?.industry || "Hospitality";
  const logoPath = dashboardData?.client?.logoPath || "/logos/clients/oberoi-dubai.png";

  const totalSpend = dashboardData?.summary?.totalSpend || 313150;
  const totalOrders = orders.length;
  const vettedSuppliersCount = 2;
  const awaitingCount = orders.filter((o) => o.evidenceStatus === "Awaiting certificate").length;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const selectedOrder =
    orders.find((o) => o.orderNumber === selectedOrderNumber) || orders[0];

  const handleSelectOrder = (order: ClientOrderItem) => {
    setSelectedOrderNumber(order.orderNumber);
    if (isMobile) {
      setIsMobileSheetOpen(true);
    }
  };

  const handleSelectAwaitingFilter = () => {
    setActiveFilter("awaiting");
    const awaitingOrder = orders.find((o) => o.evidenceStatus === "Awaiting certificate");
    if (awaitingOrder) {
      setSelectedOrderNumber(awaitingOrder.orderNumber);
    }
  };

  return (
    <div className="client-orders-v2 w-full max-w-[1760px] mx-auto space-y-6 pb-32">
      {/* 1. Top Bar */}
      <TopBarV2
        clientName={clientName}
        industry={industry}
        logoPath={logoPath}
        dashboardData={dashboardData}
      />

      {/* 2. Hero Section */}
      <OrdersHeroV2
        dateRangeText="1 Apr – 30 Jun 2026"
        dashboardData={dashboardData}
      />

      {/* 3. KPI Row */}
      <OrdersKpiV2
        totalOrders={totalOrders}
        totalSpend={totalSpend}
        vettedSuppliersCount={vettedSuppliersCount}
        awaitingCount={awaitingCount}
        awaitingCaption="Orders #4 and #5 from Bare Necessities"
        onSelectAwaitingFilter={handleSelectAwaitingFilter}
      />

      {/* 4. Desktop & Tablet Split View: All Orders Table (8 cols) + Evidence Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <AllOrdersTableV2
            orders={orders}
            selectedOrderNumber={selectedOrderNumber}
            onSelectOrder={handleSelectOrder}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            totalSpend={totalSpend}
          />
        </div>

        {/* Desktop / Tablet Evidence Panel */}
        <div className="hidden lg:block lg:col-span-4">
          <EvidencePanelV2 order={selectedOrder} />
        </div>

        {/* Tablet Full-Width Evidence Panel (768px - 1023px) */}
        <div className="hidden sm:block lg:hidden col-span-1">
          <EvidencePanelV2 order={selectedOrder} />
        </div>
      </div>

      {/* 5. Mobile Bottom Sheet Modal (≤767px) */}
      {isMobileSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:hidden"
          onClick={() => setIsMobileSheetOpen(false)}
        >
          <div
            className="
              bg-white dark:bg-[#20242B] w-full rounded-t-[28px] max-h-[85vh] overflow-y-auto p-6 relative shadow-2xl
              border-t border-black/10 dark:border-white/15 animate-in slide-in-from-bottom duration-300
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 rounded-full bg-black/15 dark:bg-white/20 mx-auto mb-4" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileSheetOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-black/5 dark:bg-white/10 text-[#5B564E] dark:text-[#C2BCB0] hover:text-black dark:hover:text-white"
              aria-label="Close evidence panel"
            >
              <X className="w-5 h-5" />
            </button>

            <EvidencePanelV2 order={selectedOrder} />
          </div>
        </div>
      )}

      {/* 6. Disclaimer Bar */}
      <FooterDisclaimerV2 />
    </div>
  );
}
