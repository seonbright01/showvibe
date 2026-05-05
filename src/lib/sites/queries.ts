import { createClient } from '@/lib/supabase/server'
import { mapSiteRow, mapAnalysisRow, mapMediaRow, mapUserRow } from './mappers'
import type { Site, SiteAnalysis, SiteMedia, User } from '@/types'
import type { Database } from '@/lib/supabase/database.types'

export interface SiteWithRelations {
  site: Site
  analysis?: SiteAnalysis
  media?: SiteMedia
  maker?: User
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// 명시 컬럼 목록 — Database['public']['Tables']['sites']['Row']의 모든 키를
// 빠짐없이 cover해야 한다. 아래 AssertExhaustiveSiteColumns가 컴파일 타임에
// 누락을 잡아낸다 (스키마에 컬럼이 추가되면 타입 에러로 알림).
const SITE_COLUMNS = [
  'id',
  'name',
  'url',
  'normalized_url',
  'description',
  'source_type',
  'source_platform',
  'status',
  'visibility',
  'is_claimed',
  'claimed_by_user_id',
  'first_discovered_at',
  'last_checked_at',
  'last_active_at',
  'created_at',
  'updated_at',
  'block_reason',
  'recheck_eligible_at',
  'recheck_count',
  'screenshot_attempts',
  'is_editors_pick',
  'editors_note',
  'editors_pick_updated_at',
  'editors_pick_updated_by',
] as const

type SiteRowKeys = keyof Database['public']['Tables']['sites']['Row']
type ListedColumns = (typeof SITE_COLUMNS)[number]

// 컴파일 가드: SITE_COLUMNS가 sites.Row의 모든 키를 cover하는지 양방향 검증.
// 한쪽이라도 누락/오타가 있으면 'never'에 string을 할당하지 못해 TS 에러가 난다.
type AssertExhaustiveSiteColumns =
  Exclude<SiteRowKeys, ListedColumns> extends never
    ? Exclude<ListedColumns, SiteRowKeys> extends never
      ? true
      : ['Unknown column listed in SITE_COLUMNS', Exclude<ListedColumns, SiteRowKeys>]
    : ['Missing column in SITE_COLUMNS', Exclude<SiteRowKeys, ListedColumns>]

// 강제 평가: 인덱스 접근으로 타입 차이를 컴파일 시점에 트리거.
const _assertSiteColumns: AssertExhaustiveSiteColumns = true
void _assertSiteColumns

const SITE_COLUMN_LIST = SITE_COLUMNS.join(', ')

// 좌측 join: site_analysis가 없는 sites도 포함됨 (대부분 사용처가 그렇게 기대).
const SITES_SELECT = `${SITE_COLUMN_LIST}, site_analysis(*), site_media(*), users:claimed_by_user_id(id, name, avatar_url, role)`

// inner join 변형: site_analysis가 반드시 존재해야 함. category 필터를 SQL
// push-down 시 부모 행도 함께 제거하기 위해 필요.
const SITES_SELECT_INNER_ANALYSIS = `${SITE_COLUMN_LIST}, site_analysis!inner(*), site_media(*), users:claimed_by_user_id(id, name, avatar_url, role)`

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
  screenshot_attempts?: number
  is_editors_pick?: boolean
  editors_note?: string | null
  editors_pick_updated_at?: string | null
  editors_pick_updated_by?: string | null
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
    screenshot_attempts: rest.screenshot_attempts ?? 0,
    is_editors_pick: rest.is_editors_pick ?? false,
    editors_note: rest.editors_note ?? null,
    editors_pick_updated_at: rest.editors_pick_updated_at ?? null,
    editors_pick_updated_by: rest.editors_pick_updated_by ?? null,
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

// 'top_score'는 site_analysis.vibe_score 기준 내림차순.
// (이전 'most_saved' 라벨은 실제 구현과 불일치하여 정정 — 실제 site_saves
//  count 기반 정렬은 후속 작업으로 분리.)
export type SortKey = 'trending' | 'newest' | 'top_score'

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
    // category 필터가 있으면 site_analysis와 inner join. 없으면 left join.
    const selectShape = params.category
      ? SITES_SELECT_INNER_ANALYSIS
      : SITES_SELECT
    let query = supabase
      .from('sites')
      .select(selectShape)
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

    // category는 referenced table(site_analysis)의 컬럼. Supabase의 inner-join
    // 의미를 유지한 채 push-down하려면 select 시 site_analysis!inner를 쓰고
    // .eq('site_analysis.category', ...)로 필터한다.
    if (params.category) {
      query = query.eq('site_analysis.category', params.category)
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

    const shaped = ((data ?? []) as unknown as JoinedRow[]).map(shapeRow)

    if (sort === 'top_score') {
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
