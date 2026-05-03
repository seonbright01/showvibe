import './_env'
import { runMonitorStep } from '../../src/lib/pipeline/runners'
import type { MonitorBucket } from '../../src/lib/monitor/run'

async function main(): Promise<void> {
  const raw = process.argv[2] ?? 'active'
  const allowed: MonitorBucket[] = ['active', 'slow', 'degraded', 'all']
  const bucket: MonitorBucket = allowed.includes(raw as MonitorBucket)
    ? (raw as MonitorBucket)
    : 'active'
  console.log(`▶ Running monitor step (bucket=${bucket})...`)
  const summary = await runMonitorStep(bucket)
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error('monitor failed:', error)
  process.exit(1)
})
