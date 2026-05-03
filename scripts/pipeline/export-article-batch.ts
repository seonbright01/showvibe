import './_env'
import path from 'node:path'
import { writeFile, mkdir } from 'node:fs/promises'
import { createServiceClient } from '../../src/lib/supabase/service'
import { crawlFetch } from '../../src/lib/crawler/fetch'

interface ArticleExportItem {
  id: string
  url: string
  name: string
  category: string | null
  tool_guess: string | null
  classifier_summary: string | null
  html_excerpt: string
  fetch_error?: string
}

async function main(): Promise<void> {
  const limit = Number(process.argv[2] ?? '10')
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('sites')
    .select('id, url, name, site_analysis!inner(ai_summary, category, tool_guess, article_summary)')
    .is('site_analysis.article_summary', null)
    .limit(limit)

  if (error) {
    console.error('Query failed:', error.message)
    process.exit(1)
  }

  type Row = {
    id: string
    url: string
    name: string
    site_analysis: { ai_summary: string | null; category: string | null; tool_guess: string | null; article_summary: string | null } | null
  }
  const sites = (data as Row[] | null) ?? []
  console.log(`▶ Fetching HTML for ${sites.length} sites needing article...`)

  const items: ArticleExportItem[] = []
  for (const s of sites) {
    const fetchResult = await crawlFetch(s.url)
    let html = ''
    let fetchError: string | undefined
    if (fetchResult.ok && 'body' in fetchResult) {
      html = fetchResult.body
    } else if ('errorMessage' in fetchResult) {
      fetchError = fetchResult.errorMessage
    } else if ('reason' in fetchResult) {
      fetchError = fetchResult.reason
    }

    items.push({
      id: s.id,
      url: s.url,
      name: s.name,
      category: s.site_analysis?.category ?? null,
      tool_guess: s.site_analysis?.tool_guess ?? null,
      classifier_summary: s.site_analysis?.ai_summary ?? null,
      html_excerpt: html.slice(0, 12000),
      ...(fetchError ? { fetch_error: fetchError } : {}),
    })
    process.stdout.write(`  · ${s.name.slice(0, 40)}${fetchError ? ` ERR:${fetchError.slice(0,30)}` : ''}\n`)
  }

  const outDir = path.resolve(process.cwd(), 'tmp')
  await mkdir(outDir, { recursive: true })
  const outPath = path.join(outDir, 'article-input.json')
  await writeFile(outPath, JSON.stringify(items, null, 2), 'utf-8')

  console.log(`\n✓ Wrote ${items.length} sites to ${outPath}`)
  console.log('Next: ask Claude to read tmp/article-input.json and write tmp/article-output.json')
}

main().catch((err) => {
  console.error('export failed:', err)
  process.exit(1)
})
