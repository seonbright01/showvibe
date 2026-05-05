'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { TurnstileWidget } from '@/components/turnstile/TurnstileWidget'
import { submitSite } from '@/lib/sites/actions'
import { TOOL_LABELS } from '@/lib/tools'
import { PROJECT_CATEGORY_LABELS } from '@/lib/categories'

const TURNSTILE_SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY

const CATEGORIES: readonly string[] = PROJECT_CATEGORY_LABELS

const TOOLS: readonly string[] = [...TOOL_LABELS, 'Other']

const DESCRIPTION_MAX = 200
const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024
const SCREENSHOT_ACCEPT = 'image/png,image/jpeg,image/webp'

interface SubmitFormState {
  name: string
  url: string
  description: string
  category: string
  builtWith: string
  isCreator: boolean
  email: string
}

const INITIAL_STATE: SubmitFormState = {
  name: '',
  url: '',
  description: '',
  category: CATEGORIES[0],
  builtWith: TOOLS[0],
  isCreator: false,
  email: '',
}

export default function SubmitPage() {
  const router = useRouter()
  const [form, setForm] = useState<SubmitFormState>(INITIAL_STATE)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const updateField = <K extends keyof SubmitFormState>(
    key: K,
    value: SubmitFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setError(null)
    if (!file) {
      setScreenshotFile(null)
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview)
      setScreenshotPreview(null)
      return
    }
    if (!SCREENSHOT_ACCEPT.split(',').includes(file.type)) {
      setError('PNG, JPEG, WebP 이미지만 업로드 가능합니다.')
      e.target.value = ''
      return
    }
    if (file.size > SCREENSHOT_MAX_BYTES) {
      setError('스크린샷은 5MB 이하여야 합니다.')
      e.target.value = ''
      return
    }
    setScreenshotFile(file)
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  const clearScreenshot = () => {
    setScreenshotFile(null)
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview)
    setScreenshotPreview(null)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.url.trim()) {
      setError('Project Name과 URL은 필수입니다.')
      return
    }

    if (TURNSTILE_SITEKEY && !turnstileToken) {
      setError('자동 인증을 완료해주세요.')
      return
    }

    startTransition(async () => {
      // 1) 스크린샷이 선택돼 있으면 먼저 업로드
      let screenshotUrl: string | undefined = undefined
      if (screenshotFile) {
        const fd = new FormData()
        fd.append('file', screenshotFile)
        const uploadRes = await fetch('/api/screenshot-upload', {
          method: 'POST',
          body: fd,
        })
        if (!uploadRes.ok) {
          const { error: uploadErr } = await uploadRes
            .json()
            .catch(() => ({ error: '스크린샷 업로드 실패' }))
          setError(uploadErr ?? '스크린샷 업로드 실패')
          return
        }
        const json = (await uploadRes.json()) as { url: string }
        screenshotUrl = json.url
      }

      // 2) 사이트 등록
      const result = await submitSite({
        name: form.name,
        url: form.url,
        description: form.description || undefined,
        category: form.category || undefined,
        builtWith: form.builtWith || undefined,
        isCreator: form.isCreator,
        email: form.email || undefined,
        turnstileToken: turnstileToken ?? undefined,
        screenshotUrl,
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
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-coral/10 flex items-center justify-center text-coral text-2xl">
                ✓
              </div>
              <h1 className="text-2xl font-bold mb-3 font-[var(--font-outfit)]">
                감사합니다!
              </h1>
              <p className="text-text-medium mb-6">
                운영자 검수 후 24-72시간 내 게시됩니다.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setForm(INITIAL_STATE)
                    setSubmitted(false)
                    setError(null)
                  }}
                  className="bg-coral hover:bg-coral-hover text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Submit Another
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/account/submissions')}
                  className="bg-bg-elevated hover:bg-bg-base border border-stroke text-text-high font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  내 제출 목록
                </button>
              </div>
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
              Submit Your Project
            </h1>
            <p className="text-[13px] text-text-muted">
              바이브코딩으로 만든 프로젝트를 등록해주세요. 검수 후 ShowVibe에 게시됩니다.
            </p>
          </div>

          <div className="bg-bg-surface border border-stroke rounded-xl p-6 mb-8 text-sm text-text-medium leading-relaxed">
            <p className="mb-2">
              <span className="font-medium text-text-high">데이터 출처 표시 정책</span>
            </p>
            <p>
              ShowVibe는 자동 수집된 사이트와 제작자가 직접 등록한 사이트를 구분해 표시합니다.
              직접 등록한 프로젝트는{' '}
              <span className="text-coral">creator_submitted</span> 배지가 부여되며,
              제작자 인증을 완료하면 더 많은 권한(썸네일/설명 수정 등)을 얻습니다.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-bg-surface border border-stroke rounded-xl p-6 lg:p-8 space-y-6"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text-high mb-2"
              >
                Project Name <span className="text-coral">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="My Awesome Project"
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
              />
            </div>

            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-text-high mb-2"
              >
                Project URL <span className="text-coral">*</span>
              </label>
              <input
                id="url"
                type="url"
                required
                value={form.url}
                onChange={(e) => updateField('url', e.target.value)}
                placeholder="https://yourproject.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
              />
              <p className="text-xs text-text-medium mt-2">
                실제 접속 가능한 라이브 URL을 입력해주세요.
              </p>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-text-high"
                >
                  Short Description
                </label>
                <span className="text-xs text-text-muted">
                  {form.description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
              <textarea
                id="description"
                rows={4}
                maxLength={DESCRIPTION_MAX}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="프로젝트를 한 두 문장으로 설명해주세요."
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-text-high mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high focus:outline-none focus:border-coral"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="builtWith"
                  className="block text-sm font-medium text-text-high mb-2"
                >
                  Built With
                </label>
                <select
                  id="builtWith"
                  value={form.builtWith}
                  onChange={(e) => updateField('builtWith', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high focus:outline-none focus:border-coral"
                >
                  {TOOLS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="screenshot"
                className="block text-sm font-medium text-text-high mb-2"
              >
                Screenshot <span className="text-text-muted text-xs">(선택)</span>
              </label>

              {screenshotPreview ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screenshotPreview}
                    alt="스크린샷 미리보기"
                    className="w-full max-h-72 object-contain rounded-lg border border-stroke bg-bg-elevated"
                  />
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className="text-text-muted truncate flex-1">
                      {screenshotFile?.name}
                    </span>
                    <button
                      type="button"
                      onClick={clearScreenshot}
                      className="text-coral hover:text-coral-hover"
                    >
                      제거
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="screenshot"
                  className="flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-lg border border-dashed border-stroke bg-bg-elevated/50 hover:bg-bg-elevated cursor-pointer transition-colors"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-text-muted"
                    aria-hidden
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <span className="text-[13px] text-text-medium">
                    스크린샷 업로드 (PNG/JPEG/WebP, 최대 5MB)
                  </span>
                </label>
              )}

              <input
                id="screenshot"
                type="file"
                accept={SCREENSHOT_ACCEPT}
                onChange={handleScreenshotChange}
                className="sr-only"
              />

              <p className="text-xs text-text-medium mt-2 leading-relaxed">
                업로드하지 않으면 ShowVibe 자동 수집기가 24시간 안에 캡처합니다.
                직접 올리면 16:9 와이드샷, 메인 화면 기준 권장.
              </p>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isCreator}
                  onChange={(e) => updateField('isCreator', e.target.checked)}
                  className="accent-coral mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-text-high">
                    Yes, I built this project
                  </span>
                  <p className="text-xs text-text-medium mt-0.5">
                    체크하면 제작자 Claim 절차로 안내됩니다.
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-high mb-2"
              >
                Email <span className="text-text-muted text-xs">(선택)</span>
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
              />
              <p className="text-xs text-text-medium mt-2">
                검수 결과 알림을 받기 위한 이메일입니다.
              </p>
            </div>

            {TURNSTILE_SITEKEY && (
              <div>
                <label className="block text-sm font-medium text-text-high mb-2">
                  Verification
                </label>
                <TurnstileWidget
                  sitekey={TURNSTILE_SITEKEY}
                  onToken={setTurnstileToken}
                />
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
              className="w-full bg-coral hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-3.5 rounded-lg transition-colors"
            >
              {isPending ? '제출 중...' : 'Submit for Review'}
            </button>

            <p className="text-xs text-text-medium text-center">
              제출 후 운영자 검수 단계를 거쳐 24-72시간 내 게시됩니다.
            </p>
          </form>
        </section>
      </main>
    </AppShell>
  )
}
