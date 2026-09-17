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
    // 1. Default: Crisp white in light, Carbon Ink in dark
    default:
      "bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#9BA9B4]/18 shadow-card-light dark:shadow-elevation-dark-low",

    // 2. Hero: Elevated monumental card — white with warm shadow in light
    hero:
      "bg-gradient-to-br from-white to-[#FDFAF5] dark:from-[#242830] dark:to-[#1B1E26] border border-[#EAE5DC] dark:border-[#9BA9B4]/22 shadow-elevation-mid dark:shadow-elevation-dark-mid",

    // 3. Verified: Premium craft-quality inset feel
    verified:
      "bg-[#FEFCF9] dark:bg-[#1E2228] border border-[#556B55]/30 dark:border-[#7B9B7B]/30 shadow-[inset_0_1px_3px_rgba(26,31,38,0.04),0_4px_16px_rgba(85,107,85,0.10)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_4px_20px_rgba(0,0,0,0.5)] relative before:absolute before:inset-[3px] before:border before:border-[#556B55]/15 dark:before:border-[#7B9B7B]/20 before:pointer-events-none",

    // 4. Chart: Data card with polished white container
    chart:
      "bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#9BA9B4]/18 shadow-elevation-mid dark:shadow-elevation-dark-mid",

    // 5. Editorial: Warm Alabaster for brand-forward pages
    editorial:
      "bg-[#FAF8F4] dark:bg-[#1C2027] border border-[#EAE5DC] dark:border-[#9BA9B4]/18 shadow-elevation-mid dark:shadow-elevation-dark-mid",

    // 6. Dense: High-density data surface
    dense:
      "bg-white/90 dark:bg-[#1E2028]/95 border border-[#EAE5DC] dark:border-[#9BA9B4]/15 shadow-card-light dark:shadow-elevation-dark-low",

    // 7. Callout: Accentuated callout with terracotta left rule
    callout:
      "bg-[#FAF8F4] dark:bg-[#1C2027] border-l-4 border-[#B85333] dark:border-[#C85D3B] border-y border-r border-[#EAE5DC] dark:border-[#9BA9B4]/18 shadow-card-light dark:shadow-elevation-dark-low",
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
              ? "hover:border-[#556B55]/60 dark:hover:border-[#7B9B7B]/60 hover:shadow-[0_12px_32px_rgba(85,107,85,0.18)]"
              : "hover:border-[#B85333]/30 dark:hover:border-[#FAF8F5]/20 hover:shadow-elevation-mid dark:hover:shadow-elevation-dark-mid"
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

