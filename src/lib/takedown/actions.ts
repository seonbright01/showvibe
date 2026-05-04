'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyTurnstile } from '@/lib/turnstile/verify'
import { takedownSchema } from './validators'

type SupabaseUntyped = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any
}

export type SubmitTakedownResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

export async function submitTakedown(
  input: unknown,
): Promise<SubmitTakedownResult> {
  const parse = takedownSchema.safeParse(input)
  if (!parse.success) {
    return {
      ok: false,
      error: parse.error.issues[0]?.message ?? '입력값을 확인해주세요',
    }
  }
  const data = parse.data

  // 보안: Turnstile 토큰 필수 검증 (sitekey 설정 시)
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!data.turnstileToken) {
      return { ok: false, error: 'Captcha 인증을 완료해주세요' }
    }
    const ok = await verifyTurnstile(data.turnstileToken)
    if (!ok) return { ok: false, error: 'Captcha 인증 실패' }
  }

  let hostname: string
  try {
    hostname = new URL(data.targetUrl).hostname.replace(/^www\./, '')
  } catch {
    return { ok: false, error: '올바른 URL이 아닙니다' }
  }

  // 보안: LIKE-injection 방지 — hostname의 % _ \ 제거
  const safeHostname = hostname.replace(/[%_\\]/g, '')

  const supabase = await createClient()
  const db = supabase as unknown as SupabaseUntyped

  const { data: site } = (await db
    .from('sites')
    .select('id')
    .ilike('normalized_url', `%${safeHostname}%`)
    .limit(1)
    .maybeSingle()) as { data: { id: string } | null }

  const { error } = (await db.from('takedown_requests').insert({
    site_id: site?.id ?? null,
    target_url: data.targetUrl,
    requester_email: data.email,
    request_type: data.requestType,
    reason: data.reason,
    status: 'pending',
  })) as { error: { message: string } | null }

  if (error) return { ok: false, error: error.message }

  // 보안: privacy 신고 자동 unlisted 제거. abuse vector — 인증 없이 누구나 임의
  // 사이트를 비공개로 만들 수 있었음. admin이 /admin/takedowns에서 검수 후 처리.

  return {
    ok: true,
    message:
      '신고가 접수되었습니다. 영업일 기준 24-48시간 내 처리 결과를 안내드립니다.',
  }
}
