"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color: string; // Hex color code
  label: string;
  delay?: number;
}

export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  color,
  label,
  delay = 0,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background track: uses text-color opacity for theme safety */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-carbon-ink/10 dark:stroke-warm-stone/10"
            strokeWidth={strokeWidth}
          />
          {/* Animated progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="square" // geometric cap instead of rounded pill for structured detailing
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              duration: 1.2,
              delay: delay + 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-2xl font-sans text-carbon-ink dark:text-warm-stone font-medium tracking-tighter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.6, duration: 0.4 }}
          >
            {value.toFixed(0)}
          </motion.span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-slate-mist dark:text-warm-stone/60 uppercase tracking-[0.2em] text-center">
        {label}
      </span>
    </motion.div>
  );
}
