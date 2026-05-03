'use client'

import { useState, useTransition } from 'react'
import { resolveTakedown } from '@/lib/admin/actions'

export interface TakedownRow {
  id: string
  requester_email: string
  requester_name: string | null
  target_url: string
  reason: string
  request_type: string
  created_at: string
  site_id: string | null
  sites: {
    id: string
    name: string
    url: string
    normalized_url: string | null
  } | null
}

interface Props {
  row: TakedownRow
}

type Decision = 'approved' | 'rejected' | 'info_required'

export function TakedownItem({ row }: Props) {
  const [note, setNote] = useState('')
  const [resolved, setResolved] = useState<Decision | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handle(decision: Decision) {
    setError(null)
    startTransition(async () => {
      const res = await resolveTakedown(row.id, decision, note || undefined)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setResolved(decision)
    })
  }

  if (resolved) {
    return (
      <article className="rounded-lg border border-stroke bg-bg-surface p-4 opacity-60">
        <p className="font-mono text-[12px] text-text-muted">
          #{row.id.slice(0, 8)} resolved as <span className="text-text-high">{resolved}</span>
        </p>
      </article>
    )
  }

  const submittedAt = new Date(row.created_at).toLocaleString()

  return (
    <article className="space-y-3 rounded-lg border border-stroke bg-bg-surface p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="font-mono text-[11px] text-text-muted">
            #{row.id.slice(0, 8)} · {row.request_type} · {submittedAt}
          </p>
          <p className="text-[13px] text-text-high">
            {row.requester_name ?? 'Anonymous'}{' '}
            <span className="font-mono text-[12px] text-text-medium">
              &lt;{row.requester_email}&gt;
            </span>
          </p>
        </div>
      </header>

      <div className="space-y-1">
        <p className="font-mono text-[11px] uppercase text-text-muted">Target URL</p>
        <a
          href={row.target_url}
          target="_blank"
          rel="noopener nofollow noreferrer"
          className="break-all font-mono text-[12px] text-coral hover:underline"
        >
          {row.target_url}
        </a>
      </div>

      {row.sites && (
        <div className="rounded border border-stroke bg-bg-base p-2.5 text-[12px]">
          <p className="font-mono text-[10.5px] uppercase text-text-muted">Matched site</p>
          <p className="text-text-high">{row.sites.name}</p>
          <a
            href={row.sites.url}
            target="_blank"
            rel="noopener nofollow noreferrer"
            className="break-all font-mono text-[11px] text-text-medium hover:text-coral"
          >
            {row.sites.url}
          </a>
        </div>
      )}

      <div className="space-y-1">
        <p className="font-mono text-[11px] uppercase text-text-muted">Reason</p>
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-text-medium">
          {row.reason}
        </p>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Admin note (optional)"
        rows={2}
        className="w-full resize-none rounded-md border border-stroke bg-bg-base px-3 py-2 text-[13px] text-text-high placeholder:text-text-dim focus:border-coral focus:outline-none"
      />

      {error && (
        <p role="alert" className="text-[12px] text-coral">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          disabled={isPending}
          onClick={() => handle('approved')}
          className="inline-flex items-center justify-center rounded-md bg-coral px-3 py-1.5 text-[12px] font-semibold text-coral-ink hover:bg-coral-hover disabled:opacity-50"
        >
          Approve + Hide
        </button>
        <button
          disabled={isPending}
          onClick={() => handle('rejected')}
          className="inline-flex items-center justify-center rounded-md border border-stroke bg-bg-elevated px-3 py-1.5 text-[12px] font-semibold text-text-high hover:bg-bg-base disabled:opacity-50"
        >
          Reject
        </button>
        <button
          disabled={isPending}
          onClick={() => handle('info_required')}
          className="inline-flex items-center justify-center rounded-md border border-stroke bg-bg-elevated px-3 py-1.5 text-[12px] font-semibold text-text-medium hover:bg-bg-base disabled:opacity-50"
        >
          Need Info
        </button>
      </div>
    </article>
  )
}
