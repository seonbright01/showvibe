'use client'

import { useActionState } from 'react'
import { signUpWithEmail } from '@/lib/auth/actions'
import { AvatarPicker } from './AvatarPicker'

type ActionResult =
  | { error: string }
  | { success: true; message: string }
  | null

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    signUpWithEmail,
    null,
  )

  const isSuccess = state !== null && 'success' in state && state.success

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <AvatarPicker />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-name" className="text-xs text-text-medium font-medium">
          이름
        </label>
        <input
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
          placeholder="홍길동"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-email" className="text-xs text-text-medium font-medium">
          이메일
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-password" className="text-xs text-text-medium font-medium">
          비밀번호
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
          className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
          placeholder="6자 이상"
        />
      </div>

      {state && 'error' in state && (
        <p
          role="alert"
          className="text-[13px] text-coral bg-coral/10 border border-coral/30 rounded-lg px-3 py-2"
        >
          {state.error}
        </p>
      )}

      {isSuccess && (
        <p
          role="status"
          className="text-[13px] text-text-high bg-bg-elevated border border-stroke rounded-lg px-3 py-2"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || isSuccess}
        className="bg-coral hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {pending ? '가입 중…' : '회원가입'}
      </button>
    </form>
  )
}
