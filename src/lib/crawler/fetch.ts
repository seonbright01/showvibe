import { isAllowedByRobots } from './robots'
import { waitForDomainSlot } from './rate-limiter'
import { DEFAULT_FETCH_HEADERS } from './user-agent'

const DEFAULT_TIMEOUT_MS = 15000
const MAX_BODY_BYTES = 5 * 1024 * 1024

export type FetchSkipReason = 'robots_disallow' | 'invalid_url'

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

  if (rateLimit) {
    await waitForDomainSlot(parsed.host)
  }

  const startedAt = Date.now()
  try {
    const response = await fetch(rawUrl, {
      method,
      headers: { ...DEFAULT_FETCH_HEADERS, ...(options.headers ?? {}) },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    })

    const responseTimeMs = Date.now() - startedAt
    const contentType = response.headers.get('content-type')
    const finalUrl = response.url || rawUrl

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
