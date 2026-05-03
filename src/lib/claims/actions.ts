'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { initClaimSchema, verifyClaimSchema } from './validators'
import { verifyMetaTag } from './meta-tag-verify'
import { verifyDns } from './dns-verify'

type SupabaseUntyped = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any
}

function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw)
    const host = u.host.replace(/^www\./, '').toLowerCase()
    return `${u.protocol}//${host}`
  } catch {
    return raw
  }
}

export type InitClaimResult =
  | {
      ok: true
      claimId: string
      token: string
      method: 'github' | 'meta_tag' | 'dns' | 'manual'
    }
  | { ok: false; error: string }

export type VerifyClaimResult =
  | { ok: true; status: 'verified' | 'already_verified' | 'pending_manual_review' }
  | { ok: false; error: string }

interface ClaimRowWithSite {
  id: string
  site_id: string
  claim_method: string
  verification_token: string | null
  status: string
  sites: { url: string; normalized_url: string } | null
}

export async function initClaim(input: unknown): Promise<InitClaimResult> {
  const parse = initClaimSchema.safeParse(input)
  if (!parse.success) {
    return {
      ok: false,
      error: parse.error.issues[0]?.message ?? 'Invalid input',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: '로그인이 필요합니다' }

  const db = supabase as unknown as SupabaseUntyped
  const normalized = normalizeUrl(parse.data.siteUrl)

  const { data: site } = (await db
    .from('sites')
    .select('id')
    .eq('normalized_url', normalized)
    .maybeSingle()) as { data: { id: string } | null }

  if (!site) {
    return {
      ok: false,
      error:
        '등록된 프로젝트가 아닙니다. 먼저 Submit하거나 사이트가 자동 수집되기를 기다려주세요.',
    }
  }

  const verificationToken = `showvibe-verify-${randomUUID().slice(0, 16)}`

  const { data: claim, error } = (await db
    .from('claims')
    .insert({
      site_id: site.id,
      user_id: user.id,
      claim_method: parse.data.method,
      status: 'pending',
      verification_token: verificationToken,
    })
    .select('id, verification_token')
    .single()) as {
    data: { id: string; verification_token: string } | null
    error: { message: string } | null
  }

  if (error || !claim) {
    return { ok: false, error: error?.message ?? 'Claim 생성 실패' }
  }

  return {
    ok: true,
    claimId: claim.id,
    token: claim.verification_token,
    method: parse.data.method,
  }
}

export async function verifyClaim(input: unknown): Promise<VerifyClaimResult> {
  const parse = verifyClaimSchema.safeParse(input)
  if (!parse.success) return { ok: false, error: 'Invalid claim id' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: '로그인이 필요합니다' }

  const db = supabase as unknown as SupabaseUntyped
  const { data: claim } = (await db
    .from('claims')
    .select(
      'id, site_id, claim_method, verification_token, status, sites(url, normalized_url)',
    )
    .eq('id', parse.data.claimId)
    .eq('user_id', user.id)
    .maybeSingle()) as { data: ClaimRowWithSite | null }

  if (!claim) return { ok: false, error: 'Claim을 찾을 수 없습니다' }
  if (claim.status === 'verified') {
    return { ok: true, status: 'already_verified' }
  }
  if (!claim.verification_token) {
    return { ok: false, error: '검증 토큰이 없습니다' }
  }

  const siteUrl = claim.sites?.url
  if (!siteUrl) return { ok: false, error: '사이트 정보를 찾을 수 없습니다' }

  let verified = false

  try {
    if (claim.claim_method === 'meta_tag') {
      verified = await verifyMetaTag(siteUrl, claim.verification_token)
    } else if (claim.claim_method === 'dns') {
      const host = new URL(siteUrl).hostname.replace(/^www\./, '')
      verified = await verifyDns(host, claim.verification_token)
    } else if (claim.claim_method === 'github') {
      return {
        ok: false,
        error:
          'GitHub 인증은 곧 지원됩니다. 우선 메타 태그 또는 DNS 방법을 시도해주세요.',
      }
    } else {
      return { ok: true, status: 'pending_manual_review' }
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }

  if (!verified) {
    return {
      ok: false,
      error:
        '검증에 실패했습니다. 토큰이 사이트에 정상적으로 추가되었는지 확인하세요.',
    }
  }

  await db
    .from('claims')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', claim.id)

  const { data: siteRow } = await db
    .from('sites')
    .select('status, visibility')
    .eq('id', claim.site_id)
    .single()

  const siteUpdates: {
    is_claimed: boolean
    claimed_by_user_id: string
    status?: string
    visibility?: string
    block_reason?: string | null
    recheck_eligible_at?: string | null
    recheck_count?: number
  } = {
    is_claimed: true,
    claimed_by_user_id: user.id,
  }
  if (siteRow?.status === 'blocked' || siteRow?.status === 'archived') {
    siteUpdates.status = 'unknown'
    siteUpdates.visibility = 'unlisted'
    siteUpdates.block_reason = null
    siteUpdates.recheck_eligible_at = null
    siteUpdates.recheck_count = 0
    await db.from('site_analysis').delete().eq('site_id', claim.site_id)
  }

  await db.from('sites').update(siteUpdates).eq('id', claim.site_id)

  revalidatePath(`/projects/${claim.site_id}`)
  return { ok: true, status: 'verified' }
}
