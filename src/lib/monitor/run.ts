import { createServiceClient } from '@/lib/supabase/service'
import { checkHealth } from './health-check'
import { determineNextStatus, type SiteStatus } from './status-transitions'

export type MonitorBucket = 'active' | 'slow' | 'degraded' | 'all'

export interface MonitorRunOptions {
  bucket: MonitorBucket
  limit?: number
}

export interface MonitorSummary {
  bucket: MonitorBucket
  processed: number
  transitioned: number
  errors: string[]
}

export async function runMonitor(options: MonitorRunOptions): Promise<MonitorSummary> {
  const limit = options.limit ?? 50
  const supabase = createServiceClient()

  let query = supabase
    .from('sites')
    .select('id, url, status, last_active_at, last_checked_at')
    .eq('visibility', 'public')

  if (options.bucket !== 'all') {
    query = query.eq('status', options.bucket)
  }
  query = query.order('last_checked_at', { ascending: true }).limit(limit)

  const { data, error } = await query
  if (error) {
    return { bucket: options.bucket, processed: 0, transitioned: 0, errors: [error.message] }
  }

  const sites = data ?? []
  let transitioned = 0
  const errors: string[] = []

  for (const site of sites) {
    try {
      const result = await checkHealth(site.url)
      const consecutiveFailures = await countConsecutiveFailures(site.id)
      const daysSinceLastSuccess = daysBetween(new Date(site.last_active_at), new Date())

      const transition = determineNextStatus({
        currentStatus: site.status as SiteStatus,
        consecutiveFailures,
        daysSinceLastSuccess,
        latestResult: result.resultStatus,
        responseTimeMs: result.responseTimeMs,
      })

      await supabase.from('site_status_checks').insert({
        site_id: site.id,
        method: result.method,
        http_status: result.httpStatus,
        response_time_ms: result.responseTimeMs,
        final_url: result.finalUrl,
        result_status: result.resultStatus,
        error_message: result.errorMessage,
      })

      const updates: {
        last_checked_at: string
        status: string
        last_active_at?: string
        recheck_eligible_at?: string
        block_reason?: string
      } = {
        last_checked_at: new Date().toISOString(),
        status: transition.nextStatus,
      }
      if (result.resultStatus === 'ok') {
        updates.last_active_at = new Date().toISOString()
      }
      if (transition.nextStatus === 'archived' && site.status !== 'archived') {
        updates.recheck_eligible_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        updates.block_reason = `archived: ${transition.reason}`
      }

      if (transition.nextStatus !== site.status) {
        transitioned += 1
      }

      await supabase.from('sites').update(updates).eq('id', site.id)
    } catch (error) {
      errors.push(`${site.url}: ${error instanceof Error ? error.message : 'unknown'}`)
    }
  }

  return {
    bucket: options.bucket,
    processed: sites.length,
    transitioned,
    errors,
  }
}

async function countConsecutiveFailures(siteId: string): Promise<number> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_status_checks')
    .select('result_status')
    .eq('site_id', siteId)
    .order('checked_at', { ascending: false })
    .limit(10)

  if (!data) return 0
  let count = 0
  for (const check of data) {
    if (check.result_status !== 'ok') count += 1
    else break
  }
  return count
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}
