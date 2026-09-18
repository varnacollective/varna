"use client";

import React from "react";
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
} from "lucide-react";

interface GroupSidebarProps {
  userName?: string;
  userRole?: string;
  groupName?: string;
}

export default function GroupSidebar({
  userName = "Yuvraj",
  userRole = "Group Chairperson",
  groupName = "Meridian Hotels & Resorts",
}: GroupSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const navItems = [
    { id: "overview", label: "Group Overview", icon: LayoutDashboard, href: "/group/dashboard" },
    { id: "properties", label: "Properties", icon: Building2, href: "/group/properties" },
    { id: "suppliers", label: "Suppliers", icon: Users, href: "/group/suppliers" },
    { id: "impact", label: "Impact", icon: Leaf, href: "/group/impact" },
    { id: "reports", label: "Reports", icon: FileText, href: "/group/reports" },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col justify-between bg-white dark:bg-[#18191D] border-r border-[#EAE5DC] dark:border-[#8C9DA8]/15 text-[#1A1F26] dark:text-[#FAF8F5] transition-colors duration-300 z-30 select-none shadow-xs shrink-0">
      {/* ── Top Branding Area ──────────────────────────────────────────────── */}
      <div>
        <div className="p-6 border-b border-[#EAE5DC] dark:border-[#8C9DA8]/15 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 p-1.5 shadow-xs">
              <Image
                src="/varna-logo.svg"
                alt="Varna Collective Logo"
                width={28}
                height={28}
                className="object-contain dark:invert"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-[#1A1F26] dark:text-[#FAF8F5]">
                VARNA
              </span>
              <span className="font-sans text-[10px] tracking-wider text-[#6E7781] dark:text-[#8C9DA8] uppercase">
                Collective
              </span>
            </div>
          </div>

          <div className="mt-1 px-3 py-1.5 rounded-md bg-[#FAF8F5] dark:bg-[#22252B] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-[#B85333]" />
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

        {/* ── Navigation Links ──────────────────────────────────────────────── */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-[#6E7781] dark:text-[#8C9DA8]/70">
            Portfolio Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/group/dashboard" && (pathname === "/group" || pathname === "/group-dashboard"));
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-sans transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-[#B85333]/10 dark:bg-[#B85333]/20 text-[#B85333] dark:text-[#D4705A] font-semibold border border-[#B85333]/30 shadow-xs"
                      : "text-[#6E7781] dark:text-[#8C9DA8] hover:bg-[#FAF8F5] dark:hover:bg-[#22252B] hover:text-[#1A1F26] dark:hover:text-[#FAF8F5]"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-[#B85333] dark:text-[#D4705A]"
                        : "text-[#6E7781] dark:text-[#8C9DA8] group-hover:text-[#1A1F26] dark:group-hover:text-[#FAF8F5]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#B85333] dark:text-[#D4705A]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── User Profile & Logout Block ────────────────────────────────────── */}
      <div className="p-4 border-t border-[#EAE5DC] dark:border-[#8C9DA8]/15 space-y-3 bg-[#FAF8F5]/50 dark:bg-[#22252B]/40">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#1A1F26] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#1A1F26] flex items-center justify-center font-sans font-semibold text-xs shadow-xs">
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-[#18191D] border border-[#EAE5DC] dark:border-[#8C9DA8]/20 text-[#6E7781] dark:text-[#8C9DA8] hover:text-[#B85333] dark:hover:text-[#D4705A] hover:border-[#B85333]/30 transition-all text-xs font-sans font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
