import { createServiceClient } from '@/lib/supabase/service'

export interface MemberRow {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: 'user' | 'creator' | 'admin'
  bio: string | null
  createdAt: string
  claimedCount: number
  isBanned: boolean
  bannedAt: string | null
  bannedReason: string | null
}

interface RawMemberRow {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: string
  bio: string | null
  created_at: string
  claims?: { count: number }[] | null
  is_banned?: boolean | null
  banned_at?: string | null
  banned_reason?: string | null
}

const VALID_ROLES = new Set(['user', 'creator', 'admin'])

function normalizeRole(role: string): MemberRow['role'] {
  return VALID_ROLES.has(role) ? (role as MemberRow['role']) : 'user'
}

export async function getAllMembers(limit = 200): Promise<MemberRow[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, name, email, avatar_url, role, bio, created_at, claims(count), is_banned, banned_at, banned_reason',
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) {
      if (error && process.env.NODE_ENV !== 'production') {
        console.error('[members] getAllMembers failed:', error)
      }
      return []
    }

    return (data as unknown as RawMemberRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatarUrl: row.avatar_url,
      role: normalizeRole(row.role),
      bio: row.bio,
      createdAt: row.created_at,
      claimedCount: row.claims?.[0]?.count ?? 0,
      isBanned: row.is_banned ?? false,
      bannedAt: row.banned_at ?? null,
      bannedReason: row.banned_reason ?? null,
    }))
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[members] getAllMembers exception:', err)
    }
    return []
  }
}
