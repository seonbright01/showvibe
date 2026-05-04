import Link from 'next/link'
import { AvatarSvg } from '@/components/ui/AvatarSvg'
import type { AvatarPresetId } from '@/lib/avatars/presets'

const ORBIT_AVATARS: AvatarPresetId[] = ['m1', 'w1', 'cat', 'm3', 'w3', 'dog']

const MARQUEE_TAGS = [
  'Cursor', 'Bolt', 'v0', 'Lovable', 'Replit', 'Claude Code',
  'Vibe-coded', 'Side-Project', 'AI SaaS', 'Indie Hacker',
] as const

export function HomeHero() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-6">
      <div
        className="sv-hero-glow relative overflow-hidden rounded-2xl border border-stroke bg-gradient-to-br from-bg-surface via-bg-elevated to-bg-surface"
        style={{ minHeight: 220 }}
      >
        {/* orbiting avatars (decorative) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden md:block"
        >
          <div className="absolute right-12 top-1/2 -translate-y-1/2 w-[260px] h-[260px]">
            {ORBIT_AVATARS.map((id, idx) => (
              <div
                key={id}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sv-hero-orbit"
                style={{
                  animationDelay: `${(idx * -14) / ORBIT_AVATARS.length}s`,
                  width: 48,
                  height: 48,
                }}
              >
                <div className="rounded-full border border-stroke bg-bg-base/40 backdrop-blur-sm overflow-hidden">
                  <AvatarSvg presetId={id} size={48} />
                </div>
              </div>
            ))}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="sv-anim-float rounded-full border border-coral-line bg-bg-base/60 p-1 shadow-pop">
                <AvatarSvg presetId="dog" size={72} />
              </div>
            </div>
          </div>
        </div>

        {/* dim overlay so text stays readable on small screens */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg-base/50 via-transparent to-bg-base/40 md:from-bg-base/0 md:via-bg-base/0 md:to-transparent"
        />

        <div className="relative z-10 flex flex-col gap-3 px-6 py-8 md:px-10 md:py-9 md:max-w-[60%]">
          <p className="sv-hero-rise text-[11px] font-mono uppercase tracking-[0.18em] text-coral">
            Show your vibe · Find your tribe
          </p>
          <h1
            className="sv-hero-rise font-[var(--font-outfit)] text-[28px] md:text-[36px] font-black leading-[1.1] tracking-tight"
            style={{ animationDelay: '0.08s' }}
          >
            <span className="sv-hero-text">Discover vibe-coded</span>
            <br />
            <span className="text-text-high">projects that stay alive.</span>
          </h1>
          <p
            className="sv-hero-rise text-[13.5px] text-text-medium leading-relaxed max-w-xl"
            style={{ animationDelay: '0.16s' }}
          >
            Cursor·v0·Bolt·Lovable로 만들어진 사이드 프로젝트를 자동 발견하고,
            살아있는 것들만 골라 보여드립니다.
          </p>
          <div
            className="sv-hero-rise mt-2 flex flex-wrap gap-2"
            style={{ animationDelay: '0.24s' }}
          >
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-[13px] font-semibold text-coral-ink transition-colors hover:bg-coral-hover"
            >
              지금 둘러보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-stroke bg-bg-base/60 px-4 py-2 text-[13px] font-medium text-text-medium transition-colors hover:text-text-high hover:bg-bg-elevated"
            >
              내 프로젝트 등록
            </Link>
          </div>
        </div>

        {/* bottom marquee strip */}
        <div className="relative z-10 border-t border-stroke bg-bg-base/40 backdrop-blur-sm py-1.5 overflow-hidden">
          <div className="sv-hero-marquee flex gap-6 whitespace-nowrap text-[11px] text-text-muted font-mono">
            {[...MARQUEE_TAGS, ...MARQUEE_TAGS].map((tag, i) => (
              <span key={`${tag}-${i}`} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-coral" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
