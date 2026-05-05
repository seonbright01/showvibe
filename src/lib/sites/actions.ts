'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { verifyTurnstile } from '@/lib/turnstile/verify'
import { submitSiteSchema } from './validators'

type SupabaseUntyped = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any
}

function normalizeUrlClient(raw: string): string {
  try {
    const u = new URL(raw)
    const host = u.host.replace(/^www\./, '').toLowerCase()
    const path = u.pathname.replace(/\/$/, '') || '/'
    return `${u.protocol}//${host}${path === '/' ? '' : path}`
  } catch {
    return raw
  }
}

export type SubmitSiteResult =
  | { ok: true; siteId: string }
  | { ok: false; error: string }

export async function submitSite(input: unknown): Promise<SubmitSiteResult> {
  const parse = submitSiteSchema.safeParse(input)
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: '로그인이 필요합니다' }

  const db = supabase as unknown as SupabaseUntyped

  // 보안 (P3.1): is_banned 체크
  const { data: profile } = (await db
    .from('users')
    .select('is_banned')
    .eq('id', user.id)
    .maybeSingle()) as { data: { is_banned: boolean } | null }
  if (profile?.is_banned) {
    return { ok: false, error: '이용이 정지된 계정입니다' }
  }

  // 보안 (P3.4): 같은 user 가 60초 내 5건 초과 submit 시 reject.
  // submitted_by_user_id 컬럼은 throttling 마이그레이션에서 추가됨.
  // 컬럼 누락 시 throttle 쿼리 실패 → best-effort 로 통과 (가용성 우선).
  const SUBMIT_RATE_LIMIT_PER_MIN = 5
  const sinceIso = new Date(Date.now() - 60_000).toISOString()
  try {
    const { count } = (await db
      .from('sites')
      .select('id', { count: 'exact', head: true })
      .eq('submitted_by_user_id', user.id)
      .gte('created_at', sinceIso)) as { count: number | null }
    if ((count ?? 0) >= SUBMIT_RATE_LIMIT_PER_MIN) {
      return {
        ok: false,
        error: '너무 많이 제출하고 있습니다. 잠시 후 다시 시도해주세요.',
      }
    }
  } catch {
    // throttle 쿼리 실패 (마이그레이션 미적용 등) — fail-open
  }

  const normalizedUrl = normalizeUrlClient(data.url)

  const { data: existing } = await db
    .from('sites')
    .select('id')
    .eq('normalized_url', normalizedUrl)
    .maybeSingle()
  if (existing) {
    return { ok: false, error: '이미 등록된 프로젝트입니다' }
  }

  // 보안: isCreator 플래그를 신뢰하지 않음. 등록 시점엔 누구든 'creator_submitted'
  // 출처로만 기록되고 소유권은 부여하지 않음. 클레임은 /claim 인증 플로우(meta tag,
  // DNS, GitHub OAuth 등)를 통해서만. 이전엔 isCreator=true로 임의 사이트 소유권 선점 가능.
  // 보안 (P3.4): submitted_by_user_id 로 user-submit 추적 (rate-limit 및 abuse 분석).
  const { data: inserted, error } = (await db
    .from('sites')
    .insert({
      name: data.name,
      url: data.url,
      normalized_url: normalizedUrl,
      description: data.description || null,
      source_type: 'creator_submitted',
      source_platform: data.builtWith || null,
      visibility: 'unlisted',
      status: 'unknown',
      claimed_by_user_id: null,
      is_claimed: false,
      submitted_by_user_id: user.id,
    })
    .select('id')
    .single()) as {
    data: { id: string } | null
    error: { message: string } | null
  }

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? 'DB 저장 실패' }
  }

  if (data.category) {
    await db.from('site_analysis').insert({
      site_id: inserted.id,
      category: data.category,
    })
  }

  // 사용자가 직접 업로드한 스크린샷이 있으면 site_media 에 저장.
  // site_media 가 존재하면 자동 스크린샷 워커가 자동으로 skip 한다
  // (fetchSitesNeedingScreenshot 가 site_media 존재 여부로 필터). [정합성]
  if (data.screenshotUrl) {
    await db.from('site_media').insert({
      site_id: inserted.id,
      media_type: 'screenshot',
      media_source: 'creator_uploaded',
      image_url: data.screenshotUrl,
      image_resolution: 'high',
      is_primary: true,
    })
  }

  revalidatePath('/admin/review')
  return { ok: true, siteId: inserted.id }
}
