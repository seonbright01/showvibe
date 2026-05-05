import { USER_AGENT } from '@/lib/crawler/user-agent'
import { validateOutboundUrl } from '@/lib/security/url-guard'
import type { ScreenshotOptions, ScreenshotResult } from './types'

const DEFAULT_VIEWPORT_WIDTH = 1440
const DEFAULT_VIEWPORT_HEIGHT = 900
const DEFAULT_TIMEOUT_MS = 15_000
const DOMAIN_CONCURRENCY_CAP = 5

// Browser singleton — 매 호출마다 chromium.launch() 하면 cold start가 1-2s/호출이라
// 큐에 쌓일 때 매우 느려진다. 모듈 스코프에 한 번만 launch.
type ChromiumModule = typeof import('playwright')['chromium']
type Browser = Awaited<ReturnType<ChromiumModule['launch']>>

let browserPromise: Promise<Browser> | null = null
let cachedChromium: ChromiumModule | null = null

async function loadChromium(): Promise<ChromiumModule> {
  if (cachedChromium) return cachedChromium
  const mod = await import('playwright')
  cachedChromium = mod.chromium
  return cachedChromium
}

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    try {
      const b = await browserPromise
      if (b.isConnected()) return b
    } catch {
      // 손상된 promise — 새 launch
    }
  }
  const chromium = await loadChromium()
  browserPromise = chromium.launch({ headless: true })
  return browserPromise
}

// 도메인별 동시 실행 cap — 같은 호스트에 다수 페이지 동시 캡처 방지
const domainInflight = new Map<string, number>()

async function acquireDomainSlot(host: string): Promise<void> {
  while ((domainInflight.get(host) ?? 0) >= DOMAIN_CONCURRENCY_CAP) {
    await new Promise((r) => setTimeout(r, 200))
  }
  domainInflight.set(host, (domainInflight.get(host) ?? 0) + 1)
}

function releaseDomainSlot(host: string): void {
  const cur = domainInflight.get(host) ?? 0
  if (cur <= 1) domainInflight.delete(host)
  else domainInflight.set(host, cur - 1)
}

export async function captureWithPlaywright(
  url: string,
  options: ScreenshotOptions = {},
): Promise<ScreenshotResult> {
  // SSRF 가드 — page.goto 직전에 hostname pattern + DNS IP 재검증
  const guard = await validateOutboundUrl(url)
  if (!guard.ok) {
    return {
      ok: false,
      provider: 'playwright',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: `url_blocked:${guard.reason}`,
    }
  }

  let host: string
  try {
    host = new URL(url).host
  } catch {
    return {
      ok: false,
      provider: 'playwright',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: 'invalid_url',
    }
  }

  let browser: Browser
  try {
    browser = await getBrowser()
  } catch (error) {
    return {
      ok: false,
      provider: 'playwright',
      buffer: null,
      contentType: null,
      width: null,
      height: null,
      errorMessage: `playwright launch failed: ${error instanceof Error ? error.message : 'unknown'}`,
    }
  }

  const width = options.viewportWidth ?? DEFAULT_VIEWPORT_WIDTH
  const height = options.viewportHeight ?? DEFAULT_VIEWPORT_HEIGHT
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  await acquireDomainSlot(host)
  let context: Awaited<ReturnType<Browser['newContext']>> | null = null
  try {
    context = await browser.newContext({
      viewport: { width, height },
      userAgent: USER_AGENT,
      colorScheme: 'dark',
    })
    const page = await context.newPage()
    // waitUntil:'load' (기존 'networkidle'은 SPA에서 30s 매달림)
    await page.goto(url, { waitUntil: 'load', timeout: timeoutMs })
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
    if (context) await context.close().catch(() => undefined)
    releaseDomainSlot(host)
  }
}
