import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  Building2,
  FileSpreadsheet,
  Award,
  Users,
  ShoppingBag,
  KeyRound,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import LinkGenerator from "@/components/SuperAdmin/LinkGenerator";

export const revalidate = 0;

export default async function SuperAdminOverviewPage() {
  const supabase = await createClient();

  // Fetch counts from each primary table
  const [
    { count: enterprisesCount },
    { count: inputsCount },
    { count: scoresCount },
    { count: clientsCount },
    { count: ordersCount },
    { count: credentialsCount },
  ] = await Promise.all([
    supabase.from("enterprise_master").select("*", { count: "exact", head: true }),
    supabase.from("assessment_inputs").select("*", { count: "exact", head: true }),
    supabase.from("scores_summary").select("*", { count: "exact", head: true }),
    supabase.from("client_summary").select("*", { count: "exact", head: true }),
    supabase.from("order_register").select("*", { count: "exact", head: true }),
    supabase.from("client_credentials").select("*", { count: "exact", head: true }),
  ]);

  const TABLES = [
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

  return (
    <div className="space-y-8 font-sans">
      {/* Overview Banner */}
      <div className="bg-[#1C1D21] border border-slate-mist/20 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-deep-clay rotate-45" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-mist">
              Varna Master Control Console
            </span>
          </div>
          <h1 className="text-3xl font-serif font-light text-warm-stone tracking-tight">
            Database Administration
          </h1>
          <p className="text-xs text-slate-mist font-light mt-1 max-w-2xl leading-relaxed">
            Directly view and edit live Supabase tables in a spreadsheet grid. Changes are synced to PostgreSQL in real time.
          </p>
        </div>

        {/* Database Health Pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#131416] border border-slate-mist/20 px-5 py-3.5">
          <div className="w-2.5 h-2.5 rounded-full bg-sage-mineral animate-pulse" />
          <div className="text-left">
            <p className="text-[10px] font-mono uppercase tracking-widest text-warm-stone/80">
              PostgreSQL Connected
            </p>
            <p className="text-[9px] text-slate-mist font-mono">
              Schema: public &bull; RLS Active &bull; Instant Sync
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-serif font-light text-warm-stone tracking-tight">
            Supabase Core Tables
          </h2>
          <span className="text-[10px] font-mono text-slate-mist">
            Select a table to open spreadsheet editor
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TABLES.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.table}
                href={t.href}
                className="bg-[#1C1D21] border border-slate-mist/20 hover:border-warm-stone/40 p-6 flex flex-col justify-between transition-all duration-200 group hover:shadow-xl hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 border border-slate-mist/25 bg-black/20 flex items-center justify-center text-warm-stone group-hover:border-warm-stone/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-serif font-light text-warm-stone group-hover:text-white transition-colors">
                      {t.count}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-light text-warm-stone mb-1 group-hover:text-white transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-mist mb-2">
                    {t.table}
                  </p>
                  <p className="text-xs text-slate-mist/80 font-light leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-mist/10 flex items-center justify-between text-xs text-warm-stone/70 group-hover:text-warm-stone">
                  <span className="text-[10px] font-mono uppercase tracking-widest">
                    Open Spreadsheet Grid
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Assessment Link Generator */}
      <LinkGenerator />

      {/* Quick Security Architecture Notes */}
      <div className="bg-[#18191B] border border-slate-mist/15 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-sage-mineral shrink-0" />
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-stone">
              Spreadsheet Editing Safety
            </h4>
            <p className="text-[11px] text-slate-mist font-light">
              Primary key columns are locked by default to protect relational integrity. Type conversion preserves numbers and booleans automatically.
            </p>
          </div>
        </div>

        <Link
          href="/superadmin/credentials"
          className="px-4 py-2 bg-warm-stone text-carbon-ink hover:bg-[#E4DEC9] text-xs font-serif uppercase tracking-widest whitespace-nowrap transition-colors"
        >
          Manage Client Credentials &rarr;
        </Link>
      </div>
    </div>
  );
}
