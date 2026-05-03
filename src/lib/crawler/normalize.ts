const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'gclid',
  'fbclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  'ref_url',
])

export interface NormalizedUrl {
  normalized: string
  host: string
  protocol: 'http:' | 'https:'
  pathname: string
}

export function normalizeUrl(rawUrl: string): NormalizedUrl {
  const trimmed = rawUrl.trim()
  if (!trimmed) {
    throw new Error('URL is empty')
  }

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const parsed = new URL(withScheme)

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported protocol: ${parsed.protocol}`)
  }

  const host = parsed.host.replace(/^www\./, '').toLowerCase()
  let pathname = parsed.pathname.replace(/\/{2,}/g, '/')
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }

  const filteredParams = new URLSearchParams()
  for (const [key, value] of parsed.searchParams.entries()) {
    if (!TRACKING_PARAMS.has(key.toLowerCase())) {
      filteredParams.append(key, value)
    }
  }
  const search = filteredParams.toString()

  return {
    normalized: `${parsed.protocol}//${host}${pathname}${search ? `?${search}` : ''}`,
    host,
    protocol: parsed.protocol as 'http:' | 'https:',
    pathname,
  }
}

export function safeNormalizeUrl(rawUrl: string): NormalizedUrl | null {
  try {
    return normalizeUrl(rawUrl)
  } catch {
    return null
  }
}
