import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  // Next.js App Router requires unsafe-inline for hydration scripts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // KaTeX and Tiptap inject inline styles at runtime
  "style-src 'self' 'unsafe-inline'",
  // Cloudinary, Wikimedia Commons, NASA, ESA — external image sources allowed in articles
  "img-src 'self' https://res.cloudinary.com https://upload.wikimedia.org https://images.nasa.gov https://www.esa.int https://imagebank.nih.gov data: blob:",
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
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.nasa.gov" },
      { protocol: "https", hostname: "www.esa.int" },
      { protocol: "https", hostname: "imagebank.nih.gov" },
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
