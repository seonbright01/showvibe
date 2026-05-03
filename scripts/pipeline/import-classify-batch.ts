import './_env'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { createServiceClient } from '../../src/lib/supabase/service'

interface ClassifyResult {
  id: string
  category?: string
  uiPattern?: string
  vibeScore?: number
  qualityScore?: number
  riskScore?: number
  toolGuess?: string
  summary?: string
  mainFeatures?: string[]
  rejected?: boolean
  rejectionReason?: string
}

async function main(): Promise<void> {
  const inputPath = path.resolve(process.cwd(), 'tmp/classify-output.json')
  let raw: string
  try {
    raw = await readFile(inputPath, 'utf-8')
  } catch {
    console.error(`File not found: ${inputPath}`)
    console.error('First run: npm run pipeline:classify-export, then have Claude write tmp/classify-output.json')
    process.exit(1)
  }

  let items: ClassifyResult[]
  try {
    items = JSON.parse(raw)
    if (!Array.isArray(items)) throw new Error('not an array')
  } catch (err) {
    console.error('Invalid JSON:', err)
    process.exit(1)
  }

  const supabase = createServiceClient()
  let inserted = 0
  let rejected = 0
  const errors: string[] = []

  for (const item of items) {
    if (!item.id) {
      errors.push('Missing id in one item')
      continue
    }
    if (item.rejected) {
      const { error } = await supabase
        .from('sites')
        .update({ status: 'blocked', visibility: 'private' })
        .eq('id', item.id)
      if (error) errors.push(`${item.id} reject: ${error.message}`)
      else rejected += 1
      continue
    }

    const clamp = (v: unknown) => {
      const n = typeof v === 'number' ? v : 0
      return Math.max(0, Math.min(100, Math.round(n)))
    }

    const { error } = await supabase.from('site_analysis').upsert(
      {
        site_id: item.id,
        ai_summary: item.summary ?? '',
        category: item.category ?? 'other',
        ui_pattern: item.uiPattern ?? 'other',
        tool_guess: item.toolGuess ?? 'unknown',
        vibe_score: clamp(item.vibeScore),
        quality_score: clamp(item.qualityScore),
        risk_score: clamp(item.riskScore),
        main_features: Array.isArray(item.mainFeatures) ? item.mainFeatures.slice(0, 5) : [],
      },
      { onConflict: 'site_id' },
    )

    if (error) {
      errors.push(`${item.id}: ${error.message}`)
    } else {
      inserted += 1
    }
  }

  console.log(JSON.stringify({ processed: items.length, inserted, rejected, errors }, null, 2))
}

main().catch((err) => {
  console.error('import failed:', err)
  process.exit(1)
})
