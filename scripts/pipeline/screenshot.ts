import './_env'
import { runScreenshotStep } from '../../src/lib/pipeline/runners'

async function main(): Promise<void> {
  const limit = Number(process.argv[2] ?? '5')
  console.log(`▶ Running screenshot step (limit=${limit})...`)
  const summary = await runScreenshotStep(limit)
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error('screenshot failed:', error)
  process.exit(1)
})
