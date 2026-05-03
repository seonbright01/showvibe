import './_env'
import { runClassifyStep } from '../../src/lib/pipeline/runners'

async function main(): Promise<void> {
  const limit = Number(process.argv[2] ?? '20')
  console.log(`▶ Running classify step (limit=${limit})...`)
  const summary = await runClassifyStep(limit)
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error('classify failed:', error)
  process.exit(1)
})
