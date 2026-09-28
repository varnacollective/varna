"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Leaf,
  FileText,
  LogOut,
  ChevronRight,
  Building,
  Loader2,
} from "lucide-react";

interface GroupSidebarProps {
  userName?: string;
  userRole?: string;
  groupName?: string;
}

const NAV_ITEMS = [
  { id: "overview", label: "Group Overview", icon: LayoutDashboard, href: "/group/dashboard" },
  { id: "properties", label: "Properties", icon: Building2, href: "/group/properties" },
  { id: "suppliers", label: "Partners", icon: Users, href: "/group/suppliers" },
  { id: "impact", label: "Impact", icon: Leaf, href: "/group/impact" },
  { id: "reports", label: "Reports", icon: FileText, href: "/group/reports" },
];

export default function GroupSidebar({
  userName = "Yuvraj",
  userRole = "Group Chairperson",
  groupName = "Meridian Hotels & Resorts",
}: GroupSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const isActive = (href: string) =>
    pathname === href ||
    (href === "/group/dashboard" && (pathname === "/group" || pathname === "/group-dashboard"));

  return (
    <>
      {/* ── Desktop + Tablet Sidebar ──────────────────────────────────────────── */}
      <aside className="varna-grp-sidebar w-64 h-screen sticky top-0 flex flex-col justify-between bg-white dark:bg-[#18191D] border-r border-[#EAE5DC] dark:border-[#8C9DA8]/15 text-[#1A1F26] dark:text-[#FAF8F5] transition-colors duration-300 z-30 select-none shadow-xs shrink-0">
        {/* ── Top Branding Area ──────────────────────────────────────────────── */}
        <div>
          <div className="varna-grp-sidebar-branding border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 flex flex-col">
            {/* Varnawordmark — minimal wrapper flush with nav links */}
            <div className="flex items-center h-16 px-6">
              <Image
                src="/assets/Varnawordmark.svg"
                alt="Varna"
                width={128}
                height={40}
                priority
                className="w-28 h-auto object-contain dark:invert transition-all duration-300 scale-110 origin-left"
              />
            </div>

            <div className="px-6 pb-3">
              <div className="varna-grp-sidebar-label px-3 py-1.5 rounded-md bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-[#B85333] shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[11px] font-sans font-semibold text-[#1A1F26] dark:text-[#FAF8F5] truncate">
                    {groupName}
                  </span>
                  <span className="text-[9px] font-mono text-[#6E7781] dark:text-[#8C9DA8]">
                    GRP-001 Portfolio
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Navigation Links ────────────────────────────────────────────── */}
          <nav className="p-4 space-y-1.5">
            <div className="varna-grp-sidebar-label px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-[#6E7781] dark:text-[#8C9DA8]/70">
              Portfolio Navigation
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-sans transition-all duration-200 group
                    ${
                      active
                        ? "bg-[#B85333]/10 dark:bg-[#B85333]/20 text-[#B85333] dark:text-[#D4705A] font-semibold border border-[#B85333]/30 shadow-xs"
                        : "text-[#6E7781] dark:text-[#8C9DA8] hover:bg-[#FAF8F5] dark:hover:bg-[#22252B] hover:text-[#1A1F26] dark:hover:text-[#FAF8F5]"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors shrink-0 ${
                        active
                          ? "text-[#B85333] dark:text-[#D4705A]"
                          : "text-[#6E7781] dark:text-[#8C9DA8] group-hover:text-[#1A1F26] dark:group-hover:text-[#FAF8F5]"
                      }`}
                    />
                    <span className="varna-grp-sidebar-label">{item.label}</span>
                  </div>
                  {active && (
                    <ChevronRight className="varna-grp-sidebar-label w-3.5 h-3.5 text-[#B85333] dark:text-[#D4705A]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── User Profile & Logout Block ──────────────────────────────────── */}
        <div className="varna-grp-sidebar-profile p-4 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 space-y-3 bg-[#FAF8F5]/50 dark:bg-[#22252B]/40">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#1A1F26] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#1A1F26] flex items-center justify-center font-sans font-semibold text-xs shadow-xs shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-sans font-semibold text-[#1A1F26] dark:text-[#FAF8F5] truncate">
                {userName}
              </span>
              <span className="text-[10px] text-[#6E7781] dark:text-[#8C9DA8] truncate">
                {userRole}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-[#18191D] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#6E7781] dark:text-[#8C9DA8] hover:text-[#B85333] dark:hover:text-[#D4705A] hover:border-[#B85333]/30 transition-all text-xs font-sans font-medium disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar (hidden on desktop/tablet via CSS) ── */}
      <nav className="varna-bottom-nav" aria-label="Group portfolio navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`varna-bottom-nav-item${active ? " varna-bottom-nav-item--active" : ""}`}
              title={item.label}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
              <span className="varna-bottom-nav-label">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="varna-bottom-nav-item"
          title="Log out"
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
