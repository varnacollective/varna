"use client";

import React, { useState, useMemo } from "react";
import { type HotelLeaderboardItem } from "@/types/group-dashboard";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, Star, ShieldCheck } from "lucide-react";

interface LeaderboardTableProps {
  hotels: HotelLeaderboardItem[];
  groupAvgScore: number;
  onSelectProperty?: (hotel: HotelLeaderboardItem) => void;
}

type SortField =
  | "rank"
  | "clientName"
  | "varnaScore"
  | "eScore"
  | "sScore"
  | "gScore"
  | "cScore"
  | "totalSpend"
  | "co2eKg"
  | "co2eAvoidedKg"
  | "carKmAvoided"
  | "treesEquivalent"
  | "activeSuppliers";

type SortOrder = "asc" | "desc";

export default function LeaderboardTable({
  hotels,
  groupAvgScore,
  onSelectProperty,
}: LeaderboardTableProps) {
  const [sortField, setSortField] = useState<SortField>("varnaScore");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedHotels = useMemo(() => {
    const list = [...hotels];
    list.sort((a, b) => {
      let valA: any = a[sortField as keyof HotelLeaderboardItem];
      let valB: any = b[sortField as keyof HotelLeaderboardItem];

      if (sortField === "rank") {
        valA = a.varnaScore;
        valB = b.varnaScore;
      }

      if (valA === null || valA === undefined) valA = 0;
      if (valB === null || valB === undefined) valB = 0;

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
    return list;
  }, [hotels, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#6E7781]/50 group-hover/header:text-[#B85333] transition-colors" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-[#B85333]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#B85333]" />
    );
  };

  const formatLakhs = (amount: number) => {
    if (!amount && amount !== 0) return "₹0";
    if (amount >= 100000) {
      const lakhs = (amount / 100000).toFixed(1);
      return `₹${lakhs}L`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNum = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "-";
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const getTierBadge = (score: number) => {
    if (score >= 80) {
      return {
        label: "Leader",
        bg: "bg-[#556B55]/15 text-[#556B55] dark:bg-[#7B9B7B]/20 dark:text-[#7B9B7B] border-[#556B55]/30",
      };
    }
    if (score >= 70) {
      return {
        label: "Advanced",
        bg: "bg-[#6F848F]/15 text-[#3E4E57] dark:bg-[#6F848F]/20 dark:text-[#96AAB4] border-[#6F848F]/30",
      };
    }
    if (score >= 50) {
      return {
        label: "Emerging",
        bg: "bg-[#A89C82]/15 text-[#7A6B4F] dark:bg-[#C5A059]/20 dark:text-[#C5A059] border-[#A89C82]/30",
      };
    }
    return {
      label: "Foundational",
      bg: "bg-[#B85333]/15 text-[#B85333] dark:bg-[#D4705A]/20 dark:text-[#D4705A] border-[#B85333]/30",
    };
  };

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-[#1E2028] rounded-xl border border-[#EAE5DC] dark:border-[#8C9DA8]/20 shadow-card-light dark:shadow-elevation-dark-low font-sans">
      <table className="w-full text-left border-collapse min-w-[950px]">
        <thead>
          <tr className="bg-[#FAF8F5] dark:bg-[#18191D] border-b border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[10px] uppercase font-semibold tracking-[0.14em] text-[#6E7781] dark:text-[#8C9DA8]">
            <th className="py-3.5 px-3 text-center w-12">#</th>
            <th
              onClick={() => handleSort("clientName")}
              className="py-3.5 px-4 font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Property</span>
                {renderSortIndicator("clientName")}
              </div>
            </th>
            <th
              onClick={() => handleSort("varnaScore")}
              className="py-3.5 px-3 text-center font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>Varna Score</span>
                {renderSortIndicator("varnaScore")}
              </div>
            </th>
            <th
              onClick={() => handleSort("eScore")}
              className="py-3.5 px-2 text-center font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-center gap-1">
                <span>E</span>
                {renderSortIndicator("eScore")}
              </div>
            </th>
            <th
              onClick={() => handleSort("sScore")}
              className="py-3.5 px-2 text-center font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-center gap-1">
                <span>S</span>
                {renderSortIndicator("sScore")}
              </div>
            </th>
            <th
              onClick={() => handleSort("gScore")}
              className="py-3.5 px-2 text-center font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-center gap-1">
                <span>G</span>
                {renderSortIndicator("gScore")}
              </div>
            </th>
            <th
              onClick={() => handleSort("cScore")}
              className="py-3.5 px-2 text-center font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-center gap-1">
                <span>C</span>
                {renderSortIndicator("cScore")}
              </div>
            </th>
            <th
              onClick={() => handleSort("totalSpend")}
              className="py-3.5 px-3 text-right font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Total Spend</span>
                {renderSortIndicator("totalSpend")}
              </div>
            </th>
            <th
              onClick={() => handleSort("co2eKg")}
              className="py-3.5 px-3 text-right font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>CO₂e (kg)</span>
                {renderSortIndicator("co2eKg")}
              </div>
            </th>
            <th
              onClick={() => handleSort("co2eAvoidedKg")}
              className="py-3.5 px-3 text-right font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>CO₂e Avoided</span>
                {renderSortIndicator("co2eAvoidedKg")}
              </div>
            </th>
            <th
              onClick={() => handleSort("carKmAvoided")}
              className="py-3.5 px-3 text-right font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Car Kms</span>
                {renderSortIndicator("carKmAvoided")}
              </div>
            </th>
            <th
              onClick={() => handleSort("treesEquivalent")}
              className="py-3.5 px-3 text-right font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Trees Planted</span>
                {renderSortIndicator("treesEquivalent")}
              </div>
            </th>
            <th
              onClick={() => handleSort("activeSuppliers")}
              className="py-3.5 px-3 text-center font-semibold cursor-pointer group/header hover:text-[#B85333] transition-colors"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>Suppliers</span>
                {renderSortIndicator("activeSuppliers")}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAE5DC] dark:divide-[#8C9DA8]/15 text-xs">
          {sortedHotels.map((item, idx) => {
            const tierBadge = getTierBadge(item.varnaScore);

            return (
              <tr
                key={item.clientId || idx}
                onClick={() => onSelectProperty?.(item)}
                className="
                  even:bg-[#FAF8F5]/40 dark:even:bg-[#1C1E24]/30
                  hover:bg-[#B85333]/5 dark:hover:bg-[#B85333]/10
                  transition-colors cursor-pointer group
                "
              >
                <td className="py-3.5 px-3 text-center font-mono text-[11px] font-semibold text-[#6E7781] dark:text-[#8C9DA8]">
                  {idx + 1}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-sans text-xs font-semibold text-[#1A1F26] dark:text-[#FAF8F5] group-hover:text-[#B85333] dark:group-hover:text-[#D4705A] transition-colors">
                        {item.clientName}
                      </span>
                      <span className="text-[10px] text-[#6E7781] dark:text-[#8C9DA8] font-sans">
                        {item.city ? `${item.city}, ${item.country || ""}` : item.propertyType || "Hotel Property"}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#6E7781]/0 group-hover:text-[#B85333] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </td>

                <td className="py-3.5 px-3 text-center">
                  <span
                    className={`
                      inline-block px-2.5 py-1 rounded-full text-xs font-sans font-bold shadow-xs border ${tierBadge.bg}
                    `}
                    title={`Score: ${item.varnaScore.toFixed(1)} (${tierBadge.label} Tier)`}
                  >
                    {item.varnaScore.toFixed(1)}
                  </span>
                </td>

                <td className="py-3.5 px-2 text-center font-mono text-[11px] text-[#6E7781] dark:text-[#8C9DA8]">
                  {item.eScore}
                </td>

                <td className="py-3.5 px-2 text-center font-mono text-[11px] text-[#6E7781] dark:text-[#8C9DA8]">
                  {item.sScore}
                </td>

                <td className="py-3.5 px-2 text-center font-mono text-[11px] text-[#6E7781] dark:text-[#8C9DA8]">
                  {item.gScore}
                </td>

                <td className="py-3.5 px-2 text-center font-mono text-[11px] text-[#6E7781] dark:text-[#8C9DA8]">
                  {item.cScore !== null && item.cScore !== undefined ? item.cScore : "-"}
                </td>

                <td className="py-3.5 px-3 text-right font-mono text-xs font-semibold text-[#1A1F26] dark:text-[#FAF8F5]">
                  {formatLakhs(item.totalSpend)}
                </td>

                <td className="py-3.5 px-3 text-right font-mono text-[11px] text-[#6E7781] dark:text-[#8C9DA8]">
                  {formatNum(item.co2eKg)}
                </td>

                <td className="py-3.5 px-3 text-right font-mono text-[11px] text-[#556B55] dark:text-[#7B9B7B] font-medium">
                  {formatNum(item.co2eAvoidedKg)}
                </td>

                <td className="py-3.5 px-3 text-right font-mono text-[11px] text-[#6E7781] dark:text-[#8C9DA8]">
                  {formatNum(item.carKmAvoided)}
                </td>

                <td className="py-3.5 px-3 text-right font-mono text-[11px] text-[#6E7781] dark:text-[#8C9DA8]">
                  {formatNum(item.treesEquivalent)}
                </td>

                <td className="py-3.5 px-3 text-center font-mono text-xs font-semibold text-[#1A1F26] dark:text-[#FAF8F5]">
                  {item.activeSuppliers}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
