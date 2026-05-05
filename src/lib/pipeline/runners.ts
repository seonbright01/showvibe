import { runCollectors, type CollectRunSummary } from '@/lib/crawler'
import { crawlFetch } from '@/lib/crawler/fetch'
import { runLevel0Filter } from '@/lib/ai/level0-filter'
import { classifySite } from '@/lib/ai/classifier'
import { generateArticle } from '@/lib/ai/article-generator'
import { captureAndStoreScreenshot } from '@/lib/screenshot/capture'
import { runMonitor, type MonitorBucket, type MonitorSummary } from '@/lib/monitor/run'
import { createServiceClient } from '@/lib/supabase/service'
import {
  fetchRecheckCandidates,
  fetchSitesNeedingArticle,
  fetchSitesNeedingScreenshot,
  fetchUnclassifiedSites,
} from './queue'

export const RECHECK_INTERVAL_DAYS = {
  l0_reject: 30,
  archive: 90,
  admin_reject: 180,
} as const

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

function nextRecheckDays(baseDays: number, recheckCount: number): number {
  return baseDays * Math.pow(2, Math.min(recheckCount, 4))
}

export interface ClassifyRunSummary {
  processed: number
  classified: number
  rejected: number
  errors: string[]
  modes: { live: number; stub: number }
}

export interface RecheckRunSummary {
  processed: number
  revived: number
  still_blocked: number
  errors: string[]
}

export interface ScreenshotRunSummary {
  processed: number
  captured: number
  errors: string[]
  providers: Record<string, number>
}

export interface ArticleRunSummary {
  processed: number
  generated: number
  errors: string[]
  modes: { live: number; stub: number }
}

export async function runCollectStep(): Promise<CollectRunSummary> {
  return runCollectors()
}

export async function runClassifyStep(limit = 20): Promise<ClassifyRunSummary> {
  const supabase = createServiceClient()
  const sites = await fetchUnclassifiedSites(limit)
  const summary: ClassifyRunSummary = {
    processed: 0,
    classified: 0,
    rejected: 0,
    errors: [],
    modes: { live: 0, stub: 0 },
  }

  for (const site of sites) {
    summary.processed += 1
    try {
      const fetchResult = await crawlFetch(site.url)
      if (!fetchResult.ok || !('body' in fetchResult)) {
        summary.errors.push(`${site.url}: fetch failed`)
        continue
      }

      const l0 = runLevel0Filter({
        url: site.url,
        html: fetchResult.body,
        description: site.description,
      })

      if (!l0.passed) {
        summary.rejected += 1
        const reason = `L0 score ${l0.score} below threshold (signals: ${l0.signals.join(', ') || 'none'})`
        await supabase.from('site_analysis').upsert(
          {
            site_id: site.id,
            ai_summary: `자동 L0 필터에 의해 차단되었습니다. ${reason}`,
            category: 'other',
            ui_pattern: 'other',
            tool_guess: l0.toolGuess ?? 'unknown',
            vibe_score: l0.score,
            quality_score: 0,
            risk_score: 0,
            main_features: [],
          },
          { onConflict: 'site_id' },
        )
        await supabase
          .from('sites')
          .update({
            status: 'blocked',
            visibility: 'private',
            block_reason: reason,
            recheck_eligible_at: daysFromNow(RECHECK_INTERVAL_DAYS.l0_reject),
          })
          .eq('id', site.id)
        continue
      }

      const classification = await classifySite({
        url: site.url,
        html: fetchResult.body,
        description: site.description,
        l0Score: l0.score,
        l0Signals: l0.signals,
      })

      summary.modes[classification.mode] += 1

      const { error: upsertError } = await supabase.from('site_analysis').upsert(
        {
          site_id: site.id,
          ai_summary: classification.summary,
          category: classification.category,
          ui_pattern: classification.uiPattern,
          tool_guess: classification.toolGuess,
          vibe_score: classification.vibeScore,
          quality_score: classification.qualityScore,
          risk_score: classification.riskScore,
          main_features: classification.mainFeatures,
        },
        { onConflict: 'site_id' },
      )

      if (upsertError) {
        summary.errors.push(`${site.url}: ${upsertError.message}`)
        continue
      }

      summary.classified += 1
    } catch (error) {
      summary.errors.push(
        `${site.url}: ${error instanceof Error ? error.message : 'unknown'}`,
      )
    }
  }

  return summary
}

export async function runScreenshotStep(limit = 10): Promise<ScreenshotRunSummary> {
  const supabase = createServiceClient()
  const sites = await fetchSitesNeedingScreenshot(limit)
  const summary: ScreenshotRunSummary = {
    processed: 0,
    captured: 0,
    errors: [],
    providers: {},
  }

  for (const site of sites) {
    summary.processed += 1
    const result = await captureAndStoreScreenshot({ siteId: site.id, url: site.url })
    if (result.ok) {
      summary.captured += 1
      const key = result.provider ?? 'unknown'
      summary.providers[key] = (summary.providers[key] ?? 0) + 1
    } else {
      summary.errors.push(`${site.url}: ${result.errors.join('; ')}`)
      const { data: row } = await supabase
        .from('sites')
        .select('screenshot_attempts')
        .eq('id', site.id)
        .single()
      const nextAttempts = (row?.screenshot_attempts ?? 0) + 1
      await supabase
        .from('sites')
        .update({ screenshot_attempts: nextAttempts })
        .eq('id', site.id)
    }
  }

  return summary
}

export async function runArticleStep(limit = 10): Promise<ArticleRunSummary> {
  const supabase = createServiceClient()
  const sites = await fetchSitesNeedingArticle(limit)
  const summary: ArticleRunSummary = {
    processed: 0,
    generated: 0,
    errors: [],
    modes: { live: 0, stub: 0 },
  }

  for (const site of sites) {
    summary.processed += 1
    try {
      const fetchResult = await crawlFetch(site.url)
      if (!fetchResult.ok || !('body' in fetchResult)) {
        summary.errors.push(`${site.url}: fetch failed for article`)
        continue
      }

      const { data: analysis } = await supabase
        .from('site_analysis')
        .select('ai_summary, category, tool_guess')
        .eq('site_id', site.id)
        .maybeSingle()

      const article = await generateArticle({
        url: site.url,
        html: fetchResult.body,
        classifierSummary: analysis?.ai_summary ?? '',
        category: analysis?.category ?? 'other',
        toolGuess: analysis?.tool_guess ?? 'unknown',
      })

      summary.modes[article.mode] += 1

      await supabase
        .from('site_analysis')
        .update({ article_summary: article.article })
        .eq('site_id', site.id)

      summary.generated += 1
    } catch (error) {
      summary.errors.push(
        `${site.url}: ${error instanceof Error ? error.message : 'unknown'}`,
      )
    }
  }

  return summary
}

export async function runMonitorStep(bucket: MonitorBucket): Promise<MonitorSummary> {
  return runMonitor({ bucket })
}

export async function runRecheckStep(limit = 20): Promise<RecheckRunSummary> {
  const supabase = createServiceClient()
  const sites = await fetchRecheckCandidates(limit)
  const summary: RecheckRunSummary = {
    processed: 0,
    revived: 0,
    still_blocked: 0,
    errors: [],
  }

  for (const site of sites) {
    summary.processed += 1
    try {
      const fetchResult = await crawlFetch(site.url)
      if (!fetchResult.ok || !('body' in fetchResult)) {
        const errMsg = 'errorMessage' in fetchResult
          ? fetchResult.errorMessage
          : 'reason' in fetchResult
            ? fetchResult.reason
            : 'unknown'

        const { data: row } = await supabase
          .from('sites')
          .select('recheck_count')
          .eq('id', site.id)
          .single()
        const nextCount = (row?.recheck_count ?? 0) + 1
        const baseDays =
          site.status === 'archived'
            ? RECHECK_INTERVAL_DAYS.archive
            : RECHECK_INTERVAL_DAYS.l0_reject
        await supabase
          .from('sites')
          .update({
            recheck_count: nextCount,
            recheck_eligible_at: daysFromNow(nextRecheckDays(baseDays, nextCount)),
            block_reason: `recheck failed: ${errMsg}`,
          })
          .eq('id', site.id)

        summary.still_blocked += 1
        continue
      }

      const l0 = runLevel0Filter({
        url: site.url,
        html: fetchResult.body,
        description: site.description,
      })

      if (l0.passed) {
        await supabase
          .from('sites')
          .update({
            status: 'unknown',
            visibility: 'unlisted',
            block_reason: null,
            recheck_eligible_at: null,
            recheck_count: 0,
          })
          .eq('id', site.id)

        await supabase
          .from('site_analysis')
          .delete()
          .eq('site_id', site.id)

        summary.revived += 1
      } else {
        const { data: row } = await supabase
          .from('sites')
          .select('recheck_count')
          .eq('id', site.id)
          .single()
        const nextCount = (row?.recheck_count ?? 0) + 1
        const baseDays =
          site.status === 'archived'
            ? RECHECK_INTERVAL_DAYS.archive
            : RECHECK_INTERVAL_DAYS.l0_reject
        await supabase
          .from('sites')
          .update({
            recheck_count: nextCount,
            recheck_eligible_at: daysFromNow(nextRecheckDays(baseDays, nextCount)),
            block_reason: `recheck still below threshold (L0=${l0.score})`,
          })
          .eq('id', site.id)

        summary.still_blocked += 1
      }
    } catch (error) {
      summary.errors.push(
        `${site.url}: ${error instanceof Error ? error.message : 'unknown'}`,
      )
    }
  }

  return summary
}
