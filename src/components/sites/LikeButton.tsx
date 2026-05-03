'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike } from '@/lib/social/actions'

interface Props {
  siteId: string
  initialIsLiked: boolean
  initialCount: number
  isAuthenticated: boolean
  size?: 'sm' | 'md'
}

export function LikeButton({
  siteId,
  initialIsLiked,
  initialCount,
  isAuthenticated,
  size = 'md',
}: Props) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      router.push('/signin?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    const prevLiked = isLiked
    const prevCount = count
    setIsLiked(!prevLiked)
    setCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1)
    startTransition(async () => {
      const res = await toggleLike(siteId)
      if (!res.ok) {
        setIsLiked(prevLiked)
        setCount(prevCount)
      } else if (typeof res.count === 'number') {
        setCount(res.count)
      }
    })
  }

  const isSm = size === 'sm'
  const buttonClass = isSm
    ? 'px-2 py-1 text-[11.5px] gap-1'
    : 'px-3 py-1.5 text-[12.5px] gap-1.5'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isLiked ? 'Unlike' : 'Like'}
      aria-pressed={isLiked}
      className={`inline-flex items-center rounded-full border transition-colors ${buttonClass} ${
        isLiked
          ? 'border-coral bg-coral-soft text-coral'
          : 'border-stroke bg-bg-surface text-text-medium hover:border-coral/40 hover:text-coral'
      } disabled:opacity-60`}
    >
      <span aria-hidden className={isLiked ? 'text-coral' : ''}>
        {isLiked ? '♥' : '♡'}
      </span>
      <span className="font-mono tabular-nums">{count}</span>
    </button>
  )
}
