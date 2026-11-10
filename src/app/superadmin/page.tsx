import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  Building2,
  FileSpreadsheet,
  Award,
  Users,
  ShoppingBag,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Mail,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export const revalidate = 0;

export default async function SuperAdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: enterprisesCount },
    { count: inputsCount },
    { count: scoresCount },
    { count: clientsCount },
    { count: ordersCount },
    { count: credentialsCount },
    { count: invitationsCount },
    { count: suppliersCount },
    { count: pendingDocsCount },
  ] = await Promise.all([
    supabase.from("enterprise_master").select("*", { count: "exact", head: true }),
    supabase.from("assessment_inputs").select("*", { count: "exact", head: true }),
    supabase.from("scores_summary").select("*", { count: "exact", head: true }),
    supabase.from("client_summary").select("*", { count: "exact", head: true }),
    supabase.from("order_register").select("*", { count: "exact", head: true }),
    supabase.from("client_credentials").select("*", { count: "exact", head: true }),
    Promise.resolve(supabase.from("partner_invitations").select("*", { count: "exact", head: true })).then(r => ({ count: r.count })).catch(() => ({ count: 0 })),
    Promise.resolve(supabase.from("partner_suppliers").select("*", { count: "exact", head: true })).then(r => ({ count: r.count })).catch(() => ({ count: 0 })),
    Promise.resolve(supabase.from("partner_documents").select("*", { count: "exact", head: true }).eq("status", "awaiting_verification")).then(r => ({ count: r.count })).catch(() => ({ count: 0 })),
  ]);

  const DATA_TABLES = [
    {
      title: "Enterprises Directory",
      table: "enterprise_master",
      href: "/superadmin/enterprises",
      icon: Building2,
      count: enterprisesCount ?? 0,
      description: "Master registry of vetted artisan and ethical manufacturer enterprises.",
    },
    {
      title: "Assessment Inputs",
      table: "assessment_inputs",
      href: "/superadmin/assessment-inputs",
      icon: FileSpreadsheet,
      count: inputsCount ?? 0,
      description: "Supplier self-assessment submissions, gender balance, and wage ratios.",
    },
    {
      title: "Scores Summary",
      table: "scores_summary",
      href: "/superadmin/scores-summary",
      icon: Award,
      count: scoresCount ?? 0,
      description: "Varna ratings, ESGC pillar scores, and evaluator qualitative narratives.",
    },
    {
      title: "Client Summary",
      table: "client_summary",
      href: "/superadmin/client-summary",
      icon: Users,
      count: clientsCount ?? 0,
      description: "Overview KPI benchmarks: avoided carbon, total spend, and workforce ratio.",
    },
    {
      title: "Orders Register",
      table: "order_register",
      href: "/superadmin/orders",
      icon: ShoppingBag,
      count: ordersCount ?? 0,
      description: "Line-item procurement records and fulfillment dispatch tracking.",
    },
    {
      title: "Client Credentials",
      table: "client_credentials",
      href: "/superadmin/credentials",
      icon: KeyRound,
      count: credentialsCount ?? 0,
      description: "Authentication tokens, client logins, and password management.",
    },
  ];

  const KPI_CARDS = [
    {
      label: "Total Invitations",
      value: invitationsCount ?? 0,
      icon: Mail,
      href: "/superadmin/partners/invitations",
      color: "var(--sa-info)",
      tint: "var(--sa-info-tint)",
    },
    {
      label: "Suppliers",
      value: suppliersCount ?? 0,
      icon: Package,
      href: "/superadmin/partners/suppliers",
      color: "var(--sa-accent)",
      tint: "var(--sa-accent-tint)",
    },
    {
      label: "Docs Awaiting Verification",
      value: pendingDocsCount ?? 0,
      icon: Clock,
      href: "/superadmin/certificates",
      color: "var(--sa-warning)",
      tint: "var(--sa-warning-tint)",
    },
    {
      label: "Enterprises in Directory",
      value: enterprisesCount ?? 0,
      icon: Building2,
      href: "/superadmin/enterprises",
      color: "var(--sa-success)",
      tint: "var(--sa-success-tint)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Page header */}
      <div>
        <h1 className="sa-page-title">Command Center</h1>
        <p style={{ marginTop: "6px", fontSize: "13px", color: "var(--sa-muted)", maxWidth: "520px", lineHeight: 1.6 }}>
          Platform-wide visibility: supplier pipeline, invitations, certificate verification, and scoring approvals.
        </p>
      </div>

      {/* KPI cards */}
      <div>
        <div className="sa-label" style={{ marginBottom: "12px" }}>Platform Overview</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {KPI_CARDS.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Link key={kpi.label} href={kpi.href} style={{ textDecoration: "none" }}>
                <div className="sa-stat-card">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--sa-radius-sm)",
                      background: kpi.tint,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                  </div>
                  <div className="sa-stat-value">{kpi.value.toLocaleString()}</div>
                  <div className="sa-stat-label">{kpi.label}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link href="/superadmin/partners/invitations?action=invite" className="sa-btn-primary">
          <Mail className="w-4 h-4" />
          + Invite Partner
        </Link>
        <Link href="/superadmin/partners/suppliers" className="sa-btn-secondary">
          <Package className="w-4 h-4" />
          View Suppliers
        </Link>
        <Link href="/superadmin/certificates" className="sa-btn-secondary">
          <CheckCircle2 className="w-4 h-4" />
          Review Certificates
        </Link>
      </div>

      {/* Data Tables section */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <div className="sa-section-title">Core Data Tables</div>
            <p style={{ fontSize: "12px", color: "var(--sa-muted)", marginTop: "2px" }}>
              Spreadsheet editors — click any card to open
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {DATA_TABLES.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.table}
                href={t.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="sa-card-interactive"
                  style={{
                    padding: "20px 24px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--sa-radius-sm)",
                        background: "var(--sa-sand)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: "var(--sa-muted)" }} />
                    </div>
                    <span
                      style={{
                        fontSize: "26px",
                        fontWeight: 300,
                        color: "var(--sa-ink)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {t.count}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--sa-ink)", marginBottom: "4px" }}>
                    {t.title}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontFamily: "ui-monospace,monospace",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--sa-caption)",
                      marginBottom: "8px",
                    }}
                  >
                    {t.table}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--sa-muted)", lineHeight: 1.5 }}>{t.description}</p>
                  <div
                    style={{
                      marginTop: "14px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--sa-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "var(--sa-accent)",
                    }}
                  >
                    Open Spreadsheet
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spreadsheet safety strip */}
      <div className="sa-info-strip">
        <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: "var(--sa-accent)" }} />
        <div>
          <span style={{ fontWeight: 600 }}>Spreadsheet Editing Safety —</span>{" "}
          Primary key columns are locked by default to protect relational integrity. Type conversion preserves numbers and booleans automatically.
        </div>
        <Link
          href="/superadmin/credentials"
          className="sa-btn-secondary"
          style={{ marginLeft: "auto", whiteSpace: "nowrap", fontSize: "12px", padding: "6px 12px" }}
        >
          Manage Credentials →
        </Link>
      </div>
    </div>
  );
}
