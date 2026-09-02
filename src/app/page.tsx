"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Remove any old cached client data to ensure fresh fetch
    localStorage.removeItem("varna_client");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientId.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      // Handle Superadmin redirect
      if (data.isSuperAdmin || data.redirectUrl === "/superadmin" || clientId.trim().toLowerCase() === "superadmin") {
        localStorage.setItem("varna_superadmin", "true");
        router.push("/superadmin");
        return;
      }

      // Ensure local storage is cleared
      localStorage.removeItem("varna_client");
      localStorage.removeItem("varna_superadmin");
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between p-8 bg-warm-stone dark:bg-[#17181A] transition-colors duration-300 font-sans text-carbon-ink dark:text-warm-stone relative selection:bg-deep-clay selection:text-warm-stone">
      {/* Top Header/Toggle Action */}
      <header className="flex justify-between items-center w-full max-w-7xl mx-auto">
        <div className="text-[10px] tracking-[0.3em] font-medium uppercase text-slate-mist dark:text-warm-stone/50">
          Varna Collective &copy; 2026
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="border border-slate-mist/30 dark:border-warm-stone/20 px-4 py-1.5 text-[10px] tracking-widest uppercase hover:bg-slate-mist/10 dark:hover:bg-warm-stone/10 transition-colors duration-200"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Main Card: sharp borders, solid color, no glassmorphism */}
          <div className="bg-[#E4DEC9] dark:bg-[#222326] border border-slate-mist/40 dark:border-midnight-blue shadow-lg p-10 relative">
            
            {/* Wordmark and Header */}
            <div className="flex flex-col items-start mb-8 border-b border-slate-mist/20 dark:border-midnight-blue pb-6 w-full">
              <span className="text-[10px] font-medium tracking-[0.3em] text-deep-clay dark:text-warm-stone/70 uppercase mb-2">
                Varna Collective
              </span>
              <h1 className="text-3.5xl font-serif tracking-tighter text-carbon-ink dark:text-warm-stone font-light leading-[1.1] mb-2">
                Sustainability Dashboard
              </h1>
              <p className="text-xs text-slate-mist dark:text-slate-mist/80 leading-relaxed font-light mt-1">
                Enterprise ESG intelligence and carbon transparency platform.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-carbon-ink/80 dark:text-warm-stone/80">
                  Client Identifier
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-stone/40 dark:bg-[#17181A]/50 border border-slate-mist/35 dark:border-midnight-blue text-carbon-ink dark:text-warm-stone placeholder-carbon-ink/40 dark:placeholder-warm-stone/30 focus:border-deep-clay dark:focus:border-warm-stone outline-none transition-colors duration-250 font-sans text-sm rounded-none"
                  placeholder="Enter Client ID (e.g., CLT-001)"
                  required
                />
              </div>

              <div className="space-y-2 relative">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-carbon-ink/80 dark:text-warm-stone/80">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-stone/40 dark:bg-[#17181A]/50 border border-slate-mist/35 dark:border-midnight-blue text-carbon-ink dark:text-warm-stone placeholder-carbon-ink/40 dark:placeholder-warm-stone/30 focus:border-deep-clay dark:focus:border-warm-stone outline-none transition-colors duration-250 font-sans text-sm pr-11 rounded-none"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-mist dark:text-warm-stone/50 hover:text-carbon-ink dark:hover:text-warm-stone"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-deep-clay dark:text-red-400 bg-deep-clay/10 dark:bg-red-950/20 border border-deep-clay/20 dark:border-red-900/30 p-3.5 flex items-center gap-2 rounded-none"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || !clientId || !password}
                className="w-full py-3.5 bg-deep-clay hover:bg-[#683315] dark:bg-warm-stone dark:text-carbon-ink dark:hover:bg-[#E4DEC9] text-warm-stone font-serif tracking-widest uppercase text-xs flex items-center justify-between px-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-none group shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-warm-stone dark:text-carbon-ink" />
                    <span>Processing Authentication</span>
                  </span>
                ) : (
                  <>
                    <span>Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>


          </div>
        </motion.div>
      </main>

      {/* Footer information */}
      <footer className="text-center text-[10px] tracking-widest uppercase text-slate-mist/70 dark:text-warm-stone/40 max-w-7xl mx-auto w-full">
        Private Channel &bull; Encrypted &bull; Sustainability Intel
      </footer>
    </div>
  );
}
