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
        // Strict Varna Collective Brand Colors
        "warm-stone": "#D8CFB8",     // Main background, whitespace planes, base panels
        "deep-clay": "#7A3F1E",      // Highlight headings, premium accents, primary buttons
        "slate-mist": "#6F848F",     // Secondary panels, UI blocks, subtle dividers
        "midnight-blue": "#2F3C52",  // Technical layouts, reporting touchpoints, structured titles
        "sage-mineral": "#738678",   // Sustainability indicators, environmental metrics
        "carbon-ink": "#222326",     // Body text, high contrast items, iconography
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
