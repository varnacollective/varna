"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface PillarTooltipProps {
  content: string;
  children: ReactNode;
}

export default function PillarTooltip({ content, children }: PillarTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const TOOLTIP_WIDTH = 280;

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    // Position above the trigger element
    const top = rect.top - 12;
    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 12));

    setPosition({ top, left });
  }, []);

  const handleClick = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      calculatePosition();
      setIsOpen(true);
    }
  }, [isOpen, calculatePosition]);

  // Click-outside and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className="inline-block cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#B85333] rounded"
        title="Click to view definition"
      >
        {children}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                  mass: 0.6,
                }}
                className="fixed z-[9999] pointer-events-auto"
                style={{
                  top: position.top,
                  left: position.left,
                  width: TOOLTIP_WIDTH,
                  transform: "translateY(-100%)",
                }}
              >
                <div
                  className="
                    bg-carbon-ink dark:bg-[#2A2B2E]
                    border border-slate-mist/25 dark:border-slate-mist/20
                    shadow-[0_8px_24px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                    px-4 py-3.5 font-sans
                  "
                >
                  <p className="text-[11px] text-warm-stone/90 dark:text-warm-stone/80 font-light leading-relaxed">
                    {content}
                  </p>
                </div>
                {/* Caret pointing down */}
                <div className="flex justify-center -mt-px">
                  <div
                    className="w-2.5 h-2.5 rotate-45 bg-carbon-ink dark:bg-[#2A2B2E] border-r border-b border-slate-mist/25 dark:border-slate-mist/20"
                    style={{ marginTop: "-5px" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
