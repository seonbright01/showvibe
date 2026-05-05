'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import type { PostCard } from '@/lib/posts/parse-cards'

interface CardDeckProps {
  cards: PostCard[]
  /** 모든 카드 상단 배경 이미지 (포스터/일러스트 URL) */
  coverImageUrl: string | null
  postTitle: string
}

const SWIPE_THRESHOLD = 60 // px

export function CardDeck({ cards, coverImageUrl, postTitle }: CardDeckProps) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)

  const total = cards.length
  const safeIndex = Math.max(0, Math.min(current, total - 1))
  const card = cards[safeIndex]

  const goPrev = () => setCurrent((i) => Math.max(0, i - 1))
  const goNext = () => setCurrent((i) => Math.min(total - 1, i + 1))

  // 키보드 좌우 화살표
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  if (total === 0) return null

  return (
    <div className="select-none">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`${postTitle} 카드뉴스`}
        aria-live="polite"
        className="relative overflow-hidden rounded-2xl border border-stroke bg-bg-surface shadow-card"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
          touchDeltaX.current = 0
        }}
        onTouchMove={(e) => {
          if (touchStartX.current !== null) {
            touchDeltaX.current = e.touches[0].clientX - touchStartX.current
          }
        }}
        onTouchEnd={() => {
          const dx = touchDeltaX.current
          touchStartX.current = null
          touchDeltaX.current = 0
          if (Math.abs(dx) >= SWIPE_THRESHOLD) {
            if (dx < 0) goNext()
            else goPrev()
          }
        }}
      >
        {/* 상단 cover 이미지 */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-gradient-to-br from-coral/20 via-bg-elevated to-claimed/20">
          {coverImageUrl && (
            <Image
              src={coverImageUrl}
              alt={postTitle}
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/40 to-transparent" />

          {/* 카드 번호 */}
          <div className="absolute top-3 right-3 rounded-full bg-bg-base/70 backdrop-blur px-2.5 py-0.5 text-[11px] font-mono text-text-medium border border-stroke">
            {card.index} / {total}
          </div>
        </div>

        {/* 카드 본문 */}
        <div className="px-6 py-7 sm:px-10 sm:py-9 min-h-[260px]">
          {card.title && (
            <h2 className="font-[var(--font-outfit)] text-[20px] sm:text-[22px] font-bold text-text-high mb-3 leading-snug">
              {card.title}
            </h2>
          )}
          <div className="prose prose-invert max-w-none prose-p:text-[14.5px] prose-p:text-text-medium prose-p:leading-[1.75] prose-a:text-coral hover:prose-a:text-coral-hover prose-strong:text-text-high prose-li:text-text-medium prose-li:my-1">
            <ReactMarkdown>{card.content}</ReactMarkdown>
          </div>
        </div>

        {/* 좌우 화살표 (sm 이상에서 노출) */}
        <button
          type="button"
          aria-label="이전 카드"
          disabled={safeIndex === 0}
          onClick={goPrev}
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-bg-base/80 backdrop-blur border border-stroke text-text-high hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="다음 카드"
          disabled={safeIndex === total - 1}
          onClick={goNext}
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-bg-base/80 backdrop-blur border border-stroke text-text-high hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* dot indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {cards.map((c, i) => (
          <button
            key={c.index}
            type="button"
            aria-label={`카드 ${i + 1}로 이동`}
            aria-current={i === safeIndex ? 'true' : undefined}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === safeIndex
                ? 'w-6 bg-coral'
                : 'w-2 bg-text-muted/40 hover:bg-text-muted/70'
            }`}
          />
        ))}
      </div>

      {/* 모바일 안내 */}
      <p className="mt-3 text-center text-[11px] text-text-muted sm:hidden">
        좌우로 스와이프 →
      </p>
    </div>
  )
}
