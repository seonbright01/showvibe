import './_env'
import path from 'node:path'
import { writeFile, mkdir } from 'node:fs/promises'
import { createServiceClient } from '../../src/lib/supabase/service'
import { crawlFetch } from '../../src/lib/crawler/fetch'
import { runLevel0Filter } from '../../src/lib/ai/level0-filter'

interface ExportItem {
  id: string
  url: string
  name: string
  description: string | null
  l0_score: number
  l0_signals: string[]
  l0_passed: boolean
  html_excerpt: string
  fetch_error?: string
}

async function main(): Promise<void> {
  const limit = Number(process.argv[2] ?? '10')
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('sites')
    .select('id, url, name, description, site_analysis(id)')
    .is('site_analysis', null)
    .neq('status', 'blocked')
    .order('first_discovered_at', { ascending: true })
    .limit(limit * 2)

  if (error) {
    console.error('Query failed:', error.message)
    process.exit(1)
  }

  type Row = {
    id: string
    url: string
    name: string
    description: string | null
    site_analysis: unknown
  }
  const candidates = ((data as Row[] | null) ?? []).slice(0, limit)
  console.log(`▶ Fetching HTML for ${candidates.length} candidates...`)

  const items: ExportItem[] = []
  for (const c of candidates) {
    const fetchResult = await crawlFetch(c.url)
    let html = ''
    let fetchError: string | undefined
    if (fetchResult.ok && 'body' in fetchResult) {
      html = fetchResult.body
    } else if ('errorMessage' in fetchResult) {
      fetchError = fetchResult.errorMessage
    } else if ('reason' in fetchResult) {
      fetchError = fetchResult.reason
    }

    const l0 = runLevel0Filter({
      url: c.url,
      html,
      description: c.description,
    })

    items.push({
      id: c.id,
      url: c.url,
      name: c.name,
      description: c.description,
      l0_score: l0.score,
      l0_signals: l0.signals,
      l0_passed: l0.passed,
      html_excerpt: html.slice(0, 12000),
      ...(fetchError ? { fetch_error: fetchError } : {}),
    })
    process.stdout.write(`  · ${c.name.slice(0, 40)} L0=${l0.score}${fetchError ? ` ERR:${fetchError.slice(0,30)}` : ''}\n`)
  }

  const outDir = path.resolve(process.cwd(), 'tmp')
  await mkdir(outDir, { recursive: true })
  const outPath = path.join(outDir, 'classify-input.json')
  await writeFile(outPath, JSON.stringify(items, null, 2), 'utf-8')

  console.log(`\n✓ Wrote ${items.length} candidates to ${outPath}`)
  console.log('Next: ask Claude in this session to read tmp/classify-input.json and write tmp/classify-output.json')
}

main().catch((err) => {
  console.error('export failed:', err)
  process.exit(1)
})
