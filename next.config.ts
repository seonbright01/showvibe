import type { NextConfig } from "next";

// 보안: HTTP Security Headers — clickjacking, MIME-sniff, referrer leak, XSS 방어선
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // CSP — Cloudflare Turnstile + Supabase + 외부 스크린샷 이미지 허용
  // 'unsafe-inline'/'unsafe-eval'은 Next.js inline runtime + dev tooling 때문에 필요.
  // production에서 nonce 도입 시 제거 가능.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://storage.googleapis.com https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev https://api.dicebear.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://challenges.cloudflare.com https://api.github.com",
      "frame-src https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // 보안 (P3.3): server action CSRF 방어 — 명시된 origin 만 허용.
  // 도메인 SSOT 는 showvibe.app (showvibe.com 은 사용 금지).
  experimental: {
    serverActions: {
      allowedOrigins: ["showvibe.app", "localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      // 보안 (P3.3): R2 public CDN — posts/screenshots prefix 만 허용
      // (전체 `/**` 면 임의 경로 이미지가 외부 hotlink 우회 SSRF 벡터로 사용 가능).
      {
        protocol: "https",
        hostname: "pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev",
        pathname: "/posts/**",
      },
      {
        protocol: "https",
        hostname: "pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev",
        pathname: "/screenshots/**",
      },
    ],
  },
  async headers() {
    return [
      // 일반 페이지: 보안 헤더 (api는 제외 — 별도 정책)
      { source: "/((?!api).*)", headers: securityHeaders },
      // 운영자/계정/인증 경로: 검색엔진 색인 차단
      {
        source: "/admin/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/account/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/auth/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
