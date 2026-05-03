// === Union / Literal Types ===

export type SourceType = 'auto_collected' | 'creator_submitted' | 'admin_curated'

export type ProjectStatus =
  | 'active'
  | 'slow'
  | 'degraded'
  | 'archived'
  | 'blocked'
  | 'unknown'

export type ClaimStatus = 'unclaimed' | 'pending' | 'verified' | 'rejected'

export type ClaimMethod = 'github' | 'meta_tag' | 'dns' | 'manual'

export type MediaType = 'screenshot' | 'video' | 'og_image'

export type MediaSource = 'system_captured' | 'creator_uploaded' | 'og_image'

export type ImageResolution = 'low' | 'high'

export type UserRole = 'user' | 'admin' | 'creator'

export type EventType = 'view' | 'click' | 'save' | 'share' | 'like'

export type CommentStatus = 'visible' | 'hidden' | 'deleted'

export type TakedownRequestType = 'copyright' | 'privacy' | 'defamation' | 'other'

export type TakedownStatus = 'pending' | 'approved' | 'rejected'

export type Visibility = 'public' | 'unlisted' | 'private'

export type UiPattern =
  | 'dashboard'
  | 'landing'
  | 'marketplace'
  | 'blog'
  | 'portfolio'
  | 'saas'
  | 'tool'
  | 'other'

// === Entity Interfaces ===

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: UserRole
}

export interface Site {
  id: string
  name: string
  url: string
  description: string
  sourceType: SourceType
  sourcePlatform: string | null
  status: ProjectStatus
  visibility: Visibility
  isClaimed: boolean
  claimedByUserId: string | null
  firstDiscoveredAt: string
  lastCheckedAt: string
  lastActiveAt: string
}

export interface SiteMedia {
  id: string
  siteId: string
  mediaType: MediaType
  mediaSource: MediaSource
  imageUrl: string
  imageResolution: ImageResolution
  isPrimary: boolean
  capturedAt: string
}

export interface SiteAnalysis {
  id: string
  siteId: string
  aiSummary: string
  articleSummary: string | null
  mainFeatures: string[]
  category: string
  toolGuess: string | null
  vibeScore: number
  qualityScore: number
  riskScore: number
  uiPattern: UiPattern
}

export interface Comment {
  id: string
  siteId: string
  userId: string
  body: string
  status: CommentStatus
  likeCount: number
  reportCount: number
  createdAt: string
}

export interface SiteEvent {
  id: string
  siteId: string
  userId: string
  eventType: EventType
  metadata: Record<string, unknown>
}

export interface Claim {
  id: string
  siteId: string
  userId: string
  claimMethod: ClaimMethod
  status: ClaimStatus
}

export interface TakedownRequest {
  id: string
  siteId: string
  requesterEmail: string
  requestType: TakedownRequestType
  reason: string
  status: TakedownStatus
}

// === Composite / View Types ===

export interface ChartEntry {
  rank: number
  change: number
  site: Site
  maker: User | null
  media?: SiteMedia | null
  vibeScore?: number | null
  initialLikeCount?: number
  initialIsLiked?: boolean
  initialIsSaved?: boolean
  isAuthenticated?: boolean
}

export interface Collection {
  id: string
  title: string
  description: string
  coverSites: Site[]
  curatorName: string
}

export interface SiteWithAnalysis extends Site {
  analysis: SiteAnalysis | null
  media: SiteMedia[]
}
