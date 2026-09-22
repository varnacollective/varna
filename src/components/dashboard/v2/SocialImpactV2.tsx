"use client";

import { motion } from "framer-motion";
import { Users, Scale } from "lucide-react";

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
    : ` `;

  const maxWageRatio = Math.max(1.5, ...supplierImpactData.map((s) => s.wageRatio));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="
        w-full mb-6
        bg-white dark:bg-[#20242B]
        rounded-[24px] border border-black/[0.07] dark:border-white/[0.08]
        shadow-sm p-6 lg:p-8 flex flex-col justify-between min-h-[420px]
      "
    >
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-[-0.01em]">
          Social Livelihood Impact
        </h2>
        <p className="text-sm text-[#6F6A61] dark:text-[#9A948A] font-normal mt-0.5">
          Women's employment and wages at your partner enterprises
        </p>
      </div>

      {/* 3 Column Layout (~30/35/35) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6 my-auto items-start">
        {/* Column 1 (~30% / 4 cols): Stat Blocks */}
        <div className="md:col-span-4 space-y-6 flex flex-col justify-center pr-2">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57] shrink-0 mt-1">
              <Users className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block">
                Women in the workforce
              </span>
              <div className="text-3xl lg:text-[42px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-none mt-1 tabular-nums">
                {womenWorkforcePercent}%
              </div>
              <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] font-normal mt-1.5">
                Average of {supplierCount} supplier enterprises
              </p>
            </div>
          </div>

          <div className="h-px bg-black/[0.07] dark:bg-white/[0.08]" />

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#2B3A55]/15 dark:bg-[#8FA6D0]/20 flex items-center justify-center text-[#2B3A55] dark:text-[#8FA6D0] shrink-0 mt-1">
              <Scale className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] block">
                Wage vs statutory minimum
              </span>
              <div className="text-3xl lg:text-[42px] font-light text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight leading-none mt-1 tabular-nums">
                {wageRatio.toFixed(2)}×
              </div>
              <p className="text-xs text-[#5B564E] dark:text-[#C2BCB0] font-normal mt-1.5">
                {wageCaption}
              </p>
            </div>
          </div>
        </div>

        {/* Column 2 (~35% / 4 cols): Women Employed by Enterprise */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.07] dark:border-white/[0.08]">
            <span className="text-xs font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
              Women employed, by enterprise
            </span>
            <span className="text-xs font-normal text-[#6F6A61] dark:text-[#9A948A]">
              Average {womenWorkforcePercent}%
            </span>
          </div>

          <div className="space-y-4">
            {supplierImpactData.map((supplier) => (
              <div key={supplier.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px] gap-2">
                  <span
                    className="text-[#1F1B16] dark:text-[#F3EFE7] font-normal truncate"
                    title={supplier.name}
                  >
                    {supplier.name}
                  </span>
                  <span className="font-semibold text-[#1F1B16] dark:text-[#F3EFE7] shrink-0 tabular-nums">
                    {supplier.womenPct}%
                  </span>
                </div>
                {/* 6px Rounded Bar (Navy #2B3A55 in Light; Light Blue #8FA6D0 in Dark - Part 2 fixed) */}
                <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2B3A55] dark:bg-[#8FA6D0] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, supplier.womenPct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3 (~35% / 4 cols): Wage Multiple vs Statutory Minimum (P0-2 FIXED: Restored "benchmark multiplier") */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.07] dark:border-white/[0.08]">
            <span className="text-xs font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
              Wage multiple vs statutory minimum
            </span>
            {/* P0-2 FIXED: Restored original "benchmark multiplier" label */}
            <span className="text-xs font-normal text-[#6F6A61] dark:text-[#9A948A]">
              benchmark multiplier
            </span>
          </div>

          <div className="space-y-4">
            {supplierImpactData.map((supplier) => {
              const ratioPct = Math.min(100, Math.max(10, (supplier.wageRatio / maxWageRatio) * 100));
              return (
                <div key={supplier.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px] gap-2">
                    <span
                      className="text-[#1F1B16] dark:text-[#F3EFE7] font-normal truncate"
                      title={supplier.name}
                    >
                      {supplier.name}
                    </span>
                    <span className="font-semibold text-[#1F1B16] dark:text-[#F3EFE7] shrink-0 tabular-nums">
                      {supplier.wageRatio.toFixed(2)}×
                    </span>
                  </div>
                  {/* 6px Rounded Bar with Baseline Indicator */}
                  <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-[#2B3A55] dark:bg-[#8FA6D0] transition-all duration-500"
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
