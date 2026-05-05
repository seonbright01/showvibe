import AppShell from "@/components/layout/AppShell";
import { ProjectCard } from "@/components/project/ProjectCard";
import { VibeChartRow } from "@/components/chart/VibeChartRow";
import { AdSlot } from "@/components/ads/AdSlot";
import { HomeHero } from "@/components/home/HomeHero";
import {
  getTrendingSites,
  getNewlyDiscoveredSites,
  getArchivedSites,
  getEditorsPickSites,
  type SiteWithRelations,
} from "@/lib/sites/queries";
import { getTopChart, type ChartEntry as ChartEntryDb } from "@/lib/chart/queries";
import { getPublishedPosts } from "@/lib/posts/queries";
import { getSessionUser } from "@/lib/auth/guards";
import { getLikeStatesForSites } from "@/lib/social/queries";
import type { ChartEntry as DomainChartEntry } from "@/types";
import Link from "next/link";
import Image from "next/image";

function toDomainChartEntry(e: ChartEntryDb, isAuthenticated: boolean): DomainChartEntry {
  const numericChange = e.change === 'up' ? e.delta : e.change === 'down' ? -Math.abs(e.delta) : 0;
  return {
    rank: e.rank,
    change: numericChange,
    site: e.site.site,
    maker: e.site.maker ?? null,
    media: e.site.media ?? null,
    vibeScore: e.site.analysis?.vibeScore ?? null,
    isAuthenticated,
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default async function HomePage() {
  const [sessionUser, trending, newlyDiscovered, archived, chart, editorsPick, vibePosts] = await Promise.all([
    getSessionUser(),
    getTrendingSites(8),
    getNewlyDiscoveredSites(4),
    getArchivedSites(8),
    getTopChart(24 * 7, undefined, 10),
    getEditorsPickSites(4),
    getPublishedPosts(undefined, 3),
  ]);

  const isAuthenticated = Boolean(sessionUser)
  const chartEntries = chart.map((e) => toDomainChartEntry(e, isAuthenticated));

  // getLikeStatesForSites는 위 Promise.all의 결과(site IDs)에 의존하므로
  // 같은 Promise.all에 합칠 수 없음 — site IDs를 모은 뒤 두 번째 단계로 호출.
  // sessionUser는 첫 단계에서 이미 병렬로 조회됨.
  const allSiteIds = Array.from(
    new Set([
      ...newlyDiscovered.map((e) => e.site.id),
      ...editorsPick.map((e) => e.site.id),
      ...trending.map((e) => e.site.id),
      ...archived.map((e) => e.site.id),
    ]),
  )
  const likeStates = await getLikeStatesForSites(allSiteIds, sessionUser?.id ?? null)

  return (
    <AppShell>
      <main className="flex-1">
        <HomeHero />

        {/* 5. Newly Discovered (full-width) */}
        <section className="mx-auto max-w-[1200px] px-6 py-10">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-0.5 font-[var(--font-outfit)]">
                Newly Discovered
              </h2>
              <p className="text-[12px] text-text-muted">방금 발견된 프로젝트</p>
            </div>
            <Link href="/explore?sort=newest" className="text-[12px] text-coral hover:text-coral-hover font-medium">
              More →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {newlyDiscovered.length === 0 ? (
              <div className="col-span-full rounded-xl border border-stroke bg-bg-surface p-6 text-center text-sm text-text-muted">
                조만간 신규 프로젝트가 추가됩니다.
              </div>
            ) : (
              newlyDiscovered.map((enriched) => {
                const lk = likeStates[enriched.site.id] ?? { count: 0, isLiked: false }
                return (
                  <ProjectCard
                    key={enriched.site.id}
                    {...enriched}
                    initialLikeCount={lk.count}
                    initialIsLiked={lk.isLiked}
                    isAuthenticated={isAuthenticated}
                  />
                )
              })
            )}
          </div>
        </section>

        {/* Sponsored Banner (AdSense leaderboard) — between Newly Discovered and Vibe Chart */}
        <section className="border-y border-stroke bg-bg-surface">
          <div className="mx-auto max-w-[1200px] px-6 py-3">
            <AdSlot slot="leaderboard" />
          </div>
        </section>

        {/* 6. Vibe Chart Full Preview (Top 10, full-width) */}
        <section className="mx-auto max-w-[1200px] px-6 py-10 border-t border-stroke">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-0.5 font-[var(--font-outfit)]">
                Vibe Chart
              </h2>
              <p className="text-[12px] text-text-muted">이번 주 가장 뜨거운 프로젝트</p>
            </div>
            <Link href="/chart" className="text-[12px] text-coral hover:text-coral-hover font-medium">
              View Full Chart →
            </Link>
          </div>
          <div className="bg-bg-surface border border-stroke rounded-xl divide-y divide-stroke overflow-hidden">
            {chartEntries.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-text-muted">
                차트 데이터가 곧 추가됩니다.
              </div>
            ) : (
              chartEntries
                .slice(0, 10)
                .map((entry) => <VibeChartRow key={entry.rank} entry={entry} />)
            )}
          </div>
        </section>

        {/* 7. Editor's Pick (single-card grid + curator note) */}
        {editorsPick.length > 0 && (
          <section className="mx-auto max-w-[1200px] px-6 py-10 border-t border-stroke">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-0.5 font-[var(--font-outfit)]">
                Editor&apos;s Pick
              </h2>
              <p className="text-[12px] text-text-muted">에디터가 직접 고른 프로젝트</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {editorsPick.map((enriched) => {
                const note =
                  enriched.editorsNote ||
                  enriched.analysis?.aiSummary ||
                  enriched.site.description ||
                  '에디터가 추천하는 vibe-coded 프로젝트입니다.'
                const lk = likeStates[enriched.site.id] ?? { count: 0, isLiked: false }
                return (
                  <div key={enriched.site.id} className="flex flex-col gap-2">
                    <ProjectCard
                      site={enriched.site}
                      analysis={enriched.analysis}
                      media={enriched.media}
                      maker={enriched.maker}
                      initialLikeCount={lk.count}
                      initialIsLiked={lk.isLiked}
                      isAuthenticated={isAuthenticated}
                    />
                    <div className="rounded-lg border border-coral-line bg-coral-soft px-3 py-2">
                      <p className="text-[10.5px] font-mono uppercase tracking-wide text-coral mb-0.5">
                        Editor&apos;s Note
                      </p>
                      <p className="text-[12px] text-text-medium leading-snug line-clamp-3">
                        {note}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 9. Vibe Posts (DB) — 데이터 없으면 섹션 숨김 */}
        {vibePosts.length > 0 && (
          <section className="mx-auto max-w-[1200px] px-6 py-10 border-t border-stroke">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-0.5 font-[var(--font-outfit)]">
                  Vibe Posts
                </h2>
                <p className="text-[12px] text-text-muted">에디토리얼 매거진 — 트렌드, 분석, 인터뷰</p>
              </div>
              <Link href="/posts" className="text-[12px] text-coral hover:text-coral-hover font-medium">
                Read More Posts →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vibePosts.map((post) => {
                const body =
                  post.excerpt ??
                  post.bodyMd.replace(/[#*_`>]/g, '').trim()
                const isLong = body.length > 160 || post.bodyMd.length > 240
                return (
                  <Link
                    key={post.slug}
                    href={`/posts/${post.slug}`}
                    className="group flex flex-col bg-bg-surface border border-stroke rounded-xl overflow-hidden hover:border-coral/40 transition-colors"
                  >
                    <div className="px-5 pt-5 pb-3">
                      {post.category && (
                        <p className="text-[10.5px] font-medium uppercase tracking-wider text-coral mb-2 font-[var(--font-outfit)]">
                          {post.category}
                        </p>
                      )}
                      <h3 className="text-[16px] font-bold text-text-high line-clamp-2 leading-snug group-hover:text-coral transition-colors font-[var(--font-outfit)]">
                        {post.title}
                      </h3>
                    </div>
                    {post.coverImageUrl && (
                      <div className="relative aspect-[16/9] bg-bg-elevated">
                        <Image
                          src={post.coverImageUrl}
                          alt={post.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="px-5 py-4 flex-1 flex flex-col">
                      <p className="text-[13px] text-text-medium leading-relaxed mb-3 line-clamp-4">
                        {body}
                      </p>
                      {isLong && (
                        <span className="text-[12px] font-medium text-coral mb-2 group-hover:text-coral-hover">
                          자세히 보기 →
                        </span>
                      )}
                      {post.publishedAt && (
                        <p className="mt-auto text-[11px] text-text-muted">
                          {formatDate(post.publishedAt)}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Trending grid (DB) */}
        {trending.length > 0 && (
          <section className="mx-auto max-w-[1200px] px-6 py-10 border-t border-stroke">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-0.5 font-[var(--font-outfit)]">
                  Trending Projects
                </h2>
                <p className="text-[12px] text-text-muted">최근 활성도가 높은 프로젝트</p>
              </div>
              <Link href="/explore" className="text-[12px] text-coral hover:text-coral-hover font-medium">
                Explore All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {trending.map((enriched: SiteWithRelations) => {
                const lk = likeStates[enriched.site.id] ?? { count: 0, isLiked: false }
                return (
                  <ProjectCard
                    key={enriched.site.id}
                    {...enriched}
                    initialLikeCount={lk.count}
                    initialIsLiked={lk.isLiked}
                    isAuthenticated={isAuthenticated}
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* 12. Archived but Interesting */}
        {archived.length > 0 && (
          <section className="mx-auto max-w-[1200px] px-6 py-10 border-t border-stroke">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-0.5 font-[var(--font-outfit)]">
                  Archived but Interesting
                </h2>
                <p className="text-[12px] text-text-muted">사라졌지만 기록할 가치가 있는 프로젝트들</p>
              </div>
              <Link href="/archive" className="text-[12px] text-coral hover:text-coral-hover font-medium">
                View Archive →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {archived.map((enriched) => {
                const lk = likeStates[enriched.site.id] ?? { count: 0, isLiked: false }
                return (
                  <ProjectCard
                    key={enriched.site.id}
                    {...enriched}
                    initialLikeCount={lk.count}
                    initialIsLiked={lk.isLiked}
                    isAuthenticated={isAuthenticated}
                  />
                )
              })}
            </div>
          </section>
        )}

      </main>
    </AppShell>
  );
}
