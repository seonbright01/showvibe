'use client'

import { useTransition } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import { trackEvent } from '@/lib/events/track'

interface Props {
  siteId: string
  url: string
  archived?: boolean
  variant?: 'primary' | 'ghost'
  className?: string
  children?: ReactNode
}

export function VisitButton({
  siteId,
  url,
  archived,
  variant = 'primary',
  className,
  children,
}: Props) {
  const [isPending, startTransition] = useTransition()

  if (archived) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-bg-elevated text-text-muted text-[13px] font-semibold px-5 py-2.5 cursor-not-allowed ${className ?? ''}`}
      >
        접속 불가 · Archived
      </button>
    )
  }

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await trackEvent(siteId, 'click')
      } catch {
        // ignore tracking failure — must not block visit
      }
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,nofollow,sponsored')
      }
    })
  }

  const baseClass =
    variant === 'primary'
      ? 'bg-coral hover:bg-coral-hover text-white'
      : 'bg-bg-elevated hover:bg-bg-base text-text-high border border-stroke'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center justify-center gap-2 rounded-lg ${baseClass} text-[13px] font-semibold px-5 py-2.5 transition-colors ${className ?? ''}`}
    >
      {children ?? <>↗ Visit Original Site</>}
    </button>
  )
}
