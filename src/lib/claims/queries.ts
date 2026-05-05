import { createServiceClient } from '@/lib/supabase/service'

export interface AdminClaimRow {
  id: string
  status: 'pending' | 'verified' | 'rejected'
  claimMethod: 'github' | 'meta_tag' | 'dns' | 'manual'
  verificationToken: string | null
  rejectedReason: string | null
  verifiedAt: string | null
  createdAt: string
  site: {
    id: string
    name: string
    url: string
    status: string
    isClaimed: boolean
  } | null
  requester: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  } | null
}

interface RawRow {
  id: string
  status: string
  claim_method: string
  verification_token: string | null
  rejected_reason: string | null
  verified_at: string | null
  created_at: string
  sites: {
    id: string
    name: string
    url: string
    status: string
    is_claimed: boolean
  } | null
  users: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  } | null
}

const VALID_STATUS = new Set(['pending', 'verified', 'rejected'])
const VALID_METHOD = new Set(['github', 'meta_tag', 'dns', 'manual'])

function normStatus(s: string): AdminClaimRow['status'] {
  return VALID_STATUS.has(s) ? (s as AdminClaimRow['status']) : 'pending'
}
function normMethod(m: string): AdminClaimRow['claimMethod'] {
  return VALID_METHOD.has(m) ? (m as AdminClaimRow['claimMethod']) : 'manual'
}

export async function getAllClaims(limit = 200): Promise<AdminClaimRow[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('claims')
      .select(
        'id, status, claim_method, verification_token, rejected_reason, verified_at, created_at, sites:site_id(id, name, url, status, is_claimed), users:user_id(id, name, email, avatar_url)',
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) {
      if (error && process.env.NODE_ENV !== 'production') {
        console.error('[claims] getAllClaims failed:', error)
      }
      return []
    }

    return (data as unknown as RawRow[]).map((r) => ({
      id: r.id,
      status: normStatus(r.status),
      claimMethod: normMethod(r.claim_method),
      verificationToken: r.verification_token,
      rejectedReason: r.rejected_reason,
      verifiedAt: r.verified_at,
      createdAt: r.created_at,
      site: r.sites
        ? {
            id: r.sites.id,
            name: r.sites.name,
            url: r.sites.url,
            status: r.sites.status,
            isClaimed: r.sites.is_claimed,
          }
        : null,
      requester: r.users
        ? {
            id: r.users.id,
            name: r.users.name,
            email: r.users.email,
            avatarUrl: r.users.avatar_url,
          }
        : null,
    }))
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[claims] getAllClaims exception:', err)
    }
    return []
  }
}
