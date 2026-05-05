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

// ISR: posts는 SSR 트리에 sessionUser가 직접 박히지 않음 (PII 누수 위험 없음).
// 콘텐츠 변경 빈도가 낮아 5분 revalidate.
export const revalidate = 300

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
  const body = post.excerpt ?? post.bodyMd.replace(/[#*_`>]/g, '').trim()
  // 본문 내용이 카드를 넘칠 정도로 길면 '자세히 보기' 표시
  const isLong = body.length > 160 || post.bodyMd.length > 240

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex flex-col rounded-xl border border-stroke bg-bg-surface overflow-hidden hover:shadow-lg hover:border-coral/40 transition-all"
    >
      {/* 상단: 제목 + 카테고리 (일러스트 영역 제거) */}
      <div className="px-5 pt-5 pb-3">
        {post.category && (
          <p className="text-[10.5px] font-medium uppercase tracking-wider text-coral mb-2 font-[var(--font-outfit)]">
            {post.category}
          </p>
        )}
        <h3 className="text-[17px] font-bold text-text-high line-clamp-2 leading-snug font-[var(--font-outfit)] group-hover:text-coral transition-colors">
          {post.title}
        </h3>
      </div>

      {/* 커버 이미지 (있을 때만, 작은 띠 형태) */}
      {cover && (
        <div className="relative aspect-[16/9] bg-bg-elevated">
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 380px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* 본문 + '자세히 보기' */}
      <div className="px-5 py-4 flex-1 flex flex-col">
        <p className="text-[13px] text-text-medium line-clamp-4 mb-3 leading-relaxed">
          {body}
        </p>
        {isLong && (
          <span className="text-[12px] font-medium text-coral mb-2 group-hover:text-coral-hover">
            자세히 보기 →
          </span>
        )}
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
