import Link from "next/link";
import { ShowVibeLogo } from "@/components/ui/Logo";

const EXPLORE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/chart", label: "Chart" },
  { href: "/explore", label: "Explore" },
  { href: "/makers", label: "Makers" },
  { href: "/posts", label: "Posts" },
  { href: "/archive", label: "Archive" },
  { href: "/library", label: "Library" },
] as const;

const MAKER_LINKS = [
  { href: "/submit", label: "Submit Project" },
  { href: "/claim", label: "Claim Project" },
] as const;

const LEGAL_LINKS = [
  { href: "/takedown", label: "Copyright / Takedown Request" },
  { href: "/takedown?type=removal", label: "Site Removal Request" },
  { href: "/takedown?type=privacy", label: "Privacy / Personal Information Report" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/bot-policy", label: "Bot / Data Collection Policy" },
  { href: "/contact", label: "Contact" },
] as const;

const HIGHLIGHTED_LEGAL_PATHS = new Set<string>([
  "/takedown",
  "/takedown?type=removal",
  "/takedown?type=privacy",
]);

function FooterLogo() {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="ShowVibe — Home">
      <ShowVibeLogo width={120} />
    </Link>
  );
}

function SocialLinks() {
  return (
    <div className="flex items-center gap-3 mt-4">
      <a
        href="https://x.com/showvibe"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X (Twitter)"
        className="text-text-muted hover:text-coral transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href="https://github.com/showvibe"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="text-text-muted hover:text-coral transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      </a>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-stroke">
      {/* 본문 페이지(max-w-[1200px] px-6)와 동일한 컨테이너로 좌우 정렬 일치 */}
      <div className="mx-auto max-w-[1200px] px-6 py-10 lg:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-12">
          {/* 브랜드 — 모바일 2열 전체, md+에서 4컬럼 폭 */}
          <div className="col-span-2 md:col-span-4">
            <FooterLogo />
            <p className="mt-3 text-[13px] text-text-medium leading-relaxed max-w-xs">
              Discover the best vibe-coded projects, track what stays alive, and
              connect with the makers behind them.
            </p>
            <SocialLinks />
          </div>

          <FooterColumn title="Explore" cols="md:col-span-2">
            {EXPLORE_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href} label={link.label} />
            ))}
          </FooterColumn>

          <FooterColumn title="For Makers" cols="md:col-span-2">
            {MAKER_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href} label={link.label} />
            ))}
          </FooterColumn>

          {/* Legal & Requests — 항목 많아 4컬럼 폭 */}
          <FooterColumn title="Legal & Requests" cols="md:col-span-4">
            {LEGAL_LINKS.map((link) => (
              <FooterLink
                key={link.href}
                href={link.href}
                label={link.label}
                emphasized={HIGHLIGHTED_LEGAL_PATHS.has(link.href)}
              />
            ))}
          </FooterColumn>
        </div>

        <div className="mt-10 border-t border-stroke pt-6">
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

function FooterColumn({
  title,
  children,
  cols,
}: {
  title: string
  children: React.ReactNode
  cols: string
}) {
  return (
    <div className={cols}>
      <h3 className="text-[11.5px] font-semibold uppercase tracking-wider text-text-high mb-3">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  )
}

function FooterLink({
  href,
  label,
  emphasized,
}: {
  href: string
  label: string
  emphasized?: boolean
}) {
  return (
    <li>
      <Link
        href={href}
        className={`text-[13px] leading-snug transition-colors hover:text-coral ${
          emphasized ? 'text-text-high font-medium' : 'text-text-medium'
        }`}
      >
        {label}
      </Link>
    </li>
  )
}
