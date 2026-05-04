import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import AppShell from '@/components/layout/AppShell'
import { ProjectCard } from '@/components/project/ProjectCard'
import {
  StatusBadge,
  SourceBadge,
  ToolBadge,
  ClaimBadge,
} from '@/components/ui/Badge'
import { CommentList } from '@/components/comments/CommentList'
import { ViewTracker } from '@/components/sites/ViewTracker'
import { VisitButton } from '@/components/sites/VisitButton'
import { SaveButton } from '@/components/sites/SaveButton'
import { LikeButton } from '@/components/sites/LikeButton'
import { CollapsibleDescription } from '@/components/sites/CollapsibleDescription'
import { getLikeCountAndState, getSaveState } from '@/lib/social/queries'
import { AdSlot } from '@/components/ads/AdSlot'
import { getSiteById, getSimilarSites } from '@/lib/sites/queries'
import { getSessionUser } from '@/lib/auth/guards'
import type { SourceType, MediaSource } from '@/types'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function formatDate(iso: string): string {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  auto_collected: '자동 수집',
  creator_submitted: '제작자 직접 등록',
  admin_curated: '운영자 큐레이션',
}

const MEDIA_SOURCE_LABEL: Record<MediaSource, string> = {
  system_captured: '시스템 자동 캡처',
  creator_uploaded: '제작자 업로드',
  og_image: 'OG image',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  if (!UUID_REGEX.test(id)) {
    return { title: 'Project not found' }
  }
  const enriched = await getSiteById(id)
  if (!enriched) {
    return { title: 'Project not found' }
  }
  const { site, analysis, media } = enriched
  const description =
    analysis?.aiSummary ?? site.description ?? `${site.name} - vibe-coded project on ShowVibe`
  const ogImage = media?.imageUrl ?? '/logo/wordmark-white.png'
  return {
    title: site.name,
    description,
    alternates: { canonical: `/projects/${id}` },
    openGraph: {
      type: 'article',
      title: site.name,
      description,
      url: `/projects/${id}`,
      images: [{ url: ogImage, alt: `${site.name} screenshot` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.name,
      description,
      images: [ogImage],
    },
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  if (!UUID_REGEX.test(id)) notFound()

  const enriched = await getSiteById(id)
  if (!enriched) notFound()

  const { site, analysis, media, maker } = enriched
  const similar = await getSimilarSites(
    id,
    analysis?.category ?? null,
    analysis?.toolGuess ?? site.sourcePlatform,
    4,
  )
  const sessionUser = await getSessionUser()
  const [likeState, saveState] = await Promise.all([
    getLikeCountAndState(id, sessionUser?.id ?? null),
    getSaveState(id, sessionUser?.id ?? null),
  ])

  const isArchived = site.status === 'archived'
  const toolName = analysis?.toolGuess ?? site.sourcePlatform
  const aiText = analysis?.aiSummary ?? site.description
  const articleText = analysis?.articleSummary
  const isVerified = site.isClaimed && !!maker

  const idHash = site.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

  // SEO: schema.org JSON-LD — SoftwareApplication + WebPage 듀얼 schema
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://showvibe.app'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE_URL}/projects/${id}`,
    name: site.name,
    description: aiText ?? site.name,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE_URL}/explore` },
        { '@type': 'ListItem', position: 3, name: site.name },
      ],
    },
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: site.name,
      url: site.url,
      applicationCategory: analysis?.category ?? 'WebApplication',
      operatingSystem: 'Web',
      ...(analysis?.vibeScore != null && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (analysis.vibeScore / 20).toFixed(1),
          bestRating: '5',
          worstRating: '0',
          ratingCount: Math.max(likeState.count, 1),
        },
      }),
      ...(media?.imageUrl && { image: media.imageUrl }),
      ...(maker && { author: { '@type': 'Person', name: maker.name } }),
    },
  }

  return (
    <AppShell>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker siteId={id} />
      <main className="flex-1">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="border-b border-stroke bg-bg-surface"
        >
          <div className="mx-auto max-w-[1200px] px-6 py-3">
            <ol className="flex items-center gap-2 text-sm text-text-muted">
              <li>
                <Link href="/" className="hover:text-text-high transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href="/explore"
                  className="hover:text-text-high transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-text-high font-medium truncate">{site.name}</li>
            </ol>
          </div>
        </nav>

        {/* Header / Hero */}
        <section className="border-b border-stroke">
          <div className="mx-auto max-w-[1200px] px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Thumbnail */}
            <div className="lg:col-span-8">
              <div
                className="relative aspect-video w-full overflow-hidden rounded-xl bg-bg-surface border border-stroke"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
              >
                {media?.imageUrl ? (
                  <Image
                    src={media.imageUrl}
                    alt={`${site.name} screenshot`}
                    fill
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    className={`object-cover ${isArchived ? 'grayscale opacity-50' : ''}`}
                    priority
                  />
                ) : (
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${
                      isArchived ? 'grayscale opacity-50' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, hsl(${idHash % 360}, 60%, 20%) 0%, hsl(${(idHash + 60) % 360}, 50%, 15%) 100%)`,
                    }}
                  >
                    <span className="text-6xl font-black text-white/20 font-[family-name:var(--font-outfit)]">
                      {site.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Title & actions */}
            <div className="lg:col-span-4 flex flex-col">
              <h1 className="text-3xl font-black tracking-tight mb-3 font-[family-name:var(--font-outfit)]">
                {site.name}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge status={site.status} />
                <SourceBadge sourceType={site.sourceType} />
                {toolName && <ToolBadge tool={toolName} />}
                {isVerified && <ClaimBadge status="verified" />}
              </div>

              <CollapsibleDescription
                text={site.description}
                maxLines={8}
                className="mb-5"
              />

              <dl className="space-y-1.5 text-sm mb-6">
                {maker && (
                  <div className="flex gap-2">
                    <dt className="text-text-muted w-20 shrink-0">Maker</dt>
                    <dd className="text-text-high">{maker.name}</dd>
                  </div>
                )}
                {toolName && (
                  <div className="flex gap-2">
                    <dt className="text-text-muted w-20 shrink-0">Tool</dt>
                    <dd className="text-text-high">{toolName}</dd>
                  </div>
                )}
                {analysis?.category && (
                  <div className="flex gap-2">
                    <dt className="text-text-muted w-20 shrink-0">Category</dt>
                    <dd className="text-text-high">{analysis.category}</dd>
                  </div>
                )}
              </dl>

              {/* Visit button */}
              <VisitButton
                siteId={id}
                url={site.url}
                archived={isArchived}
                className="w-full !text-lg !px-6 !py-4 !rounded-xl !font-bold shadow-lg shadow-coral/20"
              >
                <span className="text-xl">↗</span>
                Visit Original Site
              </VisitButton>

              {/* Secondary actions */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <LikeButton
                  siteId={id}
                  initialIsLiked={likeState.isLiked}
                  initialCount={likeState.count}
                  isAuthenticated={Boolean(sessionUser)}
                />
                <SaveButton
                  siteId={id}
                  initialIsSaved={saveState.isSaved}
                  isAuthenticated={Boolean(sessionUser)}
                />
                <Link
                  href={`/claim?siteId=${site.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-bg-elevated hover:bg-bg-surface border border-stroke text-text-high text-sm font-medium px-3 py-2.5 transition-colors"
                >
                  <span>✓</span> Claim
                </Link>
                <Link
                  href={`/takedown?siteId=${site.id}&url=${encodeURIComponent(site.url)}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-bg-elevated hover:bg-coral-soft border border-coral-line text-coral text-sm font-medium px-3 py-2.5 transition-colors"
                >
                  <span aria-hidden>⚠</span> 신고
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Archived warning banner */}
        {isArchived && (
          <section className="border-b border-stroke bg-bg-surface">
            <div className="mx-auto max-w-[1200px] px-6 py-4">
              <div className="rounded-lg border border-stroke bg-bg-elevated p-4 text-sm text-text-medium leading-relaxed">
                <p className="font-medium text-text-high mb-1">
                  이 사이트는 현재 접속되지 않습니다.
                </p>
                <p>
                  마지막 정상 확인일: {formatDate(site.lastActiveAt)}. 마지막 확인 결과: 404 Not Found. showvibe의 아카이브는 원본 사이트 전체를 보존하는 기능이 아닙니다.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Body */}
        <section className="mx-auto max-w-[1200px] px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-12">
            {/* About */}
            <div>
              <h2 className="text-xl font-bold mb-4 font-[family-name:var(--font-outfit)]">
                About this project
              </h2>
              <div className="space-y-4 text-text-medium leading-relaxed">
                <p>{aiText}</p>
                {articleText && (
                  <p className="text-sm border-l-2 border-coral pl-4 text-text-medium italic">
                    {articleText}
                  </p>
                )}
                <p className="text-sm text-text-muted">
                  본 분석은 ShowVibe의 자동화된 AI 시스템이 사이트 콘텐츠를 기반으로 생성한 요약이며, 제작자나 운영사의 공식 입장이 아닙니다.
                </p>
              </div>
            </div>

            {/* Main features */}
            {analysis?.mainFeatures && analysis.mainFeatures.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 font-[family-name:var(--font-outfit)]">
                  Main Features
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysis.mainFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 rounded-lg border border-stroke bg-bg-surface p-3"
                    >
                      <span className="text-coral mt-0.5">▹</span>
                      <span className="text-sm text-text-high">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inline ad slot (responsive in-article) */}
            <AdSlot slot="in_article" />

            {/* Comments */}
            <CommentList siteId={id} />

            {/* Similar Vibes */}
            {similar.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 font-[family-name:var(--font-outfit)]">
                  Similar Vibes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similar.map((s) => (
                    <ProjectCard key={s.site.id} {...s} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* Data Source */}
              <div className="rounded-lg border border-stroke bg-bg-surface overflow-hidden">
                <div className="border-b border-stroke bg-bg-elevated px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                    Data Source
                  </span>
                  <span className="text-xs font-mono text-text-muted">v1</span>
                </div>
                <div className="p-4 font-mono text-xs text-text-medium leading-relaxed space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-text-muted">- 등록 방식:</span>
                    <span className="text-text-high text-right">
                      {SOURCE_TYPE_LABEL[site.sourceType]}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-text-muted">- 최초 발견일:</span>
                    <span className="text-text-high text-right">
                      {formatDate(site.firstDiscoveredAt)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-text-muted">- 마지막 확인일:</span>
                    <span className="text-text-high text-right">
                      {formatDate(site.lastCheckedAt)}
                    </span>
                  </div>
                  {media && (
                    <div className="flex justify-between gap-2">
                      <span className="text-text-muted">- 썸네일 출처:</span>
                      <span className="text-text-high text-right">
                        {MEDIA_SOURCE_LABEL[media.mediaSource]}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <span className="text-text-muted">- 제작자 인증:</span>
                    <span className="text-text-high text-right">
                      {isVerified ? 'GitHub 인증 완료' : '미인증'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-text-muted">- 상태:</span>
                    <span className="text-text-high text-right uppercase">
                      {site.status}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-stroke">
                    <Link
                      href="#takedown"
                      className="text-coral hover:text-coral-hover transition-colors"
                    >
                      삭제/수정 요청 가능 →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-lg border border-stroke bg-bg-surface p-4">
                <h3 className="text-sm font-semibold text-text-high mb-3 uppercase tracking-wide">
                  Actions
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href={`/claim?siteId=${site.id}`}
                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-bg-elevated text-text-medium hover:text-text-high transition-colors"
                    >
                      Claim This Project
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-bg-elevated text-text-medium hover:text-text-high transition-colors"
                    >
                      Report Issue
                    </button>
                  </li>
                  <li id="takedown">
                    <Link
                      href={`/takedown?siteId=${site.id}`}
                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-bg-elevated text-text-medium hover:text-text-high transition-colors"
                    >
                      Request Removal
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Sidebar ad (300×250 medium rectangle) */}
              <AdSlot slot="sidebar" />
            </div>
          </aside>
        </section>

        {/* Legal disclaimer */}
        <section className="border-t border-stroke bg-bg-surface">
          <div className="mx-auto max-w-[1200px] px-6 py-6">
            <p className="text-xs text-text-muted leading-relaxed">
              showvibe는 Cursor, Lovable, Replit, Bolt, v0 등 언급된 특정 AI 코딩 도구 및 서비스와 공식 제휴 관계가 아닙니다. 각 상표는 해당 권리자에게 귀속됩니다.
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  )
}
