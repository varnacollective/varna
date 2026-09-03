"use client";

import { motion } from "framer-motion";

interface BrandWatermarkProps {
  position?: "bottom-right" | "top-right" | "bottom-left" | "center";
  size?: number;
  opacity?: number;
  className?: string;
}

/**
 * Asymmetric folded-paper / crystal triangle icon from the Varna brand deck.
 * Used as a subtle background motif (3–5% opacity, large scale, cropped in page corners).
 */
export default function BrandWatermark({
  position = "bottom-right",
  size = 520,
  opacity = 0.035,
  className = "",
}: BrandWatermarkProps) {
  const positionClasses = {
    "bottom-right": "fixed -bottom-24 -right-24 pointer-events-none z-0",
    "top-right": "fixed -top-24 -right-24 pointer-events-none z-0",
    "bottom-left": "fixed -bottom-24 -left-24 pointer-events-none z-0",
    center: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={`${positionClasses[position]} select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-carbon-ink dark:text-warm-stone"
      >
        {/* Plane 1: Primary angular facet */}
        <path
          d="M107.92 167.55L92.48 62.32c-0.13-0.89 0.95-1.43 1.59-0.79l49.1 49.49c1.12 1.13 1.8 2.63 1.9 4.22l3.36 52.27L107.92 167.55z"
          fill="currentColor"
          fillOpacity="0.8"
        />
        {/* Plane 2: Overlapping secondary facet */}
        <path
          d="M107.88 167.66l17.02-61.53c0.19-0.7 1.05-0.96 1.59-0.47l29.42 26.57c1.04 0.94 1.46 2.39 1.1 3.75l-8.47 31.58L107.88 167.66z"
          fill="currentColor"
          fillOpacity="0.4"
        />
        {/* Plane 3: Subtle folding line art contour */}
        <path
          d="M92.48 62.32L107.92 167.55l39.06-25.75"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />
      </svg>
    </motion.div>
  );
}
