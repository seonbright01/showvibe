import { createServiceClient } from '@/lib/supabase/service'
import { checkBlocklist } from './blocklist'
import { collectFromGitHub } from './sources/github'
import { collectFromHackerNews } from './sources/hn'
import { collectFromManual, type ManualCandidateInput } from './sources/manual'
import type { CandidateUrl, CollectorResult } from './sources/types'

export interface CollectRunOptions {
  enableGitHub?: boolean
  enableHackerNews?: boolean
  manualInputs?: ManualCandidateInput[]
  manualSource?: 'manual' | 'admin'
}

export interface CollectRunSummary {
  totalCandidates: number
  inserted: number
  duplicates: number
  blocked: number
  failed: number
  results: CollectorResult[]
  errors: string[]
}

export async function runCollectors(options: CollectRunOptions = {}): Promise<CollectRunSummary> {
  const enableGitHub = options.enableGitHub ?? true
  const enableHackerNews = options.enableHackerNews ?? true
  const manualInputs = options.manualInputs ?? []

  const tasks: Array<Promise<CollectorResult>> = []
  if (enableGitHub) tasks.push(collectFromGitHub())
  if (enableHackerNews) tasks.push(collectFromHackerNews())
  if (manualInputs.length > 0) {
    tasks.push(Promise.resolve(collectFromManual(manualInputs, options.manualSource ?? 'manual')))
  }

  const results = await Promise.all(tasks)
  const dedupedAll = dedupe(results.flatMap((r) => r.candidates))
  const filtered = filterBlocklisted(dedupedAll)
  const summary = await persistCandidates(filtered.kept)

  return {
    totalCandidates: filtered.kept.length,
    inserted: summary.inserted,
    duplicates: summary.duplicates,
    blocked: filtered.blockedCount,
    failed: summary.failed,
    results,
    errors: summary.errors,
  }
}

function dedupe(candidates: CandidateUrl[]): CandidateUrl[] {
  const map = new Map<string, CandidateUrl>()
  for (const candidate of candidates) {
    if (!map.has(candidate.url)) {
      map.set(candidate.url, candidate)
    }
  }
  return Array.from(map.values())
}

function filterBlocklisted(candidates: CandidateUrl[]): {
  kept: CandidateUrl[]
  blockedCount: number
} {
  const kept: CandidateUrl[] = []
  let blockedCount = 0
  for (const candidate of candidates) {
    const result = checkBlocklist(candidate.url)
    if (result.blocked) {
      blockedCount += 1
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[blocklist] skipped: ${candidate.url} (${result.reason})`)
      }
    } else {
      kept.push(candidate)
    }
  }
  return { kept, blockedCount }
}

interface PersistSummary {
  inserted: number
  duplicates: number
  failed: number
  errors: string[]
}

async function persistCandidates(candidates: CandidateUrl[]): Promise<PersistSummary> {
  if (candidates.length === 0) {
    return { inserted: 0, duplicates: 0, failed: 0, errors: [] }
  }

  const supabase = createServiceClient()
  const errors: string[] = []
  let inserted = 0
  let duplicates = 0
  let failed = 0

  const batchSize = 50
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize)
    const rows = batch.map((c) => ({
      name: c.title.slice(0, 200),
      url: c.url,
      normalized_url: c.url,
      description: c.description,
      source_type: 'auto_collected' as const,
      source_platform: c.sourcePlatform,
      status: 'unknown' as const,
      visibility: 'unlisted' as const,
    }))

    const { data, error } = await supabase
      .from('sites')
      .upsert(rows, { onConflict: 'normalized_url', ignoreDuplicates: true })
      .select('id, normalized_url')

    if (error) {
      failed += batch.length
      errors.push(`Batch insert failed: ${error.message}`)
      continue
    }

    const newRowCount = data?.length ?? 0
    inserted += newRowCount
    duplicates += batch.length - newRowCount
  }

  return { inserted, duplicates, failed, errors }
}
