'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

// CommentForm.tsx에 동일한 declare global이 있어 중복 선언 충돌 회피.
// 여기는 로컬 타입만 사용하고 window 접근은 unknown 캐스트로 처리.
interface TurnstileApi {
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
  reset?: (widgetId?: string) => void
  remove?: (widgetId?: string) => void
}

function getTurnstile(): TurnstileApi | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile
}

interface TurnstileWidgetProps {
  sitekey: string
  onToken: (token: string | null) => void
  theme?: 'light' | 'dark' | 'auto'
  className?: string
}

export function TurnstileWidget({
  sitekey,
  onToken,
  theme = 'dark',
  className = '',
}: TurnstileWidgetProps) {
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const tryRender = () => {
      if (cancelled) return
      if (!widgetRef.current) return
      if (widgetIdRef.current) return
      const ts = getTurnstile()
      if (!ts) {
        setTimeout(tryRender, 200)
        return
      }

      widgetIdRef.current = ts.render(widgetRef.current, {
        sitekey,
        theme,
        callback: (t: string) => onToken(t),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
      })
    }

    tryRender()

    return () => {
      cancelled = true
      const id = widgetIdRef.current
      const ts = getTurnstile()
      if (id && ts?.remove) {
        try {
          ts.remove(id)
        } catch {
          // ignore removal errors
        }
      }
      widgetIdRef.current = null
    }
  }, [sitekey, theme, onToken])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        strategy="afterInteractive"
      />
      <div ref={widgetRef} className={className} />
    </>
  )
}
