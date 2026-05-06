import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://showvibe.app";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "100 900",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ShowVibe — 바이브코딩 프로젝트 디스커버리",
    template: "%s · ShowVibe",
  },
  description:
    "Cursor·Lovable·Bolt·v0로 만들어진 바이브코딩 프로젝트를 발견하세요. 매일 큐레이션되는 살아있는 레퍼런스 DB.",
  keywords: [
    "바이브코딩",
    "vibe coding",
    "AI coding",
    "Cursor",
    "Lovable",
    "Bolt",
    "v0",
    "Replit",
    "프로젝트 디스커버리",
    "AI 코딩 도구",
    "show vibe",
  ],
  authors: [{ name: "ShowVibe" }],
  creator: "ShowVibe",
  publisher: "ShowVibe",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "ShowVibe",
    title: "ShowVibe — Show your vibe. Find your tribe.",
    description:
      "바이브코딩으로 만들어진 AI 프로젝트를 발견하세요. Cursor·Lovable·Bolt·v0 — 어떤 도구로 만들었든, 여기 모입니다.",
    images: [
      {
        url: "/logo/wordmark-white.png",
        width: 1200,
        height: 630,
        alt: "ShowVibe — 바이브코딩 프로젝트 디스커버리",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShowVibe — 바이브코딩 프로젝트 디스커버리",
    description:
      "Cursor·Lovable·Bolt·v0로 만들어진 프로젝트를 발견하고 살아있는 것만 추적합니다.",
    images: ["/logo/wordmark-white.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsensePubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;
  // master toggle — AdSlot 컴포넌트와 동일한 분기를 layout 단계에서도 적용해
  // 베타 단계에서는 AdSense 로더 자체를 로드하지 않는다.
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text-high">
        {children}
        {adsEnabled && adsensePubId && (
          <Script
            id="adsense-loader"
            async
            strategy="lazyOnload"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePubId}`}
          />
        )}
      </body>
    </html>
  );
}
