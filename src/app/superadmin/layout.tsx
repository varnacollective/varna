"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  FileSpreadsheet,
  Award,
  Users,
  ShoppingBag,
  KeyRound,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Database,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/superadmin",
    icon: LayoutDashboard,
    table: "System Stats",
  },
  {
    name: "Enterprises",
    href: "/superadmin/enterprises",
    icon: Building2,
    table: "enterprise_master",
  },
  {
    name: "Assessment Inputs",
    href: "/superadmin/assessment-inputs",
    icon: FileSpreadsheet,
    table: "assessment_inputs",
  },
  {
    name: "Scores Summary",
    href: "/superadmin/scores-summary",
    icon: Award,
    table: "scores_summary",
  },
  {
    name: "Client Summary",
    href: "/superadmin/client-summary",
    icon: Users,
    table: "client_summary",
  },
  {
    name: "Orders",
    href: "/superadmin/orders",
    icon: ShoppingBag,
    table: "order_register",
  },
  {
    name: "Credentials",
    href: "/superadmin/credentials",
    icon: KeyRound,
    table: "client_credentials",
  },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("varna_superadmin");
    localStorage.removeItem("varna_client");
    router.push("/login");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-[#161719] text-warm-stone font-sans selection:bg-deep-clay selection:text-warm-stone">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left-Hand Super Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#1C1D20] border-r border-slate-mist/20 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-mist/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/varna-logo.svg"
                  alt="Varna Collective"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                  priority
                />
                <span className="text-[10px] font-semibold tracking-[0.25em] text-warm-stone/80 uppercase">
                  Varna Collective
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-slate-mist hover:text-warm-stone"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h1 className="text-xl font-serif font-light text-warm-stone tracking-tight mt-2">
              Super Admin
            </h1>
            <p className="text-[10px] font-mono text-slate-mist uppercase tracking-widest mt-0.5">
              Direct Database Portal
            </p>
          </div>

          {/* Database Tables Navigation Menu */}
          <div className="px-3 py-6 space-y-1">
            <div className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-mist/70">
              Supabase Core Tables
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs transition-all duration-150 group ${
                    isActive
                      ? "bg-deep-clay text-warm-stone font-medium shadow-sm"
                      : "text-warm-stone/70 hover:text-warm-stone hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-warm-stone" : "text-slate-mist group-hover:text-warm-stone"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span
                    className={`text-[8px] font-mono tracking-wider ${
                      isActive ? "text-warm-stone/80" : "text-slate-mist/60 group-hover:text-slate-mist"
                    }`}
                  >
                    {item.table}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Sidebar Info & Logout */}
        <div className="p-4 border-t border-slate-mist/15 space-y-3">
          {/* Live DB Pill */}
          <div className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-slate-mist/15 text-[10px] text-slate-mist">
            <Database className="w-3.5 h-3.5 text-sage-mineral" />
            <span className="font-mono truncate">PostgreSQL &bull; Live Sync</span>
          </div>

          {/* Client Dashboard Link */}
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-mist hover:text-warm-stone transition-colors group"
            title="Open Client Dashboard View"
          >
            <span className="text-[11px]">View Client Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-mist group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-red-300 hover:text-red-200 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 transition-colors cursor-pointer"
          >
            <span className="font-serif tracking-wider uppercase text-[10px]">Logout Superadmin</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#18191B]/95 backdrop-blur border-b border-slate-mist/20 px-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 md:hidden text-slate-mist hover:text-warm-stone"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-mist">
              <span className="font-mono text-[10px] tracking-widest uppercase">Super Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-mist/40" />
              <span className="text-warm-stone font-medium capitalize">
                {pathname === "/superadmin"
                  ? "Overview Console"
                  : pathname.replace("/superadmin/", "").replace("-", " ")}
              </span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-deep-clay/10 border border-deep-clay/30 text-[10px] text-warm-stone font-mono uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3 text-deep-clay dark:text-warm-stone" />
              <span>Full R/W Access</span>
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 border border-slate-mist/20 hover:border-slate-mist text-slate-mist hover:text-warm-stone transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
