'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { initClaimSchema, verifyClaimSchema } from './validators'
import { verifyMetaTag } from './meta-tag-verify'
import { verifyDns } from './dns-verify'

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

  // 보안 (P3.1): is_banned 체크
  const { data: profile } = await supabase
    .from('users')
    .select('is_banned')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.is_banned) {
    return { ok: false, error: '이용이 정지된 계정입니다' }
  }

  // 보안 (P3.4): 같은 user 가 60초 내 3건 초과 claim 시 reject (brute-force 방지).
  const CLAIM_RATE_LIMIT_PER_MIN = 3
  const sinceIso = new Date(Date.now() - 60_000).toISOString()
  const { count } = await supabase
    .from('claims')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', sinceIso)
  if ((count ?? 0) >= CLAIM_RATE_LIMIT_PER_MIN) {
    return {
      ok: false,
      error: '너무 빠르게 클레임을 시도하고 있습니다. 잠시 후 다시 시도해주세요.',
    }
  }

  const normalized = normalizeUrl(parse.data.siteUrl)

  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('normalized_url', normalized)
    .maybeSingle()

  if (!site) {
    return {
      ok: false,
      error:
        '등록된 프로젝트가 아닙니다. 먼저 Submit하거나 사이트가 자동 수집되기를 기다려주세요.',
    }
  }

  const verificationToken = `showvibe-verify-${randomUUID().slice(0, 16)}`

  const { data: claim, error } = await supabase
    .from('claims')
    .insert({
      site_id: site.id,
      user_id: user.id,
      claim_method: parse.data.method,
      status: 'pending',
      verification_token: verificationToken,
    })
    .select('id, verification_token')
    .single()

  if (error || !claim) {
    return { ok: false, error: error?.message ?? 'Claim 생성 실패' }
  }

  return {
    ok: true,
    claimId: claim.id,
    token: claim.verification_token ?? verificationToken,
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

  const { data: claim } = (await supabase
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

  await supabase
    .from('claims')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', claim.id)

  // 보안: site status/visibility 자동 변경 제거. 클레임은 소유권만 부여.
  const siteUpdates = {
    is_claimed: true,
    claimed_by_user_id: user.id,
  }
  // 보안: blocked/archived 사이트의 자동 unblock 제거. 클레임 인증만으로 admin이
  // 차단한 사이트를 강제 활성화할 수 있었음. blocked 사이트는 admin 검수 콘솔
  // (/admin/review)에서만 unblock 가능. 클레임 자체는 소유권만 부여.

  await supabase.from('sites').update(siteUpdates).eq('id', claim.site_id)

  revalidatePath(`/projects/${claim.site_id}`)
  return { ok: true, status: 'verified' }
}
