/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict Varna Collective Brand Colors with full tonal range
        "warm-stone": {
          DEFAULT: "#D8CFB8",
          tint: "#FAF7F0",
          light: "#E4DEC9",
          deep: "#B5AB94",
        },
        "deep-clay": {
          DEFAULT: "#7A3F1E",
          tint: "#F7EFEA",
          light: "#C47547",
          deep: "#4E230B",
        },
        "slate-mist": {
          DEFAULT: "#6F848F",
          tint: "#F0F3F5",
          light: "#96AAB4",
          deep: "#3E4E57",
        },
        "midnight-blue": {
          DEFAULT: "#2F3C52",
          tint: "#ECF0F6",
          light: "#546B92",
          deep: "#171F2D",
        },
        "sage-mineral": {
          DEFAULT: "#738678",
          tint: "#EFF4F0",
          light: "#99AD9F",
          deep: "#47574B",
        },
        "carbon-ink": {
          DEFAULT: "#222326",
          panel: "#272A30",
          deep: "#181A1D",
        },
      },
      boxShadow: {
        "elevation-low": "0 2px 10px -2px rgba(34, 35, 38, 0.07), 0 1px 3px rgba(34, 35, 38, 0.04)",
        "elevation-mid": "0 10px 30px -4px rgba(34, 35, 38, 0.12), 0 4px 8px -2px rgba(34, 35, 38, 0.06)",
        "elevation-high": "0 20px 50px -8px rgba(34, 35, 38, 0.22), 0 8px 16px -4px rgba(34, 35, 38, 0.12)",
        "elevation-dark-low": "0 4px 20px -2px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(140, 157, 168, 0.12)",
        "elevation-dark-mid": "0 14px 44px -4px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(140, 157, 168, 0.16)",
        "elevation-dark-high": "0 28px 70px -8px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(140, 157, 168, 0.2)",
        "glow-clay": "0 0 24px -2px rgba(148, 77, 37, 0.45)",
        "glow-sage": "0 0 24px -2px rgba(130, 152, 136, 0.45)",
      },
      fontFamily: {
        // Premium Serif for Headings/H1 (Versailles / Cormorant Garamond / Playfair Display)
        serif: ["Versailles", "var(--font-cormorant)", "var(--font-playfair)", "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        // Clean Geometric Sans-Serif for Body/Sub-headings/UI (Avenir / Inter)
        sans: ["Avenir", "var(--font-inter)", "Inter", "Futura PT", "sans-serif"],
        // Authentic Handwriting Font for stylistic accents (<5% of UI)
        accent: ["var(--font-caveat)", "var(--font-cedarville)", "Caveat", "Cedarville Cursive", "cursive"],
      },
      letterSpacing: {
        hero: "-0.07em",       // Tight negative tracking (-70) on Versailles hero titles
        tighter: "-0.07em",
        section: "0.18em",     // Wide tracking for section labels ("SECTION 1 · THE THREE PRINCIPLES")
        label: "0.08em",       // Subtle tracking on uppercase captions & microcopy
      },
      lineHeight: {
        tight: "1",            // Headings line-height: 1
        relaxed: "1.4",        // Avenir body line-height: 1.4
      },
    },
  },
  plugins: [],
};

