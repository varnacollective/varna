"use client";

import { motion } from "framer-motion";

export interface SupplierImpactData {
  name: string;
  womenPct: number;
  wageRatio: number;
}

interface SocialImpactV2Props {
  artisansSupported: number;
  womenWorkforcePercent: number;
  wageRatio?: number;
  supplierImpactData?: SupplierImpactData[];
}

export default function SocialImpactV2({
  artisansSupported,
  womenWorkforcePercent,
  wageRatio = 1.05,
  supplierImpactData = [],
}: SocialImpactV2Props) {
  const supplierCount = supplierImpactData.length || 3;

  // Determine if all enterprises share the exact same wage ratio
  const allSameRatio =
    supplierImpactData.length > 0 &&
    supplierImpactData.every((s) => s.wageRatio === supplierImpactData[0].wageRatio);

  const wageCaption = allSameRatio
    ? `Same multiple at all ${supplierCount} enterprises`
    : `Across ${supplierCount} supplier enterprises`;

  // Find max wage ratio for progress bar width scaling
  const maxWageRatio = Math.max(1.5, ...supplierImpactData.map((s) => s.wageRatio));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="
        w-full mb-6
        bg-white dark:bg-[#1E2028]
        rounded-2xl border border-[#EAE5DC] dark:border-[#9BA9B4]/16
        shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[420px]
      "
    >
      {/* Header */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6F848F] dark:text-[#8C9DA8]">
          Social Livelihood Impact
        </h3>
        <p className="text-xs text-[#6F848F]/80 dark:text-[#9BA9B4]/80 font-light mt-0.5">
          Women's employment and wages at your supplier enterprises
        </p>
      </div>

      {/* 3 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
        {/* Column 1: Summary Cards */}
        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <span className="text-[10px] text-[#6F848F] dark:text-[#8C9DA8] uppercase tracking-wider block font-semibold">
              Women in the workforce
            </span>
            <div className="text-4xl sm:text-5xl font-light text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight my-1">
              {womenWorkforcePercent}%
            </div>
            <p className="text-xs text-[#6F848F] dark:text-[#8C9DA8] font-light">
              Average of {supplierCount} supplier enterprises
            </p>
          </div>

          <div className="pt-4 border-t border-[#EAE5DC]/80 dark:border-[#9BA9B4]/15">
            <span className="text-[10px] text-[#6F848F] dark:text-[#8C9DA8] uppercase tracking-wider block font-semibold">
              Wage vs statutory minimum
            </span>
            <div className="text-4xl sm:text-5xl font-light text-[#1A1F26] dark:text-[#FAF8F5] tracking-tight my-1">
              {wageRatio.toFixed(2)}×
            </div>
            <p className="text-xs text-[#6F848F] dark:text-[#8C9DA8] font-light">
              {wageCaption}
            </p>
          </div>
        </div>

        {/* Column 2: Women employed by enterprise */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DC] dark:border-[#9BA9B4]/15">
            <span className="text-xs font-semibold text-[#1A1F26] dark:text-[#FAF8F5]">
              Women employed, by enterprise
            </span>
            <span className="text-xs font-light text-[#6F848F] dark:text-[#8C9DA8]">
              Average {womenWorkforcePercent}%
            </span>
          </div>

          <div className="space-y-4">
            {supplierImpactData.map((supplier) => (
              <div key={supplier.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span
                    className="text-[#1A1F26] dark:text-[#FAF8F5] font-light truncate"
                    title={supplier.name}
                  >
                    {supplier.name}
                  </span>
                  <span className="font-medium text-[#1A1F26] dark:text-[#FAF8F5] shrink-0">
                    {supplier.womenPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE5DC] dark:bg-[#252830] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2F3C52] dark:bg-[#6F848F] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, supplier.womenPct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Wage multiple vs statutory minimum */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DC] dark:border-[#9BA9B4]/15">
            <span className="text-xs font-semibold text-[#1A1F26] dark:text-[#FAF8F5]">
              Wage multiple vs statutory minimum
            </span>
            <span className="text-xs font-light text-[#6F848F] dark:text-[#8C9DA8]">
              Minimum 1.00×
            </span>
          </div>

          <div className="space-y-4">
            {supplierImpactData.map((supplier) => {
              const ratioPct = Math.min(100, Math.max(10, (supplier.wageRatio / maxWageRatio) * 100));
              return (
                <div key={supplier.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span
                      className="text-[#1A1F26] dark:text-[#FAF8F5] font-light truncate"
                      title={supplier.name}
                    >
                      {supplier.name}
                    </span>
                    <span className="font-medium text-[#1A1F26] dark:text-[#FAF8F5] shrink-0">
                      {supplier.wageRatio.toFixed(2)}×
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#EAE5DC] dark:bg-[#252830] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2F3C52] dark:bg-[#6F848F] transition-all duration-500"
                      style={{ width: `${ratioPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
