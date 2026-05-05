import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import AppShell from '@/components/layout/AppShell'
import { ProjectCard } from '@/components/project/ProjectCard'
import { CommentList } from '@/components/comments/CommentList'
import { getPostBySlug } from '@/lib/posts/queries'
import { getSitesByIds } from '@/lib/sites/queries'

interface PageProps {
  params: Promise<{ slug: string }>
}

const KO_DATE = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function formatPublished(iso: string | null): string {
  if (!iso) return ''
  try {
    return KO_DATE.format(new Date(iso))
  } catch {
    return ''
  }
}

function gradientForCategory(category: string | null): string {
  const palettes: Record<string, string> = {
    weekly: 'from-coral/30 to-claimed/20',
    trends: 'from-claimed/30 to-coral/10',
    tools: 'from-bg-elevated to-coral/10',
    interview: 'from-coral/20 to-claimed/30',
  }
  if (!category) return 'from-bg-surface to-bg-elevated'
  return palettes[category] ?? 'from-bg-surface to-bg-elevated'
}

// SEO: 마크다운 문법 제거 plaintext 추출 (description fallback용)
function toPlainText(md: string, limit = 160): string {
  return md
    .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 이미지 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크 텍스트만
    .replace(/[#*_`>~-]/g, '') // 마크다운 문자 제거
    .replace(/\n+/g, ' ') // 줄바꿈 → 공백
    .trim()
    .slice(0, limit)
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) {
    return { title: 'Post not found' }
  }
  const description = post.excerpt ?? toPlainText(post.bodyMd, 160)
  const ogImage = post.coverImageUrl ?? '/logo/wordmark-white.png'
  return {
    title: post.title,
    description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `/posts/${post.slug}`,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedSites =
    post.relatedSiteIds.length > 0
      ? await getSitesByIds(post.relatedSiteIds)
      : []
  const gradient = gradientForCategory(post.category)

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://showvibe.app'
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? toPlainText(post.bodyMd, 200),
    image: post.coverImageUrl
      ? [post.coverImageUrl]
      : [`${siteUrl}/logo/wordmark-white.png`],
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: 'ShowVibe' },
    publisher: {
      '@type': 'Organization',
      name: 'ShowVibe',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo/wordmark-white.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/posts/${post.slug}`,
    },
  }

  return (
    <AppShell>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <article className="lg:col-span-8 lg:max-w-3xl">
            <header className="mb-8">
              {post.category && (
                <p className="text-xs font-medium uppercase tracking-wider text-coral mb-3 font-[var(--font-outfit)]">
                  {post.category}
                </p>
              )}
              <h1 className="text-3xl font-black tracking-tight leading-tight mb-4 font-[var(--font-outfit)]">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-text-medium leading-relaxed mb-4">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{formatPublished(post.publishedAt)}</span>
                {post.readTimeMinutes !== null && (
                  <>
                    <span>·</span>
                    <span>{post.readTimeMinutes}분 읽기</span>
                  </>
                )}
              </div>
            </header>

            {post.coverImageUrl && (
              <div
                className={`relative aspect-video rounded-xl overflow-hidden mb-10 bg-gradient-to-br ${gradient}`}
              >
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 768px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-bg-base/20" />
              </div>
            )}

            <div className="prose prose-invert max-w-none prose-headings:font-[var(--font-outfit)] prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-p:text-[14px] prose-p:text-text-medium prose-p:leading-[1.75] prose-a:text-coral hover:prose-a:text-coral-hover">
              <ReactMarkdown>{post.bodyMd}</ReactMarkdown>
            </div>

            <section className="mt-12 pt-8 border-t border-stroke">
              <CommentList postId={post.id} />
            </section>
          </article>

          <aside className="lg:col-span-4 lg:max-w-xs">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-lg border border-stroke bg-bg-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-text-muted px-2 py-0.5 rounded bg-bg-base border border-stroke">
                    Sponsored
                  </span>
                  <span className="text-xs text-text-muted">Ad</span>
                </div>
                <div className="flex items-center justify-center bg-bg-elevated border border-stroke rounded h-[250px] w-full">
                  <p className="text-xs text-text-muted">300 × 250 광고 슬롯</p>
                </div>
              </div>

              {relatedSites.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-3 font-[var(--font-outfit)]">
                    Related Projects
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {relatedSites.map((s) => (
                      <ProjectCard
                        key={s.site.id}
                        site={s.site}
                        analysis={s.analysis}
                        media={s.media}
                        maker={s.maker}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  )
}
