"use client";

import React from "react";

export function CardSkeleton({ height = "h-32", className = "" }: { height?: string; className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-5 shadow-card-light dark:shadow-elevation-dark-low animate-pulse ${height} ${className}`}
    >
      <div className="h-3 w-1/3 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded mb-3" />
      <div className="h-8 w-1/2 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded mb-2" />
      <div className="h-2 w-2/3 bg-[#EAE5DC] dark:bg-[#8C9DA8]/15 rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-white dark:bg-[#1E2028] rounded-xl border border-[#EAE5DC] dark:border-[#8C9DA8]/20 p-6 shadow-card-light dark:shadow-elevation-dark-low animate-pulse space-y-4">
      <div className="h-4 w-1/4 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-[#EAE5DC]/50 dark:border-[#8C9DA8]/10">
            <div className="h-4 w-1/4 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded" />
            <div className="h-4 w-1/6 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded" />
            <div className="h-4 w-1/6 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded" />
            <div className="h-4 w-1/6 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = "h-56" }: { height?: string }) {
  return (
    <div
      className={`bg-white dark:bg-[#1E2028] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 rounded-xl p-6 shadow-card-light dark:shadow-elevation-dark-low animate-pulse flex flex-col justify-between ${height}`}
    >
      <div className="h-4 w-1/3 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded" />
      <div className="h-32 w-full bg-[#EAE5DC]/50 dark:bg-[#8C9DA8]/10 rounded-lg flex items-end justify-around p-3 gap-2">
        <div className="w-12 h-16 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded-t" />
        <div className="w-12 h-24 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded-t" />
        <div className="w-12 h-20 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded-t" />
        <div className="w-12 h-28 bg-[#EAE5DC] dark:bg-[#8C9DA8]/20 rounded-t" />
      </div>
      <div className="h-3 w-1/2 bg-[#EAE5DC] dark:bg-[#8C9DA8]/15 rounded" />
    </div>
  );
}

export function EmptyState({
  title = "No Data Available",
  message = "There are currently no records matching your selected filter.",
  onReset,
}: {
  title?: string;
  message?: string;
  onReset?: () => void;
}) {
  return (
    <div className="w-full bg-white dark:bg-[#1E2028] rounded-xl border border-[#EAE5DC] dark:border-[#8C9DA8]/20 p-12 text-center shadow-card-light dark:shadow-elevation-dark-low font-sans space-y-3">
      <div className="w-12 h-12 rounded-full bg-[#B85333]/10 text-[#B85333] flex items-center justify-center mx-auto text-lg font-bold">
        !
      </div>
      <h4 className="text-base font-medium text-[#1A1F26] dark:text-[#FAF8F5] uppercase tracking-wide">
        {title}
      </h4>
      <p className="text-xs text-[#6E7781] dark:text-[#8C9DA8] max-w-md mx-auto font-light leading-relaxed">
        {message}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#B85333] text-white hover:bg-[#9E3E20] transition-colors cursor-pointer"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
