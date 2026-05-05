import { createClient } from '@/lib/supabase/server'

export interface ReviewCandidate {
  id: string
  name: string
  url: string
  description: string | null
  source_type: string
  source_platform: string | null
  status: string
  visibility: string
  first_discovered_at: string
  analysis: {
    ai_summary: string | null
    article_summary: string | null
    category: string | null
    tool_guess: string | null
    vibe_score: number | null
    quality_score: number | null
    risk_score: number | null
    main_features: unknown
  } | null
  media: {
    image_url: string
  } | null
}

interface SiteMediaRow {
  image_url: string
  is_primary: boolean | null
}

interface SiteAnalysisRow {
  ai_summary: string | null
  article_summary: string | null
  category: string | null
  tool_guess: string | null
  vibe_score: number | null
  quality_score: number | null
  risk_score: number | null
  main_features: unknown
}

interface SiteJoinRow {
  id: string
  name: string
  url: string
  description: string | null
  source_type: string
  source_platform: string | null
  status: string
  visibility: string
  first_discovered_at: string
  site_analysis: SiteAnalysisRow | SiteAnalysisRow[] | null
  site_media: SiteMediaRow | SiteMediaRow[] | null
}

function pickAnalysis(
  raw: SiteAnalysisRow | SiteAnalysisRow[] | null,
): SiteAnalysisRow | null {
  if (!raw) return null
  if (Array.isArray(raw)) return raw[0] ?? null
  return raw
}

function pickMedia(
  raw: SiteMediaRow | SiteMediaRow[] | null,
): { image_url: string } | null {
  if (!raw) return null
  if (Array.isArray(raw)) {
    const primary = raw.find((m) => m.is_primary)
    const chosen = primary ?? raw[0]
    return chosen ? { image_url: chosen.image_url } : null
  }
  return { image_url: raw.image_url }
}

export async function getReviewQueue(limit = 100): Promise<ReviewCandidate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .select(
      'id, name, url, description, source_type, source_platform, status, visibility, first_discovered_at, site_analysis(ai_summary, article_summary, category, tool_guess, vibe_score, quality_score, risk_score, main_features), site_media(image_url, is_primary)',
    )
    .eq('visibility', 'unlisted')
    .neq('status', 'blocked')
    .order('first_discovered_at', { ascending: true })
    .limit(limit)

  if (error || !data) return []

  return (data as unknown as SiteJoinRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url,
    description: row.description,
    source_type: row.source_type,
    source_platform: row.source_platform,
    status: row.status,
    visibility: row.visibility,
    first_discovered_at: row.first_discovered_at,
    analysis: pickAnalysis(row.site_analysis),
    media: pickMedia(row.site_media),
  }))
}

export async function getTakedownQueue() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('takedown_requests')
    .select('*, sites(id, name, url, normalized_url)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getReportedComments() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comment_reports')
    .select(
      '*, comments(id, body, status, like_count, report_count, created_at, site_id, user_id, users(id, name)), reporter:users!comment_reports_reporter_user_id_fkey(id, name)',
    )
    .order('created_at', { ascending: false })
    .limit(100)
  return data ?? []
}

export interface SiteHealthStats {
  totalSites: number
  pendingReview: number
  pendingTakedowns: number
  pendingClaims: number
  statusCounts: Record<string, number>
}

export async function getSiteHealthStats(): Promise<SiteHealthStats> {
  const supabase = await createClient()

  const [statusRes, totalRes, pendingReviewRes, pendingTakedownsRes, pendingClaimsRes] =
    await Promise.all([
      supabase.from('sites').select('status').eq('visibility', 'public'),
      supabase.from('sites').select('*', { count: 'exact', head: true }),
      supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('visibility', 'unlisted'),
      supabase
        .from('takedown_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ])

  const statusCounts: Record<string, number> = {}
  for (const row of statusRes.data ?? []) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1
  }

  return {
    totalSites: totalRes.count ?? 0,
    pendingReview: pendingReviewRes.count ?? 0,
    pendingTakedowns: pendingTakedownsRes.count ?? 0,
    pendingClaims: pendingClaimsRes.count ?? 0,
    statusCounts,
  }
}
