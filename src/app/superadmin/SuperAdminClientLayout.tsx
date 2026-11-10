"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Mail,
  GitBranch,
  Flag,
  FileCheck,
  BarChart3,
  Building2,
  FileSpreadsheet,
  Award,
  ShoppingBag,
  KeyRound,
  Bell,
  UserCog,
  FileText,
  ClipboardList,
  LogOut,
  ExternalLink,
  Database,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";

type NavChild = { name: string; href: string };
type NavGroup = {
  label: string;
  items: { name: string; href: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; children?: NavChild[] }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [
      { name: "Overview", href: "/superadmin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Partners",
    items: [
      { name: "Clients", href: "/superadmin/partners/clients", icon: Users },
      { name: "Suppliers", href: "/superadmin/partners/suppliers", icon: Package },
      { name: "Invitations", href: "/superadmin/partners/invitations", icon: Mail },
    ],
  },
  {
    label: "Assessment",
    items: [
      { name: "Pipeline", href: "/superadmin/assessment/pipeline", icon: GitBranch },
      { name: "Review Queue", href: "/superadmin/assessment/review-queue", icon: Flag },
      { name: "Certificates", href: "/superadmin/certificates", icon: FileCheck },
      { name: "Scoring & Approval", href: "/superadmin/assessment/scoring", icon: BarChart3 },
    ],
  },
  {
    label: "Data",
    items: [
      { name: "Enterprises", href: "/superadmin/enterprises", icon: Building2 },
      { name: "Assessment Inputs", href: "/superadmin/assessment-inputs", icon: FileSpreadsheet },
      { name: "Scores Summary", href: "/superadmin/scores-summary", icon: Award },
      { name: "Client Summary", href: "/superadmin/client-summary", icon: Users },
      { name: "Orders", href: "/superadmin/orders", icon: ShoppingBag },
      { name: "Credentials", href: "/superadmin/credentials", icon: KeyRound },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Notifications", href: "/superadmin/admin/notifications", icon: Bell },
      { name: "Users & Roles", href: "/superadmin/admin/users", icon: UserCog },
      { name: "Templates & Settings", href: "/superadmin/admin/templates", icon: FileText },
      { name: "Audit Log", href: "/superadmin/admin/audit-log", icon: ClipboardList },
    ],
  },
];

export default function SuperAdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("varna_superadmin");
    localStorage.removeItem("varna_client");
    router.push("/");
  };

  if (!mounted) return null;

  const isActive = (href: string) =>
    href === "/superadmin"
      ? pathname === "/superadmin"
      : pathname.startsWith(href);

  // Breadcrumb
  const pathParts = pathname.split("/").filter(Boolean);
  const breadcrumb = pathParts.map((part, i) => ({
    label: part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + pathParts.slice(0, i + 1).join("/"),
  }));

  return (
    <div className="sa-root min-h-screen flex" style={{ background: "var(--sa-canvas)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(30,26,22,0.4)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sa-sidebar fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ width: "256px" }}
      >
        {/* Logo area */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--sa-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <Link href="/superadmin" className="flex flex-col gap-1.5">
              <Image
                src="/Varnawordmark.svg"
                alt="Varna"
                width={110}
                height={28}
                className="object-contain"
                priority
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
              style={{ color: "var(--sa-muted)" }}
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            style={{
              display: "inline-flex",
              marginTop: "10px",
              padding: "2px 8px",
              background: "var(--sa-accent-tint)",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--sa-accent)",
            }}
          >
            Super Admin
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: "8px 12px" }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: "4px" }}>
              {group.label && (
                <div className="sa-nav-group-label">{group.label}</div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`sa-nav-item ${active ? "active" : ""}`}
                    style={{ marginBottom: "2px" }}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ opacity: active ? 1 : 0.6 }} />
                    <span style={{ flex: 1 }}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--sa-border)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* Live sync indicator */}
          <div className="sa-live-dot" style={{ padding: "0 4px" }}>
            PostgreSQL · Live Sync
          </div>

          <Link
            href="/dashboard"
            className="sa-nav-item"
            style={{ fontSize: "12px" }}
          >
            <ExternalLink className="w-3.5 h-3.5" style={{ opacity: 0.5 }} />
            View Client Dashboard
          </Link>

          <button
            onClick={handleLogout}
            className="sa-nav-item w-full text-left"
            style={{ fontSize: "12px", color: "var(--sa-danger)" }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div
        className="flex flex-col flex-1 min-h-screen"
        style={{ marginLeft: "256px" }}
      >
        {/* Top bar */}
        <header className="sa-topbar sticky top-0 z-30">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mr-2"
            style={{ color: "var(--sa-muted)" }}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 flex-1" style={{ fontSize: "13px", color: "var(--sa-muted)" }}>
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={crumb.href}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
                {i === breadcrumb.length - 1 ? (
                  <span style={{ color: "var(--sa-ink)", fontWeight: 500 }}>{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} style={{ color: "var(--sa-muted)" }} className="hover:underline">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sa-btn-secondary"
            style={{ fontSize: "12px", padding: "6px 12px", gap: "6px" }}
          >
            <Search className="w-3.5 h-3.5" />
            <span style={{ color: "var(--sa-muted)" }}>Search</span>
            <kbd
              style={{
                background: "var(--sa-sand)",
                border: "1px solid var(--sa-border)",
                borderRadius: "4px",
                padding: "1px 4px",
                fontSize: "10px",
                fontFamily: "ui-monospace,monospace",
                color: "var(--sa-muted)",
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Notification bell (placeholder) */}
          <button
            className="relative"
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--sa-radius-sm)",
              background: "transparent",
              border: "1px solid var(--sa-border)",
              color: "var(--sa-muted)",
              cursor: "pointer",
            }}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        </header>

        {/* Command palette overlay */}
        {searchOpen && (
          <>
            <div
              className="sa-overlay"
              onClick={() => setSearchOpen(false)}
            />
            <div
              style={{
                position: "fixed",
                top: "80px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "480px",
                maxWidth: "90vw",
                background: "var(--sa-white)",
                border: "1px solid var(--sa-border)",
                borderRadius: "var(--sa-radius-lg)",
                boxShadow: "var(--sa-shadow-lg)",
                zIndex: 60,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--sa-border)" }}>
                <Search className="w-4 h-4" style={{ color: "var(--sa-muted)", flexShrink: 0 }} />
                <input
                  autoFocus
                  placeholder="Search pages, partners, suppliers…"
                  className="sa-input"
                  style={{ border: "none", padding: "0", boxShadow: "none", fontSize: "14px" }}
                />
                <kbd
                  style={{ fontSize: "10px", fontFamily: "ui-monospace,monospace", color: "var(--sa-muted)", flexShrink: 0 }}
                  onClick={() => setSearchOpen(false)}
                >
                  ESC
                </kbd>
              </div>
              <div style={{ padding: "8px", maxHeight: "320px", overflowY: "auto" }}>
                {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSearchOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: "var(--sa-radius-sm)",
                        fontSize: "13px",
                        color: "var(--sa-ink-2)",
                        textDecoration: "none",
                      }}
                      className="hover:bg-[var(--sa-sand)]"
                    >
                      <Icon className="w-4 h-4" style={{ color: "var(--sa-muted)" }} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: "32px 32px 48px",
            maxWidth: "1280px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
