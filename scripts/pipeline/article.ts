import './_env'
import { runArticleStep } from '../../src/lib/pipeline/runners'

async function main(): Promise<void> {
  const limit = Number(process.argv[2] ?? '10')
  console.log(`▶ Running article step (limit=${limit})...`)
  const summary = await runArticleStep(limit)
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error('article failed:', error)
  process.exit(1)
})
