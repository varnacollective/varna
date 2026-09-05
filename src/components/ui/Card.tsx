"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export type CardVariant = "default" | "verified" | "editorial" | "dense" | "hero" | "chart" | "callout";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
  accentColor?: "none" | "deep-clay" | "sage-mineral" | "slate-mist" | "midnight-blue";
  noPadding?: boolean;
}

export default function Card({
  children,
  variant = "default",
  className = "",
  delay = 0,
  hoverEffect = false,
  accentColor = "none",
  noPadding = false,
  ...props
}: CardProps) {
  // Treatment styles matching luxury boutique hospitality and fintech-grade elevation
  const variantStyles: Record<CardVariant, string> = {
    // 1. Default: Elevated resting card with soft carbon-ink tinted shadow
    default:
      "bg-[#E4DEC9] dark:bg-[#22252B] border border-[#6F848F]/20 dark:border-[#8C9DA8]/20 shadow-elevation-low dark:shadow-elevation-dark-low",

    // 2. Hero: Monumental card with subtle gradient background and higher elevation
    hero:
      "bg-gradient-to-br from-[#E8E2D1] to-[#DFD8C2] dark:from-[#262B34] dark:to-[#1F2329] border border-[#6F848F]/25 dark:border-[#8C9DA8]/25 shadow-elevation-mid dark:shadow-elevation-dark-mid",

    // 3. Verified: Inset luxury look referencing fine leather craft
    verified:
      "bg-[#DFD8C2] dark:bg-[#22262D] border border-[#738678]/40 dark:border-[#829888]/35 shadow-[inset_0_1px_3px_rgba(34,35,38,0.06),0_4px_16px_rgba(115,134,120,0.12)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_4px_20px_rgba(0,0,0,0.5)] relative before:absolute before:inset-[3px] before:border before:border-[#738678]/20 dark:before:border-[#829888]/20 before:pointer-events-none",

    // 4. Chart: Elevated data card with polished container
    chart:
      "bg-[#E4DEC9]/95 dark:bg-[#22252B] border border-[#6F848F]/20 dark:border-[#8C9DA8]/20 shadow-elevation-mid dark:shadow-elevation-dark-mid",

    // 5. Editorial: Warm Stone base for Framework and brand-forward pages
    editorial:
      "bg-[#E8E2D1] dark:bg-[#202329] border border-[#6F848F]/25 dark:border-[#8C9DA8]/20 shadow-elevation-mid dark:shadow-elevation-dark-mid",

    // 6. Dense: High-density data table style
    dense:
      "bg-[#E4DEC9]/90 dark:bg-[#22252B]/95 border border-[#6F848F]/25 dark:border-[#8C9DA8]/20 shadow-elevation-low dark:shadow-elevation-dark-low",

    // 7. Callout: Accentuated callout container
    callout:
      "bg-[#DFD8C2]/60 dark:bg-[#202329] border-l-4 border-[#7A3F1E] dark:border-[#FAF6EE] border-y border-r border-[#6F848F]/20 dark:border-[#8C9DA8]/20 shadow-elevation-low dark:shadow-elevation-dark-low",
  };

  const paddingStyle = noPadding
    ? ""
    : variant === "dense"
    ? "p-4 sm:p-5"
    : variant === "editorial"
    ? "p-8 sm:p-10"
    : "p-6 sm:p-7";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        hoverEffect
          ? {
              y: -3,
              scale: 1.008,
              transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
            }
          : undefined
      }
      className={`
        rounded-none overflow-hidden relative transition-all duration-300
        ${variantStyles[variant]}
        ${
          hoverEffect
            ? variant === "verified"
              ? "hover:border-[#738678]/70 dark:hover:border-[#738678]/60 hover:shadow-[0_12px_32px_rgba(115,134,120,0.22)]"
              : "hover:border-[#6F848F]/50 dark:hover:border-[#D8CFB8]/30 hover:shadow-elevation-mid dark:hover:shadow-elevation-dark-mid"
            : ""
        }
        ${className}
      `}
      {...props}
    >
      {/* Top Accent Line */}
      {accentColor !== "none" && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 z-20 ${
            accentColor === "deep-clay"
              ? "bg-[#7A3F1E]"
              : accentColor === "sage-mineral"
              ? "bg-[#738678]"
              : accentColor === "slate-mist"
              ? "bg-[#6F848F]"
              : accentColor === "midnight-blue"
              ? "bg-[#2F3C52]"
              : ""
          }`}
        />
      )}
      <div className={`${paddingStyle} relative z-10 h-full`}>{children}</div>
    </motion.div>
  );
}

