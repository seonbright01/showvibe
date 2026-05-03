'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import type { ReviewCandidate } from '@/lib/admin/queries'
import {
  approveSite,
  archiveSite,
  holdSite,
  rejectSite,
} from '@/lib/admin/actions'

interface Props {
  initialQueue: ReviewCandidate[]
}

type ActionFn = (id: string) => Promise<{ ok: boolean; error?: string }>

export function ReviewConsole({ initialQueue }: Props) {
  const [queue] = useState(initialQueue)
  const [index, setIndex] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [processed, setProcessed] = useState(0)
  const [startTime] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState<string | null>(null)

  const current = queue[index]

  const advance = useCallback(() => {
    setIndex((i) => Math.min(i + 1, queue.length))
    setProcessed((n) => n + 1)
    setNow(Date.now())
  }, [queue.length])

  const handleAction = useCallback(
    (fn: ActionFn) => {
      if (!current) return
      setError(null)
      const id = current.id
      // 낙관적 업데이트: 즉시 다음 카드로
      advance()
      startTransition(async () => {
        const res = await fn(id)
        if (!res.ok) setError(res.error ?? 'Action failed')
      })
    },
    [current, advance],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      // e.code는 키보드 레이아웃·IME 무관 (한국어 입력 모드에서도 동작)
      switch (e.code) {
        case 'KeyY':
          e.preventDefault()
          handleAction(approveSite)
          break
        case 'KeyN':
          e.preventDefault()
          handleAction(rejectSite)
          break
        case 'KeyH':
          e.preventDefault()
          handleAction(holdSite)
          break
        case 'KeyA':
          e.preventDefault()
          handleAction(archiveSite)
          break
        case 'ArrowRight':
          e.preventDefault()
          advance()
          break
        case 'ArrowLeft':
          e.preventDefault()
          setIndex((i) => Math.max(0, i - 1))
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleAction, advance])

  if (!current) {
    return (
      <div className="rounded-xl border border-stroke bg-bg-surface p-12 text-center">
        <p className="text-text-medium">검수할 후보가 없습니다.</p>
        <p className="mt-2 text-[12px] text-text-muted">
          Processed in this session: {processed}
        </p>
      </div>
    )
  }

  const elapsedHr = (now - startTime) / 1000 / 3600
  const perHour = elapsedHr > 0 ? Math.round(processed / elapsedHr) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-stroke bg-bg-surface px-4 py-2.5">
        <div className="flex items-center gap-3 text-[13px]">
          <span className="font-mono text-text-medium">
            Candidate {index + 1} / {queue.length}
          </span>
          {isPending && <span className="text-[11px] text-coral">saving…</span>}
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-text-muted">
          <span>Processed: {processed}</span>
          <span>·</span>
          <span>{perHour} / hr</span>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-coral-line bg-coral-soft px-3 py-2 text-[12px] text-coral"
        >
          {error}
        </p>
      )}

      <article className="overflow-hidden rounded-xl border border-stroke bg-bg-surface md:grid md:grid-cols-12">
        <div className="relative h-[160px] bg-bg-elevated md:col-span-5 md:h-auto md:min-h-[220px] md:max-h-[380px]">
          {current.media?.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <a
              href={current.media.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full w-full"
              title="원본 스크린샷 열기"
            >
              <img
                src={current.media.image_url}
                alt={current.name}
                className="h-full w-full object-cover object-top"
              />
            </a>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 font-mono text-[11px] text-text-dim">
              <span>No screenshot</span>
              <span className="text-[10px] text-text-muted normal-case">
                실행: <code>npm run pipeline:screenshot</code>
              </span>
            </div>
          )}
        </div>
        <div className="space-y-4 p-5 md:col-span-7">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{current.name}</h2>
            <a
              href={current.url}
              target="_blank"
              rel="noopener nofollow noreferrer"
              className="break-all font-mono text-[12px] text-coral hover:underline"
            >
              {current.url}
            </a>
          </div>

          {current.description && (
            <p className="text-[13px] leading-relaxed text-text-medium">
              {current.description}
            </p>
          )}

          {current.analysis?.article_summary && (
            <div className="rounded-lg border border-stroke bg-bg-base p-3 text-[13px] leading-relaxed text-text-medium">
              {current.analysis.article_summary}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-stroke bg-bg-base p-3">
              <div className="font-mono text-[10.5px] uppercase text-text-muted">
                Vibe
              </div>
              <div className="font-[var(--font-outfit)] text-2xl font-bold text-coral">
                {current.analysis?.vibe_score ?? '–'}
              </div>
            </div>
            <div className="rounded-lg border border-stroke bg-bg-base p-3">
              <div className="font-mono text-[10.5px] uppercase text-text-muted">
                Quality
              </div>
              <div className="font-[var(--font-outfit)] text-2xl font-bold">
                {current.analysis?.quality_score ?? '–'}
              </div>
            </div>
            <div className="rounded-lg border border-stroke bg-bg-base p-3">
              <div className="font-mono text-[10.5px] uppercase text-text-muted">
                Risk
              </div>
              <div
                className={`font-[var(--font-outfit)] text-2xl font-bold ${
                  (current.analysis?.risk_score ?? 0) >= 60 ? 'text-coral' : ''
                }`}
              >
                {current.analysis?.risk_score ?? '–'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 font-mono text-[11px] text-text-muted">
            <span className="rounded border border-stroke bg-bg-elevated px-2 py-0.5">
              {current.source_type}
            </span>
            {current.source_platform && (
              <span className="rounded border border-stroke bg-bg-elevated px-2 py-0.5">
                {current.source_platform}
              </span>
            )}
            {current.analysis?.category && (
              <span className="rounded border border-stroke bg-bg-elevated px-2 py-0.5">
                {current.analysis.category}
              </span>
            )}
          </div>

          <Link
            href={current.url}
            target="_blank"
            rel="noopener nofollow noreferrer"
            className="inline-flex items-center gap-1 text-[12px] text-coral hover:text-coral-hover"
          >
            ↗ Open in new tab
          </Link>
        </div>
      </article>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAction(approveSite)}
          className="inline-flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-lg bg-coral px-4 py-3 text-[13px] font-semibold text-coral-ink hover:bg-coral-hover"
        >
          <kbd className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px]">
            Y
          </kbd>
          Approve
        </button>
        <button
          onClick={() => handleAction(rejectSite)}
          className="inline-flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-lg border border-stroke bg-bg-elevated px-4 py-3 text-[13px] font-semibold text-text-high hover:bg-bg-base"
        >
          <kbd className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px]">
            N
          </kbd>
          Reject
        </button>
        <button
          onClick={() => handleAction(holdSite)}
          className="inline-flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-lg border border-stroke bg-bg-elevated px-4 py-3 text-[13px] font-semibold text-text-medium hover:bg-bg-base"
        >
          <kbd className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px]">
            H
          </kbd>
          Hold
        </button>
        <button
          onClick={() => handleAction(archiveSite)}
          className="inline-flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-lg border border-stroke bg-bg-elevated px-4 py-3 text-[13px] font-semibold text-text-muted hover:bg-bg-base"
        >
          <kbd className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px]">
            A
          </kbd>
          Archive
        </button>
      </div>

      <div className="rounded-lg border border-stroke bg-bg-surface px-4 py-2 font-mono text-[11px] text-text-muted">
        <span className="text-text-high">Shortcuts:</span>
        <span className="ml-2">Y Approve</span>
        <span className="ml-2">N Reject</span>
        <span className="ml-2">H Hold</span>
        <span className="ml-2">A Archive</span>
        <span className="ml-2">← Previous</span>
        <span className="ml-2">→ Next</span>
      </div>
    </div>
  )
}
