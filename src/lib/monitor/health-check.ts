import { crawlFetch } from '../crawler/fetch'

const PARKING_PATTERNS = [
  /domain\s+(?:is\s+)?for\s+sale/i,
  /buy\s+this\s+domain/i,
  /this\s+domain\s+may\s+be\s+for\s+sale/i,
]

export type HealthResultStatus = 'ok' | 'error' | 'timeout' | 'blocked' | 'parking'

export interface HealthCheckResult {
  method: 'HEAD' | 'GET'
  resultStatus: HealthResultStatus
  httpStatus: number | null
  finalUrl: string
  responseTimeMs: number
  errorMessage?: string
}

export async function checkHealth(siteUrl: string): Promise<HealthCheckResult> {
  const head = await crawlFetch(siteUrl, {
    method: 'HEAD',
    timeoutMs: 10_000,
    respectRobots: true,
    rateLimit: true,
  })

  if (!head.ok && 'skipped' in head && head.skipped) {
    return {
      method: 'HEAD',
      resultStatus: 'blocked',
      httpStatus: null,
      finalUrl: siteUrl,
      responseTimeMs: 0,
      errorMessage: head.reason,
    }
  }

  if (head.ok) {
    return {
      method: 'HEAD',
      resultStatus: 'ok',
      httpStatus: head.status,
      finalUrl: head.finalUrl,
      responseTimeMs: head.responseTimeMs,
    }
  }

  const get = await crawlFetch(siteUrl, {
    method: 'GET',
    timeoutMs: 15_000,
    respectRobots: true,
    rateLimit: true,
  })

  if (!get.ok && 'skipped' in get && get.skipped) {
    return {
      method: 'GET',
      resultStatus: 'blocked',
      httpStatus: null,
      finalUrl: siteUrl,
      responseTimeMs: 0,
      errorMessage: get.reason,
    }
  }

  if (!get.ok && 'errorMessage' in get) {
    const isTimeout =
      get.errorMessage.toLowerCase().includes('timeout') ||
      get.errorMessage.toLowerCase().includes('timed out')
    return {
      method: 'GET',
      resultStatus: isTimeout ? 'timeout' : 'error',
      httpStatus: get.status,
      finalUrl: siteUrl,
      responseTimeMs: get.responseTimeMs,
      errorMessage: get.errorMessage,
    }
  }

  if ('body' in get) {
    const isParking = PARKING_PATTERNS.some((pattern) => pattern.test(get.body))
    if (isParking) {
      return {
        method: 'GET',
        resultStatus: 'parking',
        httpStatus: get.status,
        finalUrl: get.finalUrl,
        responseTimeMs: get.responseTimeMs,
      }
    }
    if (get.ok) {
      return {
        method: 'GET',
        resultStatus: 'ok',
        httpStatus: get.status,
        finalUrl: get.finalUrl,
        responseTimeMs: get.responseTimeMs,
      }
    }
    return {
      method: 'GET',
      resultStatus: 'error',
      httpStatus: get.status,
      finalUrl: get.finalUrl,
      responseTimeMs: get.responseTimeMs,
      errorMessage: `HTTP ${get.status}`,
    }
  }

  return {
    method: 'GET',
    resultStatus: 'error',
    httpStatus: null,
    finalUrl: siteUrl,
    responseTimeMs: 0,
    errorMessage: 'unknown',
  }
}
