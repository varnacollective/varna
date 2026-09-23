"use client";

import { useRef, useState, useMemo } from "react";
import type { ClientOrderItem } from "@/lib/mock-data";
import BrandLogo from "@/components/ui/BrandLogo";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface AllOrdersTableV2Props {
  orders: ClientOrderItem[];
  selectedOrderNumber: string;
  onSelectOrder: (order: ClientOrderItem) => void;
  activeFilter: "all" | "awaiting";
  onFilterChange: (filter: "all" | "awaiting") => void;
  totalSpend: number;
}

export default function AllOrdersTableV2({
  orders,
  selectedOrderNumber,
  onSelectOrder,
  activeFilter,
  onFilterChange,
  totalSpend,
}: AllOrdersTableV2Props) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true); // Default to ascending (#1 -> #5)

  const filteredOrders = useMemo(() => {
    const baseList =
      activeFilter === "awaiting"
        ? orders.filter((o) => o.evidenceStatus === "Awaiting certificate")
        : orders;

    return [...baseList].sort((a, b) => {
      const numA = parseInt(a.orderNumber.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.orderNumber.replace(/\D/g, ""), 10) || 0;
      return sortAsc ? numA - numB : numB - numA;
    });
  }, [orders, activeFilter, sortAsc]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = Math.min(index + 1, filteredOrders.length - 1);
      onSelectOrder(filteredOrders[nextIndex]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      onSelectOrder(filteredOrders[prevIndex]);
    }
  };

  return (
    <div
      className="
        varna-orders-table-card
        bg-white dark:bg-[#20242B]
        border border-black/[0.07] dark:border-white/[0.08]
        shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
        dark:shadow-none dark:border-t-white/[0.12]
        rounded-[24px] p-6 lg:p-8
        flex flex-col justify-between h-full w-full
      "
    >
      {/* Header Row: Title, Subtitle, Filter Pills (D1) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.07] dark:border-white/[0.08]">
        <div>
          <h2 className="text-xl lg:text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
            All Orders
          </h2>
          <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] mt-1 font-normal">
            {orders.length} orders in this period
          </p>
        </div>

        {/* Filter Toggle Pills (D1) */}
        <div className="flex items-center gap-2 bg-[#F7F3EA] dark:bg-[#272C34] p-1 rounded-full border border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            aria-pressed={activeFilter === "all"}
            className={`
              px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer min-h-[36px]
              ${activeFilter === "all"
                ? "bg-[#7D3F1E] dark:bg-[#8A4622] text-white shadow-xs font-semibold"
                : "text-[#5B564E] dark:text-[#C2BCB0] hover:text-[#1F1B16] dark:hover:text-[#F3EFE7]"
              }
            `}
          >
            All {orders.length}
          </button>
        </div>
      </div>

      {/* Orders Table Area */}
      <div className="overflow-x-auto my-4 -mx-2 px-2">
        <table ref={tableRef} className="w-full text-left min-w-[680px] block">
          <thead className="block">
            <tr
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(140px, 1fr) minmax(180px, 1.4fr) minmax(100px, 0.8fr) 64px minmax(140px, 1fr)",
              }}
              className="grid items-center border-b border-black/[0.07] dark:border-white/[0.08] text-[11px] uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]"
            >
              <th scope="col" className="py-3.5 pl-4 sm:pl-6 pr-3">
                <button
                  type="button"
                  onClick={() => setSortAsc(!sortAsc)}
                  className="flex items-center gap-1 hover:text-[#1F1B16] dark:hover:text-white cursor-pointer transition-colors uppercase tracking-[0.14em]"
                  title="Click to toggle sort order"
                >
                  <span>Order</span>
                  {sortAsc ? (
                    <ArrowUp className="w-3 h-3 text-[#7D3F1E] dark:text-[#E07A57]" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-[#7D3F1E] dark:text-[#E07A57]" />
                  )}
                </button>
              </th>
              <th scope="col" className="py-3.5 px-3 sm:px-4">
                Partner
              </th>
              <th scope="col" className="py-3.5 px-3 sm:px-4 text-right">
                Value
              </th>
              {/* Dedicated explicit 64px gap track */}
              <th aria-hidden="true" className="w-16 min-w-[64px] p-0 pointer-events-none" />
              <th scope="col" className="py-3.5 pl-3 sm:pl-4 pr-4 sm:pr-6">
                Fulfilment
              </th>
            </tr>
          </thead>
          <tbody className="block divide-y divide-black/[0.05] dark:divide-white/[0.05]">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, idx) => {
                const isSelected = order.orderNumber === selectedOrderNumber;
                const spendPct = Math.min(100, Math.round((order.orderValue / totalSpend) * 100));

                const isAwaiting = order.evidenceStatus === "Awaiting certificate";
                const isVerified = order.evidenceStatus === "Verified";

                const fulfilmentDotColor =
                  order.fulfilmentStatus.toLowerCase().includes("complete") ? "#55705A" : "#6F8391";

                return (
                  <tr
                    key={order.orderNumber}
                    onClick={() => onSelectOrder(order)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    tabIndex={0}
                    aria-current={isSelected ? "true" : undefined}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(140px, 1fr) minmax(180px, 1.4fr) minmax(100px, 0.8fr) 64px minmax(140px, 1fr)",
                    }}
                    className={`
                      grid items-center group cursor-pointer transition-colors duration-150 rounded-[18px] outline-none
                      ${isSelected
                        ? "bg-[#F7F3EA] dark:bg-[#272C34] border-l-4 border-[#7D3F1E] dark:border-[#E07A57]"
                        : "hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                      }
                    `}
                  >
                    {/* Order # and Date */}
                    <td className="py-4 pl-4 sm:pl-6 pr-3 align-middle">
                      <div className="font-semibold text-[15px] text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
                        {order.orderNumber}
                      </div>
                      <div className="text-xs text-[#6F6A61] dark:text-[#9A948A] font-normal mt-0.5">
                        {order.orderDate}
                      </div>
                    </td>

                    {/* Supplier Logo Tile + Name */}
                    <td className="py-4 px-3 sm:px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          <BrandLogo
                            logoPath={order.supplierLogo}
                            alt={order.supplierName}
                            name={order.supplierName}
                            size="sm"
                            entityType="supplier"
                          />
                        </div>
                        <span className="text-sm font-medium text-[#1F1B16] dark:text-[#F3EFE7] whitespace-nowrap">
                          {order.supplierName}
                        </span>
                      </div>
                    </td>

                    {/* Value + Spend Share Hairline Bar */}
                    <td className="py-4 px-3 sm:px-4 align-middle text-right">
                      <div className="text-sm font-semibold text-[#1F1B16] dark:text-[#F3EFE7] tabular-nums">
                        ${Math.round(order.orderValue > 10000 ? order.orderValue / 83 : order.orderValue).toLocaleString("en-US")}
                      </div>

                      {/* Spend Share Hairline Bar */}
                      <div className="w-16 sm:w-20 h-1 rounded-full bg-black/5 dark:bg-white/10 ml-auto mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-[#55705A] dark:bg-[#9DB4A0] rounded-full"
                          style={{ width: `${spendPct}%` }}
                        />
                      </div>
                    </td>

                    {/* Dedicated explicit 64px gap track */}
                    <td aria-hidden="true" className="w-16 min-w-[64px] p-0 pointer-events-none" />

                    {/* Fulfilment Status */}
                    <td className="py-4 pl-3 sm:pl-4 pr-4 sm:pr-6 align-middle">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: fulfilmentDotColor }}
                        />
                        <span className="text-xs font-medium text-[#1F1B16] dark:text-[#F3EFE7]">
                          {order.fulfilmentStatus}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="block">
                <td colSpan={5} className="py-12 text-center block">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-sm font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
                      No data in this period
                    </p>
                    <p className="text-xs text-[#6F6A61] dark:text-[#9A948A]">
                      No procurement orders match the selected date range.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary Row */}
      <div className="pt-4 mt-auto border-t border-black/[0.07] dark:border-white/[0.08] flex items-center justify-between text-xs text-[#6F6A61] dark:text-[#9A948A] font-normal">
        <span>Showing {filteredOrders.length} of {orders.length} orders</span>
        <div className="font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
          Total <span className="font-semibold ml-1">$</span>{Math.round(totalSpend > 10000 ? totalSpend / 83 : totalSpend).toLocaleString("en-US")}
        </div>
      </div>
    </div>
  );
}
