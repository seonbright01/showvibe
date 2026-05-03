'use server'

import { randomBytes } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { verifyTurnstile } from '@/lib/turnstile/verify'
import { subscribeNewsletterSchema } from './validators'

interface ActionResult {
  success?: true
  message?: string
  error?: string
}

// Supabase placeholder Database 타입 우회 (comments/actions.ts 패턴 동일)
type SupabaseUntyped = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any
}

interface SupabaseError {
  code?: string
  message?: string
}

const TOKEN_BYTES = 32

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다'
}

function generateConfirmationToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex')
}

async function sendConfirmationEmail(
  email: string,
  token: string,
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    // Resend 미설정 시 stub — 토큰은 이미 DB에 저장됨
    // eslint-disable-next-line no-console
    console.warn(
      '[newsletter] RESEND_API_KEY not set — confirmation email skipped',
      { email, tokenLength: token.length },
    )
    return
  }

  // 향후 Resend 통합 위치. 현재 stub.
  // eslint-disable-next-line no-console
  console.info('[newsletter] Resend integration TODO', { email })
}

export async function subscribeNewsletter(
  input: unknown,
): Promise<ActionResult> {
  let data
  try {
    data = subscribeNewsletterSchema.parse(input)
  } catch (error: unknown) {
    return { error: getErrorMessage(error) }
  }

  // Turnstile 키 없으면 skip + 경고 (개발/스테이징 환경 graceful)
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
  if (turnstileSecret) {
    if (!data.turnstileToken) {
      return { error: 'Captcha 인증을 완료해주세요' }
    }
    const ok = await verifyTurnstile(data.turnstileToken)
    if (!ok) return { error: 'Captcha 인증에 실패했습니다' }
  } else {
    // eslint-disable-next-line no-console
    console.warn('[newsletter] TURNSTILE_SECRET_KEY not set — skipping captcha')
  }

  let supabase
  try {
    supabase = await createClient()
  } catch (error: unknown) {
    return { error: getErrorMessage(error) }
  }
  const db = supabase as unknown as SupabaseUntyped

  const token = generateConfirmationToken()

  const { error: insertError } = (await db
    .from('newsletter_subscribers')
    .insert({
      email: data.email,
      status: 'pending',
      confirmation_token: token,
      source: data.source ?? 'homepage',
    })) as { error: SupabaseError | null }

  if (insertError) {
    // 23505 = unique violation → 이미 구독 (graceful 응답)
    if (insertError.code === '23505') {
      return {
        success: true,
        message: '이미 구독 중인 이메일입니다.',
      }
    }
    return { error: insertError.message ?? '구독 처리에 실패했습니다' }
  }

  await sendConfirmationEmail(data.email, token)

  return {
    success: true,
    message: '구독 신청이 완료되었습니다. 확인 메일을 확인해주세요.',
  }
}

export type NewsletterActionResult = ActionResult
