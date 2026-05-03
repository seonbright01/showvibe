import type { User } from '@/types'

export interface Post {
  id: string
  authorUserId: string
  title: string
  slug: string
  bodyMd: string
  excerpt: string | null
  category: string | null
  coverImageUrl: string | null
  relatedSiteIds: string[]
  readTimeMinutes: number | null
  viewCount: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PostWithAuthor extends Post {
  author: User | null
}

export interface PostRow {
  id: string
  author_user_id: string
  title: string
  slug: string
  body_md: string
  excerpt: string | null
  category: string | null
  cover_image_url: string | null
  related_site_ids: string[] | null
  read_time_minutes: number | null
  view_count: number | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export function mapPostRow(row: PostRow): Post {
  return {
    id: row.id,
    authorUserId: row.author_user_id,
    title: row.title,
    slug: row.slug,
    bodyMd: row.body_md,
    excerpt: row.excerpt,
    category: row.category,
    coverImageUrl: row.cover_image_url,
    relatedSiteIds: row.related_site_ids ?? [],
    readTimeMinutes: row.read_time_minutes,
    viewCount: row.view_count ?? 0,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
