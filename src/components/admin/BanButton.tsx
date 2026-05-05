'use client'

import { useState } from 'react'
import { toggleMemberBanAction } from '@/lib/members/actions'

interface BanButtonProps {
  userId: string
  userName: string
  isBanned: boolean
  isSelf: boolean
}

export function BanButton({ userId, userName, isBanned, isSelf }: BanButtonProps) {
  const [reason, setReason] = useState('')
  const [showForm, setShowForm] = useState(false)

  if (isSelf) {
    return <span className="text-[11px] text-text-muted italic">본인</span>
  }

  if (isBanned) {
    return (
      <form action={toggleMemberBanAction} className="inline-block">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="action" value="unban" />
        <button
          type="submit"
          className="rounded px-2 py-1 text-[12px] text-active hover:bg-active/10 transition-colors"
          onClick={(e) => {
            if (!window.confirm(`"${userName}" 이용정지를 해제할까요?`)) {
              e.preventDefault()
            }
          }}
        >
          정지 해제
        </button>
      </form>
    )
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="rounded px-2 py-1 text-[12px] text-coral hover:bg-coral/10 transition-colors"
      >
        이용정지
      </button>
    )
  }

  return (
    <form
      action={toggleMemberBanAction}
      className="inline-flex items-center gap-1.5"
      onSubmit={(e) => {
        if (!window.confirm(`"${userName}" 이용정지 처리할까요?`)) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="action" value="ban" />
      <input
        type="text"
        name="reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="사유 (선택)"
        maxLength={200}
        className="rounded-md border border-stroke bg-bg-elevated px-2 py-1 text-[12px] w-32 text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
      />
      <button
        type="submit"
        className="rounded px-2 py-1 text-[12px] text-coral hover:bg-coral/10"
      >
        확인
      </button>
      <button
        type="button"
        onClick={() => {
          setShowForm(false)
          setReason('')
        }}
        className="rounded px-1 text-[12px] text-text-muted hover:text-text-high"
      >
        ✕
      </button>
    </form>
  )
}
