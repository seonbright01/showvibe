'use client'

import { useActionState } from 'react'
import { signInWithEmail } from '@/lib/auth/actions'

type ActionResult =
  | { error: string }
  | { success: true; message: string }
  | null

interface SignInFormProps {
  next?: string
}

export function SignInForm({ next }: SignInFormProps = {}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    signInWithEmail,
    null,
  )

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signin-email" className="text-xs text-text-medium font-medium">
          이메일
        </label>
        <input
          id="signin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="signin-password" className="text-xs text-text-medium font-medium">
          비밀번호
        </label>
        <input
          id="signin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
          placeholder="••••••••"
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

      <button
        type="submit"
        disabled={pending}
        className="bg-coral hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {pending ? '로그인 중…' : '로그인'}
      </button>
    </form>
  )
}
