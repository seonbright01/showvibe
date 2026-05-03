import { safeNormalizeUrl } from '../normalize'
import type { CandidateUrl, CollectorResult } from './types'

export interface ManualCandidateInput {
  url: string
  title?: string
  description?: string | null
  source?: string
}

export function collectFromManual(
  inputs: ReadonlyArray<ManualCandidateInput>,
  sourcePlatform: 'manual' | 'admin' = 'manual',
): CollectorResult {
  const candidates: CandidateUrl[] = []
  const errors: string[] = []
  let skipped = 0

  for (const input of inputs) {
    const normalized = safeNormalizeUrl(input.url)
    if (!normalized) {
      skipped += 1
      errors.push(`Invalid URL: ${input.url}`)
      continue
    }

    candidates.push({
      url: normalized.normalized,
      title: input.title?.trim() || normalized.host,
      description: input.description ?? null,
      sourcePlatform: input.source ?? sourcePlatform,
      discoveredAt: new Date().toISOString(),
      raw: { originalUrl: input.url },
    })
  }

  return {
    source: sourcePlatform,
    collected: candidates.length,
    skipped,
    errors,
    candidates,
  }
}
