'use client'

import { useState, useTransition } from 'react'
import { deleteComment, updateComment } from '@/lib/comments/actions'
import { ReportButton } from './ReportButton'
import type { CommentWithAuthor } from './types'

interface Props {
  comment: CommentWithAuthor
  currentUserId: string | null
}

const MIN_LENGTH = 2
const MAX_LENGTH = 2000

function formatRelative(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffSec = Math.max(0, Math.floor((now - then) / 1000))

  if (diffSec < 60) return '방금 전'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}일 전`
  const diffWeek = Math.floor(diffDay / 7)
  if (diffWeek < 5) return `${diffWeek}주 전`
  const diffMonth = Math.floor(diffDay / 30)
  if (diffMonth < 12) return `${diffMonth}개월 전`
  const diffYear = Math.floor(diffDay / 365)
  return `${diffYear}년 전`
}

export function CommentItem({ comment, currentUserId }: Props) {
  const author = comment.users
  const isOwn = currentUserId !== null && comment.user_id === currentUserId
  const isMaker = author?.role === 'creator'

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(comment.body)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isDeleted, setIsDeleted] = useState(false)

  function handleSaveEdit() {
    const trimmed = draft.trim()
    if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
      setError('댓글은 2~2000자 사이여야 합니다')
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await updateComment({ commentId: comment.id, body: trimmed })
      if (res.error) {
        setError(res.error)
        return
      }
      setIsEditing(false)
    })
  }

  function handleDelete() {
    if (typeof window !== 'undefined' && !window.confirm('이 댓글을 삭제하시겠습니까?')) return
    setError(null)
    startTransition(async () => {
      const res = await deleteComment(comment.id)
      if (res.error) {
        setError(res.error)
        return
      }
      setIsDeleted(true)
    })
  }

  if (isDeleted) {
    return (
      <li className="py-3 text-[13px] text-text-muted italic">
        삭제된 댓글입니다.
      </li>
    )
  }

  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        {author?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.avatar_url}
            alt={author.name}
            className="w-7 h-7 rounded-full bg-bg-elevated flex-shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-bg-elevated flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-text-medium">
            {(author?.name ?? '?').charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[13px] font-semibold text-text-high">
              {author?.name ?? '알 수 없음'}
            </span>
            {isMaker && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                style={{
                  color: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                }}
              >
                Maker
              </span>
            )}
            <span
              className="text-[11px] font-mono text-text-muted"
              title={new Date(comment.created_at).toLocaleString('ko-KR')}
            >
              {formatRelative(comment.created_at)}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-[11px] font-mono text-text-muted">(수정됨)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={MAX_LENGTH}
                aria-label="댓글 수정"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-stroke text-text-high focus:outline-none focus:border-coral resize-y text-[13px]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isPending}
                  className="bg-coral hover:bg-coral-hover disabled:bg-stroke text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors"
                >
                  {isPending ? '저장 중...' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setDraft(comment.body)
                    setError(null)
                  }}
                  disabled={isPending}
                  className="bg-bg-elevated hover:bg-bg-surface border border-stroke text-text-medium text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-text-medium leading-relaxed whitespace-pre-wrap break-words">
              {comment.body}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-2 text-[11px] text-error">
              {error}
            </p>
          )}

          {!isEditing && (
            <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-text-muted">
              <span>♡ {comment.like_count}</span>
              {isOwn ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="hover:text-text-high transition-colors"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="hover:text-error transition-colors disabled:opacity-50"
                  >
                    삭제
                  </button>
                </>
              ) : currentUserId ? (
                <ReportButton commentId={comment.id} />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
