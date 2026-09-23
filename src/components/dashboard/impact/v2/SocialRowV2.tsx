"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Users, Scale } from "lucide-react";

interface SocialImpactSupplier {
  name: string;
  womenPct: number;
  wageRatio: number;
}

interface SocialRowV2Props {
  womenWorkforcePercent?: number;
  wageRatio?: number;
  supplierImpactData?: SocialImpactSupplier[];
}

const DEFAULT_SUPPLIER_LIST: SocialImpactSupplier[] = [
  { name: "Bare Necessities", womenPct: 82, wageRatio: 1.05 },
  { name: "UKHI India", womenPct: 65, wageRatio: 1.05 },
  { name: "Kheoni", womenPct: 75, wageRatio: 1.05 },
];

export default function SocialRowV2({
  womenWorkforcePercent = 78,
  wageRatio = 1.05,
  supplierImpactData,
}: SocialRowV2Props) {
  const suppliers = supplierImpactData && supplierImpactData.length > 0
    ? supplierImpactData
    : DEFAULT_SUPPLIER_LIST;

  // D5 Derived Highest Women Percentage Supplier
  let topWomenSupplierName = "Bare Necessities";
  let topWomenPct = 0;
  suppliers.forEach((s) => {
    if (s.womenPct > topWomenPct) {
      topWomenPct = s.womenPct;
      topWomenSupplierName = s.name;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
      {/* 7 Cols: Social Livelihood Impact Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-7
          bg-white dark:bg-[#20242B]
          border border-black/[0.07] dark:border-white/[0.08]
          shadow-[0_1px_2px_rgba(31,27,22,0.04),0_8px_24px_rgba(31,27,22,0.06)]
          dark:shadow-none dark:border-t-white/[0.12]
          rounded-[24px] p-6 lg:p-8
          flex flex-col justify-between h-full w-full
          hover:border-[#7D3F1E]/30 dark:hover:border-[#E07A57]/40 transition-colors duration-200
        "
      >
        <div>
          {/* Header Row */}
          <div className="pb-4 border-b border-black/[0.07] dark:border-white/[0.08]">
            <h2 className="text-xl lg:text-[22px] font-medium text-[#1F1B16] dark:text-[#F3EFE7] tracking-tight">
              Social Livelihood Impact
            </h2>
            <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] mt-1 font-normal">
              Women&apos;s employment and wages at your supplier enterprises
            </p>
          </div>

          {/* 2 Stat Blocks Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-black/[0.07] dark:border-white/[0.08]">
            {/* Stat Block 1: Women in supplier workforces */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-[#2B3A55]/15 dark:bg-[#8FA6D0]/20 flex items-center justify-center text-[#2B3A55] dark:text-[#8FA6D0]">
                  <Users className="w-3.5 h-3.5" strokeWidth={1.8} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6F6A61] dark:text-[#9A948A]">
                  Women in supplier workforces
                </span>
              </div>

              <div className="text-3xl lg:text-4xl font-light text-[#2B3A55] dark:text-[#8FA6D0] tracking-tight leading-none my-1 tabular-nums">
                {womenWorkforcePercent}%
              </div>

              <span className="text-[11px] text-[#6F6A61] dark:text-[#9A948A] font-normal block">
                Average of {suppliers.length} supplier enterprises
              </span>
            </div>

            {/* Stat Block 2: Wage vs statutory minimum */}
            <div className="sm:border-l sm:border-black/[0.07] sm:dark:border-white/[0.08] sm:pl-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-black/[0.07] dark:border-white/[0.08]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-[#7D3F1E]/15 dark:bg-[#E07A57]/20 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57]">
                  <Scale className="w-3.5 h-3.5" strokeWidth={1.8} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6F6A61] dark:text-[#9A948A]">
                  Wage vs statutory minimum
                </span>
              </div>

              <div className="text-3xl lg:text-4xl font-light text-[#7D3F1E] dark:text-[#E07A57] tracking-tight leading-none my-1 tabular-nums flex items-baseline gap-0.5">
                <span>{wageRatio.toFixed(2)}</span>
                <span className="text-base font-normal text-[#7D3F1E]/80 dark:text-[#E07A57]/80">×</span>
              </div>

              <span className="text-[11px] text-[#6F6A61] dark:text-[#9A948A] font-normal block">
                Same multiple at all {suppliers.length} enterprises
              </span>
            </div>
          </div>

          {/* 2 Columns of Lists (Women Employed & Wage Multiple) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
            {/* List 1: Women Employed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] pb-1 border-b border-black/[0.07] dark:border-white/[0.08]">
                <span>Women employed</span>
                <span>% women</span>
              </div>

              <div className="space-y-3">
                {suppliers.map((s) => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-medium truncate max-w-[160px]">
                        {s.name}
                      </span>
                      <span className="text-[#2B3A55] dark:text-[#8FA6D0] font-semibold tabular-nums">
                        {s.womenPct}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-[#2B3A55] dark:bg-[#8FA6D0] rounded-full"
                        style={{ width: `${s.womenPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* List 2: Wage Multiple */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] font-medium text-[#6F6A61] dark:text-[#9A948A] pb-1 border-b border-black/[0.07] dark:border-white/[0.08]">
                <span>Wage multiple</span>
                <span>benchmark multiplier</span>
              </div>

              <div className="space-y-3">
                {suppliers.map((s) => {
                  const ratioPct = Math.min(100, Math.round((s.wageRatio / 2.0) * 100)); // Scale 0 to 2.0x

                  return (
                    <div key={s.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#1F1B16] dark:text-[#F3EFE7] font-medium truncate max-w-[160px]">
                          {s.name}
                        </span>
                        <span className="text-[#7D3F1E] dark:text-[#E07A57] font-semibold tabular-nums">
                          {s.wageRatio.toFixed(2)}×
                        </span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden relative">
                        {/* 1.00x Baseline Tick */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/30 dark:bg-white/40 z-10" />

                        <div
                          className="h-full bg-[#7D3F1E] dark:bg-[#E07A57] rounded-full"
                          style={{ width: `${ratioPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary Line */}
        <div className="pt-3 mt-5 border-t border-black/[0.07] dark:border-white/[0.08] text-xs text-[#6F6A61] dark:text-[#9A948A] font-medium flex items-center justify-between">
          <span>Workforce & wage compliance</span>
          <span className="text-[#55705A] dark:text-[#9DB4A0] font-semibold">
            100% Fair Wage & Minimum Living Wage Compliant
          </span>
        </div>
      </motion.div>

      {/* 5 Cols: Impact3 Visual Image Card with D5 Overlaid Note Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="
          lg:col-span-5
          rounded-[24px] overflow-hidden relative min-h-[360px]
          border border-black/[0.07] dark:border-white/[0.12] shadow-sm
          bg-[#1F1B16] group flex flex-col justify-end p-6 lg:p-8
        "
      >
        <Image
          src="/assets/Impact3.svg"
          alt="Handmade soap with lavender visual"
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 40vw"
          className="object-cover rounded-[24px] object-[50%_40%] transition-transform duration-700 group-hover:scale-[1.03] dark:brightness-90"
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none rounded-[24px]" />

        {/* Overlaid Bottom-Left Brand-Brown Note Card (D5) */}

      </motion.div>
    </div>
  );
}
