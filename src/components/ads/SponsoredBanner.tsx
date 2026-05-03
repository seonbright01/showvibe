import Link from 'next/link'

interface SponsoredItem {
  id: string
  sponsor: string
  title: string
  description: string
  href: string
  cta: string
  gradient: string
}

// MVP: hardcoded mock. 향후 DB sponsored_banners 테이블에서 큐레이션 로드.
const MOCK_SPONSORED: readonly SponsoredItem[] = [
  {
    id: 'sponsor-cursor',
    sponsor: 'Cursor',
    title: 'AI-first code editor',
    description:
      'Build software faster in the editor designed for pair-programming with AI.',
    href: 'https://cursor.com',
    cta: 'Learn more',
    gradient: 'from-coral/20 via-coral/5 to-claimed/10',
  },
]

interface SponsoredBannerProps {
  index?: number
  className?: string
}

export function SponsoredBanner({
  index = 0,
  className,
}: SponsoredBannerProps) {
  if (MOCK_SPONSORED.length === 0) return null
  const item = MOCK_SPONSORED[index % MOCK_SPONSORED.length]

  return (
    <aside
      className={`relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br ${item.gradient} ${className ?? ''}`}
      aria-label="Sponsored content"
    >
      <div className="absolute top-3 right-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-0.5 rounded bg-bg-base/80 backdrop-blur border border-stroke">
          Sponsored
        </span>
      </div>
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-mono uppercase tracking-wide text-text-muted mb-1">
            {item.sponsor}
          </p>
          <h3 className="text-[16px] font-bold text-text-high mb-1 font-[var(--font-outfit)]">
            {item.title}
          </h3>
          <p className="text-[12.5px] text-text-medium leading-relaxed">
            {item.description}
          </p>
        </div>
        <Link
          href={item.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="shrink-0 self-start sm:self-auto inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-coral hover:bg-coral-hover text-white text-[12.5px] font-medium transition-colors"
        >
          {item.cta} →
        </Link>
      </div>
    </aside>
  )
}
