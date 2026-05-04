import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/service'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://showvibe.app'

export const revalidate = 3600 // 1시간마다 재생성

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/chart`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/posts`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/makers`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/archive`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal/bot-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/submit`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]

  let dynamicEntries: MetadataRoute.Sitemap = []

  try {
    const supabase = createServiceClient()

    // 공개된 active 사이트만 sitemap에 포함 (blocked/archived/unlisted 제외)
    const { data: sites } = await supabase
      .from('sites')
      .select('id, updated_at')
      .eq('status', 'active')
      .eq('visibility', 'public')
      .order('updated_at', { ascending: false })
      .limit(5000)

    if (sites) {
      dynamicEntries = dynamicEntries.concat(
        sites.map((s) => ({
          url: `${SITE_URL}/projects/${s.id}`,
          lastModified: s.updated_at ? new Date(s.updated_at) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })),
      )
    }

    // 발행된 매거진 포스트
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(1000)

    if (posts) {
      dynamicEntries = dynamicEntries.concat(
        posts.map((p) => ({
          url: `${SITE_URL}/posts/${p.slug}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        })),
      )
    }
  } catch (err) {
    // sitemap 생성은 best-effort. DB 장애 시에도 정적 entries는 반환.
    console.error('[sitemap] dynamic entries failed:', err)
  }

  return [...staticEntries, ...dynamicEntries]
}
