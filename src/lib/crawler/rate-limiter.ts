/**
 * 도메인별 in-process rate limiter.
 *
 * ⚠️ Vercel serverless multi-instance 한계:
 * 슬롯 상태(`buckets`)를 in-memory `Map`으로 들고 있어서 instance 간에 공유되지 않음.
 * 동시에 여러 lambda instance가 살아있으면 한 도메인에 대해 분당 N회 보장이 깨진다
 * (instance 수 만큼 곱해진 traffic이 실제로 나갈 수 있음).
 * 외부 도메인에 대한 정중한 crawling 페이스를 강제하려면 distributed limiter
 * (Redis / Upstash / Vercel KV 기반 token-bucket 등) 도입 검토 필요.
 */
interface DomainBucket {
  lastRequestAt: number
  queue: Array<() => void>
}

const DEFAULT_INTERVAL_MS = 1000

const buckets = new Map<string, DomainBucket>()

export interface RateLimiterOptions {
  intervalMs?: number
}

export async function waitForDomainSlot(host: string, options: RateLimiterOptions = {}): Promise<void> {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS
  const key = host.toLowerCase()

  const bucket = buckets.get(key) ?? { lastRequestAt: 0, queue: [] }
  if (!buckets.has(key)) {
    buckets.set(key, bucket)
  }

  const now = Date.now()
  const elapsed = now - bucket.lastRequestAt
  if (elapsed >= intervalMs && bucket.queue.length === 0) {
    bucket.lastRequestAt = now
    return
  }

  await new Promise<void>((resolve) => {
    bucket.queue.push(resolve)
    scheduleNext(key, intervalMs)
  })
  bucket.lastRequestAt = Date.now()
}

function scheduleNext(key: string, intervalMs: number): void {
  const bucket = buckets.get(key)
  if (!bucket) return

  const delay = Math.max(intervalMs - (Date.now() - bucket.lastRequestAt), 0)
  setTimeout(() => {
    const next = bucket.queue.shift()
    if (next) next()
    if (bucket.queue.length > 0) {
      scheduleNext(key, intervalMs)
    }
  }, delay)
}

export function clearRateLimiter(): void {
  buckets.clear()
}
