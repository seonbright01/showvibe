import AppShell from "@/components/layout/AppShell";
import { ProjectCard } from "@/components/project/ProjectCard";
import { VibeChartRow } from "@/components/chart/VibeChartRow";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { TagCloud } from "@/components/ui/TagCloud";
import { AdSlot } from "@/components/ads/AdSlot";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import {
  MOCK_USERS,
  MOCK_COLLECTIONS,
  MOCK_TAGS,
} from "@/data/mock";
import {
  getTrendingSites,
  getNewlyDiscoveredSites,
  getArchivedSites,
  getEditorsPickSites,
  type SiteWithRelations,
} from "@/lib/sites/queries";
import { getTopChart, type ChartEntry as ChartEntryDb } from "@/lib/chart/queries";
import { getPopularTags } from "@/lib/tags/queries";
import { getSessionUser } from "@/lib/auth/guards";
import type { ChartEntry as DomainChartEntry, User } from "@/types";
import Link from "next/link";

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

interface HomeStory {
  slug: string;
  title: string;
  maker: User;
  excerpt: string;
  publishedAt: string;
  viewCount: number;
  replyCount: number;
  tags: string[];
}

interface HomePost {
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  excerpt: string;
  gradient: string;
}

interface HomeTheme {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  count: number;
  gradient: string;
}

const HOME_STORIES: readonly HomeStory[] = [
  {
    slug: "building-lawflow-with-cursor",
    title: "Cursor로 LawFlow를 30일 만에 만든 이야기",
    maker: MOCK_USERS[0],
    excerpt:
      "바이브코딩으로 시작해 베타 런칭까지 — 처음 마주친 막힘과 돌파구. 법대생이 LegalTech SaaS를 빌드하면서 배운 것들.",
    publishedAt: "2026-04-28",
    viewCount: 1230,
    replyCount: 42,
    tags: ["Cursor", "LegalTech"],
  },
  {
    slug: "pixelboard-design-process",
    title: "Bolt로 디자인 도구 만들기 — UI 리서치부터 출시까지",
    maker: {
      id: "mock_pb",
      name: "Anonymous Maker",
      avatarUrl: null,
      role: "creator",
      email: "",
    },
    excerpt:
      "디자이너가 직접 디자이너용 툴을 만든다는 것. AI 무드보드 생성기 PixelBoard를 빌드하면서 마주한 UX 결정들.",
    publishedAt: "2026-04-22",
    viewCount: 980,
    replyCount: 28,
    tags: ["Bolt", "Design"],
  },
  {
    slug: "travelmate-launch-week",
    title: "TravelMate 런칭 첫 주 — Product Hunt 1위 후기",
    maker: MOCK_USERS[1],
    excerpt:
      "v0로 만든 여행 플래너가 어떻게 Product Hunt 1위까지 갔는지. 런칭 직전 72시간과 런칭 이후 첫 주의 모든 것.",
    publishedAt: "2026-04-18",
    viewCount: 2100,
    replyCount: 87,
    tags: ["v0", "Travel"],
  },
];

const HOME_POSTS: readonly HomePost[] = [
  {
    slug: "2026-week18-trending",
    title: "2026년 4월 4주차 — 이번 주 가장 핫한 바이브코딩 프로젝트 5선",
    category: "주간 핫이슈",
    publishedAt: "2026-05-01",
    excerpt:
      "이번 주 ShowVibe 차트 상위권에 오른 프로젝트들의 공통점은 무엇일까. 트래픽 급상승 사이트들을 분석합니다.",
    gradient: "from-coral/30 via-coral/10 to-claimed/20",
  },
  {
    slug: "cursor-vs-lovable-2026",
    title: "Cursor vs Lovable — 2026년 비교 분석",
    category: "트렌드 분석",
    publishedAt: "2026-04-28",
    excerpt:
      "AI 코딩 도구의 양대 산맥, 실제 사용자 후기와 결과물 비교. 어떤 도구가 어떤 프로젝트에 더 적합한가.",
    gradient: "from-claimed/30 via-claimed/10 to-coral/20",
  },
  {
    slug: "how-jimin-built-lawflow",
    title: "인터뷰: Jimin Park가 말하는 LawFlow의 시작",
    category: "제작 현장",
    publishedAt: "2026-04-25",
    excerpt:
      "법대생이 어떻게 30일 만에 LegalTech SaaS를 만들었나. 코딩 경험 없는 메이커의 진짜 이야기.",
    gradient: "from-active/30 via-active/10 to-warning/20",
  },
];

const HOME_THEMES: readonly HomeTheme[] = [
  {
    id: "theme-weekend",
    emoji: "🚀",
    title: "Built in a Weekend",
    desc: "2-3일 만에 만들어진 빠른 프로토타입",
    count: 24,
    gradient: "from-coral/20 to-warning/10",
  },
  {
    id: "theme-saas",
    emoji: "💼",
    title: "AI SaaS Starter Pack",
    desc: "바이브코딩 SaaS 입문 레퍼런스",
    count: 38,
    gradient: "from-claimed/20 to-coral/10",
  },
  {
    id: "theme-revival",
    emoji: "🪦",
    title: "Archived Legends",
    desc: "사라졌지만 영감을 주는 프로젝트",
    count: 17,
    gradient: "from-stroke/30 to-stroke/10",
  },
  {
    id: "theme-survived",
    emoji: "🌳",
    title: "90 Days Alive",
    desc: "90일 이상 살아남은 검증된 프로젝트",
    count: 56,
    gradient: "from-active/20 to-claimed/10",
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

export default async function HomePage() {
  const [sessionUser, trending, newlyDiscovered, archived, chart, tags, editorsPick] = await Promise.all([
    getSessionUser(),
    getTrendingSites(8),
    getNewlyDiscoveredSites(4),
    getArchivedSites(8),
    getTopChart(24 * 7, undefined, 10),
    getPopularTags(15),
    getEditorsPickSites(4),
  ]);

  const isAuthenticated = Boolean(sessionUser)
  const chartEntries = chart.map((e) => toDomainChartEntry(e, isAuthenticated));
  const tagList: string[] = tags.length > 0 ? tags : [...MOCK_TAGS];

  return (
    <AppShell>
      <main className="flex-1">
        {/* 1. Featured / Sponsored Banner (AdSense leaderboard) */}
        <section className="border-b border-stroke bg-bg-surface">
          <div className="mx-auto max-w-[1200px] px-6 py-3">
            <AdSlot slot="leaderboard" />
          </div>
        </section>

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
              newlyDiscovered.map((enriched) => (
                <ProjectCard key={enriched.site.id} {...enriched} isAuthenticated={isAuthenticated} />
              ))
            )}
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
                return (
                  <div key={enriched.site.id} className="flex flex-col gap-2">
                    <ProjectCard
                      site={enriched.site}
                      analysis={enriched.analysis}
                      media={enriched.media}
                      maker={enriched.maker}
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

        {/* 9. Vibe Posts */}
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
            {HOME_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="group block bg-bg-surface border border-stroke rounded-xl overflow-hidden hover:border-coral/40 transition-colors"
              >
                <div
                  className={`aspect-[16/9] bg-gradient-to-br ${post.gradient} flex items-end p-4`}
                >
                  <span className="text-[10.5px] font-mono uppercase tracking-wide px-2 py-0.5 rounded bg-bg-base/80 backdrop-blur border border-stroke text-text-high">
                    {post.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[15px] font-bold text-text-high mb-2 line-clamp-2 group-hover:text-coral transition-colors font-[var(--font-outfit)]">
                    {post.title}
                  </h3>
                  <p className="text-[12.5px] text-text-medium leading-relaxed mb-3 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {formatDate(post.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

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
              {trending.map((enriched: SiteWithRelations) => (
                <ProjectCard key={enriched.site.id} {...enriched} isAuthenticated={isAuthenticated} />
              ))}
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
              {archived.map((enriched) => (
                <ProjectCard key={enriched.site.id} {...enriched} isAuthenticated={isAuthenticated} />
              ))}
            </div>
          </section>
        )}

      </main>
    </AppShell>
  );
}
