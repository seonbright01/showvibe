'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toggleEditorsPick, updateEditorsNote } from '@/lib/admin/editors-pick'

interface AdminSite {
  id: string
  name: string
  url: string
  isEditorsPick: boolean
  editorsNote: string | null
  imageUrl: string | null
  aiSummary: string | null
  vibeScore: number | null
  category: string | null
}

interface Props {
  site: AdminSite
}

const NOTE_MAX = 500

export function EditorsPickRow({ site }: Props) {
  const [isPick, setIsPick] = useState(site.isEditorsPick)
  const [note, setNote] = useState(site.editorsNote ?? '')
  const [savedNote, setSavedNote] = useState(site.editorsNote ?? '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  const noteDirty = note !== savedNote

  function onTogglePick() {
    const next = !isPick
    setIsPick(next)
    setError(null)
    startTransition(async () => {
      const res = await toggleEditorsPick({ siteId: site.id, isPick: next })
      if (!res.ok) {
        setIsPick(!next)
        setError(res.error ?? 'toggle failed')
      }
    })
  }

  function onSaveNote() {
    if (!noteDirty) return
    setError(null)
    startTransition(async () => {
      const res = await updateEditorsNote({ siteId: site.id, note })
      if (!res.ok) {
        setError(res.error ?? 'note save failed')
      } else {
        setSavedNote(note)
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 1500)
      }
    })
  }

  return (
    <li
      className={`rounded-xl border bg-bg-surface p-3 transition-colors ${
        isPick ? 'border-coral/40' : 'border-stroke'
      }`}
    >
      <div className="flex gap-3">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-bg-elevated border border-stroke">
          {site.imageUrl ? (
            <Image
              src={site.imageUrl}
              alt={site.name}
              fill
              sizes="128px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-text-dim">
              No image
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/projects/${site.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-2 text-[14px] font-semibold text-text-high hover:text-coral"
              >
                {site.name}
              </Link>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="block truncate font-mono text-[11px] text-text-muted hover:text-coral"
              >
                {site.url}
              </a>
            </div>
            <button
              type="button"
              onClick={onTogglePick}
              disabled={isPending}
              aria-pressed={isPick}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-60 ${
                isPick
                  ? 'bg-coral text-coral-ink hover:bg-coral-hover'
                  : 'border border-stroke bg-bg-elevated text-text-high hover:bg-bg-base'
              }`}
            >
              {isPick ? '✓ Picked' : 'Pick this'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-text-muted">
            {site.category && (
              <span className="rounded border border-stroke bg-bg-elevated px-1.5 py-0.5">
                {site.category}
              </span>
            )}
            {site.vibeScore !== null && (
              <span className="rounded border border-stroke bg-bg-elevated px-1.5 py-0.5">
                Vibe {site.vibeScore}
              </span>
            )}
          </div>

          {site.aiSummary && (
            <p className="line-clamp-2 text-[12px] text-text-muted">
              AI: {site.aiSummary}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <label className="flex items-center justify-between text-[11.5px] text-text-muted">
          <span>추천 멘트 (Editor&apos;s Note)</span>
          <span className={note.length > NOTE_MAX ? 'text-coral' : ''}>
            {note.length} / {NOTE_MAX}
          </span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX + 50))}
          rows={2}
          maxLength={NOTE_MAX}
          placeholder="홈 카드 아래 표시될 추천 한 줄. 비우면 AI 요약 사용."
          className="w-full resize-y rounded-lg border border-stroke bg-bg-base px-3 py-2 text-[13px] text-text-high outline-none focus:border-coral"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-text-muted">
            {savedFlash && '✓ 저장됨'}
            {error && <span className="text-coral">{error}</span>}
          </span>
          <button
            type="button"
            onClick={onSaveNote}
            disabled={!noteDirty || isPending || note.length > NOTE_MAX}
            className="rounded-lg bg-bg-elevated border border-stroke px-3 py-1 text-[12px] font-medium text-text-high hover:bg-bg-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            저장
          </button>
        </div>
      </div>
    </li>
  )
}
