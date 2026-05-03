import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import AppShell from '@/components/layout/AppShell'
import { getPublishedPosts, getPostCategories } from '@/lib/posts/queries'
import type { PostWithAuthor } from '@/lib/posts/types'

export const metadata: Metadata = {
  title: 'Vibe Posts — ShowVibe',
  description:
    '주간 핫이슈, 트렌드 분석, 도구 비교까지. 바이브코딩 디스커버리의 모든 것.',
}

export const dynamic = 'force-dynamic'

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

function gradientForTitle(title: string): string {
  const palettes = [
    'from-coral/30 via-bg-elevated to-claimed/20',
    'from-claimed/30 via-bg-surface to-coral/10',
    'from-bg-elevated to-coral/15',
    'from-coral/25 to-bg-surface',
    'from-bg-elevated to-claimed/20',
    'from-coral/15 via-bg-elevated to-bg-surface',
    'from-claimed/20 to-coral/15',
  ]
  const hash = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return palettes[hash % palettes.length]
}

function PostCard({ post }: { post: PostWithAuthor }) {
  const cover = post.coverImageUrl
  const gradient = gradientForTitle(post.title)
  const excerpt = post.excerpt ?? post.bodyMd.slice(0, 140)

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex flex-col rounded-xl border border-stroke bg-bg-surface overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className={`relative aspect-video bg-gradient-to-br ${gradient}`}>
        {cover && (
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 380px, 100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-bg-base/20" />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {post.category && (
          <p className="text-[10.5px] font-medium uppercase tracking-wider text-coral mb-1.5 font-[var(--font-outfit)]">
            {post.category}
          </p>
        )}
        <h3 className="text-[15px] font-semibold text-text-high mb-1.5 line-clamp-2 leading-snug">
          {post.title}
        </h3>
        <p className="text-[12.5px] text-text-medium line-clamp-3 mb-3 leading-relaxed">
          {excerpt}
        </p>
        <div className="mt-auto flex items-center gap-2 text-[11px] text-text-muted">
          <span>{formatPublished(post.publishedAt)}</span>
          {post.readTimeMinutes && (
            <>
              <span>·</span>
              <span>{post.readTimeMinutes}분 읽기</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

function EmptyPosts() {
  return (
    <div className="rounded-xl border border-stroke bg-bg-surface px-6 py-16 text-center">
      <p className="text-base font-medium text-text-high mb-2 font-[var(--font-outfit)]">
        콘텐츠 준비 중
      </p>
      <p className="text-sm text-text-medium max-w-md mx-auto leading-relaxed">
        ShowVibe 편집팀이 첫 매거진 포스트를 준비하고 있습니다. 곧 만나보실 수
        있습니다.
      </p>
    </div>
  )
}

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function PostsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const categoryFilter = sp.category?.trim() || undefined

  const [posts, categories] = await Promise.all([
    getPublishedPosts(categoryFilter, 48),
    getPostCategories(),
  ])

  return (
    <AppShell>
      <main className="flex-1">
        <section className="border-b border-stroke">
          <div className="mx-auto max-w-[1200px] px-6 py-10 lg:py-12">
            <p className="text-[12px] font-medium text-coral mb-2 tracking-wide font-[var(--font-outfit)]">
              Vibe Posts
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2 font-[var(--font-outfit)]">
              바이브코딩 매거진
            </h1>
            <p className="text-[13px] text-text-muted max-w-2xl mb-6">
              주간 핫이슈, 트렌드 분석, 도구 비교, 튜토리얼까지. 디스커버리에
              필요한 모든 것.
            </p>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/posts"
                  aria-current={!categoryFilter ? 'page' : undefined}
                  className={`px-3 py-1 rounded-full text-[11px] transition-colors ${
                    !categoryFilter
                      ? 'bg-bg-elevated border border-stroke text-text-high'
                      : 'bg-bg-surface hover:bg-bg-elevated border border-stroke text-text-medium hover:text-text-high'
                  }`}
                >
                  All
                </Link>
                {categories.map((cat) => {
                  const isActive = cat === categoryFilter
                  return (
                    <Link
                      key={cat}
                      href={`/posts?category=${encodeURIComponent(cat)}`}
                      aria-current={isActive ? 'page' : undefined}
                      className={`px-3 py-1 rounded-full text-[11px] transition-colors ${
                        isActive
                          ? 'bg-bg-elevated border border-stroke text-text-high'
                          : 'bg-bg-surface hover:bg-bg-elevated border border-stroke text-text-medium hover:text-text-high'
                      }`}
                    >
                      {cat}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-8">
          {posts.length === 0 ? (
            <EmptyPosts />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  )
}
