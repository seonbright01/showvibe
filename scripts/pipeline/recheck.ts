import './_env'
import { runRecheckStep } from '../../src/lib/pipeline/runners'

async function main(): Promise<void> {
  const limit = Number(process.argv[2] ?? '20')
  console.log(`▶ Running recheck step (limit=${limit})...`)
  const summary = await runRecheckStep(limit)
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((err) => {
  console.error('recheck failed:', err)
  process.exit(1)
})
