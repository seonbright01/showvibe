import './_env'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { createServiceClient } from '../../src/lib/supabase/service'

interface ArticleResult {
  id: string
  article: string
}

async function main(): Promise<void> {
  const inputPath = path.resolve(process.cwd(), 'tmp/article-output.json')
  let raw: string
  try {
    raw = await readFile(inputPath, 'utf-8')
  } catch {
    console.error(`File not found: ${inputPath}`)
    process.exit(1)
  }

  let items: ArticleResult[]
  try {
    items = JSON.parse(raw)
    if (!Array.isArray(items)) throw new Error('not an array')
  } catch (err) {
    console.error('Invalid JSON:', err)
    process.exit(1)
  }

  const supabase = createServiceClient()
  let updated = 0
  const errors: string[] = []

  for (const item of items) {
    if (!item.id || !item.article || typeof item.article !== 'string') {
      errors.push(`Missing id or article: ${JSON.stringify(item).slice(0, 80)}`)
      continue
    }
    const { error } = await supabase
      .from('site_analysis')
      .update({ article_summary: item.article })
      .eq('site_id', item.id)
    if (error) errors.push(`${item.id}: ${error.message}`)
    else updated += 1
  }

  console.log(JSON.stringify({ processed: items.length, updated, errors }, null, 2))
}

main().catch((err) => {
  console.error('import failed:', err)
  process.exit(1)
})
