import './_env'
import {
  runArticleStep,
  runClassifyStep,
  runCollectStep,
  runMonitorStep,
  runScreenshotStep,
} from '../../src/lib/pipeline/runners'

async function main(): Promise<void> {
  console.log('▶ collect')
  console.log(JSON.stringify(await runCollectStep(), null, 2))
  console.log('▶ classify')
  console.log(JSON.stringify(await runClassifyStep(20), null, 2))
  console.log('▶ screenshot')
  console.log(JSON.stringify(await runScreenshotStep(5), null, 2))
  console.log('▶ article')
  console.log(JSON.stringify(await runArticleStep(10), null, 2))
  console.log('▶ monitor:active')
  console.log(JSON.stringify(await runMonitorStep('active'), null, 2))
}

main().catch((error) => {
  console.error('run-all failed:', error)
  process.exit(1)
})
