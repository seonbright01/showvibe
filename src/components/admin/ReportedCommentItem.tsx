'use client'

import { useState, useTransition } from 'react'
import { moderateComment } from '@/lib/admin/actions'

export interface ReportedCommentRow {
  id: string
  comment_id: string
  reason: string
  detail: string | null
  created_at: string
  comments: {
    id: string
    body: string
    status: string
    like_count: number
    report_count: number
    created_at: string
    site_id: string
    user_id: string
    users: { id: string; name: string | null } | null
  } | null
  reporter: { id: string; name: string | null } | null
}

interface Props {
  row: ReportedCommentRow
}

type Action = 'show' | 'hide' | 'delete'

export function ReportedCommentItem({ row }: Props) {
  const [appliedStatus, setAppliedStatus] = useState<string | null>(
    row.comments?.status ?? null,
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handle(action: Action) {
    if (!row.comments) return
    setError(null)
    const id = row.comments.id
    startTransition(async () => {
      const res = await moderateComment(id, action)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setAppliedStatus(
        action === 'hide' ? 'hidden' : action === 'delete' ? 'deleted' : 'visible',
      )
    })
  }

  if (!row.comments) {
    return (
      <article className="rounded-lg border border-stroke bg-bg-surface p-4 opacity-60">
        <p className="font-mono text-[11px] text-text-muted">
          #{row.id.slice(0, 8)} (orphaned report — comment deleted)
        </p>
      </article>
    )
  }

  const reportedAt = new Date(row.created_at).toLocaleString()
  const isMuted = appliedStatus === 'deleted' || appliedStatus === 'hidden'

  return (
    <article
      className={`space-y-3 rounded-lg border border-stroke bg-bg-surface p-4 ${
        isMuted ? 'opacity-70' : ''
      }`}
    >
      <header className="flex flex-wrap items-start justify-between gap-2 text-[11px]">
        <div className="space-y-0.5 font-mono text-text-muted">
          <p>#{row.id.slice(0, 8)} · {reportedAt}</p>
          <p>
            Reporter:{' '}
            <span className="text-text-medium">{row.reporter?.name ?? 'unknown'}</span>{' '}
            · Reason: <span className="text-text-medium">{row.reason}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className="rounded border border-stroke bg-bg-elevated px-1.5 py-0.5 text-text-muted">
            status: {appliedStatus ?? 'visible'}
          </span>
          <span className="rounded border border-stroke bg-bg-elevated px-1.5 py-0.5 text-text-muted">
            reports: {row.comments.report_count}
          </span>
        </div>
      </header>

      <div className="rounded border border-stroke bg-bg-base p-3">
        <p className="mb-1 font-mono text-[10.5px] uppercase text-text-muted">
          By {row.comments.users?.name ?? 'unknown'}
        </p>
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-text-high">
          {row.comments.body}
        </p>
      </div>

      {row.detail && (
        <div className="text-[12px] leading-relaxed text-text-medium">
          <span className="font-mono text-[10.5px] uppercase text-text-muted">
            Reporter detail:
          </span>{' '}
          {row.detail}
        </div>
      )}

      {error && (
        <p role="alert" className="text-[12px] text-coral">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          disabled={isPending}
          onClick={() => handle('show')}
          className="inline-flex items-center justify-center rounded-md border border-stroke bg-bg-elevated px-3 py-1.5 text-[12px] font-semibold text-text-high hover:bg-bg-base disabled:opacity-50"
        >
          Show
        </button>
        <button
          disabled={isPending}
          onClick={() => handle('hide')}
          className="inline-flex items-center justify-center rounded-md border border-stroke bg-bg-elevated px-3 py-1.5 text-[12px] font-semibold text-text-medium hover:bg-bg-base disabled:opacity-50"
        >
          Hide
        </button>
        <button
          disabled={isPending}
          onClick={() => handle('delete')}
          className="inline-flex items-center justify-center rounded-md bg-coral px-3 py-1.5 text-[12px] font-semibold text-coral-ink hover:bg-coral-hover disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </article>
  )
}
