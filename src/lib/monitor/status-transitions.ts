import type { HealthResultStatus } from './health-check'

export type SiteStatus = 'active' | 'slow' | 'degraded' | 'archived' | 'blocked' | 'unknown'

export interface TransitionInput {
  currentStatus: SiteStatus
  consecutiveFailures: number
  daysSinceLastSuccess: number
  latestResult: HealthResultStatus
  responseTimeMs: number
}

export interface TransitionOutput {
  nextStatus: SiteStatus
  reason: string
  resetFailures: boolean
}

const SLOW_RESPONSE_THRESHOLD_MS = 5000
const DEGRADED_FAILURE_THRESHOLD = 3
const ARCHIVE_DAYS_THRESHOLD = 30

export function determineNextStatus(input: TransitionInput): TransitionOutput {
  const { currentStatus, consecutiveFailures, daysSinceLastSuccess, latestResult, responseTimeMs } = input

  if (latestResult === 'parking') {
    return { nextStatus: 'archived', reason: 'parking page detected', resetFailures: false }
  }

  if (latestResult === 'blocked') {
    return { nextStatus: currentStatus, reason: 'blocked by robots.txt — no change', resetFailures: false }
  }

  if (latestResult === 'ok') {
    if (responseTimeMs > SLOW_RESPONSE_THRESHOLD_MS) {
      return { nextStatus: 'slow', reason: `slow response ${responseTimeMs}ms`, resetFailures: true }
    }
    return { nextStatus: 'active', reason: 'ok', resetFailures: true }
  }

  const newFailureCount = consecutiveFailures + 1

  if (daysSinceLastSuccess >= ARCHIVE_DAYS_THRESHOLD) {
    return {
      nextStatus: 'archived',
      reason: `no success for ${daysSinceLastSuccess} days`,
      resetFailures: false,
    }
  }

  if (newFailureCount >= DEGRADED_FAILURE_THRESHOLD) {
    return {
      nextStatus: 'degraded',
      reason: `${newFailureCount} consecutive failures`,
      resetFailures: false,
    }
  }

  if (currentStatus === 'active') {
    return { nextStatus: 'slow', reason: 'first failure', resetFailures: false }
  }

  return { nextStatus: currentStatus, reason: `failure (${newFailureCount}x)`, resetFailures: false }
}
