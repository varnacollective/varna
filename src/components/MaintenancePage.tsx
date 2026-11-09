"use client";

import { motion } from "framer-motion";

export default function MaintenancePage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center text-center p-6 bg-[#FAF8F5] dark:bg-[#151311] text-[#1C1917] dark:text-[#FAF8F5] font-sans selection:bg-[#9A4A2E] selection:text-white relative overflow-hidden">
      {/* Subtle Ambient Radial Highlight */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#EFE7D8]/50 dark:bg-[#25201A]/30 rounded-full blur-[140px] pointer-events-none -z-0"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center max-w-xl mx-auto z-10"
      >
        {/* Editorial Wordmark */}
        <h1 className="font-serif tracking-[0.35em] text-4xl sm:text-5xl lg:text-6xl font-light text-[#1C1917] dark:text-[#FAF8F5] uppercase select-none">
          VARNA
        </h1>

        {/* Brand Tagline */}
        <p className="text-[#8C4A27] dark:text-[#E07A57] mt-4 font-serif italic text-lg lg:text-xl tracking-wide">
          Elevating the Impact Experience.
        </p>

        {/* Minimalist Ornamental Hairline */}
        <div
          aria-hidden="true"
          className="w-12 h-[1px] bg-[#8C4A27]/25 dark:bg-[#E07A57]/30 my-6"
        />

        {/* Body Description */}
        <p className="max-w-md text-sm sm:text-base text-[#57534E] dark:text-[#B3A998] font-normal leading-relaxed">
          We are migrating the Varna platform to a new enterprise cloud environment to bring you faster insights and enhanced security. The dashboard will be back online shortly.
        </p>

        {/* Contact / Inquiries Line */}
        <p className="mt-12 text-xs text-[#A8A29E] tracking-wide font-sans">
          For urgent inquiries, please contact your Developer.
        </p>
      </motion.div>
    </main>
  );
}

