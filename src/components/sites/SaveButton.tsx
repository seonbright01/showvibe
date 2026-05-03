'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleSave } from '@/lib/social/actions'

interface Props {
  siteId: string
  initialIsSaved: boolean
  isAuthenticated: boolean
  size?: 'sm' | 'md'
}

export function SaveButton({
  siteId,
  initialIsSaved,
  isAuthenticated,
  size = 'md',
}: Props) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      router.push('/signin?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    const prev = isSaved
    setIsSaved(!prev)
    startTransition(async () => {
      const res = await toggleSave(siteId)
      if (!res.ok) setIsSaved(prev)
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
      aria-label={isSaved ? 'Remove from library' : 'Save to library'}
      aria-pressed={isSaved}
      title={isSaved ? '라이브러리에서 제거' : '라이브러리에 저장'}
      className={`inline-flex items-center rounded-full border transition-colors ${buttonClass} ${
        isSaved
          ? 'border-claimed bg-bg-surface text-claimed'
          : 'border-stroke bg-bg-surface text-text-medium hover:border-claimed/40 hover:text-claimed'
      } disabled:opacity-60`}
    >
      <span aria-hidden>{isSaved ? '🔖' : '🔖'}</span>
      <span className="font-mono">{isSaved ? 'Saved' : 'Save'}</span>
    </button>
  )
}
