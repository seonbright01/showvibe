import { createServiceClient } from '@/lib/supabase/service'

export interface PipelineSite {
  id: string
  url: string
  name: string
  description: string | null
  source_platform: string | null
  status: string
  visibility: string
}

export async function fetchUnclassifiedSites(limit = 20): Promise<PipelineSite[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('sites')
    .select('id, url, name, description, source_platform, status, visibility, site_analysis(id)')
    .is('site_analysis', null)
    .not('status', 'in', '(blocked,archived)')
    .order('first_discovered_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(`fetchUnclassifiedSites: ${error.message}`)
  }
  type Row = PipelineSite & { site_analysis: unknown }
  return ((data as Row[] | null) ?? []).map(({ site_analysis: _ignored, ...rest }) => rest)
}

export async function fetchRecheckCandidates(limit = 20): Promise<PipelineSite[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('sites')
    .select('id, url, name, description, source_platform, status, visibility')
    .in('status', ['blocked', 'archived'])
    .not('recheck_eligible_at', 'is', null)
    .lte('recheck_eligible_at', new Date().toISOString())
    .order('recheck_eligible_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(`fetchRecheckCandidates: ${error.message}`)
  }
  return ((data as PipelineSite[] | null) ?? [])
}

export const MAX_SCREENSHOT_ATTEMPTS = 3

export async function fetchSitesNeedingScreenshot(limit = 10): Promise<PipelineSite[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('sites')
    .select('id, url, name, description, source_platform, status, visibility, site_media(id)')
    .lt('screenshot_attempts', MAX_SCREENSHOT_ATTEMPTS)
    .order('first_discovered_at', { ascending: true })
    .limit(limit * 3)

  if (error) {
    throw new Error(`fetchSitesNeedingScreenshot: ${error.message}`)
  }
  type Row = PipelineSite & { site_media: unknown[] | null }
  const rows = (data as Row[] | null) ?? []
  return rows
    .filter((row) => !row.site_media || row.site_media.length === 0)
    .slice(0, limit)
    .map(({ site_media: _ignored, ...rest }) => rest)
}

export async function fetchSitesNeedingArticle(limit = 10): Promise<PipelineSite[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('sites')
    .select(
      'id, url, name, description, source_platform, status, visibility, site_analysis!inner(id, article_summary, ai_summary, category, tool_guess)',
    )
    .is('site_analysis.article_summary', null)
    .limit(limit)

  if (error) {
    throw new Error(`fetchSitesNeedingArticle: ${error.message}`)
  }
  type Row = PipelineSite & {
    site_analysis: { id: string; article_summary: string | null; ai_summary: string | null; category: string | null; tool_guess: string | null } | null
  }
  return ((data as Row[] | null) ?? []).map(({ site_analysis: _ignored, ...rest }) => rest)
}
