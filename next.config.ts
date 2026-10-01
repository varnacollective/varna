import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],

  // ─── HTTP cache headers ──────────────────────────────────────────────────
  // Dashboard pages: 30-second CDN/browser cache + stale-while-revalidate
  // so repeat navigations are served instantly from edge cache.
  // The session cookie ensures per-user content is private and won't cross.
  async headers() {
    return [
      {
        // Dashboard and suppliers pages: short CDN cache, private per user
        source: "/dashboard/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, s-maxage=30, stale-while-revalidate=60",
          },
        ],
      },
      {
        // Static SVG/PNG assets: long-lived browser cache (1 year via immutable)
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ─── Image optimization ──────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24 hours for optimized images
  },

  // ─── Bundle optimization ─────────────────────────────────────────────────
  // Reduces time to first byte by tree-shaking unused exports
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
    ],
  },
};

export default nextConfig;
