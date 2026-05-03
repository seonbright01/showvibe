import './_env'
import { runCollectStep } from '../../src/lib/pipeline/runners'

async function main(): Promise<void> {
  console.log('▶ Running collect step...')
  const summary = await runCollectStep()
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error('collect failed:', error)
  process.exit(1)
})
