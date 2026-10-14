"use client";

import { useMemo } from "react";
import type { DashboardData } from "@/lib/mock-data";
import { CLIENT_ORDERS_LIST } from "@/lib/mock-data";
import { useDateRange } from "@/context/DateRangeContext";
import TopBarV2 from "./TopBarV2";
import WelcomeCardV2 from "./WelcomeCardV2";
import KpiRowV2 from "./KpiRowV2";
import PillarsAndCategoryV2 from "./PillarsAndCategoryV2";
import CarbonAndTiersV2 from "./CarbonAndTiersV2";
import SocialImpactV2 from "./SocialImpactV2";
import FooterDisclaimerV2 from "./FooterDisclaimerV2";

interface ClientOverviewV2Props {
  data: DashboardData;
}

export default function ClientOverviewV2({ data }: ClientOverviewV2Props) {
  const { state: dateState } = useDateRange();
  const { client, summary, categorySpend, products, tierDistribution, supplierImpactData } = data;

  const filteredOrders = useMemo(() => {
    if (!dateState.startDate && !dateState.endDate) return null;
    const start = dateState.startDate ? new Date(dateState.startDate + "T00:00:00") : null;
    const end = dateState.endDate ? new Date(dateState.endDate + "T23:59:59") : null;

    return CLIENT_ORDERS_LIST.filter((order) => {
      if (!order.orderDate) return true;
      const orderDate = new Date(order.orderDate);
      if (isNaN(orderDate.getTime())) return true;
      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
      return true;
    });
  }, [dateState.startDate, dateState.endDate]);

  const isPeriodFiltered = Boolean(dateState.startDate || dateState.endDate);
  const currentTotalOrders = filteredOrders ? filteredOrders.length : summary.totalOrders;
  const currentTotalSpend = filteredOrders ? filteredOrders.reduce((acc, o) => acc + o.orderValue, 0) : summary.totalSpend;

  // Dynamic Category Spend based on filtered period orders
  const currentCategorySpend = useMemo(() => {
    if (!isPeriodFiltered) return categorySpend;
    if (filteredOrders && filteredOrders.length === 0) {
      return categorySpend.map((c) => ({
        ...c,
        totalSpend: 0,
        total_spend: 0,
        totalOrders: 0,
        percentage: 0,
      }));
    }

    // Map each filtered order to its corresponding category spend
    const spendByCategory: Record<string, { spend: number; orders: number }> = {
      "Bathroom Amenities": { spend: 0, orders: 0 },
      "Amenity Accessories": { spend: 0, orders: 0 },
      "Disposables": { spend: 0, orders: 0 },
      "Packaging": { spend: 0, orders: 0 },
    };

    // Ensure all categories from prop exist
    categorySpend.forEach((c) => {
      const name = c.categoryName || c.category_name;
      if (name && !spendByCategory[name]) {
        spendByCategory[name] = { spend: 0, orders: 0 };
      }
    });

    (filteredOrders || []).forEach((order) => {
      const supp = (order.supplierName || "").toLowerCase();
      const val = order.orderValue || 0;

      if (supp.includes("bare")) {
        spendByCategory["Bathroom Amenities"].spend += val;
        spendByCategory["Bathroom Amenities"].orders += 1;
      } else if (supp.includes("kheoni")) {
        spendByCategory["Amenity Accessories"].spend += val;
        spendByCategory["Amenity Accessories"].orders += 1;
      } else if (supp.includes("ukhi")) {
        // UKHI provides both Disposables (69%) and Packaging (31%)
        const dispVal = Math.round(val * 0.69);
        const packVal = val - dispVal;
        spendByCategory["Disposables"].spend += dispVal;
        spendByCategory["Disposables"].orders += 1;
        spendByCategory["Packaging"].spend += packVal;
        spendByCategory["Packaging"].orders += 1;
      } else {
        // Fallback to first category
        const firstCat = Object.keys(spendByCategory)[0] || "Bathroom Amenities";
        spendByCategory[firstCat].spend += val;
        spendByCategory[firstCat].orders += 1;
      }
    });

    return categorySpend.map((cat) => {
      const name = cat.categoryName || cat.category_name || "";
      const stats = spendByCategory[name] || { spend: 0, orders: 0 };
      return {
        ...cat,
        totalSpend: stats.spend,
        total_spend: stats.spend,
        totalOrders: stats.orders,
      };
    });
  }, [isPeriodFiltered, filteredOrders, categorySpend]);

  // Carbon avoided in this period: 0 kg if no orders in period; all-time baseline otherwise
  const currentCO2eAvoidedKg = useMemo(() => {
    if (!isPeriodFiltered) return summary.totalCO2eAvoidedKg;
    if (filteredOrders && filteredOrders.length === 0) return 0;
    return summary.totalCO2eAvoidedKg;
  }, [isPeriodFiltered, filteredOrders, summary.totalCO2eAvoidedKg]);

  // D01/D02 Portfolio average wage ratio
  const avgWageRatio = useMemo(() => {
    if (!supplierImpactData || supplierImpactData.length === 0) return 1.05;
    const valid = supplierImpactData.filter((s) => typeof s.wageRatio === "number" && !isNaN(s.wageRatio));
    if (valid.length === 0) return 1.05;
    return Math.round((valid.reduce((acc, s) => acc + s.wageRatio, 0) / valid.length) * 100) / 100;
  }, [supplierImpactData]);

  // D06 Single authoritative portfolio score description
  const varnaScoreData = {
    score: summary.avgVarnaScore,
    eScore: summary.avgEScore,
    sScore: summary.avgSScore,
    gScore: summary.avgGScore,
    cScore: summary.avgCScore,
    supplierName: "Simple arithmetic average across your active purchasing partners",
  };

  const ratingBand = summary.avgVarnaScore >= 85 ? "Leader band" : summary.avgVarnaScore >= 70 ? "Advanced band" : "Emerging band";

  return (
    <div className="client-overview-v2 w-full max-w-[1760px] mx-auto space-y-6 pb-32">
      {/* 1. Top Bar (W1) */}
      <TopBarV2
        clientName={client.clientName}
        industry={client.industry}
        logoPath={client.logoPath}
        dashboardData={data}
        clientDetails={{
          "Industry Sector": client.industry,
          "Location": client.city && client.state ? `${client.city}, ${client.state}` : client.city || client.state,
          "Status": client.status || "Active",
          "Onboarding Date": client.onboardingDate,
          "Active Partners": summary?.totalSuppliers ? `${summary.totalSuppliers} Verified Enterprises` : undefined,
          "Total Spend": summary?.totalSpend ? `$${Math.round(summary.totalSpend / 83).toLocaleString('en-US')}` : undefined,
        }}
      />

      {/* 2. Welcome & Hero Banner (W2, W3 & D6) */}
      <WelcomeCardV2
        clientName={client.clientName}
        industry={client.industry}
        logoPath={client.logoPath}
        totalSuppliers={summary.totalSuppliers}
        totalOrders={currentTotalOrders}
        ratingBand={ratingBand}
        dashboardData={data}
      />

      {/* 3. KPI Strip & Tagline (W4, W5 & D1) */}
      <KpiRowV2
        totalSpend={currentTotalSpend}
        totalOrders={currentTotalOrders}
        avgVarnaScore={summary.avgVarnaScore}
        totalSuppliers={summary.totalSuppliers}
        varnaScoreData={varnaScoreData}
      />

      {/* 4. Mid Section: Visual + ESG Pillars + Spend by Product (W6, W7, W8 & D2, D3) */}
      <PillarsAndCategoryV2
        eScore={summary.avgEScore}
        sScore={summary.avgSScore}
        gScore={summary.avgGScore}
        cScore={summary.avgCScore}
        pillarBreakdown={summary.pillarBreakdown}
        categorySpend={currentCategorySpend}
        products={products}
        orderRegister={data.orderRegister}
      />

      {/* 5. Carbon Impact + Supplier Tier Distribution (W9, W10 & D4, D5) */}
      <CarbonAndTiersV2
        totalCO2eAvoidedKg={currentCO2eAvoidedKg}
        totalSuppliers={summary.totalSuppliers}
        tierDistribution={tierDistribution}
        suppliers={data.suppliers}
        totalSpend={currentTotalSpend}
      />

      {/* 6. Social Livelihood Impact (W11) */}
      <SocialImpactV2
        artisansSupported={summary.totalArtisansSupported}
        womenWorkforcePercent={summary.womenWorkforcePercent}
        wageRatio={avgWageRatio}
        supplierImpactData={supplierImpactData}
      />

      {/* 7. Footer Disclaimer (W12) */}
      <FooterDisclaimerV2 />
    </div>
  );
}
