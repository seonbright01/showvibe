import { createClient } from '@/lib/supabase/server'
import { mapUserRow } from '@/lib/sites/mappers'
import { mapPostRow, type Post, type PostRow, type PostWithAuthor } from './types'

const POSTS_SELECT =
  'id, author_user_id, title, slug, body_md, excerpt, category, cover_image_url, related_site_ids, read_time_minutes, view_count, published_at, created_at, updated_at, users:author_user_id(id, name, avatar_url, role, email)'

interface JoinedPostRow extends PostRow {
  users?: unknown
}

function logQueryError(name: string, error: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[posts] ${name} failed:`, error)
  }
}

function shapeRow(row: JoinedPostRow): PostWithAuthor {
  const { users, ...postOnly } = row
  const post: Post = mapPostRow(postOnly)
  const author = users
    ? mapUserRow(users as Parameters<typeof mapUserRow>[0])
    : null
  return { ...post, author }
}

export async function getPublishedPosts(
  category?: string,
  limit = 24,
): Promise<PostWithAuthor[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('posts')
      .select(POSTS_SELECT)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) {
      logQueryError('getPublishedPosts', error)
      return []
    }
    return ((data ?? []) as unknown as JoinedPostRow[]).map(shapeRow)
  } catch (err) {
    logQueryError('getPublishedPosts', err)
    return []
  }
}

export async function getPostBySlug(
  slug: string,
): Promise<PostWithAuthor | null> {
  if (!slug) return null
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select(POSTS_SELECT)
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .maybeSingle()

    if (error) {
      logQueryError('getPostBySlug', error)
      return null
    }
    if (!data) return null
    return shapeRow(data as unknown as JoinedPostRow)
  } catch (err) {
    logQueryError('getPostBySlug', err)
    return null
  }
}

export async function getPostCategories(): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .not('published_at', 'is', null)
      .not('category', 'is', null)

    if (error || !data) {
      if (error) logQueryError('getPostCategories', error)
      return []
    }
    const set = new Set<string>()
    for (const row of data as unknown as { category: string | null }[]) {
      if (row.category) set.add(row.category)
    }
    return Array.from(set).sort()
  } catch (err) {
    logQueryError('getPostCategories', err)
    return []
  }
}
