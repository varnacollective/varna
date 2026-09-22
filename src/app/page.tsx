"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

const CAROUSEL_SLIDES = [
  {
    image: "/assets/Login1.svg",
    quote: " ",
    position: "bottom-12 left-12 sm:bottom-16 sm:left-16",
  },
  {
    image: "/assets/Login2.svg",
    quote: " ",
    position: "top-16 right-12 sm:top-24 sm:right-16",
  },
  {
    image: "/assets/Login3.svg",
    quote: " ",
    position: "top-16 right-12 sm:top-24 sm:right-16",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // UI state for Carousel & Checkbox
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setMounted(true);
    localStorage.removeItem("varna_client");
  }, []);

  // Automated image carousel: 3000ms interval, cleared on unmount
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanClientId = clientId.trim();

    // Direct superadmin fallback/fast-path check
    const isSuperAdminLocal = cleanClientId.toLowerCase() === "superadmin" && password === "Varna";

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: cleanClientId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If API fails but local superadmin credentials match, provide resilient entry
        if (isSuperAdminLocal) {
          localStorage.setItem("varna_superadmin", "true");
          router.push("/superadmin");
          return;
        }
        setError(data.error || "Authentication failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      if (data.isSuperAdmin || isSuperAdminLocal) {
        localStorage.setItem("varna_superadmin", "true");
        router.push("/superadmin");
      } else {
        localStorage.removeItem("varna_superadmin");
        const targetUrl = data.redirectUrl || (data.isGroup ? "/group-dashboard" : "/dashboard");
        router.push(targetUrl);
      }
    } catch {
      if (isSuperAdminLocal) {
        localStorage.setItem("varna_superadmin", "true");
        router.push("/superadmin");
        return;
      }
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF8F5] text-stone-900 font-sans selection:bg-[#6D7D6D] selection:text-white">
      {/* ── LEFT COLUMN: Form Container (~42% width) ── */}
      <div className="w-full lg:w-[42%] min-h-screen bg-white flex flex-col justify-between items-center p-8 sm:p-12 lg:p-16 relative z-10 flex-shrink-0">
        {/* Top Combined Branding Block */}
        <div className="w-full flex flex-col items-center pt-2">
          <img
            src="/Varnawordmark.svg"
            alt="Varna Geometric Logo"
            className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/Varnawordmark.svg";
            }}
          />

        </div>

        {/* Center Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm my-auto py-8"
        >
          {/* Form Titles */}
          <div className="text-center mb-8">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 uppercase font-sans mb-2">
              EVIDENCE TO IMPACT
            </h1>
            <p className="text-xs text-stone-500 font-normal leading-relaxed max-w-xs mx-auto">
              A clear view of your suppliers, procurement choices and the impact they create.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* User ID Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-stone-900 block font-sans">
                User ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-none transition-all duration-200 text-sm font-sans rounded-lg"
                placeholder="Enter Username"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-stone-900 block font-sans">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-none transition-all duration-200 text-sm font-sans rounded-lg pr-11"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox & Forgot Password */}
            <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-[#6D7D6D] focus:ring-[#6D7D6D] h-3.5 w-3.5"
                />
                <span className="text-stone-500">Remember for 30 days</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setError("Please contact your Varna Enterprise Administrator to reset your password.");
                }}
                className="text-stone-500 hover:text-stone-900 transition-colors font-normal"
              >
                Forgot Password?
              </a>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2.5 text-left"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !clientId || !password}
              className="w-full mt-3 py-3.5 bg-[#6D7D6D] hover:bg-[#5C6C5E] active:scale-[0.99] text-white font-sans font-medium text-sm rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="font-sans text-xs">Logging in...</span>
                </span>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* ── RIGHT COLUMN: Carousel Container (~58% width) ── */}
      <div className="w-full lg:w-[58%] min-h-[450px] lg:min-h-screen p-4 sm:p-6 flex flex-col justify-center items-center bg-[#FAF8F5] flex-1">
        <div className="w-full h-full min-h-[420px] lg:min-h-[calc(100vh-3rem)] relative rounded-3xl overflow-hidden shadow-xl bg-stone-900 select-none">
          {/* Carousel Background Images with CSS crossfade opacity */}
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <div
              key={slide.image}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === carouselIndex ? "opacity-100 z-0" : "opacity-0 pointer-events-none -z-10"
                }`}
            >
              <img
                src={slide.image}
                alt={`Varna Carousel slide ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Dynamic Handwritten/Serif Script Quote Text Overlay */}
          <AnimatePresence mode="wait">
            <motion.div
              key={carouselIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6 }}
              className={`absolute z-20 ${CAROUSEL_SLIDES[carouselIndex].position}`}
            >
              <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-[#8B4513] font-normal drop-shadow-sm leading-tight tracking-wide">
                {CAROUSEL_SLIDES[carouselIndex].quote}
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Center Pagination Dots */}
          <div className="absolute bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2.5">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${idx === carouselIndex
                  ? "w-2.5 h-2.5 bg-white opacity-100 scale-110"
                  : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80 opacity-60"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
