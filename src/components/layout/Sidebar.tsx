"use client";

import { motion } from "framer-motion";
import { usePathname, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import React, { useState, Suspense } from "react";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Leaf,
  Network,
  LogOut,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  defaultHref: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, defaultHref: "/dashboard?section=overview" },
  { id: "suppliers", label: "Partners", icon: Store, defaultHref: "/dashboard/suppliers" },
  { id: "orders", label: "Orders", icon: ShoppingBag, defaultHref: "/dashboard?section=orders" },
  { id: "impact", label: "Impact", icon: Leaf, defaultHref: "/dashboard?section=impact" },
  { id: "algorithm", label: "Framework", icon: Network, defaultHref: "/algorithm" },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
  onLogout?: () => void;
}

function buildNavHref(itemId: string, defaultHref: string, clientId?: string | null): string {
  if (!clientId) return defaultHref;

  switch (itemId) {
    case "overview":
      return `/dashboard?section=overview&clientId=${encodeURIComponent(clientId)}`;
    case "suppliers":
      return `/dashboard/suppliers?clientId=${encodeURIComponent(clientId)}`;
    case "orders":
      return `/dashboard?section=orders&clientId=${encodeURIComponent(clientId)}`;
    case "impact":
      return `/dashboard?section=impact&clientId=${encodeURIComponent(clientId)}`;
    case "algorithm":
      return `/algorithm?clientId=${encodeURIComponent(clientId)}`;
    default:
      return defaultHref.includes("?")
        ? `${defaultHref}&clientId=${encodeURIComponent(clientId)}`
        : `${defaultHref}?clientId=${encodeURIComponent(clientId)}`;
  }
}

function checkIsActive(
  itemId: string,
  activeSection: string,
  pathname: string,
  currentSectionQuery?: string | null
): boolean {
  if (activeSection === itemId) return true;
  if (itemId === "suppliers" && pathname.includes("/suppliers")) return true;
  if (itemId === "orders") {
    if (pathname.includes("/orders")) return true;
    if (pathname === "/dashboard" && currentSectionQuery === "orders") return true;
  }
  if (itemId === "impact") {
    if (pathname.includes("/impact")) return true;
    if (pathname === "/dashboard" && currentSectionQuery === "impact") return true;
  }
  if (itemId === "overview") {
    if (pathname === "/dashboard" && (!currentSectionQuery || currentSectionQuery === "overview")) return true;
  }
  if (itemId === "algorithm" && pathname.includes("/algorithm")) return true;
  return false;
}

interface SidebarViewProps extends SidebarProps {
  clientId?: string | null;
  currentSectionQuery?: string | null;
}

function SidebarView({
  activeSection,
  onSectionChange,
  onLogout,
  clientId,
  currentSectionQuery,
}: SidebarViewProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout?.();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* ── Desktop + Tablet Sidebar ──────────────────────────────────── */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="varna-sidebar fixed left-0 top-0 bottom-0 w-24 flex flex-col items-center py-8 justify-between z-50 bg-white dark:bg-[#141619] border-r border-[#EAE5DC] dark:border-[#9BA9B4]/10 text-[#1A1F26] dark:text-[#EAE5DC] shadow-md dark:shadow-2xl transition-colors duration-300 selection:bg-[#B85333] selection:text-white"
      >
        {/* ── Branding: Varnawordmark ──────── */}
        <div className="flex items-center justify-center w-full px-1 py-1 varna-sidebar-brand overflow-visible">
          <Image
            src="/assets/Varnawordmark.svg"
            alt="Varna"
            width={112}
            height={48}
            priority
            className="w-24 sm:w-28 h-auto max-h-16 object-contain dark:invert transition-all duration-300 scale-125"
          />
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col items-center gap-2 w-full px-2 mt-8 flex-1">
          {NAV_ITEMS.map((item) => {
            const href = buildNavHref(item.id, item.defaultHref, clientId);
            const isActive = checkIsActive(item.id, activeSection, pathname, currentSectionQuery);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={href}
                prefetch={true}
                onClick={(e) => {
                  if (pathname === "/dashboard" && href.includes("/dashboard?section=")) {
                    e.preventDefault();
                  }
                  if (onSectionChange) {
                    onSectionChange(item.id);
                  }
                }}
                className={`
                  relative flex flex-col items-center justify-center
                  w-full py-3.5 transition-all duration-150
                  group rounded-none border-y border-transparent cursor-pointer
                  ${isActive
                    ? "bg-[#B85333]/10 dark:bg-[#EAE5DC]/12 text-[#B85333] dark:text-[#EAE5DC] relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-[#B85333] before:to-[#556B55] shadow-[0_0_12px_rgba(184,83,51,0.15)] font-medium"
                    : "text-[#6E7781] dark:text-[#9BA9B4]/70 hover:text-[#1A1F26] dark:hover:text-[#EAE5DC] hover:bg-[#F0EBE3] dark:hover:bg-[#EAE5DC]/8"
                  }
                `}
                title={item.label}
              >
                <Icon className="w-5 h-5 mb-1 text-inherit" strokeWidth={isActive ? 2 : 1.5} />
                <span className="varna-nav-label text-[9px] tracking-widest font-sans font-light uppercase">
                  {item.label}
                </span>

                {/* Tooltip — adapts to light/dark */}
                <div className="
                  absolute left-full ml-3
                  px-3 py-1.5 rounded-none
                  bg-white dark:bg-[#1A1F26] text-[#1A1F26] dark:text-[#EAE5DC]
                  border border-[#EAE5DC] dark:border-[#2A3644]/80
                  text-[10px] font-sans tracking-widest uppercase whitespace-nowrap
                  opacity-0 group-hover:opacity-100
                  -translate-x-1 group-hover:translate-x-0
                  transition-all duration-200
                  pointer-events-none z-50 shadow-xl
                ">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Exit / Logout */}
        <div className="w-full px-2">
          <button
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            className={`
              flex flex-col items-center justify-center
              w-full py-4 transition-all duration-200 cursor-pointer
              text-[#6E7781] dark:text-[#9BA9B4]/60 hover:text-[#B85333] dark:hover:text-[#B85333] hover:bg-[#B85333]/10
              ${isLoggingOut ? "opacity-50 cursor-wait" : ""}
            `}
            title="Exit Session"
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 mb-1 animate-spin text-[#B85333]" />
            ) : (
              <LogOut className="w-5 h-5 mb-1" strokeWidth={1.5} />
            )}
            <span className="varna-nav-label text-[9px] tracking-widest font-sans font-light uppercase">
              {isLoggingOut ? "Exiting..." : "Exit"}
            </span>
          </button>
        </div>
      </motion.aside>

      {/* ── Mobile Bottom Navigation Bar (hidden on desktop/tablet via CSS) ── */}
      <nav className="varna-bottom-nav" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => {
          const href = buildNavHref(item.id, item.defaultHref, clientId);
          const isActive = checkIsActive(item.id, activeSection, pathname, currentSectionQuery);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={href}
              prefetch={true}
              onClick={(e) => {
                if (pathname === "/dashboard" && href.includes("/dashboard?section=")) {
                  e.preventDefault();
                }
                onSectionChange?.(item.id);
              }}
              className={`varna-bottom-nav-item${isActive ? " varna-bottom-nav-item--active" : ""}`}
              title={item.label}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="varna-bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="varna-bottom-nav-item"
          title="Exit Session"
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#B85333" }} />
          ) : (
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
          )}
          <span className="varna-bottom-nav-label">{isLoggingOut ? "..." : "Exit"}</span>
        </button>
      </nav>
    </>
  );
}

function SidebarWithParams(props: SidebarProps) {
  const searchParams = useSearchParams();
  const params = useParams();

  const clientId =
    searchParams?.get("clientId") ||
    (params?.hotelId as string) ||
    (params?.clientId as string) ||
    null;

  const currentSectionQuery = searchParams?.get("section") || null;

  return (
    <SidebarView
      {...props}
      clientId={clientId}
      currentSectionQuery={currentSectionQuery}
    />
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense
      fallback={
        <SidebarView
          {...props}
          clientId={null}
          currentSectionQuery={null}
        />
      }
    >
      <SidebarWithParams {...props} />
    </Suspense>
  );
}
