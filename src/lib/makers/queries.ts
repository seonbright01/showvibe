// TODO: users 테이블에 username 필드가 없어서 현재는 user.id로 라우팅합니다.
// 추후 username 컬럼 추가 시 slug 기반 lookup으로 변경하세요.

import { createClient } from '@/lib/supabase/server'
import {
  mapSiteRow,
  mapAnalysisRow,
  mapMediaRow,
  mapUserRow,
} from '@/lib/sites/mappers'
import type { SiteWithRelations } from '@/lib/sites/queries'
import type { User } from '@/types'

export interface MakerWithStats {
  user: User
  claimedCount: number
  bio: string | null
}

interface UserListRow {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: string
  bio: string | null
  claims?: { count: number }[] | null
}

const SITES_SELECT =
  '*, site_analysis(*), site_media(*), users:claimed_by_user_id(id, name, avatar_url, role)'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function logQueryError(name: string, error: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[makers] ${name} failed:`, error)
  }
}

function shapeJoinedSite(row: unknown): SiteWithRelations | null {
  if (!row || typeof row !== 'object') return null
  const r = row as Record<string, unknown>
  const { site_analysis, site_media, users, ...siteOnly } = r
  const site = mapSiteRow(siteOnly as Parameters<typeof mapSiteRow>[0])

  const rawAnalysis = Array.isArray(site_analysis) ? site_analysis[0] : site_analysis
  const analysis = rawAnalysis
    ? mapAnalysisRow(rawAnalysis as Parameters<typeof mapAnalysisRow>[0])
    : undefined

  let media
  if (Array.isArray(site_media)) {
    const primary = site_media.find(
      (m) => Boolean(m) && typeof m === 'object' && (m as { is_primary?: boolean }).is_primary,
    )
    const target = primary ?? site_media[0]
    if (target) media = mapMediaRow(target as Parameters<typeof mapMediaRow>[0])
  } else if (site_media) {
    media = mapMediaRow(site_media as Parameters<typeof mapMediaRow>[0])
  }

  const maker = users
    ? mapUserRow(users as Parameters<typeof mapUserRow>[0])
    : undefined

  return { site, analysis, media, maker }
}

export async function getMakers(limit = 60): Promise<MakerWithStats[]> {
  try {
    const supabase = await createClient()
    // role=creator 또는 admin인 사용자 + claims count
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, role, bio, claims(count)')
      .or('role.eq.creator,role.eq.admin')
      .limit(limit)

    if (error || !data) {
      if (error) logQueryError('getMakers', error)
      return []
    }

    const rows = data as unknown as UserListRow[]
    const result: MakerWithStats[] = rows.map((row) => ({
      user: mapUserRow(row),
      claimedCount: row.claims?.[0]?.count ?? 0,
      bio: row.bio,
    }))

    // claim 수 많은 순으로 정렬
    result.sort((a, b) => b.claimedCount - a.claimedCount)
    return result
  } catch (err) {
    logQueryError('getMakers', err)
    return []
  }
}

export async function getMakerById(
  userId: string,
): Promise<{ maker: MakerWithStats; sites: SiteWithRelations[] } | null> {
  if (!UUID_REGEX.test(userId)) return null
  try {
    const supabase = await createClient()
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, role, bio')
      .eq('id', userId)
      .maybeSingle()

    if (userError) {
      logQueryError('getMakerById.user', userError)
      return null
    }
    if (!userRow) return null

    const userRecord = userRow as UserListRow

    const { data: siteRows, error: sitesError } = await supabase
      .from('sites')
      .select(SITES_SELECT)
      .eq('claimed_by_user_id', userId)
      .eq('is_claimed', true)
      .eq('visibility', 'public')
      .neq('status', 'blocked')
      .order('last_active_at', { ascending: false })

    if (sitesError) {
      logQueryError('getMakerById.sites', sitesError)
    }

    const sites: SiteWithRelations[] = []
    for (const row of siteRows ?? []) {
      const shaped = shapeJoinedSite(row)
      if (shaped) sites.push(shaped)
    }

    return {
      maker: {
        user: mapUserRow(userRecord),
        claimedCount: sites.length,
        bio: userRecord.bio,
      },
      sites,
    }
  } catch (err) {
    logQueryError('getMakerById', err)
    return null
  }
}
