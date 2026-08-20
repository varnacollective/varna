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
        // Premium Serif for Headings/H1 (Tight tracking, breathing room)
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        // Clean Geometric Sans-Serif for Body/Sub-headings/UI (Leading relaxed)
        sans: ["var(--font-inter)", "Inter", "Avenir", "sans-serif"],
        // Authentic Handwriting Font for stylistic accents
        accent: ["var(--font-cedarville)", "Cedarville Cursive", "cursive"],
      },
      letterSpacing: {
        tighter: "-0.07em", // Tight tracking applied to Versailles headings
      },
      lineHeight: {
        relaxed: "1.4", // Avenir geometric font spacing
      },
    },
  },
  plugins: [],
};
