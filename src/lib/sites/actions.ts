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

  if (data.turnstileToken) {
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

  const { data: inserted, error } = (await db
    .from('sites')
    .insert({
      name: data.name,
      url: data.url,
      normalized_url: normalizedUrl,
      description: data.description || null,
      source_type: data.isCreator ? 'creator_submitted' : 'auto_collected',
      source_platform: data.builtWith || null,
      visibility: 'unlisted',
      status: 'unknown',
      claimed_by_user_id: data.isCreator ? user.id : null,
      is_claimed: data.isCreator,
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

  revalidatePath('/admin/review')
  return { ok: true, siteId: inserted.id }
}
