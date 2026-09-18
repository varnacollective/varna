"use client";

import React from "react";
import { type HotelLeaderboardItem } from "@/types/group-dashboard";

interface LeaderboardTableProps {
  hotels: HotelLeaderboardItem[];
  groupAvgScore: number;
  onSelectProperty?: (hotel: HotelLeaderboardItem) => void;
}

export default function LeaderboardTable({
  hotels,
  groupAvgScore,
  onSelectProperty,
}: LeaderboardTableProps) {
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

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-[#1E2028] rounded-xl border border-[#EAE5DC] dark:border-[#8C9DA8]/20 shadow-card-light dark:shadow-elevation-dark-low">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#FAF8F5] dark:bg-[#18191D] border-b border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-[#6E7781] dark:text-[#8C9DA8]">
            <th className="py-3.5 px-3 text-center w-10">#</th>
            <th className="py-3.5 px-4 font-semibold">Property</th>
            <th className="py-3.5 px-3 text-center font-semibold">Varna Score</th>
            <th className="py-3.5 px-2 text-center font-semibold">E</th>
            <th className="py-3.5 px-2 text-center font-semibold">S</th>
            <th className="py-3.5 px-2 text-center font-semibold">G</th>
            <th className="py-3.5 px-2 text-center font-semibold">C</th>
            <th className="py-3.5 px-3 text-right font-semibold">Total Spend</th>
            <th className="py-3.5 px-3 text-right font-semibold">CO₂e (kg)</th>
            <th className="py-3.5 px-3 text-right font-semibold">CO₂e Avoided</th>
            <th className="py-3.5 px-3 text-right font-semibold">Car Kms</th>
            <th className="py-3.5 px-3 text-right font-semibold">Trees Planted</th>
            <th className="py-3.5 px-3 text-center font-semibold">Suppliers</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAE5DC] dark:divide-[#8C9DA8]/15 text-xs">
          {hotels.map((item, idx) => {
            return (
              <tr
                key={item.clientId || idx}
                onClick={() => onSelectProperty?.(item)}
                className="hover:bg-[#FAF8F5] dark:hover:bg-[#22252B]/60 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-3 text-center font-mono text-[11px] text-[#6E7781] dark:text-[#8C9DA8]">
                  {idx + 1}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-[#1A1F26] dark:text-[#FAF8F5] group-hover:text-[#B85333] dark:group-hover:text-[#D4705A] transition-colors">
                      {item.clientName}
                    </span>
                    <span className="text-[10px] text-[#6E7781] dark:text-[#8C9DA8] font-sans">
                      {item.city ? `${item.city}, ${item.country || ""}` : item.propertyType || "Hotel Property"}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-3 text-center">
                  <span
                    className={`
                      inline-block px-2.5 py-1 rounded-full text-xs font-sans font-bold shadow-xs
                      ${
                        item.varnaScore >= 80
                          ? "bg-[#556B55]/15 text-[#556B55] dark:bg-[#7B9B7B]/20 dark:text-[#7B9B7B] border border-[#556B55]/30"
                          : item.varnaScore >= 60
                          ? "bg-[#6F848F]/15 text-[#3E4E57] dark:bg-[#6F848F]/20 dark:text-[#96AAB4] border border-[#6F848F]/30"
                          : "bg-[#B85333]/15 text-[#B85333] dark:bg-[#D4705A]/20 dark:text-[#D4705A] border border-[#B85333]/30"
                      }
                    `}
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
