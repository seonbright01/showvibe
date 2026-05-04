'use client'

import { useEffect, useRef, useState } from 'react'

interface CollapsibleDescriptionProps {
  text: string | null | undefined
  maxLines?: number
  className?: string
}

export function CollapsibleDescription({
  text,
  maxLines = 8,
  className = '',
}: CollapsibleDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsToggle, setNeedsToggle] = useState(false)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const normalized = normalizeDescription(text ?? '')

  useEffect(() => {
    // 접힌 상태에서만 overflow 측정.
    // 펼쳐진 상태에서는 측정하면 항상 false가 되어 토글 버튼이 사라지므로 skip.
    if (isExpanded) return

    const el = contentRef.current
    if (!el) return

    const checkOverflow = () => {
      const overflow = el.scrollHeight - el.clientHeight > 1
      setNeedsToggle(overflow)
    }

    checkOverflow()

    const observer = new ResizeObserver(checkOverflow)
    observer.observe(el)
    return () => observer.disconnect()
  }, [normalized, maxLines, isExpanded])

  if (!normalized) return null

  return (
    <div className={className}>
      <div
        ref={contentRef}
        className={[
          'text-sm text-text-medium leading-relaxed whitespace-pre-line',
          isExpanded ? '' : 'overflow-hidden',
        ].join(' ')}
        style={
          isExpanded
            ? undefined
            : {
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical',
              }
        }
      >
        {normalized}
      </div>

      {needsToggle && (
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-coral hover:text-coral-hover transition-colors"
        >
          {isExpanded ? '접기' : 'Click to read more'}
          <span aria-hidden>{isExpanded ? '▴' : '▾'}</span>
        </button>
      )}
    </div>
  )
}

function normalizeDescription(input: string): string {
  if (!input) return ''
  return input
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/g, '/')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
