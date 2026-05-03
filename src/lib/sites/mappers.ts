import type { Database } from '@/lib/supabase/database.types'
import type {
  Site,
  SiteAnalysis,
  SiteMedia,
  User,
  SourceType,
  ProjectStatus,
  Visibility,
  MediaType,
  MediaSource,
  ImageResolution,
  UiPattern,
  UserRole,
} from '@/types'

type SiteRow = Database['public']['Tables']['sites']['Row']
type AnalysisRow = Database['public']['Tables']['site_analysis']['Row']
type MediaRow = Database['public']['Tables']['site_media']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

export function mapSiteRow(row: SiteRow): Site {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    description: row.description ?? '',
    sourceType: (row.source_type as SourceType) ?? 'auto_collected',
    sourcePlatform: row.source_platform ?? null,
    status: (row.status as ProjectStatus) ?? 'unknown',
    visibility: (row.visibility as Visibility) ?? 'public',
    isClaimed: row.is_claimed,
    claimedByUserId: row.claimed_by_user_id ?? null,
    firstDiscoveredAt: row.first_discovered_at,
    lastCheckedAt: row.last_checked_at,
    lastActiveAt: row.last_active_at,
  }
}

export function mapAnalysisRow(row: AnalysisRow): SiteAnalysis {
  const features = Array.isArray(row.main_features)
    ? (row.main_features as unknown[]).filter((v): v is string => typeof v === 'string')
    : []
  return {
    id: row.id,
    siteId: row.site_id,
    aiSummary: row.ai_summary ?? '',
    articleSummary: row.article_summary ?? null,
    mainFeatures: features,
    category: row.category ?? '',
    toolGuess: row.tool_guess ?? null,
    vibeScore: row.vibe_score ?? 0,
    qualityScore: row.quality_score ?? 0,
    riskScore: row.risk_score ?? 0,
    uiPattern: (row.ui_pattern as UiPattern) ?? 'other',
  }
}

export function mapMediaRow(row: MediaRow): SiteMedia {
  return {
    id: row.id,
    siteId: row.site_id,
    mediaType: (row.media_type as MediaType) ?? 'screenshot',
    mediaSource: (row.media_source as MediaSource) ?? 'system_captured',
    imageUrl: row.image_url,
    imageResolution: (row.image_resolution as ImageResolution) ?? 'high',
    isPrimary: row.is_primary,
    capturedAt: row.captured_at,
  }
}

type PartialUser = Pick<UserRow, 'id' | 'name' | 'avatar_url' | 'role'> & {
  email?: string | null
}

export function mapUserRow(row: PartialUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? '',
    avatarUrl: row.avatar_url ?? null,
    role: (row.role as UserRole) ?? 'user',
  }
}
