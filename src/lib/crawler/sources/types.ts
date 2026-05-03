export interface CandidateUrl {
  url: string
  title: string
  description: string | null
  sourcePlatform: 'github' | 'hn' | 'manual' | 'admin' | string
  discoveredAt: string
  raw?: Record<string, unknown>
}

export interface CollectorResult {
  source: string
  collected: number
  skipped: number
  errors: string[]
  candidates: CandidateUrl[]
}
