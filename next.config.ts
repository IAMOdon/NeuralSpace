import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  // Next.js App Router requires unsafe-inline for hydration scripts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // KaTeX and Tiptap inject inline styles at runtime
  "style-src 'self' 'unsafe-inline'",
  // Any HTTPS image source — articles can embed from Nature, NASA, Wikimedia, etc.
  "img-src 'self' https: data: blob:",
  // Allow media (video/audio) from any HTTPS source — toolbox previews, article embeds
  "media-src 'self' https: blob:",
  "font-src 'self'",
  // Supabase API + realtime websocket
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
  // Allow YouTube/Vimeo video embeds (ArticleRenderer renders these as iframes)
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Allow any HTTPS source — articles can use Nature, NASA, Wikimedia, AP, etc.
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Polices auto-hébergées pour les e-mails : les clients mail (et l'iframe
        // de prévisualisation sandboxée) chargent en cross-origin — CORS requis.
        source: "/fonts/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
