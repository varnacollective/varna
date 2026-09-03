"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import BrandWatermark from "@/components/ui/BrandWatermark";

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
        setError(data.error || "Authentication failed. Please verify credentials.");
        setLoading(false);
        return;
      }

      // Handle Superadmin redirect
      if (data.isSuperAdmin || data.redirectUrl === "/superadmin" || clientId.trim().toLowerCase() === "superadmin") {
        localStorage.setItem("varna_superadmin", "true");
        router.push("/superadmin");
        return;
      }

      localStorage.removeItem("varna_client");
      localStorage.removeItem("varna_superadmin");
      router.push("/dashboard");
    } catch {
      setError("Network connection error. Please try again.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-10 bg-[#D8CFB8] dark:bg-[#222326] text-[#222326] dark:text-[#D8CFB8] font-sans transition-colors duration-300 relative selection:bg-[#7A3F1E] selection:text-[#D8CFB8] overflow-hidden">
      {/* Subtle brand crystal mark watermark */}
      <BrandWatermark position="bottom-right" size={620} opacity={0.045} />

      {/* Top Header / Brand Mark */}
      <header className="flex justify-between items-center w-full max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo-light.svg" alt="Varna" className="block dark:hidden h-10 w-auto object-contain" />
          <img src="/logo-dark.svg" alt="Varna" className="hidden dark:block h-10 w-auto object-contain" />
          <span className="text-[10px] tracking-[0.25em] font-semibold uppercase text-[#6F848F] dark:text-[#D8CFB8]/60 hidden sm:inline-block border-l border-[#6F848F]/30 pl-3">
            Enterprise Intelligence Portal
          </span>
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="border border-[#6F848F]/35 px-4 py-2 text-[10px] tracking-widest uppercase hover:bg-[#D8CFB8]/20 dark:hover:bg-[#D8CFB8]/10 text-[#6F848F] dark:text-[#D8CFB8]/70 hover:text-[#222326] dark:hover:text-[#D8CFB8] transition-colors duration-200 cursor-pointer"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Main Card: sharp borders, solid warm stone / carbon ink panel */}
          <div className="bg-[#E4DEC9] dark:bg-[#272A30] border border-[#6F848F]/35 dark:border-[#2F3C52] shadow-xl p-8 sm:p-10 relative">
            
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#7A3F1E]" />

            {/* Wordmark and Header */}
            <div className="flex flex-col items-start mb-8 border-b border-[#6F848F]/25 dark:border-[#2F3C52] pb-6 w-full">
              <span className="text-[10px] font-semibold tracking-[0.22em] text-[#7A3F1E] dark:text-[#D8CFB8]/70 uppercase mb-2">
                The Varna Collective
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif text-[#222326] dark:text-[#D8CFB8] tracking-hero uppercase leading-none mb-2">
                Sustainability Dashboard
              </h1>
              <p className="text-xs text-[#6F848F] leading-relaxed font-light mt-1">
                A Force for Good, Built into Every Purchase.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-[#222326]/80 dark:text-[#D8CFB8]/80 block">
                  Client Identifier
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#DFD8C2]/50 dark:bg-[#222326]/60 border border-[#6F848F]/35 dark:border-[#2F3C52] text-[#222326] dark:text-[#D8CFB8] placeholder-[#6F848F]/60 focus:border-[#7A3F1E] dark:focus:border-[#D8CFB8] outline-none transition-colors duration-200 font-sans text-sm rounded-none"
                  placeholder="e.g. CLT001"
                  required
                />
              </div>

              <div className="space-y-2 relative">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-[#222326]/80 dark:text-[#D8CFB8]/80 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#DFD8C2]/50 dark:bg-[#222326]/60 border border-[#6F848F]/35 dark:border-[#2F3C52] text-[#222326] dark:text-[#D8CFB8] placeholder-[#6F848F]/60 focus:border-[#7A3F1E] dark:focus:border-[#D8CFB8] outline-none transition-colors duration-200 font-sans text-sm pr-11 rounded-none"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6F848F] hover:text-[#222326] dark:hover:text-[#D8CFB8] cursor-pointer"
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
                    className="text-xs text-[#7A3F1E] dark:text-[#D8CFB8] bg-[#7A3F1E]/15 dark:bg-[#7A3F1E]/20 border border-[#7A3F1E]/30 p-3.5 flex items-center gap-2.5 rounded-none"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#7A3F1E]" />
                    <span className="font-light">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || !clientId || !password}
                className="w-full py-4 bg-[#7A3F1E] hover:bg-[#683315] dark:bg-[#D8CFB8] dark:hover:bg-[#E8E2D1] text-[#D8CFB8] dark:text-[#222326] font-serif tracking-widest uppercase text-xs flex items-center justify-between px-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-none group shadow-md cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-inherit" />
                    <span>Validating Credentials...</span>
                  </span>
                ) : (
                  <>
                    <span>Enter Portal</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Footer information */}
      <footer className="text-center text-[10px] tracking-widest uppercase text-[#6F848F] max-w-6xl mx-auto w-full relative z-10">
        Private Enterprise Channel &bull; Encrypted &bull; Varna Collective ESG Engine
      </footer>
    </div>
  );
}
