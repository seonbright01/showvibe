/**
 * ShowVibe — 바이브코딩 도구 단일 진실 소스 (Single Source of Truth)
 *
 * 한 곳에 도구 목록을 정의하면 다음이 모두 일관 적용된다:
 *  - /submit Built With 셀렉트
 *  - /explore Built With 필터
 *  - 카드/상세 ToolBadge 색상
 *  - 자동 수집 후 분류 단계의 도구 감지 (detectToolFromText)
 */

export interface ToolDef {
  /** canonical 식별자 (DB sites.source_platform / site_analysis.tool_guess 에 저장) */
  id: string
  /** UI 노출 라벨 */
  label: string
  /** ToolBadge 텍스트 색상 */
  color: string
  /** ToolBadge 배경 색상 */
  bg: string
  /**
   * 텍스트(설명/HTML/title)에서 이 도구 사용을 추정하는 정규식 패턴들.
   * 가장 구체적인 패턴부터(예: "Claude Code"가 "Claude"보다 먼저).
   * 모두 case-insensitive.
   */
  patterns: readonly RegExp[]
}

export const VIBE_TOOLS: readonly ToolDef[] = [
  {
    id: 'Cursor',
    label: 'Cursor',
    color: '#A78BFA',
    bg: 'rgba(167, 139, 250, 0.15)',
    patterns: [/\bcursor\.com\b/i, /\bcursor\s+(?:ai|ide|editor)\b/i, /\bbuilt\s+with\s+cursor\b/i, /\bvibe[- ]coded\s+with\s+cursor\b/i],
  },
  {
    id: 'Lovable',
    label: 'Lovable',
    color: '#F472B6',
    bg: 'rgba(244, 114, 182, 0.15)',
    patterns: [/\blovable\.dev\b/i, /\bbuilt\s+with\s+lovable\b/i, /@lovable_dev\b/i, /\bgpt-?engineer\b/i],
  },
  {
    id: 'Replit',
    label: 'Replit',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    patterns: [/\breplit\.(?:com|app|dev)\b/i, /\breplit\s+agent\b/i],
  },
  {
    id: 'Bolt',
    label: 'Bolt',
    color: '#FBBF24',
    bg: 'rgba(251, 191, 36, 0.15)',
    patterns: [/\bbolt\.new\b/i, /\bbuilt\s+with\s+bolt\b/i, /\bstackblitz\s+bolt\b/i],
  },
  {
    id: 'v0',
    label: 'v0',
    color: '#F3F4F6',
    bg: 'rgba(243, 244, 246, 0.15)',
    patterns: [/\bv0\.dev\b/i, /\bv0\s+by\s+vercel\b/i, /\bbuilt\s+with\s+v0\b/i],
  },
  {
    id: 'Claude Code',
    label: 'Claude Code',
    color: '#D97757',
    bg: 'rgba(217, 119, 87, 0.15)',
    patterns: [/\bclaude[\s-]?code\b/i, /\banthropic\s+claude\s+code\b/i, /\bbuilt\s+with\s+claude\b/i],
  },
  {
    id: 'ChatGPT Codex',
    label: 'ChatGPT Codex',
    color: '#10A37F',
    bg: 'rgba(16, 163, 127, 0.15)',
    patterns: [/\bchatgpt\s+codex\b/i, /\bopenai\s+codex\b/i, /\bcodex\s+cli\b/i, /\bbuilt\s+with\s+codex\b/i],
  },
  {
    id: 'Gemini CLI',
    label: 'Gemini CLI',
    color: '#4285F4',
    bg: 'rgba(66, 133, 244, 0.15)',
    patterns: [/\bgemini[\s-]?cli\b/i, /\bgoogle\s+gemini\s+cli\b/i, /\bbuilt\s+with\s+gemini\b/i],
  },
  {
    id: 'Windsurf',
    label: 'Windsurf',
    color: '#22D3EE',
    bg: 'rgba(34, 211, 238, 0.15)',
    patterns: [/\bwindsurf\.(?:com|ai)\b/i, /\bcodeium\s+windsurf\b/i, /\bbuilt\s+with\s+windsurf\b/i],
  },
  {
    id: 'GitHub Copilot',
    label: 'GitHub Copilot',
    color: '#6E40C9',
    bg: 'rgba(110, 64, 201, 0.15)',
    patterns: [/\bgithub\s+copilot\b/i, /\bcopilot\s+workspace\b/i, /\bcopilot\s+cli\b/i],
  },
] as const

/** UI 셀렉트/필터에서 쓰는 라벨 배열 (순서 유지) */
export const TOOL_LABELS: readonly string[] = VIBE_TOOLS.map((t) => t.label)

/** ToolBadge 색상 lookup */
export function getToolColor(idOrLabel: string): { color: string; bg: string } {
  const tool = VIBE_TOOLS.find(
    (t) => t.id === idOrLabel || t.label === idOrLabel,
  )
  return tool ?? { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)' }
}

/**
 * 텍스트(설명/HTML/title 등) 에서 가장 먼저 매칭되는 도구를 반환.
 * 모두 미스 시 null. 분류 파이프라인이 site_analysis.tool_guess 결정에 사용.
 */
export function detectToolFromText(text: string | null | undefined): string | null {
  if (!text) return null
  for (const tool of VIBE_TOOLS) {
    for (const pattern of tool.patterns) {
      if (pattern.test(text)) return tool.id
    }
  }
  return null
}

