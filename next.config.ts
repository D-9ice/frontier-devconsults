import type { NextConfig } from "next";

const supabaseHost = 'dfvrmaiqiyhtturtxykf.supabase.co';
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob: https://${supabaseHost}`,
  `media-src 'self' https://${supabaseHost}`,
  `connect-src 'self' https://${supabaseHost}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactCompiler: true,
  reactStrictMode: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/app-media/**' },
      { protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/project-media/**' },
    ],
  },
  async redirects() {
    return [{
      source: '/:path*',
      has: [{ type: 'host', value: 'www.frontier-devconsults.com' }],
      destination: 'https://frontier-devconsults.com/:path*',
      permanent: true,
    }];
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        { key: 'Origin-Agent-Cluster', value: '?1' },
        { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Content-Security-Policy', value: contentSecurityPolicy },
      ],
    }, {
      source: '/admin/:path*',
      headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' }],
    }, {
      source: '/api/admin/:path*',
      headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' }],
    }];
  },
};

export default nextConfig;
