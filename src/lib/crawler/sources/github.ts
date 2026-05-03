import { safeNormalizeUrl } from '../normalize'
import type { CandidateUrl, CollectorResult } from './types'

const GITHUB_SEARCH_URL = 'https://api.github.com/search/repositories'
const DEFAULT_QUERIES = [
  'topic:vibe-coded',
  'topic:lovable-app',
  'topic:cursor-built',
  'topic:v0-app',
  'topic:bolt-built',
  'topic:vercel-deployed in:description created:>2025-01-01',
]

interface GitHubRepo {
  html_url: string
  homepage: string | null
  description: string | null
  full_name: string
  stargazers_count: number
  pushed_at: string
}

export interface GitHubCollectorOptions {
  queries?: string[]
  perQuery?: number
  token?: string
}

export async function collectFromGitHub(
  options: GitHubCollectorOptions = {},
): Promise<CollectorResult> {
  const queries = options.queries ?? DEFAULT_QUERIES
  const perQuery = Math.min(options.perQuery ?? 30, 100)
  const token = options.token ?? process.env.GITHUB_TOKEN

  const candidates: CandidateUrl[] = []
  const errors: string[] = []
  let skipped = 0

  for (const query of queries) {
    try {
      const url = `${GITHUB_SEARCH_URL}?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=${perQuery}`
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'ShowVibeBot/1.0',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(10_000),
      })

      if (!response.ok) {
        errors.push(`GitHub query failed (${response.status}): ${query}`)
        continue
      }

      const payload = (await response.json()) as { items?: GitHubRepo[] }
      const items = payload.items ?? []

      for (const item of items) {
        const candidate = item.homepage?.trim() || item.html_url
        const normalized = safeNormalizeUrl(candidate)
        if (!normalized) {
          skipped += 1
          continue
        }
        if (
          normalized.host === 'github.com' &&
          (!item.homepage || !item.homepage.trim())
        ) {
          skipped += 1
          continue
        }

        candidates.push({
          url: normalized.normalized,
          title: item.full_name,
          description: item.description,
          sourcePlatform: 'github',
          discoveredAt: new Date().toISOString(),
          raw: {
            stars: item.stargazers_count,
            pushedAt: item.pushed_at,
            repo: item.full_name,
            query,
          },
        })
      }
    } catch (error) {
      errors.push(
        `GitHub query error (${query}): ${error instanceof Error ? error.message : 'unknown'}`,
      )
    }
  }

  return {
    source: 'github',
    collected: candidates.length,
    skipped,
    errors,
    candidates,
  }
}
