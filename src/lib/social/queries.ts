import { createClient } from '@/lib/supabase/server'

export async function getLikeCountAndState(
  siteId: string,
  userId: string | null,
): Promise<{ count: number; isLiked: boolean }> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('site_likes')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', siteId)

  let isLiked = false
  if (userId) {
    const { data } = await supabase
      .from('site_likes')
      .select('user_id')
      .eq('site_id', siteId)
      .eq('user_id', userId)
      .maybeSingle()
    isLiked = Boolean(data)
  }

  return { count: count ?? 0, isLiked }
}

export async function getSaveState(
  siteId: string,
  userId: string | null,
): Promise<{ isSaved: boolean }> {
  if (!userId) return { isSaved: false }
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_saves')
    .select('user_id')
    .eq('site_id', siteId)
    .eq('user_id', userId)
    .maybeSingle()
  return { isSaved: Boolean(data) }
}

export interface SiteLikeState {
  count: number
  isLiked: boolean
}

export async function getLikeStatesForSites(
  siteIds: readonly string[],
  userId: string | null,
): Promise<Record<string, SiteLikeState>> {
  const result: Record<string, SiteLikeState> = {}
  for (const id of siteIds) result[id] = { count: 0, isLiked: false }
  if (siteIds.length === 0) return result

  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('site_likes')
    .select('site_id, user_id')
    .in('site_id', siteIds as string[])

  for (const r of rows ?? []) {
    const entry = result[r.site_id]
    if (!entry) continue
    entry.count += 1
    if (userId && r.user_id === userId) entry.isLiked = true
  }
  return result
}

export async function getSaveStatesForSites(
  siteIds: readonly string[],
  userId: string | null,
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {}
  for (const id of siteIds) result[id] = false
  if (!userId || siteIds.length === 0) return result

  const supabase = await createClient()
  const { data } = await supabase
    .from('site_saves')
    .select('site_id')
    .eq('user_id', userId)
    .in('site_id', siteIds as string[])

  for (const r of data ?? []) {
    result[r.site_id] = true
  }
  return result
}

export interface SavedSite {
  siteId: string
  savedAt: string
}

export async function getSavedSites(userId: string, limit = 50): Promise<SavedSite[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_saves')
    .select('site_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map((r) => ({ siteId: r.site_id, savedAt: r.created_at }))
}
