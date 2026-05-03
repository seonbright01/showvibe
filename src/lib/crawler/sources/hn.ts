import { safeNormalizeUrl } from '../normalize'
import { cleanTitle } from '../title-cleaner'
import type { CandidateUrl, CollectorResult } from './types'

const HN_SEARCH_URL = 'https://hn.algolia.com/api/v1/search_by_date'
const DEFAULT_QUERIES = [
  'Show HN built with Cursor',
  'Show HN built with Lovable',
  'Show HN built with v0',
  'Show HN built with Bolt',
  'Show HN vibe coding',
  'Show HN AI built',
]

interface HnHit {
  objectID: string
  title: string | null
  url: string | null
  story_text: string | null
  author: string | null
  points: number | null
  num_comments: number | null
  created_at: string
}

export interface HnCollectorOptions {
  queries?: string[]
  hitsPerQuery?: number
}

export async function collectFromHackerNews(
  options: HnCollectorOptions = {},
): Promise<CollectorResult> {
  const queries = options.queries ?? DEFAULT_QUERIES
  const hitsPerQuery = Math.min(options.hitsPerQuery ?? 50, 100)

  const candidates: CandidateUrl[] = []
  const errors: string[] = []
  let skipped = 0

  for (const query of queries) {
    try {
      const url = `${HN_SEARCH_URL}?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${hitsPerQuery}`
      const response = await fetch(url, {
        headers: { 'User-Agent': 'ShowVibeBot/1.0' },
        signal: AbortSignal.timeout(10_000),
      })

      if (!response.ok) {
        errors.push(`HN query failed (${response.status}): ${query}`)
        continue
      }

      const payload = (await response.json()) as { hits?: HnHit[] }
      const hits = payload.hits ?? []

      for (const hit of hits) {
        if (!hit.url) {
          skipped += 1
          continue
        }
        const normalized = safeNormalizeUrl(hit.url)
        if (!normalized) {
          skipped += 1
          continue
        }
        if (normalized.host === 'news.ycombinator.com') {
          skipped += 1
          continue
        }

        const cleanedTitle = cleanTitle(hit.title) || normalized.host
        candidates.push({
          url: normalized.normalized,
          title: cleanedTitle,
          description: hit.story_text,
          sourcePlatform: 'hn',
          discoveredAt: new Date().toISOString(),
          raw: {
            hnId: hit.objectID,
            author: hit.author,
            points: hit.points,
            numComments: hit.num_comments,
            createdAt: hit.created_at,
            query,
          },
        })
      }
    } catch (error) {
      errors.push(
        `HN query error (${query}): ${error instanceof Error ? error.message : 'unknown'}`,
      )
    }
  }

  return {
    source: 'hn',
    collected: candidates.length,
    skipped,
    errors,
    candidates,
  }
}
