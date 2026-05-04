import Link from 'next/link'
import Image from 'next/image'
import type { ChartEntry } from '@/types'
import { StatusBadge, ToolBadge } from '@/components/ui/Badge'
import { LikeButton } from '@/components/sites/LikeButton'
import { SaveButton } from '@/components/sites/SaveButton'

interface VibeChartRowProps {
  entry: ChartEntry
}

function RankChange({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span
        className="flex items-center gap-0.5 text-xs font-medium"
        style={{ color: 'var(--trend-up)' }}
        aria-label={`순위 ${change}계단 상승`}
      >
        ▲ {change}
      </span>
    )
  }

  if (change < 0) {
    return (
      <span
        className="flex items-center gap-0.5 text-xs font-medium"
        style={{ color: 'var(--trend-down)' }}
        aria-label={`순위 ${Math.abs(change)}계단 하락`}
      >
        ▼ {Math.abs(change)}
      </span>
    )
  }

  return (
    <span className="text-xs font-medium text-text-muted" aria-label="순위 변동 없음">
      –
    </span>
  )
}

function gradientForName(name: string): string {
  const palettes = [
    'from-coral/30 to-claimed/20',
    'from-claimed/30 to-coral/10',
    'from-bg-elevated to-coral/15',
    'from-coral/20 to-claimed/25',
    'from-bg-surface to-coral/20',
  ]
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return palettes[hash % palettes.length]
}

function Thumb({
  url,
  alt,
  name,
}: {
  url: string | null | undefined
  alt: string
  name: string
}) {
  if (url) {
    return (
      <div className="relative h-10 w-16 overflow-hidden rounded-md border border-stroke shrink-0 bg-bg-elevated">
        <Image src={url} alt={alt} fill sizes="64px" className="object-cover" unoptimized />
      </div>
    )
  }
  return (
    <div
      className={`h-10 w-16 rounded-md border border-stroke shrink-0 bg-gradient-to-br ${gradientForName(name)}`}
      aria-hidden="true"
    />
  )
}

export function VibeChartRow({ entry }: VibeChartRowProps) {
  const {
    rank,
    change,
    site,
    maker,
    media,
    vibeScore,
    initialLikeCount = 0,
    initialIsLiked = false,
    initialIsSaved = false,
    isAuthenticated = false,
  } = entry
  const toolName = site.sourcePlatform

  return (
    <div className="flex items-center gap-3 rounded-lg border border-stroke bg-bg-surface px-3 py-2 transition-colors hover:bg-bg-elevated">
      {/* Rank */}
      <span className="w-7 text-right text-xl font-bold text-text-high font-[family-name:var(--font-outfit)] tabular-nums">
        {rank}
      </span>

      {/* Change */}
      <div className="w-9 text-center font-mono">
        <RankChange change={change} />
      </div>

      {/* Thumb */}
      <Thumb url={media?.imageUrl} alt={site.name} name={site.name} />

      {/* Project name + maker */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 min-w-0">
          <Link
            href={`/projects/${site.id}`}
            className="truncate text-[13px] font-medium text-text-high hover:text-coral transition-colors"
          >
            {site.name}
          </Link>
          {maker && (
            <span className="truncate text-[11px] font-mono text-text-muted">
              @{maker.name}
            </span>
          )}
        </div>
      </div>

      {/* Tool */}
      <div className="hidden sm:block">{toolName && <ToolBadge tool={toolName} />}</div>

      {/* Status */}
      <div className="hidden md:block">
        <StatusBadge status={site.status} />
      </div>

      {/* Score */}
      <div className="hidden lg:flex items-baseline gap-1 w-16 justify-end">
        {typeof vibeScore === 'number' ? (
          <>
            <span className="font-[family-name:var(--font-outfit)] text-base font-bold text-coral tabular-nums">
              {vibeScore}
            </span>
            <span className="font-mono text-[10px] uppercase text-text-muted">VIBE</span>
          </>
        ) : (
          <span className="text-xs text-text-muted">–</span>
        )}
      </div>

      {/* Like + Save (md 이상에서만 표시 — 좁은 화면에서는 Visit만) */}
      <div className="hidden md:flex items-center gap-1.5">
        <LikeButton
          siteId={site.id}
          initialIsLiked={initialIsLiked}
          initialCount={initialLikeCount}
          isAuthenticated={isAuthenticated}
          size="sm"
        />
        <SaveButton
          siteId={site.id}
          initialIsSaved={initialIsSaved}
          isAuthenticated={isAuthenticated}
          size="sm"
        />
      </div>

      {/* Report */}
      <Link
        href={`/takedown?siteId=${site.id}&url=${encodeURIComponent(site.url)}`}
        aria-label="이 프로젝트 신고하기"
        title="신고하기"
        className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-md border border-coral-line/40 px-2 py-1.5 text-[11px] font-medium text-text-muted hover:text-coral hover:border-coral-line transition-colors"
      >
        <span aria-hidden>⚠</span> 신고
      </Link>

      {/* Visit */}
      <Link
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-coral px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-coral-hover"
      >
        <span aria-hidden>↗</span> Visit
      </Link>
    </div>
  )
}
