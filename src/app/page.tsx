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
    objectPosition: "object-center",
  },
  {
    image: "/assets/Login2.svg",
    quote: " ",
    position: "top-16 right-12 sm:top-24 sm:right-16",
    objectPosition: "object-center",
  },
  {
    image: "/assets/Login3.svg",
    quote: " ",
    position: "top-16 right-12 sm:top-24 sm:right-16",
    objectPosition: "object-center",
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
      <div className="w-full lg:w-[42%] min-h-screen bg-white flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 relative z-10 flex-shrink-0">
        {/* Center Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] my-auto py-6 flex flex-col items-center"
        >
          {/* Repositioned & Enlarged VARNA Wordmark with Enhanced Tracking & Position */}
          <div className="w-full flex justify-center mb-4 sm:mb-5">
            <svg
              viewBox="50 102 138 32"
              className="w-80 sm:w-[360px] h-auto text-stone-900 fill-current transition-all"
              aria-label="VARNA Wordmark"
            >
              <g transform="translate(-7, 0)">
                {/* V */}
                <path transform="translate(0, 0)" d="M64.96,107.04h2.35l6.98,22.02l7.01-22.02h0.93l-7.44,23.48l0.03,0.17h-2.35L64.96,107.04z" />
                {/* A */}
                <path transform="translate(3.5, 0)" d="M93.8,107.08v-0.03h2.35l7.31,23.74h-2.35l-1.85-6.08h-9.92l-1.88,6.08h-0.93L93.8,107.08z M98.96,123.81l-4.66-15.21l-4.7,15.21H98.96z" />
                {/* R */}
                <path transform="translate(7, 0)" d="M110.1,107.04h8.33c1.08,0,2.11,0.26,3.09,0.78c0.98,0.52,1.77,1.24,2.36,2.17c0.6,0.93,0.89,1.97,0.89,3.14c0,1.12-0.3,2.16-0.91,3.11c-0.61,0.95-1.4,1.7-2.38,2.25c-0.98,0.55-2.02,0.83-3.12,0.83l8.17,11.47h-2.45l-8.2-11.47h-3.57v11.47h-2.22V107.04z M118,118.42c0.81,0,1.57-0.26,2.26-0.78c0.69-0.52,1.25-1.19,1.65-2.02c0.41-0.83,0.61-1.66,0.61-2.5s-0.2-1.66-0.61-2.46s-0.96-1.46-1.65-1.97c-0.69-0.51-1.45-0.76-2.26-0.76h-5.69v10.48H118z" />
                {/* N */}
                <path transform="translate(10.5, 0)" d="M132.49,107.04h2.58l11.38,19.31v-19.31h0.89v23.74h-0.89v-0.03l-13.06-22.19v22.22h-0.89V107.04z" />
                {/* A */}
                <path transform="translate(14, 0)" d="M161.22,107.08v-0.03h2.35l7.31,23.74h-2.35l-1.85-6.08h-9.92l-1.88,6.08h-0.93L161.22,107.08z M166.38,123.81l-4.66-15.21l-4.7,15.21H166.38z" />
              </g>
            </svg>
          </div>

          {/* Form Titles */}
          <div className="text-center mb-9 w-full">
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-wider text-stone-900 uppercase font-sans mb-3 leading-tight">
              EVIDENCE TO IMPACT
            </h1>
            <p className="text-sm sm:text-[15px] text-stone-500 font-normal leading-relaxed max-w-[340px] sm:max-w-sm mx-auto">
              A clear view of your suppliers, procurement choices and the impact they create.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6 w-full">
            {/* User ID Field */}
            <div className="space-y-2 text-left w-full">
              <label className="text-sm sm:text-[14.5px] font-bold text-stone-900 block font-sans">
                User ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-3.5 sm:py-4 bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-none transition-all duration-200 text-base font-sans rounded-lg"
                placeholder="Enter Username"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2 text-left w-full">
              <label className="text-sm sm:text-[14.5px] font-bold text-stone-900 block font-sans">
                Password
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 sm:py-4 bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-none transition-all duration-200 text-base font-sans rounded-lg pr-12"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Checkbox & Forgot Password */}
            <div className="flex items-center justify-between gap-6 sm:gap-8 text-sm text-stone-600 pt-1 w-full">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-[#6D7D6D] focus:ring-[#6D7D6D] h-4 w-4"
                />
                <span className="text-stone-500">Remember for 30 days</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setError("Please contact your Varna Enterprise Administrator to reset your password.");
                }}
                className="text-stone-500 hover:text-stone-900 transition-colors font-normal shrink-0"
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
                  className="text-sm text-red-700 bg-red-50 border border-red-200 p-3.5 rounded-lg flex items-center gap-2.5 text-left"
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
              className="w-full mt-4 py-4 sm:py-4.5 bg-[#6D7D6D] hover:bg-[#5C6C5E] active:scale-[0.99] text-white font-sans font-semibold text-base sm:text-[17px] rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2.5">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span className="font-sans text-sm sm:text-base">Logging in...</span>
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
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                idx === carouselIndex ? "opacity-100 z-0" : "opacity-0 pointer-events-none -z-10"
              }`}
            >
              <img
                src={slide.image}
                alt={`Varna Carousel slide ${idx + 1}`}
                className={`w-full h-full object-cover ${slide.objectPosition || "object-center"}`}
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
