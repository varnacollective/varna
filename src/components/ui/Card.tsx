import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
  accentColor?: "none" | "deep-clay" | "sage-mineral" | "slate-mist" | "midnight-blue";
  noPadding?: boolean;
}

export default function Card({
  children,
  className = "",
  delay = 0,
  hoverEffect = false,
  accentColor = "none",
  noPadding = false,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hoverEffect ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`
        bg-[#E4DEC9] dark:bg-[#222326] border border-slate-mist/30 dark:border-midnight-blue
        shadow-sm rounded-none overflow-hidden
        relative transition-all duration-300
        ${hoverEffect ? "hover:border-slate-mist/60 dark:hover:border-slate-mist/35" : ""}
        ${className}
      `}
      {...props}
    >
      {/* Top Accent Line */}
      {accentColor !== "none" && (
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          accentColor === "deep-clay" ? "bg-deep-clay" :
          accentColor === "sage-mineral" ? "bg-sage-mineral" :
          accentColor === "slate-mist" ? "bg-slate-mist" :
          accentColor === "midnight-blue" ? "bg-midnight-blue" : ""
        }`} />
      )}
      <div className={`${noPadding ? "" : "p-6"} relative z-10 h-full`}>{children}</div>
    </motion.div>
  );
}
