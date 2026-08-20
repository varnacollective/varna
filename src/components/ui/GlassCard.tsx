"use client";

import { motion } from "framer-motion";
import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverEffect?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  glowColor,
  hoverEffect = true,
  delay = 0,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        hoverEffect
          ? {
              y: -4,
              transition: { duration: 0.25, ease: "easeOut" },
            }
          : undefined
      }
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-[var(--card)] backdrop-blur-xl
        border border-[var(--border)]
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        transition-colors duration-300
        ${hoverEffect ? "hover:bg-[var(--card)] hover:border-[var(--border)] cursor-pointer" : ""}
        ${glowColor ? glowColor : ""}
        ${className}
      `}
    >
      {/* Subtle inner highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </motion.div>
  );
}
