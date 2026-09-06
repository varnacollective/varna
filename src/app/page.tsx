"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, Eye, EyeOff, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import BrandWatermark from "@/components/ui/BrandWatermark";
import BrandLogo from "@/components/ui/BrandLogo";

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#D8CFB8] dark:bg-[#18191D] text-[#222326] dark:text-[#FAF6EE] font-sans transition-colors duration-300 relative selection:bg-[#7A3F1E] selection:text-[#D8CFB8] overflow-hidden">
      
      {/* ── LEFT PANEL: Full-Bleed Luxury Artisan Photography (50% desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#222326] overflow-hidden flex-col justify-between p-12 xl:p-16 text-[#D8CFB8]">
        {/* Background Image with Ambient Scrim */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: "url('/assets/login_craft.jpg')" }}
        />
        {/* Editorial gradient dark scrim for maximum text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1E22] via-[#222326]/75 to-[#222326]/40 backdrop-blur-[0.5px]" />

        {/* Subtle Watermark in photography panel */}
        <BrandWatermark position="bottom-right" size={480} opacity={0.06} />

        {/* Top Brand Mark */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img src="/logo-dark.svg" alt="Varna Collective" className="h-14 sm:h-16 lg:h-18 w-auto object-contain drop-shadow-md" />
          <div className="h-8 w-px bg-[#D8CFB8]/30" />
          <span className="text-[11px] sm:text-xs tracking-[0.25em] font-semibold uppercase text-[#D8CFB8]/90">
            Enterprise Portal
          </span>
        </div>

        {/* Center Philosophy Statement */}
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7A3F1E]/40 border border-[#7A3F1E]/60 text-[#D8CFB8] text-[9px] font-semibold uppercase tracking-widest backdrop-blur-md shadow-xs">
            <Sparkles className="w-3 h-3 text-[#D8CFB8]" />
            Bespoke Hospitality Procurement
          </div>
          <h2 className="text-4xl xl:text-5xl font-serif text-[#FAF7F0] tracking-hero uppercase leading-none drop-shadow-md">
            A Force for Good, Built into Every Purchase.
          </h2>
          <p className="text-xs xl:text-sm text-[#D8CFB8]/85 font-light leading-relaxed">
            Engineered specifically for small and micro producers that conventional ESG frameworks overlook—and for hospitality leaders who demand verifiable operational evidence.
          </p>
        </div>

        {/* Bottom Verification Indicators */}
        <div className="relative z-10 pt-6 border-t border-[#D8CFB8]/20 flex items-center justify-between text-[10px] text-[#D8CFB8]/70 font-light tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#738678]" />
            <span>Varna Trust Protocol · 18 Verifiable Indicators</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Elevated Login Form (50% desktop) ── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative bg-ambient-mesh-light dark:bg-ambient-mesh-dark">
        {/* Top Header Controls */}
        <header className="flex justify-between items-center w-full max-w-md mx-auto mb-8">
          <div className="flex items-center gap-3 lg:hidden">
            <img src="/logo-light.svg" alt="Varna" className="block dark:hidden h-8 w-auto object-contain" />
            <img src="/logo-dark.svg" alt="Varna" className="hidden dark:block h-8 w-auto object-contain" />
          </div>

          <div className="ml-auto">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-3.5 py-1.5 rounded-full border border-[#6F848F]/30 dark:border-[#8C9DA8]/25 text-[10px] tracking-widest uppercase hover:bg-[#D8CFB8]/30 dark:hover:bg-[#8C9DA8]/15 text-[#6F848F] dark:text-[#8C9DA8] hover:text-[#222326] dark:hover:text-[#FAF6EE] transition-all duration-200 cursor-pointer shadow-xs"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </header>

        {/* Form Container */}
        <main className="w-full max-w-md mx-auto my-auto py-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {/* Main Elevated Card with multi-layer shadow and soft depth */}
            <div className="bg-[#E4DEC9] dark:bg-[#22252B] border border-[#6F848F]/20 dark:border-[#8C9DA8]/20 shadow-elevation-mid dark:shadow-elevation-dark-mid p-8 sm:p-10 relative rounded-xl overflow-hidden">
              
              {/* Top Accent Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7A3F1E] via-[#A85422] to-[#738678] dark:from-[#944D25] dark:via-[#B86230] dark:to-[#829888]" />

              {/* Wordmark and Header */}
              <div className="flex flex-col items-start mb-8 border-b border-[#6F848F]/20 dark:border-[#8C9DA8]/15 pb-6 w-full">
                <span className="text-[10px] font-semibold tracking-[0.22em] text-[#7A3F1E] dark:text-[#E89260] uppercase mb-2">
                  The Varna Collective
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif text-[#222326] dark:text-[#FAF6EE] tracking-hero uppercase leading-none mb-2">
                  Sustainability Portal
                </h1>
                <p className="text-xs text-[#6F848F] dark:text-[#8C9DA8] leading-relaxed font-light mt-1">
                  Secure authenticated access for enterprise hospitality procurement teams.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold tracking-widest uppercase text-[#222326]/80 dark:text-[#FAF6EE] block">
                    Client Identifier
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#E8E2D1]/70 dark:bg-[#1A1C22] border border-[#6F848F]/30 dark:border-[#8C9DA8]/20 text-[#222326] dark:text-[#FAF6EE] placeholder-[#6F848F]/60 dark:placeholder-[#8C9DA8]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-[#7A3F1E]/30 focus:border-[#7A3F1E] dark:focus:border-[#FAF6EE] outline-none transition-all duration-200 font-sans text-sm"
                    placeholder="e.g. CLT001"
                    required
                  />
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[10px] font-semibold tracking-widest uppercase text-[#222326]/80 dark:text-[#FAF6EE] block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-[#E8E2D1]/70 dark:bg-[#1A1C22] border border-[#6F848F]/30 dark:border-[#8C9DA8]/20 text-[#222326] dark:text-[#FAF6EE] placeholder-[#6F848F]/60 dark:placeholder-[#8C9DA8]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-[#7A3F1E]/30 focus:border-[#7A3F1E] dark:focus:border-[#FAF6EE] outline-none transition-all duration-200 font-sans text-sm pr-11"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6F848F] hover:text-[#222326] dark:text-[#8C9DA8] dark:hover:text-[#FAF6EE] cursor-pointer"
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
                      className="text-xs text-[#7A3F1E] dark:text-[#E89260] bg-[#7A3F1E]/12 dark:bg-[#7A3F1E]/25 border border-[#7A3F1E]/30 dark:border-[#944D25]/40 p-3.5 rounded-lg flex items-center gap-2.5 shadow-xs"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#7A3F1E] dark:text-[#E89260]" />
                      <span className="font-light">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading || !clientId || !password}
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#7A3F1E] to-[#5C2A0F] hover:from-[#6B3315] hover:to-[#4E220B] text-[#FAF7F0] font-serif tracking-widest uppercase text-xs flex items-center justify-between px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-elevation-mid hover:shadow-elevation-high dark:shadow-[0_0_24px_rgba(148,77,37,0.35)] cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 mx-auto">
                      <Loader2 className="w-4 h-4 animate-spin text-inherit" />
                      <span>Validating Credentials...</span>
                    </span>
                  ) : (
                    <>
                      <span>Enter Enterprise Portal</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </main>

        {/* Footer information */}
        <footer className="text-center text-[9px] tracking-widest uppercase text-[#6F848F] dark:text-[#8C9DA8]/70 max-w-md mx-auto w-full mt-8">
          Private Enterprise Gateway &bull; Encrypted &bull; Varna Collective Trust Engine
        </footer>
      </div>
    </div>
  );
}

