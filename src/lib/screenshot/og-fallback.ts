import { crawlFetch } from '../crawler/fetch'
import { validateOutboundUrl } from '@/lib/security/url-guard'
import type { ScreenshotResult } from './types'

const OG_PATTERNS = [
  /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
  /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
  /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
]

export async function captureWithOgFallback(url: string): Promise<ScreenshotResult> {
  const fetchResult = await crawlFetch(url, { method: 'GET', timeoutMs: 12_000 })
  if (!fetchResult.ok || ('skipped' in fetchResult && fetchResult.skipped)) {
    return {
      ok: false,
      provider: 'og_image',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: 'fetch_failed_for_og',
    }
  }

  if (!('body' in fetchResult)) {
    return {
      ok: false,
      provider: 'og_image',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: 'no_body',
    }
  }

  let imageUrl: string | null = null
  for (const pattern of OG_PATTERNS) {
    const match = fetchResult.body.match(pattern)
    if (match) {
      imageUrl = resolveUrl(url, match[1])
      break
    }
  }

  if (!imageUrl) {
    return {
      ok: false,
      provider: 'og_image',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: 'no_og_image',
    }
  }

  // og:image 직접 fetch는 SSRF 1차 위험 — 검증 추가
  const imageGuard = await validateOutboundUrl(imageUrl)
  if (!imageGuard.ok) {
    return {
      ok: false,
      provider: 'og_image',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: `og_image_url_blocked:${imageGuard.reason}`,
    }
  }

  try {
    const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(15_000) })
    if (!imageResponse.ok) {
      return {
        ok: false,
        provider: 'og_image',
        buffer: null,
        contentType: null,
        width: null,
        height: null,
        errorMessage: `og_image fetch HTTP ${imageResponse.status}`,
      }
    }
    const arrayBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') ?? 'image/png'
    const allowed: ScreenshotResult['contentType'] = contentType.includes('webp')
      ? 'image/webp'
      : contentType.includes('jpeg') || contentType.includes('jpg')
        ? 'image/jpeg'
        : 'image/png'

    return {
      ok: true,
      provider: 'og_image',
      buffer: Buffer.from(arrayBuffer),
      contentType: allowed,
      width: null,
      height: null,
    }
  } catch (error) {
    return {
      ok: false,
      provider: 'og_image',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: error instanceof Error ? error.message : 'og_fetch_failed',
    }
  }
}

function resolveUrl(baseUrl: string, target: string): string {
  try {
    return new URL(target, baseUrl).toString()
  } catch {
    return target
  }
}
