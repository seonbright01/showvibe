'use client'

import { useRef, useState, useTransition } from 'react'
import { updateMemberRoleAction } from '@/lib/members/actions'

interface RoleSelectProps {
  userId: string
  initialRole: 'user' | 'creator' | 'admin'
}

const ROLES: Array<{ value: RoleSelectProps['initialRole']; label: string }> = [
  { value: 'user', label: 'user' },
  { value: 'creator', label: 'creator' },
  { value: 'admin', label: 'admin' },
]

export function RoleSelect({ userId, initialRole }: RoleSelectProps) {
  const [role, setRole] = useState(initialRole)
  const formRef = useRef<HTMLFormElement | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <form ref={formRef} action={updateMemberRoleAction} className="inline-block">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        value={role}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as RoleSelectProps['initialRole']
          setRole(next)
          startTransition(() => formRef.current?.requestSubmit())
        }}
        className="rounded-md border border-stroke bg-bg-elevated px-2 py-1 text-[12px] text-text-high focus:outline-none focus:border-coral disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </form>
  )
}
