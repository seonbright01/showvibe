import { createClient } from '@/lib/supabase/server'
import { mapSiteRow, mapAnalysisRow, mapMediaRow, mapUserRow } from './mappers'
import type { Site, SiteAnalysis, SiteMedia, User } from '@/types'

export interface SiteWithRelations {
  site: Site
  analysis?: SiteAnalysis
  media?: SiteMedia
  maker?: User
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const SITES_SELECT =
  '*, site_analysis(*), site_media(*), users:claimed_by_user_id(id, name, avatar_url, role)'

interface JoinedRow {
  // sites columns
  id: string
  name: string
  url: string
  description: string | null
  source_type: string
  source_platform: string | null
  status: string
  visibility: string
  is_claimed: boolean
  claimed_by_user_id: string | null
  first_discovered_at: string
  last_checked_at: string
  last_active_at: string
  normalized_url: string
  created_at: string
  updated_at: string
  block_reason?: string | null
  recheck_eligible_at?: string | null
  recheck_count?: number
  // joined relations
  site_analysis?: unknown
  site_media?: unknown
  users?: unknown
}

function pickFirstAnalysis(value: unknown) {
  if (!value) return undefined
  if (Array.isArray(value)) return value[0]
  return value
}

function pickPrimaryMedia(value: unknown) {
  if (!value) return undefined
  if (Array.isArray(value)) {
    const primary = value.find((m) => (m as { is_primary?: boolean }).is_primary)
    return primary ?? value[0]
  }
  return value
}

function shapeRow(row: JoinedRow): SiteWithRelations {
  // Pull joined relations off so they don't pollute SiteRow shape
  const { site_analysis, site_media, users, ...rest } = row
  const siteOnly = {
    ...rest,
    block_reason: rest.block_reason ?? null,
    recheck_eligible_at: rest.recheck_eligible_at ?? null,
    recheck_count: rest.recheck_count ?? 0,
    is_editors_pick: false,
    editors_note: null,
    editors_pick_updated_at: null,
    editors_pick_updated_by: null,
  }
  const site = mapSiteRow(siteOnly)

  const rawAnalysis = pickFirstAnalysis(site_analysis)
  const analysis = rawAnalysis
    ? mapAnalysisRow(rawAnalysis as Parameters<typeof mapAnalysisRow>[0])
    : undefined

  const rawMedia = pickPrimaryMedia(site_media)
  const media = rawMedia
    ? mapMediaRow(rawMedia as Parameters<typeof mapMediaRow>[0])
    : undefined

  const maker = users
    ? mapUserRow(users as Parameters<typeof mapUserRow>[0])
    : undefined

  return { site, analysis, media, maker }
}

function logQueryError(name: string, error: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[queries] ${name} failed:`, error)
  }
}

export async function getTrendingSites(limit = 8): Promise<SiteWithRelations[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sites')
      .select(SITES_SELECT)
      .eq('visibility', 'public')
      .neq('status', 'blocked')
      .order('last_active_at', { ascending: false })
      .limit(limit)

    if (error) {
      logQueryError('getTrendingSites', error)
      return []
    }
    return ((data ?? []) as unknown as JoinedRow[]).map(shapeRow)
  } catch (err) {
    logQueryError('getTrendingSites', err)
    return []
  }
}

export async function getNewlyDiscoveredSites(
  limit = 4,
): Promise<SiteWithRelations[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sites')
      .select(SITES_SELECT)
      .eq('visibility', 'public')
      .neq('status', 'blocked')
      .order('first_discovered_at', { ascending: false })
      .limit(limit)

    if (error) {
      logQueryError('getNewlyDiscoveredSites', error)
      return []
    }
    return ((data ?? []) as unknown as JoinedRow[]).map(shapeRow)
  } catch (err) {
    logQueryError('getNewlyDiscoveredSites', err)
    return []
  }
}

export async function getArchivedSites(
  limit = 8,
): Promise<SiteWithRelations[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sites')
      .select(SITES_SELECT)
      .eq('visibility', 'public')
      .eq('status', 'archived')
      .order('last_active_at', { ascending: false })
      .limit(limit)

    if (error) {
      logQueryError('getArchivedSites', error)
      return []
    }
    return ((data ?? []) as unknown as JoinedRow[]).map(shapeRow)
  } catch (err) {
    logQueryError('getArchivedSites', err)
    return []
  }
}

export interface EditorsPickEntry extends SiteWithRelations {
  editorsNote: string | null
}

export async function getEditorsPickSites(limit = 4): Promise<EditorsPickEntry[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sites')
      .select(SITES_SELECT)
      .eq('visibility', 'public')
      .eq('is_editors_pick', true)
      .neq('status', 'blocked')
      .order('editors_pick_updated_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error || !data) {
      if (error) logQueryError('getEditorsPickSites', error)
      return []
    }

    return (data as unknown as Array<JoinedRow & { editors_note: string | null }>).map((row) => {
      const editorsNote = row.editors_note ?? null
      const shaped = shapeRow(row)
      return { ...shaped, editorsNote }
    })
  } catch (err) {
    logQueryError('getEditorsPickSites', err)
    return []
  }
}

export async function getSitesByIds(
  siteIds: readonly string[],
): Promise<SiteWithRelations[]> {
  const validIds = siteIds.filter((id) => UUID_REGEX.test(id))
  if (validIds.length === 0) return []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sites')
      .select(SITES_SELECT)
      .in('id', validIds)
      .neq('status', 'blocked')

    if (error || !data) {
      if (error) logQueryError('getSitesByIds', error)
      return []
    }

    const byId = new Map<string, SiteWithRelations>()
    for (const row of data as unknown as JoinedRow[]) {
      const shaped = shapeRow(row)
      byId.set(shaped.site.id, shaped)
    }

    const ordered: SiteWithRelations[] = []
    for (const id of validIds) {
      const found = byId.get(id)
      if (found) ordered.push(found)
    }
    return ordered
  } catch (err) {
    logQueryError('getSitesByIds', err)
    return []
  }
}

export async function getSiteById(id: string): Promise<SiteWithRelations | null> {
  if (!UUID_REGEX.test(id)) return null
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sites')
      .select(SITES_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      logQueryError('getSiteById', error)
      return null
    }
    if (!data) return null
    return shapeRow(data as unknown as JoinedRow)
  } catch (err) {
    logQueryError('getSiteById', err)
    return null
  }
}

export async function getSimilarSites(
  siteId: string,
  category: string | null,
  tool: string | null,
  limit = 4,
): Promise<SiteWithRelations[]> {
  if (!UUID_REGEX.test(siteId)) return []
  try {
    const supabase = await createClient()
    let query = supabase
      .from('sites')
      .select(SITES_SELECT)
      .eq('visibility', 'public')
      .neq('status', 'blocked')
      .neq('id', siteId)
      .limit(limit * 3)

    if (tool) {
      query = query.eq('source_platform', tool)
    }

    const { data, error } = await query
    if (error) {
      logQueryError('getSimilarSites', error)
      return []
    }

    const rows = (data ?? []) as unknown as JoinedRow[]
    const shaped = rows.map(shapeRow)

    // category 일치 우선 정렬
    if (category) {
      shaped.sort((a, b) => {
        const aMatch = a.analysis?.category === category ? 1 : 0
        const bMatch = b.analysis?.category === category ? 1 : 0
        return bMatch - aMatch
      })
    }

    return shaped.slice(0, limit)
  } catch (err) {
    logQueryError('getSimilarSites', err)
    return []
  }
}

export type SortKey = 'trending' | 'newest' | 'most_saved'

export interface SearchSitesParams {
  q?: string
  tool?: string
  category?: string
  status?: string
  source?: string
  sort?: SortKey
  limit?: number
}

export async function searchSites(
  params: SearchSitesParams,
): Promise<SiteWithRelations[]> {
  const limit = params.limit ?? 60
  try {
    const supabase = await createClient()
    let query = supabase
      .from('sites')
      .select(SITES_SELECT)
      .eq('visibility', 'public')
      .limit(limit)

    if (params.status === 'archived') {
      query = query.eq('status', 'archived')
    } else if (params.status === 'active') {
      query = query.neq('status', 'archived').neq('status', 'blocked')
    } else {
      query = query.neq('status', 'blocked')
    }

    if (params.source) {
      query = query.eq('source_type', params.source)
    }

    if (params.tool) {
      query = query.eq('source_platform', params.tool)
    }

    const q = params.q?.trim()
    if (q && q.length > 0) {
      const escaped = q.replace(/[%_,()]/g, '')
      const pattern = `%${escaped}%`
      query = query.or(
        `name.ilike.${pattern},description.ilike.${pattern},url.ilike.${pattern}`,
      )
    }

    const sort = params.sort ?? 'trending'
    if (sort === 'newest') {
      query = query.order('first_discovered_at', { ascending: false })
    } else {
      query = query.order('last_active_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) {
      logQueryError('searchSites', error)
      return []
    }

    let shaped = ((data ?? []) as unknown as JoinedRow[]).map(shapeRow)

    if (params.category) {
      shaped = shaped.filter((s) => s.analysis?.category === params.category)
    }

    if (sort === 'most_saved') {
      shaped.sort(
        (a, b) => (b.analysis?.vibeScore ?? 0) - (a.analysis?.vibeScore ?? 0),
      )
    }

    return shaped
  } catch (err) {
    logQueryError('searchSites', err)
    return []
  }
}
