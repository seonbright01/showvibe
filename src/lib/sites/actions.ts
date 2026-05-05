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

  const normalizedUrl = normalizeUrlClient(data.url)

  const db = supabase as unknown as SupabaseUntyped

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
