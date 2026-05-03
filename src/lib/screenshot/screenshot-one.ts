import type { ScreenshotOptions, ScreenshotResult } from './types'

const SCREENSHOT_ONE_URL = 'https://api.screenshotone.com/take'

export async function captureWithScreenshotOne(
  url: string,
  options: ScreenshotOptions = {},
): Promise<ScreenshotResult> {
  const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY
  if (!accessKey) {
    return {
      ok: false,
      provider: 'screenshot_one',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: 'SCREENSHOTONE_ACCESS_KEY not configured',
    }
  }

  const width = options.viewportWidth ?? 1440
  const height = options.viewportHeight ?? 900
  const params = new URLSearchParams({
    access_key: accessKey,
    url,
    viewport_width: String(width),
    viewport_height: String(height),
    format: 'webp',
    image_quality: '80',
    block_ads: 'true',
    block_trackers: 'true',
    block_cookie_banners: 'true',
    full_page: 'false',
    response_type: 'by_format',
  })

  try {
    const response = await fetch(`${SCREENSHOT_ONE_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(options.timeoutMs ?? 60_000),
    })
    if (!response.ok) {
      return {
        ok: false,
        provider: 'screenshot_one',
        buffer: null,
        contentType: null,
        width: null,
        height: null,
        errorMessage: `screenshotone error: HTTP ${response.status}`,
      }
    }
    const arrayBuffer = await response.arrayBuffer()
    return {
      ok: true,
      provider: 'screenshot_one',
      buffer: Buffer.from(arrayBuffer),
      contentType: 'image/webp',
      width,
      height,
    }
  } catch (error) {
    return {
      ok: false,
      provider: 'screenshot_one',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: error instanceof Error ? error.message : 'screenshot_one_failed',
    }
  }
}
