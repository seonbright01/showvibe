import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

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
  title: "ShowVibe — Show your vibe. Find your tribe.",
  description:
    "Discover the best vibe-coded projects, track what stays alive, and connect with the makers behind them.",
  keywords: [
    "vibe coding",
    "바이브코딩",
    "AI coding",
    "project discovery",
    "web development",
    "reference",
  ],
  openGraph: {
    title: "ShowVibe",
    description:
      "Discover the best vibe-coded projects, track what stays alive, and connect with the makers behind them.",
    siteName: "ShowVibe",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsensePubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text-high">
        {children}
        {adsensePubId && (
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
