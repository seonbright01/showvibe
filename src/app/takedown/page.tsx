'use client'

import { Suspense, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { submitTakedown } from '@/lib/takedown/actions'
import type { TakedownRequestType } from '@/types'

const TURNSTILE_SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY

interface RequestTypeOption {
  value: TakedownRequestType
  label: string
}

const REQUEST_TYPES: readonly RequestTypeOption[] = [
  { value: 'copyright', label: '저작권 침해' },
  { value: 'privacy', label: '개인정보 노출' },
  { value: 'defamation', label: '명예훼손/허위사실' },
  { value: 'other', label: '기타' },
] as const

interface TakedownFormState {
  email: string
  targetUrl: string
  requestType: TakedownRequestType
  reason: string
  confirmIdentity: boolean
}

const INITIAL_STATE: TakedownFormState = {
  email: '',
  targetUrl: '',
  requestType: 'copyright',
  reason: '',
  confirmIdentity: false,
}

export default function TakedownPage() {
  return (
    <Suspense fallback={null}>
      <TakedownPageInner />
    </Suspense>
  )
}

function deriveInitialRequestType(
  typeParam: string | null,
): TakedownRequestType {
  if (typeParam === 'privacy') return 'privacy'
  if (typeParam === 'defamation') return 'defamation'
  if (typeParam === 'other') return 'other'
  return 'copyright'
}

function TakedownPageInner() {
  const searchParams = useSearchParams()
  const initialRequestType = deriveInitialRequestType(searchParams.get('type'))
  const initialTargetUrl = searchParams.get('url') ?? ''
  const [form, setForm] = useState<TakedownFormState>(() => ({
    ...INITIAL_STATE,
    requestType: initialRequestType,
    targetUrl: initialTargetUrl,
  }))
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const updateField = <K extends keyof TakedownFormState>(
    key: K,
    value: TakedownFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!form.email.trim() || !form.targetUrl.trim() || !form.reason.trim()) {
      setError('이메일, 대상 URL, 요청 사유는 필수입니다.')
      return
    }
    if (!form.confirmIdentity) {
      setError('신원 정보 정확성 보증에 체크해주세요.')
      return
    }

    startTransition(async () => {
      const result = await submitTakedown({
        email: form.email,
        targetUrl: form.targetUrl,
        requestType: form.requestType,
        reason: form.reason,
        confirmIdentity: true,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <AppShell>
        <main className="flex-1">
          <section className="mx-auto max-w-3xl px-6 py-20">
            <div className="bg-bg-surface border border-stroke rounded-xl p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-2xl">
                ✓
              </div>
              <h1 className="text-2xl font-bold mb-3 font-[var(--font-outfit)]">
                요청이 접수되었습니다
              </h1>
              <p className="text-text-medium mb-2">
                영업일 기준 24-48시간 내에 처리됩니다.
              </p>
              <p className="text-sm text-text-muted mb-6">
                처리 결과는 등록한 이메일({form.email})로 안내됩니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForm(INITIAL_STATE)
                  setSubmitted(false)
                }}
                className="bg-bg-elevated hover:bg-bg-base border border-stroke text-text-high font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </section>
        </main>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 font-[var(--font-outfit)]">
              Site Removal / Takedown Request
            </h1>
            <p className="text-[13px] text-text-muted">
              ShowVibe는 자동 수집형 서비스입니다. 권리자나 제작자의 요청 시 즉시 처리합니다.
            </p>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 mb-8 text-sm leading-relaxed">
            <p className="font-medium text-red-300 mb-2">
              처리 시간 안내
            </p>
            <p className="text-text-medium">
              모든 요청은 <span className="text-text-high font-medium">영업일 기준 24-48시간 내</span>에 검토됩니다.
              심각한 침해(개인정보, 미성년자 관련)는 우선 처리됩니다.
              긴급한 경우 abuse@showvibe.com 으로 직접 문의해주세요.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-bg-surface border border-stroke rounded-xl p-6 lg:p-8 space-y-6"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-high mb-2"
              >
                신청자 이메일 <span className="text-coral">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
              />
              <p className="text-xs text-text-medium mt-2">
                처리 결과 통보용 이메일입니다.
              </p>
            </div>

            <div>
              <label
                htmlFor="target-url"
                className="block text-sm font-medium text-text-high mb-2"
              >
                대상 사이트 URL <span className="text-coral">*</span>
              </label>
              <input
                id="target-url"
                type="url"
                required
                value={form.targetUrl}
                onChange={(e) => updateField('targetUrl', e.target.value)}
                placeholder="https://showvibe.com/projects/site_01  또는  https://대상사이트.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
              />
              <p className="text-xs text-text-medium mt-2">
                ShowVibe 페이지 URL 또는 원본 사이트 URL을 입력해주세요.
              </p>
            </div>

            <div>
              <label
                htmlFor="request-type"
                className="block text-sm font-medium text-text-high mb-2"
              >
                요청 유형 <span className="text-coral">*</span>
              </label>
              <select
                id="request-type"
                value={form.requestType}
                onChange={(e) =>
                  updateField('requestType', e.target.value as TakedownRequestType)
                }
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high focus:outline-none focus:border-coral"
              >
                {REQUEST_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-text-high mb-2"
              >
                요청 사유 <span className="text-coral">*</span>
              </label>
              <textarea
                id="reason"
                required
                rows={6}
                value={form.reason}
                onChange={(e) => updateField('reason', e.target.value)}
                placeholder="구체적인 침해 내용과 권리 보유를 증명할 수 있는 정보를 기재해주세요."
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral resize-none"
              />
              <p className="text-xs text-text-medium mt-2">
                저작권자임을 증명할 수 있는 링크/문서가 있다면 함께 첨부해주세요.
              </p>
            </div>

            <div className="border-t border-stroke pt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.confirmIdentity}
                  onChange={(e) => updateField('confirmIdentity', e.target.checked)}
                  className="accent-coral mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-text-high">
                    신청자 본인 확인
                  </span>
                  <p className="text-xs text-text-medium mt-0.5">
                    제출한 신원 정보의 정확성을 보증하며, 허위 신고 시 법적 책임을 질 수 있음을 이해합니다.
                  </p>
                </div>
              </label>
            </div>

            {TURNSTILE_SITEKEY && (
              <div>
                <label className="block text-sm font-medium text-text-high mb-2">
                  Verification
                </label>
                <div className="border border-dashed border-stroke rounded-lg p-6 bg-bg-elevated text-center">
                  <p className="text-sm text-text-medium">
                    Cloudflare Turnstile 위젯이 표시될 자리입니다.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-3.5 rounded-lg transition-colors"
            >
              {isPending ? '제출 중...' : 'Submit Takedown Request'}
            </button>

            <p className="text-xs text-text-medium text-center">
              요청은 영업일 기준 24-48시간 내에 처리됩니다.
            </p>
          </form>
        </section>
      </main>
    </AppShell>
  )
}
