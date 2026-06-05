import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  // Next.js App Router requires unsafe-inline for hydration scripts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // KaTeX and Tiptap inject inline styles at runtime
  "style-src 'self' 'unsafe-inline'",
  // Cloudinary article/cover images + data URIs for Next.js blurDataURL
  "img-src 'self' https://res.cloudinary.com data: blob:",
  "font-src 'self'",
  // Supabase API + realtime websocket
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
  // No iframes, no plugins, no base-tag injection
  "frame-src 'none'",
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
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
