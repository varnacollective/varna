"use client";

import { useState, type SubmitEvent } from "react";
import { KeyRound, ShieldPlus, RefreshCw, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import type { Login } from "@/lib/auth/logins";

type Role = "client" | "group";
type Status = { type: "success" | "error"; text: string } | null;

interface Props {
  initialLogins: Login[];
  loadError: boolean;
}

const ROLE_LABEL: Record<NonNullable<Login["role"]>, string> = {
  superadmin: "Superadmin",
  client: "Hotel",
  group: "Group",
};

const inputClass =
  "w-full px-3.5 py-2.5 bg-[#141517] border border-slate-mist/25 text-warm-stone text-sm placeholder-slate-mist/40 focus:border-warm-stone focus-visible:outline-2 focus-visible:outline-warm-stone outline-none transition-colors";
const labelClass = "text-[10px] font-semibold tracking-widest uppercase text-warm-stone/70";

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function LoginsClient({ initialLogins, loadError }: Props) {
  const [logins, setLogins] = useState<Login[]>(initialLogins);
  const [role, setRole] = useState<Role>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientId, setClientId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<Status>(
    loadError ? { type: "error", text: "Could not load the logins. Please refresh the page." } : null
  );

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/superadmin/logins");
      const data = (await res.json()) as { logins?: Login[]; error?: string };
      if (res.ok && data.logins) setLogins(data.logins);
      else setStatus({ type: "error", text: data.error ?? "Could not load the logins." });
    } catch {
      setStatus({ type: "error", text: "Network error. Please try again." });
    } finally {
      setRefreshing(false);
    }
  }

  async function create(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    setSaving(true);
    const body = role === "client" ? { role, email, password, clientId } : { role, email, password, clientId, groupName };
    try {
      const res = await fetch("/api/superadmin/logins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { login?: Login; error?: string };
      if (res.ok && data.login) {
        const created = data.login;
        setLogins((prev) => [created, ...prev]);
        setStatus({ type: "success", text: `Login created for ${created.clientName ?? created.email}.` });
        setEmail("");
        setPassword("");
        setClientId("");
        setGroupName("");
      } else {
        setStatus({ type: "error", text: data.error ?? "Could not create the login." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = email && password.length >= 6 && clientId && (role === "client" || groupName);

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-slate-mist/20 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-5 h-5 text-deep-clay dark:text-warm-stone" aria-hidden="true" />
          <h1 className="text-2xl font-sans font-medium text-warm-stone tracking-tight">Hotel Client Access & Credentials</h1>
        </div>
        <p className="text-xs text-slate-mist font-light">
          Create logins for hotels and groups. People sign in with their email and password.
        </p>
      </div>

      <section aria-labelledby="new-login" className="bg-[#1E2024] border border-slate-mist/25 p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-2.5 border-b border-slate-mist/15 pb-4 mb-6">
          <ShieldPlus className="w-4 h-4 text-warm-stone" aria-hidden="true" />
          <h2 id="new-login" className="text-base font-sans font-medium text-warm-stone tracking-tight">New Login</h2>
        </div>

        <form onSubmit={(e) => void create(e)} className="space-y-5">
          <fieldset className="space-y-1.5">
            <legend className={labelClass}>Login for</legend>
            <div className="flex gap-4 pt-1">
              {(["client", "group"] as const).map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm text-warm-stone cursor-pointer">
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
                  {r === "client" ? "A hotel" : "A group"}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="login-client-id" className={labelClass}>{role === "client" ? "Hotel client ID" : "Group ID"}</label>
              <input id="login-client-id" type="text" value={clientId} onChange={(e) => setClientId(e.target.value)}
                placeholder={role === "client" ? "e.g. CLT-012" : "e.g. GRP-002"} className={inputClass} required autoComplete="off" />
              {role === "client" && <p className="text-[11px] text-slate-mist">The hotel&apos;s name and group are taken from its record.</p>}
            </div>
            {role === "group" && (
              <div className="space-y-1.5">
                <label htmlFor="login-group-name" className={labelClass}>Group name</label>
                <input id="login-group-name" type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Exactly as on its hotels" className={inputClass} required autoComplete="off" />
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="login-email-new" className={labelClass}>Email</label>
              <input id="login-email-new" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" className={inputClass} required autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="login-password-new" className={labelClass}>Password</label>
              <input id="login-password-new" type="text" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters" className={`${inputClass} font-mono`} required minLength={6} autoComplete="new-password" />
            </div>
          </div>

          <div aria-live="polite">
            {status && (
              <p className={`text-xs p-3 flex items-center gap-2 border ${status.type === "success"
                ? "bg-sage-mineral/10 border-sage-mineral/30 text-warm-stone"
                : "bg-red-950/20 border-red-800/30 text-red-200"}`}>
                {status.type === "success"
                  ? <CheckCircle2 className="w-4 h-4 text-sage-mineral shrink-0" aria-hidden="true" />
                  : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />}
                <span>{status.text}</span>
              </p>
            )}
          </div>

          <button type="submit" disabled={saving || !canSubmit}
            className="px-6 py-3 bg-warm-stone text-carbon-ink hover:bg-[#E4DEC9] font-sans font-medium uppercase tracking-widest text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-sm">
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{saving ? "Creating…" : "Create Login"}</span>
          </button>
        </form>
      </section>

      <section aria-labelledby="all-logins" className="bg-[#1E2024] border border-slate-mist/25">
        <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-mist/15">
          <h2 id="all-logins" className="text-base font-sans font-medium text-warm-stone tracking-tight">
            Logins <span className="text-slate-mist font-normal">({logins.length})</span>
          </h2>
          <button type="button" onClick={() => void refresh()} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-warm-stone/80 hover:text-white disabled:opacity-40 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-widest text-slate-mist">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                <th scope="col" className="px-4 py-3 font-semibold">Client ID</th>
                <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Last sign-in</th>
              </tr>
            </thead>
            <tbody className="text-warm-stone">
              {logins.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-mist">No logins yet.</td></tr>
              ) : logins.map((l) => (
                <tr key={l.id} className="border-t border-slate-mist/10">
                  <td className="px-4 py-3 break-all">{l.email}</td>
                  <td className="px-4 py-3">{l.role ? ROLE_LABEL[l.role] : <span className="text-red-300">Not set up</span>}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.clientId ?? "—"}</td>
                  <td className="px-4 py-3">{l.clientName ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-mist">{formatDate(l.lastSignInAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
