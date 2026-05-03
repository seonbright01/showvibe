import type { ScreenshotOptions, ScreenshotResult } from './types'

const DEFAULT_VIEWPORT_WIDTH = 1440
const DEFAULT_VIEWPORT_HEIGHT = 900
const DEFAULT_TIMEOUT_MS = 30_000

export async function captureWithPlaywright(
  url: string,
  options: ScreenshotOptions = {},
): Promise<ScreenshotResult> {
  let chromium: typeof import('playwright').chromium
  try {
    const mod = await import('playwright')
    chromium = mod.chromium
  } catch (error) {
    return {
      ok: false,
      provider: 'playwright',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: `playwright import failed: ${error instanceof Error ? error.message : 'unknown'}`,
    }
  }

  const width = options.viewportWidth ?? DEFAULT_VIEWPORT_WIDTH
  const height = options.viewportHeight ?? DEFAULT_VIEWPORT_HEIGHT
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width, height },
      userAgent: 'ShowVibeBot/1.0 (+https://showvibe.app/bot)',
      colorScheme: 'dark',
    })
    const page = await context.newPage()

    await page.goto(url, { waitUntil: 'networkidle', timeout: timeoutMs })
    const png = await page.screenshot({ type: 'png', fullPage: false })
    return {
      ok: true,
      provider: 'playwright',
      buffer: Buffer.from(png),
      contentType: 'image/png',
      width,
      height,
    }
  } catch (error) {
    return {
      ok: false,
      provider: 'playwright',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: error instanceof Error ? error.message : 'playwright_failed',
    }
  } finally {
    if (browser) await browser.close().catch(() => undefined)
  }
}
