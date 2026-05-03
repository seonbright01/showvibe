import { createClient } from '@/lib/supabase/server'
import { getTrendingSites } from '@/lib/sites/queries'
import type { SiteWithRelations } from '@/lib/sites/queries'
import { mapSiteRow, mapAnalysisRow, mapMediaRow, mapUserRow } from '@/lib/sites/mappers'

export interface ChartEntry {
  rank: number
  change: 'up' | 'down' | 'flat'
  delta: number
  siteId: string
  score: number
  site: SiteWithRelations
}

interface RpcRow {
  rank: number
  change: number
  score: number
  site_id: string
}

const SITES_SELECT =
  '*, site_analysis(*), site_media(*), users:claimed_by_user_id(id, name, avatar_url, role)'

function logChartError(name: string, error: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[chart] ${name} failed:`, error)
  }
}

function deltaToDirection(delta: number): 'up' | 'down' | 'flat' {
  if (delta > 0) return 'up'
  if (delta < 0) return 'down'
  return 'flat'
}

function shapeJoined(row: unknown): SiteWithRelations | undefined {
  if (!row || typeof row !== 'object') return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = row as any
  const { site_analysis, site_media, users, ...siteOnly } = r
  const site = mapSiteRow(siteOnly)

  let analysis
  const rawAnalysis = Array.isArray(site_analysis) ? site_analysis[0] : site_analysis
  if (rawAnalysis) analysis = mapAnalysisRow(rawAnalysis)

  let media
  if (Array.isArray(site_media)) {
    const primary = site_media.find((m) => m?.is_primary)
    const target = primary ?? site_media[0]
    if (target) media = mapMediaRow(target)
  } else if (site_media) {
    media = mapMediaRow(site_media)
  }

  const maker = users ? mapUserRow(users) : undefined

  return { site, analysis, media, maker }
}

async function buildFallback(limit: number): Promise<ChartEntry[]> {
  const sites = await getTrendingSites(limit)
  return sites.map((s, idx) => ({
    rank: idx + 1,
    change: 'flat' as const,
    delta: 0,
    siteId: s.site.id,
    score: 0,
    site: s,
  }))
}

export async function getTopChart(
  windowHours = 24 * 7,
  category?: string,
  limit = 50,
): Promise<ChartEntry[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_top_chart', {
      p_window: `${windowHours} hours`,
      p_category: category ?? undefined,
      p_limit: limit,
    })

    if (error || !data) {
      if (error) logChartError('getTopChart.rpc', error)
      return buildFallback(limit)
    }

    const rows = data as unknown as RpcRow[]
    if (rows.length === 0) return buildFallback(limit)

    const ids = rows.map((r) => r.site_id)
    const { data: siteRows, error: sitesError } = await supabase
      .from('sites')
      .select(SITES_SELECT)
      .in('id', ids)

    if (sitesError) {
      logChartError('getTopChart.sitesJoin', sitesError)
      return buildFallback(limit)
    }

    const byId = new Map<string, SiteWithRelations>()
    for (const row of siteRows ?? []) {
      const shaped = shapeJoined(row)
      if (shaped) byId.set(shaped.site.id, shaped)
    }

    const entries: ChartEntry[] = []
    for (const r of rows) {
      const site = byId.get(r.site_id)
      if (!site) continue
      entries.push({
        rank: r.rank,
        change: deltaToDirection(r.change),
        delta: r.change,
        siteId: r.site_id,
        score: r.score,
        site,
      })
    }
    return entries
  } catch (err) {
    logChartError('getTopChart', err)
    return buildFallback(limit)
  }
}
