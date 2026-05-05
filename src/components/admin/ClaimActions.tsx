'use client'

import { useState } from 'react'
import {
  approveClaimAction,
  rejectClaimAction,
} from '@/lib/claims/admin-actions'

interface ClaimActionsProps {
  claimId: string
  siteName: string
  status: 'pending' | 'verified' | 'rejected'
}

export function ClaimActions({ claimId, siteName, status }: ClaimActionsProps) {
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')

  if (status === 'verified') {
    return (
      <span className="inline-flex items-center rounded-full bg-active/15 text-active px-2 py-0.5 text-[11px] font-medium">
        승인됨
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center rounded-full bg-bg-elevated text-text-muted border border-stroke px-2 py-0.5 text-[11px] font-medium">
        거절됨
      </span>
    )
  }

  if (showReject) {
    return (
      <form
        action={rejectClaimAction}
        className="inline-flex items-center gap-1.5"
        onSubmit={(e) => {
          if (!window.confirm(`"${siteName}" 클레임을 거절할까요?`)) {
            e.preventDefault()
          }
        }}
      >
        <input type="hidden" name="claimId" value={claimId} />
        <input
          type="text"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="거절 사유 (선택)"
          maxLength={300}
          className="rounded-md border border-stroke bg-bg-elevated px-2 py-1 text-[12px] w-40 text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
        />
        <button
          type="submit"
          className="rounded px-2 py-1 text-[12px] text-coral hover:bg-coral/10"
        >
          거절
        </button>
        <button
          type="button"
          onClick={() => {
            setShowReject(false)
            setReason('')
          }}
          className="rounded px-1 text-[12px] text-text-muted hover:text-text-high"
        >
          ✕
        </button>
      </form>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <form
        action={approveClaimAction}
        className="inline"
        onSubmit={(e) => {
          if (!window.confirm(`"${siteName}" 클레임을 승인할까요? (소유권 부여)`)) {
            e.preventDefault()
          }
        }}
      >
        <input type="hidden" name="claimId" value={claimId} />
        <button
          type="submit"
          className="rounded px-2 py-1 text-[12px] text-active hover:bg-active/10"
        >
          승인
        </button>
      </form>
      <button
        type="button"
        onClick={() => setShowReject(true)}
        className="rounded px-2 py-1 text-[12px] text-coral hover:bg-coral/10"
      >
        거절
      </button>
    </div>
  )
}
