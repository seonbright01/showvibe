'use client'

import { useEffect, useState, useTransition } from 'react'
import { reportComment } from '@/lib/comments/actions'

interface Props {
  commentId: string
}

type ReportReason = 'spam' | 'abuse' | 'ad' | 'privacy' | 'other'

const REASON_OPTIONS: ReadonlyArray<{ value: ReportReason; label: string }> = [
  { value: 'spam', label: '스팸 / 도배' },
  { value: 'abuse', label: '욕설 / 비방' },
  { value: 'ad', label: '광고 / 홍보' },
  { value: 'privacy', label: '개인정보 노출' },
  { value: 'other', label: '기타' },
]

export function ReportButton({ commentId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>('spam')
  const [detail, setDetail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  function resetAndClose() {
    setIsOpen(false)
    setReason('spam')
    setDetail('')
    setError(null)
    setSuccess(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await reportComment({
        commentId,
        reason,
        detail: detail.trim() || undefined,
      })
      if (res.error) {
        setError(res.error)
        return
      }
      setSuccess(true)
      setTimeout(() => resetAndClose(), 1500)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hover:text-error transition-colors"
      >
        신고
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="댓글 신고"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetAndClose()
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-stroke bg-bg-surface p-5 shadow-xl">
            <h3 className="text-base font-bold text-text-high mb-1">
              댓글 신고하기
            </h3>
            <p className="text-[11px] text-text-muted mb-4">
              운영팀이 검토 후 조치합니다. 동일 댓글에 5회 이상 신고가 누적되면
              자동 비공개 처리됩니다.
            </p>

            {success ? (
              <div className="rounded-lg bg-bg-elevated border border-stroke p-4 text-[13px] text-text-high text-center">
                신고가 접수되었습니다.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="space-y-2">
                  <legend className="text-[13px] font-medium text-text-high mb-2">
                    신고 사유
                  </legend>
                  {REASON_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 text-[13px] text-text-medium cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={opt.value}
                        checked={reason === opt.value}
                        onChange={() => setReason(opt.value)}
                        className="accent-coral"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </fieldset>

                <div>
                  <label
                    htmlFor="report-detail"
                    className="block text-[13px] font-medium text-text-high mb-2"
                  >
                    상세 내용 <span className="text-text-muted">(선택)</span>
                  </label>
                  <textarea
                    id="report-detail"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="신고 사유를 자세히 적어주세요"
                    className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-stroke text-text-high placeholder:text-text-muted text-[13px] focus:outline-none focus:border-coral resize-y"
                  />
                  <p className="mt-1 text-[11px] font-mono text-text-muted text-right tabular-nums">
                    {detail.length}/500
                  </p>
                </div>

                {error && (
                  <p role="alert" className="text-[13px] text-error">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    disabled={isPending}
                    className="bg-bg-elevated hover:bg-bg-surface border border-stroke text-text-medium text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-coral hover:bg-coral-hover disabled:bg-stroke disabled:text-text-muted text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {isPending ? '제출 중...' : '신고 제출'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
