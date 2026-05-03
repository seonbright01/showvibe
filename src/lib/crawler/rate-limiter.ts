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
