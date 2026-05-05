'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/ses'
import { verifyTurnstile } from '@/lib/turnstile/verify'
import { takedownSchema, type TakedownInput } from './validators'

export type SubmitTakedownResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

const REQUEST_TYPE_LABELS: Record<TakedownInput['requestType'], string> = {
  copyright: '저작권 침해',
  privacy: '개인정보/프라이버시',
  defamation: '명예훼손',
  other: '기타',
}

async function sendAcknowledgment(input: TakedownInput): Promise<void> {
  const typeLabel = REQUEST_TYPE_LABELS[input.requestType]
  const submittedAt = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  })

  const text = [
    '안녕하세요, ShowVibe입니다.',
    '',
    '신고가 정상적으로 접수되었습니다.',
    '',
    `· 신고 유형: ${typeLabel}`,
    `· 대상 URL: ${input.targetUrl}`,
    `· 접수 시각: ${submittedAt} (KST)`,
    '',
    '영업일 기준 24-48시간 내에 검토 결과를 회신드립니다.',
    '추가 자료가 필요한 경우 본 메일에 답신해 주세요.',
    '',
    '감사합니다.',
    'ShowVibe 운영팀',
  ].join('\n')

  await sendEmail({
    to: input.email,
    subject: '[ShowVibe] 신고 접수가 확인되었습니다',
    text,
  })
}

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

  // 보안: ILIKE wildcard injection 방지 — origin (protocol + hostname) 정확 매칭만 허용.
  // sites.normalized_url 은 `${protocol}//${host}${path}` canonical 형태로 저장되므로,
  // 추가 안전을 위해 eq() 사용. path 가 다른 동일 origin 사이트는 site_id null 처리.
  let origin: string
  try {
    const u = new URL(data.targetUrl)
    const host = u.host.replace(/^www\./, '').toLowerCase()
    origin = `${u.protocol}//${host}`
  } catch {
    return { ok: false, error: '올바른 URL이 아닙니다' }
  }

  const supabase = await createClient()

  // 보안 (P3.4): 같은 email 이 60초 내 5건 초과 신고 시 reject (anon spam 방지).
  const TAKEDOWN_RATE_LIMIT_PER_MIN = 5
  const sinceIso = new Date(Date.now() - 60_000).toISOString()
  const { count } = await supabase
    .from('takedown_requests')
    .select('id', { count: 'exact', head: true })
    .eq('requester_email', data.email)
    .gte('created_at', sinceIso)
  if ((count ?? 0) >= TAKEDOWN_RATE_LIMIT_PER_MIN) {
    return {
      ok: false,
      error: '너무 빠르게 신고하고 있습니다. 잠시 후 다시 시도해주세요.',
    }
  }

  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('normalized_url', origin)
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('takedown_requests').insert({
    site_id: site?.id ?? null,
    target_url: data.targetUrl,
    requester_email: data.email,
    request_type: data.requestType,
    reason: data.reason,
    status: 'pending',
  })

  if (error) return { ok: false, error: error.message }

  // 보안: privacy 신고 자동 unlisted 제거. abuse vector — 인증 없이 누구나 임의
  // 사이트를 비공개로 만들 수 있었음. admin이 /admin/takedowns에서 검수 후 처리.

  await sendAcknowledgment(data)

  return {
    ok: true,
    message:
      '신고가 접수되었습니다. 영업일 기준 24-48시간 내 처리 결과를 안내드립니다.',
  }
}
