"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Coins, Users } from "lucide-react";

interface OrdersKpiV2Props {
  totalOrders?: number;
  totalSpend?: number;
  vettedSuppliersCount?: number;
  awaitingCount?: number;
  awaitingCaption?: string;
  onSelectAwaitingFilter?: () => void;
}

export default function OrdersKpiV2({
  totalOrders = 5,
  totalSpend = 313150,
  vettedSuppliersCount = 2,
}: OrdersKpiV2Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-stretch">
      {/* KPI 1: Total Orders */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          bg-white dark:bg-[#20242B]
          border border-black/[0.07] dark:border-white/[0.08]
          shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
          dark:shadow-none dark:border-t-white/[0.12]
          rounded-[24px] p-7 lg:p-8
          flex flex-col justify-between min-h-[200px] h-full
          hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        "
      >
        <div className="flex items-start justify-between">
          <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
            Total Orders
          </span>
          <div className="w-9 h-9 rounded-full bg-[#7D3F1E]/10 dark:bg-[#E07A57]/20 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57] shrink-0">
            <ShoppingBag className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="text-4xl lg:text-[52px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-none my-3 tabular-nums">
          {totalOrders}
        </div>

        <p className="text-[13px] text-[#6F6A61] dark:text-[#9A948A] font-normal leading-snug">
          Across 3 partners
        </p>
      </motion.div>

      {/* KPI 2: Total Spend */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="
          bg-white dark:bg-[#20242B]
          border border-black/[0.07] dark:border-white/[0.08]
          shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
          dark:shadow-none dark:border-t-white/[0.12]
          rounded-[24px] p-7 lg:p-8
          flex flex-col justify-between min-h-[200px] h-full
          hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        "
      >
        <div className="flex items-start justify-between">
          <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
            Total Spend
          </span>
          <div className="w-9 h-9 rounded-full bg-[#55705A]/15 dark:bg-[#9DB4A0]/20 flex items-center justify-center text-[#55705A] dark:text-[#9DB4A0] shrink-0">
            <Coins className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div
          className="text-3xl lg:text-[40px] font-light text-[#55705A] dark:text-[#9DB4A0] tracking-tight leading-none my-3 tabular-nums flex items-baseline gap-1"
          aria-label={`Total spend $${Math.round(totalSpend > 10000 ? totalSpend / 83 : totalSpend).toLocaleString("en-US")}`}
        >
          <span>${Math.round(totalSpend > 10000 ? totalSpend / 83 : totalSpend).toLocaleString("en-US")}</span>
        </div>


      </motion.div>

      {/* KPI 3: Vetted Suppliers */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="
          bg-white dark:bg-[#20242B]
          border border-black/[0.07] dark:border-white/[0.08]
          shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
          dark:shadow-none dark:border-t-white/[0.12]
          rounded-[24px] p-7 lg:p-8
          flex flex-col justify-between min-h-[200px] h-full
          hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        "
      >
        <div className="flex items-start justify-between">
          <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A]">
            Partners
          </span>
          <div className="w-9 h-9 rounded-full bg-[#6F8391]/15 dark:bg-[#93A9B8]/20 flex items-center justify-center text-[#6F8391] dark:text-[#93A9B8] shrink-0">
            <Users className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="text-4xl lg:text-[52px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-none my-3 tabular-nums">
          {vettedSuppliersCount}
        </div>

        <p className="text-[13px] text-[#6F6A61] dark:text-[#9A948A] font-normal leading-snug">
          Assessed against the Varna framework
        </p>
      </motion.div>
    </div>
  );
}
