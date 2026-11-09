"use client";

import { motion } from "framer-motion";

export default function MaintenanceView() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#FAF8F5] dark:bg-[#151311] text-[#1C1917] dark:text-[#FAF8F5] font-sans px-6 py-10 selection:bg-[#9A4A2E] selection:text-white relative overflow-hidden">
      {/* ─── Ambient Glow (Subtle Luxury Accents) ───────────────────────────── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-[#EFE7D8]/60 dark:bg-[#25201A]/30 rounded-full blur-[120px] pointer-events-none -z-0" />

      {/* Top Spacer / Subtle Tag */}
      <div className="w-full flex justify-between items-center max-w-5xl z-10 text-[11px] uppercase tracking-[0.2em] text-[#8C8275] dark:text-[#8C8275]/80 font-medium">
        <span>Varna Collective</span>
        <span>Systems Notice</span>
      </div>

      {/* ─── Main Centerpiece Card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="my-auto max-w-xl w-full flex flex-col items-center text-center z-10 py-8"
      >
        {/* Varna Authentic Wordmark */}
        <div className="w-full flex justify-center mb-7 tracking-[0.35em]">
          <svg
            viewBox="50 102 138 32"
            className="w-64 sm:w-80 h-auto text-[#1C1917] dark:text-[#FAF8F5] fill-current transition-all"
            aria-label="VARNA"
          >
            <g transform="translate(-7, 0)">
              {/* V */}
              <path
                transform="translate(0, 0)"
                d="M64.96,107.04h2.35l6.98,22.02l7.01-22.02h0.93l-7.44,23.48l0.03,0.17h-2.35L64.96,107.04z"
              />
              {/* A */}
              <path
                transform="translate(3.5, 0)"
                d="M93.8,107.08v-0.03h2.35l7.31,23.74h-2.35l-1.85-6.08h-9.92l-1.88,6.08h-0.93L93.8,107.08z M98.96,123.81l-4.66-15.21l-4.7,15.21H98.96z"
              />
              {/* R */}
              <path
                transform="translate(7, 0)"
                d="M110.1,107.04h8.33c1.08,0,2.11,0.26,3.09,0.78c0.98,0.52,1.77,1.24,2.36,2.17c0.6,0.93,0.89,1.97,0.89,3.14c0,1.12-0.3,2.16-0.91,3.11c-0.61,0.95-1.4,1.7-2.38,2.25c-0.98,0.55-2.02,0.83-3.12,0.83l8.17,11.47h-2.45l-8.2-11.47h-3.57v11.47h-2.22V107.04z M118,118.42c0.81,0,1.57-0.26,2.26-0.78c0.69-0.52,1.25-1.19,1.65-2.02c0.41-0.83,0.61-1.66,0.61-2.5s-0.2-1.66-0.61-2.46s-0.96-1.46-1.65-1.97c-0.69-0.51-1.45-0.76-2.26-0.76h-5.69v10.48H118z"
              />
              {/* N */}
              <path
                transform="translate(10.5, 0)"
                d="M132.49,107.04h2.58l11.38,19.31v-19.31h0.89v23.74h-0.89v-0.03l-13.06-22.19v22.22h-0.89V107.04z"
              />
              {/* A */}
              <path
                transform="translate(14, 0)"
                d="M161.22,107.08v-0.03h2.35l7.31,23.74h-2.35l-1.85-6.08h-9.92l-1.88,6.08h-0.93L161.22,107.08z M166.38,123.81l-4.66-15.21l-4.7,15.21H166.38z"
              />
            </g>
          </svg>
        </div>

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#F5EFE6] dark:bg-white/5 border border-[#D4C5A9]/70 dark:border-white/10 shadow-xs mb-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8C4A27] dark:bg-[#E07A57] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8C4A27] dark:bg-[#E07A57]" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#8C4A27] dark:text-[#E07A57] uppercase font-sans">
            Cloud Migration & Infrastructure Upgrade
          </span>
        </div>

        {/* Editorial Heading / Tagline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-[#1C1917] dark:text-[#FAF8F5] tracking-tight leading-snug mb-3">
          Elevating the Impact Experience.
        </h1>

        {/* Minimalist Ornamental Hairline */}
        <div className="w-12 h-[1px] bg-[#8C4A27]/30 dark:bg-[#E07A57]/30 mx-auto my-3" />

        {/* Body Description */}
        <p className="text-sm sm:text-base text-[#57534E] dark:text-[#B3A998] font-normal leading-relaxed max-w-lg mx-auto mt-2">
          We are migrating the Varna platform to a dedicated enterprise cloud environment to bring you faster ESG intelligence, reinforced data security, and seamless Scope 3 carbon analytics. The dashboard will be back online shortly.
        </p>

        {/* Migration Telemetry Pill */}
        <div className="mt-8 px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E8E2D9] dark:border-white/10 shadow-xs flex items-center gap-3 text-xs text-[#78716C] dark:text-[#A8A29E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#55705A]" />
          <span className="font-mono text-[11px]">System Status: Database & Storage Sync in Progress</span>
          <span className="text-[#A8A29E]">•</span>
          <span className="font-medium text-[#1C1917] dark:text-[#FAF8F5]">Zero Data Loss</span>
        </div>
      </motion.div>

      {/* ─── Editorial Footer / Contact ────────────────────────────────────── */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#E8E2D9] dark:border-white/10 text-xs text-[#78716C] dark:text-[#A8A29E] z-10">
        <p className="tracking-wide">
          For urgent inquiries, please contact your <span className="text-[#1C1917] dark:text-[#FAF8F5] font-medium">Developer</span> or Account Director.
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] font-mono text-[#A8A29E]">
          VARNA • Evidence to Impact
        </p>
      </footer>
    </div>
  );
}

