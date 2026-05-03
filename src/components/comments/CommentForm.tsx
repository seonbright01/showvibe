'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { createComment } from '@/lib/comments/actions'

interface Props {
  siteId: string
  isAuthenticated: boolean
}

interface TurnstileGlobal {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string
      theme?: 'light' | 'dark' | 'auto'
      callback?: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
    },
  ) => string
  reset: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileGlobal
  }
}

const MIN_LENGTH = 2
const MAX_LENGTH = 2000

export function CommentForm({ siteId, isAuthenticated }: Props) {
  const [body, setBody] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY

  useEffect(() => {
    if (!sitekey || !widgetRef.current) return
    if (widgetIdRef.current) return
    if (typeof window === 'undefined' || !window.turnstile) return

    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey,
      theme: 'dark',
      callback: (t: string) => setToken(t),
      'expired-callback': () => setToken(null),
      'error-callback': () => setToken(null),
    })
  }, [sitekey])

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-stroke bg-bg-elevated p-5 text-center">
        <p className="text-[13px] text-text-medium mb-3">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-coral-hover"
        >
          Sign in to comment
        </Link>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmed = body.trim()
    if (trimmed.length < MIN_LENGTH) {
      setError('댓글은 최소 2자 이상이어야 합니다')
      return
    }

    const turnstileToken = sitekey ? token : 'dev'
    if (!turnstileToken) {
      setError('자동 인증을 완료해주세요')
      return
    }

    startTransition(async () => {
      const res = await createComment({
        siteId,
        body: trimmed,
        turnstileToken,
      })
      if (res.error) {
        setError(res.error)
        if (sitekey && window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current)
          setToken(null)
        }
        return
      }
      setBody('')
      if (sitekey && window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current)
        setToken(null)
      }
    })
  }

  const isSubmitDisabled =
    isPending ||
    body.trim().length < MIN_LENGTH ||
    (Boolean(sitekey) && !token)

  return (
    <>
      {sitekey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
          strategy="afterInteractive"
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="이 프로젝트에 대한 생각을 남겨주세요..."
          maxLength={MAX_LENGTH}
          minLength={MIN_LENGTH}
          required
          rows={3}
          aria-label="댓글 내용"
          className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral resize-y"
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {sitekey ? (
            <div ref={widgetRef} />
          ) : (
            <p className="text-[11px] font-mono text-text-muted">
              Dev 모드 — Turnstile 미설정
            </p>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[11px] font-mono text-text-muted tabular-nums">
              {body.length}/{MAX_LENGTH}
            </span>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-coral hover:bg-coral-hover disabled:bg-stroke disabled:text-text-muted disabled:cursor-not-allowed text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {isPending ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="text-[13px] text-error">
            {error}
          </p>
        )}
      </form>
    </>
  )
}
