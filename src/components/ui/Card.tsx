"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export type CardVariant = "default" | "verified" | "editorial" | "dense";

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
  // Treatment styles matching brand identity
  const variantStyles: Record<CardVariant, string> = {
    // 1. Default: Standard elevated clean card
    default:
      "bg-[#E4DEC9] dark:bg-[#272A30] border border-slate-mist/30 dark:border-midnight-blue shadow-sm",

    // 2. Verified: Embossed / Inset look referencing leather-embossing in brand deck
    verified:
      "bg-[#DFD8C2] dark:bg-[#23262B] border-2 border-[#738678]/40 dark:border-[#738678]/30 shadow-[inset_0_1px_3px_rgba(34,35,38,0.08),0_2px_8px_rgba(115,134,120,0.12)] relative before:absolute before:inset-[3px] before:border before:border-[#738678]/20 before:pointer-events-none",

    // 3. Editorial: Warm Stone base for Framework and brand-forward pages
    editorial:
      "bg-[#E8E2D1] dark:bg-[#202226] border border-slate-mist/25 dark:border-slate-mist/20 shadow-md",

    // 4. Dense: Data-table style for high-density procurement screens
    dense:
      "bg-[#E4DEC9]/90 dark:bg-[#272A30]/95 border border-slate-mist/35 dark:border-midnight-blue/80 shadow-none",
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
              y: -2,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={`
        rounded-none overflow-hidden relative transition-all duration-300
        ${variantStyles[variant]}
        ${hoverEffect ? "hover:border-slate-mist/60 dark:hover:border-slate-mist/40 hover:shadow-md" : ""}
        ${className}
      `}
      {...props}
    >
      {/* Top Accent Line */}
      {accentColor !== "none" && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 z-20 ${
            accentColor === "deep-clay"
              ? "bg-deep-clay"
              : accentColor === "sage-mineral"
              ? "bg-sage-mineral"
              : accentColor === "slate-mist"
              ? "bg-slate-mist"
              : accentColor === "midnight-blue"
              ? "bg-midnight-blue"
              : ""
          }`}
        />
      )}
      <div className={`${paddingStyle} relative z-10 h-full`}>{children}</div>
    </motion.div>
  );
}
