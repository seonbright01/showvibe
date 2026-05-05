import { isAllowedByRobots } from './robots'
import { waitForDomainSlot } from './rate-limiter'
import { DEFAULT_FETCH_HEADERS } from './user-agent'
import { validateOutboundUrl } from '@/lib/security/url-guard'

const DEFAULT_TIMEOUT_MS = 15000
const MAX_BODY_BYTES = 5 * 1024 * 1024
const MAX_REDIRECT_HOPS = 5

export type FetchSkipReason = 'robots_disallow' | 'invalid_url' | 'ssrf_blocked'

export interface CrawlFetchOk {
  ok: true
  status: number
  finalUrl: string
  body: string
  contentType: string | null
  responseTimeMs: number
  truncated: boolean
}

export interface CrawlFetchHttpError {
  ok: false
  skipped: false
  status: number
  finalUrl: string
  body: string
  contentType: string | null
  responseTimeMs: number
  truncated: boolean
}

export interface CrawlFetchSkip {
  ok: false
  skipped: true
  reason: FetchSkipReason
}

export interface CrawlFetchNetworkError {
  ok: false
  skipped: false
  status: null
  errorMessage: string
  responseTimeMs: number
}

export type CrawlFetchResult =
  | CrawlFetchOk
  | CrawlFetchHttpError
  | CrawlFetchSkip
  | CrawlFetchNetworkError

export interface CrawlFetchOptions {
  method?: 'GET' | 'HEAD'
  timeoutMs?: number
  respectRobots?: boolean
  rateLimit?: boolean
  headers?: Record<string, string>
}

export async function crawlFetch(
  rawUrl: string,
  options: CrawlFetchOptions = {},
): Promise<CrawlFetchResult> {
  const method = options.method ?? 'GET'
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const respectRobots = options.respectRobots ?? true
  const rateLimit = options.rateLimit ?? true

  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { ok: false, skipped: true, reason: 'invalid_url' }
  }

  if (respectRobots) {
    const allowed = await isAllowedByRobots(rawUrl)
    if (!allowed) {
      return { ok: false, skipped: true, reason: 'robots_disallow' }
    }
  }

  // SSRF 가드: hostname pattern + DNS 해석 IP 재검증
  const initialGuard = await validateOutboundUrl(rawUrl)
  if (!initialGuard.ok) {
    return { ok: false, skipped: true, reason: 'ssrf_blocked' }
  }

  if (rateLimit) {
    await waitForDomainSlot(parsed.host)
  }

  const startedAt = Date.now()
  try {
    // redirect manual 처리 — 각 hop마다 SSRF 재검증
    let currentUrl = rawUrl
    let response: Response
    let hops = 0
    while (true) {
      response = await fetch(currentUrl, {
        method,
        headers: { ...DEFAULT_FETCH_HEADERS, ...(options.headers ?? {}) },
        redirect: 'manual',
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (response.status < 300 || response.status >= 400) break
      const location = response.headers.get('location')
      if (!location) break
      hops += 1
      if (hops > MAX_REDIRECT_HOPS) {
        return {
          ok: false,
          skipped: false,
          status: null,
          errorMessage: 'too_many_redirects',
          responseTimeMs: Date.now() - startedAt,
        }
      }
      const nextUrl = new URL(location, currentUrl).toString()
      const hopGuard = await validateOutboundUrl(nextUrl)
      if (!hopGuard.ok) {
        return { ok: false, skipped: true, reason: 'ssrf_blocked' }
      }
      currentUrl = nextUrl
    }

    const responseTimeMs = Date.now() - startedAt
    const contentType = response.headers.get('content-type')
    const finalUrl = currentUrl

    if (method === 'HEAD') {
      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          finalUrl,
          body: '',
          contentType,
          responseTimeMs,
          truncated: false,
        }
      }
      return {
        ok: false,
        skipped: false,
        status: response.status,
        finalUrl,
        body: '',
        contentType,
        responseTimeMs,
        truncated: false,
      }
    }

    const buffer = await response.arrayBuffer()
    const truncated = buffer.byteLength > MAX_BODY_BYTES
    const sliced = truncated ? buffer.slice(0, MAX_BODY_BYTES) : buffer
    const body = new TextDecoder('utf-8', { fatal: false }).decode(sliced)

    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        finalUrl,
        body,
        contentType,
        responseTimeMs,
        truncated,
      }
    }
    return {
      ok: false,
      skipped: false,
      status: response.status,
      finalUrl,
      body,
      contentType,
      responseTimeMs,
      truncated,
    }
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      status: null,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      responseTimeMs: Date.now() - startedAt,
    }
  }
}
