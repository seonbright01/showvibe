import Link from "next/link";
import { ShowVibeLogo } from "@/components/ui/Logo";

const LEGAL_LINKS = [
  { href: "/takedown", label: "Takedown Request" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
] as const;

const HIGHLIGHTED_LEGAL_PATHS = new Set<string>(["/takedown"]);

export default function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-stroke">
      {/* 본문 페이지(max-w-[1200px] px-6)와 동일한 컨테이너로 좌우 정렬 일치 */}
      <div className="mx-auto max-w-[1200px] px-6 py-10 lg:py-12">
        {/* 1행: 브랜드 (로고 + 설명) */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center"
            aria-label="ShowVibe — Home"
          >
            <ShowVibeLogo width={120} />
          </Link>
          <p className="text-[13px] text-text-medium leading-relaxed max-w-md">
            Discover the best vibe-coded projects, track what stays alive, and
            connect with the makers behind them.
          </p>
        </div>

        {/* 2행: Legal & Requests (가로 한 줄) */}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-x-6 sm:gap-y-1 sm:flex-wrap">
          <span className="text-[11.5px] font-semibold uppercase tracking-wider text-text-high">
            Legal &amp; Requests
          </span>
          {LEGAL_LINKS.map((link) => {
            const emphasized = HIGHLIGHTED_LEGAL_PATHS.has(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] transition-colors hover:text-coral ${
                  emphasized
                    ? "text-text-high font-medium"
                    : "text-text-medium"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* 3행: 디스클레이머 + 카피라이트 */}
        <div className="mt-8 border-t border-stroke pt-6">
          <p className="text-[11.5px] text-text-muted leading-relaxed">
            showvibe는 Cursor, Lovable, Replit, Bolt, v0 등 언급된 특정 AI 코딩
            도구 및 서비스와 공식 제휴 관계가 아닙니다. 각 상표는 해당 권리자에게
            귀속됩니다.
          </p>
          <p className="mt-2 text-[11.5px] text-text-muted">
            &copy; {new Date().getFullYear()} showvibe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
