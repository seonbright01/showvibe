const VIBE_DOMAINS: Array<{ pattern: RegExp; weight: number; signal: string }> = [
  { pattern: /\.lovable\.app$/, weight: 30, signal: 'lovable.app domain' },
  { pattern: /\.vercel\.app$/, weight: 15, signal: 'vercel.app domain' },
  { pattern: /\.netlify\.app$/, weight: 12, signal: 'netlify.app domain' },
  { pattern: /\.bolt\.new$/, weight: 25, signal: 'bolt.new domain' },
  { pattern: /\.replit\.(app|dev)$/, weight: 20, signal: 'replit domain' },
  { pattern: /\.github\.io$/, weight: 8, signal: 'github.io domain' },
  { pattern: /\.pages\.dev$/, weight: 10, signal: 'cloudflare pages domain' },
  { pattern: /\.fly\.dev$/, weight: 10, signal: 'fly.dev domain' },
]

const TOOL_KEYWORDS: Array<{ pattern: RegExp; weight: number; signal: string; tool: string }> = [
  { pattern: /built\s+with\s+cursor/i, weight: 25, signal: 'built with Cursor', tool: 'cursor' },
  { pattern: /built\s+with\s+lovable/i, weight: 25, signal: 'built with Lovable', tool: 'lovable' },
  { pattern: /built\s+with\s+v0/i, weight: 25, signal: 'built with v0', tool: 'v0' },
  { pattern: /built\s+with\s+bolt/i, weight: 25, signal: 'built with Bolt', tool: 'bolt' },
  { pattern: /built\s+with\s+windsurf/i, weight: 25, signal: 'built with Windsurf', tool: 'windsurf' },
  { pattern: /built\s+with\s+claude/i, weight: 20, signal: 'built with Claude', tool: 'claude' },
  { pattern: /vibe[-\s]?coded/i, weight: 30, signal: 'vibe-coded keyword', tool: 'unknown' },
  { pattern: /made\s+with\s+lovable/i, weight: 25, signal: 'made with Lovable', tool: 'lovable' },
  { pattern: /generated\s+by\s+(?:cursor|v0|bolt|lovable)/i, weight: 25, signal: 'AI-generated note', tool: 'unknown' },
]

const META_GENERATOR_PATTERN =
  /<meta\s+name=["']generator["']\s+content=["']([^"']+)["']/i

const META_DESCRIPTION_PATTERN =
  /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i

const META_AUTHOR_PATTERN =
  /<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i

const TWITTER_SITE_PATTERN =
  /<meta\s+(?:name|property)=["']twitter:site["']\s+content=["']@?([^"']+)["']/i

const TWITTER_CREATOR_PATTERN =
  /<meta\s+(?:name|property)=["']twitter:creator["']\s+content=["']@?([^"']+)["']/i

const OG_SITE_NAME_PATTERN =
  /<meta\s+(?:property|name)=["']og:site_name["']\s+content=["']([^"']+)["']/i

const VIBE_TOOL_NAMES: Array<{ pattern: RegExp; tool: string }> = [
  { pattern: /lovable/i, tool: 'lovable' },
  { pattern: /cursor/i, tool: 'cursor' },
  { pattern: /\bv0\b/i, tool: 'v0' },
  { pattern: /bolt(\.new)?/i, tool: 'bolt' },
  { pattern: /windsurf/i, tool: 'windsurf' },
  { pattern: /replit/i, tool: 'replit' },
]

const NEGATIVE_KEYWORDS: Array<{ pattern: RegExp; weight: number; signal: string }> = [
  { pattern: /404\s+not\s+found/i, weight: -50, signal: '404 page' },
  { pattern: /coming\s+soon/i, weight: -10, signal: 'coming soon page' },
  { pattern: /domain\s+(?:is\s+)?for\s+sale/i, weight: -100, signal: 'domain for sale (parking)' },
  { pattern: /buy\s+this\s+domain/i, weight: -100, signal: 'parking page' },
]

export interface Level0Result {
  score: number
  signals: string[]
  toolGuess: string | null
  passed: boolean
  reason?: string
}

export interface Level0Input {
  url: string
  html?: string
  description?: string | null
  threshold?: number
}

export function runLevel0Filter(input: Level0Input): Level0Result {
  const threshold = input.threshold ?? 50
  const signals: string[] = []
  let score = 0
  let toolGuess: string | null = null

  let host: string
  try {
    host = new URL(input.url).host.toLowerCase()
  } catch {
    return { score: 0, signals: ['invalid_url'], toolGuess: null, passed: false, reason: 'invalid_url' }
  }

  for (const domain of VIBE_DOMAINS) {
    if (domain.pattern.test(host)) {
      score += domain.weight
      signals.push(domain.signal)
    }
  }

  const text = `${input.html ?? ''}\n${input.description ?? ''}`

  for (const keyword of TOOL_KEYWORDS) {
    if (keyword.pattern.test(text)) {
      score += keyword.weight
      signals.push(keyword.signal)
      if (!toolGuess && keyword.tool !== 'unknown') {
        toolGuess = keyword.tool
      }
    }
  }

  const generatorMatch = input.html?.match(META_GENERATOR_PATTERN)
  if (generatorMatch) {
    const value = generatorMatch[1].toLowerCase()
    if (/(cursor|lovable|v0|bolt|windsurf|claude|chatgpt)/.test(value)) {
      score += 20
      signals.push(`generator meta: ${generatorMatch[1]}`)
      const matched = value.match(/(cursor|lovable|v0|bolt|windsurf|claude|chatgpt)/)
      if (matched && !toolGuess) toolGuess = matched[1]
    }
  }

  const descriptionMatch = input.html?.match(META_DESCRIPTION_PATTERN)
  if (descriptionMatch && /(ai|gpt|claude|cursor|lovable)/i.test(descriptionMatch[1])) {
    score += 5
    signals.push('AI-related meta description')
  }

  const authorMatch = input.html?.match(META_AUTHOR_PATTERN)
  if (authorMatch) {
    const author = authorMatch[1]
    const matched = VIBE_TOOL_NAMES.find((t) => t.pattern.test(author))
    if (matched) {
      score += 15
      signals.push(`meta author: ${author}`)
      if (!toolGuess) toolGuess = matched.tool
    }
  }

  const ogSiteNameMatch = input.html?.match(OG_SITE_NAME_PATTERN)
  if (ogSiteNameMatch) {
    const siteName = ogSiteNameMatch[1]
    const matched = VIBE_TOOL_NAMES.find((t) => t.pattern.test(siteName))
    if (matched) {
      score += 12
      signals.push(`og:site_name: ${siteName}`)
      if (!toolGuess) toolGuess = matched.tool
    }
  }

  const twitterSiteMatch = input.html?.match(TWITTER_SITE_PATTERN)
  if (twitterSiteMatch) {
    const handle = twitterSiteMatch[1]
    const matched = VIBE_TOOL_NAMES.find((t) => t.pattern.test(handle))
    if (matched) {
      score += 12
      signals.push(`twitter:site @${handle}`)
      if (!toolGuess) toolGuess = matched.tool
    }
  }

  const twitterCreatorMatch = input.html?.match(TWITTER_CREATOR_PATTERN)
  if (twitterCreatorMatch) {
    const handle = twitterCreatorMatch[1]
    const matched = VIBE_TOOL_NAMES.find((t) => t.pattern.test(handle))
    if (matched) {
      score += 10
      signals.push(`twitter:creator @${handle}`)
      if (!toolGuess) toolGuess = matched.tool
    }
  }

  for (const negative of NEGATIVE_KEYWORDS) {
    if (negative.pattern.test(text)) {
      score += negative.weight
      signals.push(negative.signal)
    }
  }

  const clamped = Math.max(0, Math.min(100, score))
  return {
    score: clamped,
    signals,
    toolGuess,
    passed: clamped >= threshold,
    reason: clamped < threshold ? `score ${clamped} below threshold ${threshold}` : undefined,
  }
}
