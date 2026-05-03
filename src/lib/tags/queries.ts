import { createClient } from '@/lib/supabase/server'

function logTagError(name: string, error: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[tags] ${name} failed:`, error)
  }
}

export async function getPopularTags(limit = 15): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_analysis')
      .select('category, tool_guess')
      .limit(500)

    if (error) {
      logTagError('getPopularTags', error)
      return []
    }

    const counts = new Map<string, number>()
    for (const row of data ?? []) {
      const cat = row.category?.trim()
      const tool = row.tool_guess?.trim()
      if (cat) counts.set(cat, (counts.get(cat) ?? 0) + 1)
      if (tool) counts.set(tool, (counts.get(tool) ?? 0) + 1)
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag)
  } catch (err) {
    logTagError('getPopularTags', err)
    return []
  }
}
