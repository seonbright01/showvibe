'use client'

import { useActionState, useState } from 'react'
import {
  sendContactMessage,
  type ContactResult,
} from '@/lib/contact/actions'
import { TurnstileWidget } from '@/components/turnstile/TurnstileWidget'

const TURNSTILE_SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY

interface ContactFormProps {
  defaultName?: string
  defaultEmail?: string
}

export function ContactForm({ defaultName, defaultEmail }: ContactFormProps) {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState<
    ContactResult | null,
    FormData
  >(sendContactMessage, null)

  const isSuccess = Boolean(state && 'ok' in state && state.ok)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        label="이름"
        name="name"
        defaultValue={defaultName}
        required
        maxLength={60}
        placeholder="홍길동"
      />
      <Field
        label="이메일"
        name="email"
        type="email"
        defaultValue={defaultEmail}
        required
        placeholder="you@example.com"
      />
      <Field
        label="제목 (선택)"
        name="subject"
        maxLength={120}
        placeholder="예) 사이트 등록 문의"
      />
      <Field
        label="문의 내용"
        name="message"
        as="textarea"
        rows={8}
        required
        minLength={10}
        maxLength={4000}
        placeholder="문의하실 내용을 자세히 적어주세요. (최소 10자)"
      />

      {turnstileToken !== null && (
        <input type="hidden" name="turnstileToken" value={turnstileToken} />
      )}
      {TURNSTILE_SITEKEY && (
        <div>
          <label className="block text-xs text-text-medium font-medium mb-1.5">
            자동 인증
          </label>
          <TurnstileWidget
            sitekey={TURNSTILE_SITEKEY}
            onToken={setTurnstileToken}
          />
        </div>
      )}

      {state && 'ok' in state && !state.ok && (
        <p
          role="alert"
          className="text-[13px] text-coral bg-coral/10 border border-coral/30 rounded-lg px-3 py-2"
        >
          {state.error}
        </p>
      )}

      {state && state.ok && (
        <p
          role="status"
          className="text-[13px] text-active bg-active/10 border border-active/30 rounded-lg px-3 py-2"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || isSuccess}
        className="rounded-lg bg-coral px-5 py-2.5 text-[13px] font-semibold text-coral-ink hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? '전송 중…' : isSuccess ? '전송 완료' : '문의 보내기'}
      </button>
    </form>
  )
}

interface FieldProps {
  label: string
  name: string
  type?: string
  defaultValue?: string
  required?: boolean
  placeholder?: string
  maxLength?: number
  minLength?: number
  as?: 'input' | 'textarea'
  rows?: number
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required,
  placeholder,
  maxLength,
  minLength,
  as = 'input',
  rows,
}: FieldProps) {
  const baseClass =
    'w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral'

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-text-medium font-medium">
        {label}
        {required && <span className="text-coral ml-1">*</span>}
      </span>
      {as === 'textarea' ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          rows={rows}
          className={`${baseClass} leading-relaxed`}
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          className={baseClass}
        />
      )}
    </label>
  )
}
