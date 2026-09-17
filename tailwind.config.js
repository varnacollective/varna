/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Varna Collective Brand Colors ──────────────────────────────────
        "warm-stone": {
          DEFAULT: "#D8CFB8",
          tint: "#FAF8F5",
          light: "#EAE5DC",
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
          DEFAULT: "#1C1D21",
          panel: "#22252B",
          deep: "#121316",
        },
        // ── New Design System Tokens (varnacollective.com alignment) ────────
        "terracotta": {
          DEFAULT: "#B85333",   // Rich Terracotta — primary accent
          light: "#D4705A",     // Hover / lighter tint
          deep: "#8B3A21",      // Pressed / darker
          dark: "#C85D3B",      // Dark mode vibrant variant
          muted: "#B85333",
        },
        "sage-olive": {
          DEFAULT: "#556B55",   // Environmental pillar — Sage Olive
          light: "#7B9B7B",     // Dark mode / hover
          deep: "#3E5040",      // Pressed
        },
        "alabaster": {
          DEFAULT: "#F8F5EF",   // Warm Alabaster canvas
          warm: "#FAF8F4",      // Lightest page background
          deep: "#EAE5DC",      // Card border / subtle tint
          card: "#FFFFFF",      // Card surface (crisp white)
        },
        "obsidian": {
          DEFAULT: "#1A1F26",   // Deep Obsidian Slate text
          light: "#2A3644",     // Secondary / Midnight Slate
        },
      },
      boxShadow: {
        "elevation-low":      "0 1px 4px rgba(26, 31, 38, 0.04), 0 2px 12px rgba(26, 31, 38, 0.06)",
        "elevation-mid":      "0 4px 16px rgba(26, 31, 38, 0.06), 0 8px 32px rgba(26, 31, 38, 0.08)",
        "elevation-high":     "0 8px 32px rgba(26, 31, 38, 0.10), 0 20px 52px rgba(26, 31, 38, 0.12)",
        "elevation-dark-low": "0 4px 20px -2px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(155, 169, 180, 0.12)",
        "elevation-dark-mid": "0 14px 44px -4px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(155, 169, 180, 0.16)",
        "elevation-dark-high":"0 28px 70px -8px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(155, 169, 180, 0.2)",
        "glow-terracotta":    "0 0 24px -2px rgba(184, 83, 51, 0.35)",
        "glow-sage":          "0 0 24px -2px rgba(85, 107, 85, 0.35)",
        "card-light":         "0 1px 3px rgba(26, 31, 38, 0.04), 0 4px 16px rgba(26, 31, 38, 0.05)",
        // Legacy aliases
        "glow-clay":          "0 0 24px -2px rgba(148, 77, 37, 0.45)",
      },
      fontFamily: {
        // Universal Geometric Sans
        sans: ["Avenir", "Avenir Next", "var(--font-jost)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        // Serif alias (also Jost to preserve existing behaviour)
        serif: ["Avenir", "Avenir Next", "var(--font-jost)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        // Editorial Display — Cormorant Garamond / Playfair for luxury hero headings
        display: ["var(--font-cormorant)", "var(--font-playfair)", "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        // Handwriting accents (<5% of UI)
        accent: ["var(--font-caveat)", "var(--font-cedarville)", "Caveat", "Cedarville Cursive", "cursive"],
      },
      letterSpacing: {
        hero:    "-0.04em",
        tighter: "-0.04em",
        section: "0.18em",
        label:   "0.08em",
      },
      lineHeight: {
        tight:   "1",
        relaxed: "1.4",
      },
    },
  },
  plugins: [],
};
