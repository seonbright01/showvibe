import type { Metadata } from 'next'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import { VibeChartRow } from '@/components/chart/VibeChartRow'
import { getTopChart } from '@/lib/chart/queries'
import { getSessionUser } from '@/lib/auth/guards'
import type { ChartEntry } from '@/types'

export const metadata: Metadata = {
  title: 'Vibe Chart — ShowVibe',
  description:
    '지금 뜨는 바이브코딩 프로젝트 Top 50. ShowVibe 내부 반응 지표 기반 실시간 차트.',
}

export const dynamic = 'force-dynamic'

const TIME_WINDOWS = [
  { id: '24h', label: '24 Hours', hours: 24 },
  { id: '7d', label: '7 Days', hours: 24 * 7 },
  { id: '30d', label: '30 Days', hours: 24 * 30 },
] as const

type WindowId = (typeof TIME_WINDOWS)[number]['id']

const CATEGORIES = [
  { id: 'all', label: 'All', value: undefined },
  { id: 'design', label: 'Design', value: 'Design' },
  { id: 'dev-tool', label: 'Development Tool', value: 'Development Tool' },
  { id: 'creative-tool', label: 'Creative Tool', value: 'Creative Tool' },
  { id: 'platform', label: 'Platform', value: 'Platform' },
  { id: 'game', label: 'Game', value: 'Game' },
  { id: 'others', label: 'Others', value: 'Others' },
] as const

type CategoryId = (typeof CATEGORIES)[number]['id']

function isWindowId(value: string | undefined): value is WindowId {
  return value === '24h' || value === '7d' || value === '30d'
}

function isCategoryId(value: string | undefined): value is CategoryId {
  if (!value) return false
  return CATEGORIES.some((c) => c.id === value)
}

function buildHref(windowId: WindowId, categoryId: CategoryId): string {
  const params = new URLSearchParams()
  if (windowId !== '7d') params.set('window', windowId)
  if (categoryId !== 'all') params.set('category', categoryId)
  const qs = params.toString()
  return qs ? `/chart?${qs}` : '/chart'
}

function SponsoredInline() {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-bg-elevated border border-stroke">
      <div className="flex items-center gap-3">
        <span className="text-[10.5px] font-mono uppercase text-text-muted px-2 py-0.5 rounded bg-bg-base border border-stroke">
          Sponsored
        </span>
        <p className="text-[12px] text-text-medium">
          광고 슬롯 — Top 10 인라인 Sponsored
        </p>
      </div>
      <span className="text-[11px] text-text-muted">Ad</span>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="rounded-xl border border-stroke bg-bg-surface px-6 py-16 text-center">
      <p className="text-base font-medium text-text-high mb-2 font-[var(--font-outfit)]">
        아직 차트에 표시할 프로젝트가 없습니다
      </p>
      <p className="text-sm text-text-medium max-w-md mx-auto leading-relaxed">
        ShowVibe는 사용자 반응 지표(조회·클릭·저장·댓글)를 기반으로 차트를
        산출합니다. 데이터가 충분히 쌓이면 이곳에 Top 50이 표시됩니다.
      </p>
    </div>
  )
}

interface PageProps {
  searchParams: Promise<{ window?: string; category?: string }>
}

export default async function ChartPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const windowId: WindowId = isWindowId(sp.window) ? sp.window : '7d'
  const categoryId: CategoryId = isCategoryId(sp.category) ? sp.category : 'all'

  const windowDef = TIME_WINDOWS.find((w) => w.id === windowId) ?? TIME_WINDOWS[1]
  const categoryDef = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0]

  const [sessionUser, rawEntries] = await Promise.all([
    getSessionUser(),
    getTopChart(windowDef.hours, categoryDef.value, 50),
  ])
  const isAuthenticated = Boolean(sessionUser)

  // 어댑터: lib/chart/queries.ts의 ChartEntry → @/types ChartEntry
  const entries: ChartEntry[] = rawEntries.map((e) => ({
    rank: e.rank,
    change: e.delta,
    site: e.site.site,
    maker: e.site.maker ?? null,
    media: e.site.media ?? null,
    vibeScore: e.site.analysis?.vibeScore ?? null,
    isAuthenticated,
  }))

  const top10 = entries.slice(0, 10)
  const rest = entries.slice(10)

  return (
    <AppShell>
      <main className="flex-1">
        <section className="border-b border-stroke">
          <div className="mx-auto max-w-[1200px] px-6 py-10 lg:py-12">
            <p className="text-[12px] font-medium text-coral mb-2 tracking-wide font-[var(--font-outfit)]">
              Vibe Chart
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2 font-[var(--font-outfit)]">
              지금 뜨는 바이브코딩 프로젝트
            </h1>
            <p className="text-[13px] text-text-muted">
              Updated hourly · Top 50
            </p>

            <div className="mt-6 flex items-center gap-2">
              {TIME_WINDOWS.map((win) => {
                const isActive = win.id === windowId
                return (
                  <Link
                    key={win.id}
                    href={buildHref(win.id, categoryId)}
                    className={`px-3.5 py-1 rounded-full text-[12px] transition-colors ${
                      isActive
                        ? 'bg-coral text-white'
                        : 'bg-bg-surface hover:bg-bg-elevated border border-stroke text-text-medium hover:text-text-high'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {win.label}
                  </Link>
                )
              })}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = cat.id === categoryId
                return (
                  <Link
                    key={cat.id}
                    href={buildHref(windowId, cat.id)}
                    className={`px-3 py-1 rounded-full text-[11px] transition-colors ${
                      isActive
                        ? 'bg-bg-elevated border border-stroke text-text-high'
                        : 'bg-bg-surface hover:bg-bg-elevated border border-stroke text-text-medium hover:text-text-high'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {cat.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-10">
          {entries.length === 0 ? (
            <EmptyChart />
          ) : (
            <>
              <div className="bg-bg-surface border border-stroke rounded-xl divide-y divide-stroke overflow-hidden">
                {top10.map((entry) => (
                  <VibeChartRow key={`row-${entry.rank}`} entry={entry} />
                ))}
              </div>

              {rest.length > 0 && (
                <>
                  <div className="my-6">
                    <SponsoredInline />
                  </div>

                  <div className="bg-bg-surface border border-stroke rounded-xl divide-y divide-stroke overflow-hidden">
                    {rest.map((entry) => (
                      <VibeChartRow key={`row-${entry.rank}`} entry={entry} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <div className="mt-10 rounded-lg border border-stroke bg-bg-surface px-5 py-4">
            <p className="text-xs text-text-muted leading-relaxed">
              * 외부 방문자 수가 아닌 ShowVibe 내부 반응 지표(조회·클릭·저장·댓글)
              기반으로 산출됩니다. 차트는 1시간마다 갱신됩니다.
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  )
}
