"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DataGrid from "@/components/SuperAdmin/DataGrid";
import {
  KeyRound,
  ShieldPlus,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CredentialsClientProps {
  initialCredentials: any[];
}

export default function CredentialsClient({ initialCredentials }: CredentialsClientProps) {
  const supabase = createClient();
  const [credentials, setCredentials] = useState<any[]>(initialCredentials || []);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate a random secure password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setLoading(true);

    const cleanClientId = clientId.trim().toUpperCase();
    const cleanClientName = clientName.trim();
    const cleanPassword = password.trim();

    if (!cleanClientId || !cleanPassword) {
      setStatusMessage({ type: "error", text: "Client ID and password are required." });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("client_credentials")
        .insert([
          {
            client_id: cleanClientId,
            client_name: cleanClientName || cleanClientId,
            password: cleanPassword,
          },
        ])
        .select();

      if (error) {
        console.error("Supabase error creating credential:", error);
        setStatusMessage({
          type: "error",
          text: error.message || "Failed to create client credential. Client ID may already exist.",
        });
      } else if (data && data.length > 0) {
        setCredentials((prev) => [data[0], ...prev]);
        setStatusMessage({
          type: "success",
          text: `Successfully created credentials for ${cleanClientName || cleanClientId}.`,
        });
        setClientId("");
        setClientName("");
        setPassword("");
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reloadCredentials = async () => {
    const { data } = await supabase
      .from("client_credentials")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setCredentials(data);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Page Title & Context */}
      <div className="border-b border-slate-mist/20 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-5 h-5 text-deep-clay dark:text-warm-stone" />
          <h1 className="text-2xl font-sans font-medium text-warm-stone tracking-tight">
            Hotel Client Access & Credentials
          </h1>
        </div>
        <p className="text-xs text-slate-mist font-light">
          Generate, audit, and revoke authentication tokens for hospitality clients logging into the portal.
        </p>
      </div>

      {/* Creation Card & Security Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate New Client Login Form */}
        <div className="lg:col-span-2 bg-[#1E2024] border border-slate-mist/25 p-6 sm:p-8 shadow-md relative">
          <div className="flex items-center justify-between border-b border-slate-mist/15 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <ShieldPlus className="w-4 h-4 text-warm-stone" />
              <h2 className="text-base font-sans font-medium text-warm-stone tracking-tight">
                Generate New Client Login
              </h2>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-mist">
              Table: client_credentials
            </span>
          </div>

          <form onSubmit={handleCreateCredential} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-warm-stone/70">
                  Client ID (Unique)
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. CLT-005"
                  className="w-full px-3.5 py-2.5 bg-[#141517] border border-slate-mist/25 text-warm-stone text-xs placeholder-slate-mist/40 focus:border-warm-stone outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-warm-stone/70">
                  Hotel / Enterprise Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Taj West End Bengaluru"
                  className="w-full px-3.5 py-2.5 bg-[#141517] border border-slate-mist/25 text-warm-stone text-xs placeholder-slate-mist/40 focus:border-warm-stone outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-warm-stone/70">
                  Access Password
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="flex items-center gap-1 text-[10px] text-deep-clay dark:text-warm-stone/80 hover:text-white transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Secure Token</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter or generate temporary password"
                  className="w-full px-3.5 py-2.5 bg-[#141517] border border-slate-mist/25 text-warm-stone text-xs font-mono placeholder-slate-mist/40 focus:border-warm-stone outline-none transition-colors pr-10"
                  required
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(password)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-mist hover:text-warm-stone"
                    title="Copy Password"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {copied && (
                <p className="text-[10px] text-sage-mineral font-mono">Password copied to clipboard!</p>
              )}
            </div>

            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-xs p-3 flex items-center gap-2 border ${
                    statusMessage.type === "success"
                      ? "bg-sage-mineral/10 border-sage-mineral/30 text-warm-stone"
                      : "bg-red-950/20 border-red-800/30 text-red-200"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-sage-mineral shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !clientId || !password}
              className="px-6 py-3 bg-warm-stone text-carbon-ink hover:bg-[#E4DEC9] active:scale-[0.99] font-sans font-medium uppercase tracking-widest text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <span>Generating and Storing...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Issue Client Login</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Instruction Card */}
        <div className="bg-[#1A1C1F] border border-slate-mist/20 p-6 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-slate-mist uppercase block mb-1">
              Access Governance
            </span>
            <h3 className="text-base font-sans font-medium text-warm-stone tracking-tight mb-3">
              Authentication Architecture
            </h3>
            <p className="text-xs text-slate-mist font-light leading-relaxed mb-4">
              Credentials issued here enable hotel clients to view their consolidated ESG metrics, supplier impact scores, and download third-party verified sustainability certificates.
            </p>
            <div className="space-y-2.5 text-xs text-warm-stone/80">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-deep-clay rotate-45 mt-1.5 shrink-0" />
                <span>Client ID is case-insensitive for easy client access.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-sage-mineral rotate-45 mt-1.5 shrink-0" />
                <span>Passwords can be modified inline anytime in the grid below.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-warm-stone rotate-45 mt-1.5 shrink-0" />
                <span>Deleting a row immediately revokes portal access for that client.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-mist/15 text-[10px] text-slate-mist/70 font-mono">
            Direct sync &bull; Table client_credentials
          </div>
        </div>
      </div>

      {/* Active Client Credentials Spreadsheet Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-sans font-medium text-warm-stone tracking-tight">
            Active Client Access Tokens & Passwords
          </h2>
          <span className="text-[10px] text-slate-mist font-mono">
            Click any cell in the table below to edit credentials in real time
          </span>
        </div>

        <DataGrid
          tableName="client_credentials"
          title="Client Credentials Register"
          subtitle="Direct view of the client_credentials table. Edits save to Supabase automatically."
          initialData={credentials}
          primaryKeyColumn="id"
          readOnlyColumns={["id", "created_at"]}
          allowDelete={true}
          onRefresh={reloadCredentials}
        />
      </div>
    </div>
  );
}
