import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import AppShell from '@/components/layout/AppShell'
import { ProjectCard } from '@/components/project/ProjectCard'
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) {
    return { title: 'Post not found — ShowVibe' }
  }
  return {
    title: `${post.title} — ShowVibe`,
    description: post.excerpt ?? post.bodyMd.slice(0, 160),
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

  return (
    <AppShell>
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

            <div
              className={`relative aspect-video rounded-xl overflow-hidden mb-10 bg-gradient-to-br ${gradient}`}
            >
              {post.coverImageUrl && (
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 768px, 100vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-bg-base/20" />
            </div>

            <div className="prose prose-invert max-w-none prose-headings:font-[var(--font-outfit)] prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-p:text-[14px] prose-p:text-text-medium prose-p:leading-[1.75] prose-a:text-coral hover:prose-a:text-coral-hover">
              <ReactMarkdown>{post.bodyMd}</ReactMarkdown>
            </div>

            <section className="mt-12 pt-8 border-t border-stroke">
              <h3 className="text-lg font-bold mb-4 font-[var(--font-outfit)]">
                Comments
              </h3>
              <div className="rounded-lg border border-stroke bg-bg-surface px-5 py-8 text-center">
                <p className="text-sm text-text-muted">
                  댓글 기능은 곧 오픈됩니다.
                </p>
              </div>
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
