import type { ProjectStatus, SourceType, ClaimStatus } from '@/types'

// === StatusBadge ===

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  slow: { label: 'Slow', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  degraded: { label: 'Degraded', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
  archived: { label: 'Archived', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)' },
  blocked: { label: 'Blocked', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  unknown: { label: 'Unknown', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)' },
}

interface StatusBadgeProps {
  status: ProjectStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  )
}

// === SourceBadge ===

const SOURCE_CONFIG: Record<SourceType, { label: string; color: string; bg: string }> = {
  auto_collected: { label: 'Auto', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)' },
  creator_submitted: { label: 'Creator', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  admin_curated: { label: 'Curated', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
}

interface SourceBadgeProps {
  sourceType: SourceType
}

export function SourceBadge({ sourceType }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[sourceType]

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  )
}

// === ToolBadge ===

const TOOL_COLORS: Record<string, { color: string; bg: string }> = {
  Cursor: { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.15)' },
  Lovable: { color: '#F472B6', bg: 'rgba(244, 114, 182, 0.15)' },
  Replit: { color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
  Bolt: { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)' },
  v0: { color: '#F3F4F6', bg: 'rgba(243, 244, 246, 0.15)' },
}

const DEFAULT_TOOL_COLOR = { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)' }

interface ToolBadgeProps {
  tool: string
}

export function ToolBadge({ tool }: ToolBadgeProps) {
  const config = TOOL_COLORS[tool] ?? DEFAULT_TOOL_COLOR

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {tool}
    </span>
  )
}

// === ClaimBadge ===

interface ClaimBadgeProps {
  status: ClaimStatus
}

export function ClaimBadge({ status }: ClaimBadgeProps) {
  if (status !== 'verified') return null

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium"
      style={{ color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
      Verified
    </span>
  )
}
