'use client'

import { useState, useTransition } from 'react'
import { subscribeNewsletter } from '@/lib/newsletter/actions'

interface NewsletterFormProps {
  source?: string
  className?: string
}

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

export function NewsletterForm({
  source = 'homepage',
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>({ status: 'idle' })
  const [isPending, startTransition] = useTransition()

  const isSubmitting = isPending || state.status === 'submitting'
  const isSuccess = state.status === 'success'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) {
      setState({ status: 'error', message: '이메일을 입력해주세요' })
      return
    }

    setState({ status: 'submitting' })

    startTransition(async () => {
      const result = await subscribeNewsletter({ email, source })
      if (result.error) {
        setState({ status: 'error', message: result.error })
        return
      }
      setState({
        status: 'success',
        message: result.message ?? '구독 신청이 완료되었습니다',
      })
      setEmail('')
    })
  }

  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
        aria-label="뉴스레터 구독"
      >
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          disabled={isSubmitting || isSuccess}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state.status === 'error') setState({ status: 'idle' })
          }}
          placeholder="your@email.com"
          aria-label="이메일 주소"
          className="flex-1 px-4 py-2.5 rounded-lg bg-bg-base border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="bg-coral hover:bg-coral-hover text-white font-medium text-[13px] px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '처리 중...' : isSuccess ? '구독 완료' : 'Subscribe'}
        </button>
      </form>

      <div
        className="mt-3 text-center min-h-[18px]"
        role="status"
        aria-live="polite"
      >
        {state.status === 'success' && (
          <p className="text-[12px] text-active">{state.message}</p>
        )}
        {state.status === 'error' && (
          <p className="text-[12px] text-coral">{state.message}</p>
        )}
        {state.status === 'idle' && (
          <p className="text-[11px] text-text-muted">
            스팸 없음. 언제든 구독 취소 가능.
          </p>
        )}
        {state.status === 'submitting' && (
          <p className="text-[11px] text-text-muted">처리 중입니다...</p>
        )}
      </div>
    </div>
  )
}
