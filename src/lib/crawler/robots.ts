import robotsParser from 'robots-parser'
import { DEFAULT_FETCH_HEADERS, USER_AGENT } from './user-agent'

const ROBOTS_TIMEOUT_MS = 5000
const ROBOTS_CACHE_TTL_MS = 60 * 60 * 1000

interface CacheEntry {
  isAllowed: (targetUrl: string, userAgent: string) => boolean | undefined
  fetchedAt: number
}

const cache = new Map<string, CacheEntry>()

export async function isAllowedByRobots(targetUrl: string): Promise<boolean> {
  let parsedTarget: URL
  try {
    parsedTarget = new URL(targetUrl)
  } catch {
    return false
  }

  const robotsUrl = `${parsedTarget.protocol}//${parsedTarget.host}/robots.txt`
  const cached = cache.get(robotsUrl)
  if (cached && Date.now() - cached.fetchedAt < ROBOTS_CACHE_TTL_MS) {
    return cached.isAllowed(targetUrl, USER_AGENT) ?? true
  }

  try {
    const response = await fetch(robotsUrl, {
      headers: DEFAULT_FETCH_HEADERS,
      signal: AbortSignal.timeout(ROBOTS_TIMEOUT_MS),
    })

    if (!response.ok) {
      cache.set(robotsUrl, { isAllowed: () => true, fetchedAt: Date.now() })
      return true
    }

    const text = await response.text()
    const robots = robotsParser(robotsUrl, text)
    const checker = (url: string, ua: string) => robots.isAllowed(url, ua)
    cache.set(robotsUrl, { isAllowed: checker, fetchedAt: Date.now() })
    return checker(targetUrl, USER_AGENT) ?? true
  } catch {
    return true
  }
}

export function clearRobotsCache(): void {
  cache.clear()
}
