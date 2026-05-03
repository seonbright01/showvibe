import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { ProjectCard } from '@/components/project/ProjectCard'
import { getSessionUser } from '@/lib/auth/guards'
import { getSavedSites, getLikeStatesForSites } from '@/lib/social/queries'
import { getSitesByIds } from '@/lib/sites/queries'

export const metadata: Metadata = {
  title: 'Library — ShowVibe',
  description: '책갈피한 사이트들 (본인 전용)',
}

export const dynamic = 'force-dynamic'

export default async function LibraryPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/signin?redirect=/library')
  }

  const saved = await getSavedSites(user.id, 100)
  const siteIds = saved.map((s) => s.siteId)
  const [sites, likeStates] = await Promise.all([
    siteIds.length > 0 ? getSitesByIds(siteIds) : Promise.resolve([]),
    getLikeStatesForSites(siteIds, user.id),
  ])

  return (
    <AppShell>
      <main className="flex-1">
        <section className="border-b border-stroke">
          <div className="mx-auto max-w-[1200px] px-6 py-10 lg:py-12">
            <p className="text-[12px] font-medium text-coral mb-2 tracking-wide font-[var(--font-outfit)]">
              Library
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2 font-[var(--font-outfit)]">
              책갈피한 사이트
            </h1>
            <p className="text-[13px] text-text-muted">
              본인만 볼 수 있는 저장 목록입니다. 총 {sites.length}개.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-8">
          {sites.length === 0 ? (
            <div className="rounded-xl border border-stroke bg-bg-surface px-6 py-16 text-center">
              <p className="text-base font-medium text-text-high mb-2 font-[var(--font-outfit)]">
                아직 저장한 사이트가 없습니다
              </p>
              <p className="text-sm text-text-medium max-w-md mx-auto leading-relaxed mb-4">
                마음에 드는 프로젝트의 🔖 Save 버튼을 누르면 여기에 모입니다.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-coral text-coral-ink text-sm font-medium hover:bg-coral-hover transition-colors"
              >
                프로젝트 탐색하기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sites.map((s) => {
                const lk = likeStates[s.site.id] ?? { count: 0, isLiked: false }
                return (
                  <ProjectCard
                    key={s.site.id}
                    site={s.site}
                    analysis={s.analysis}
                    media={s.media}
                    maker={s.maker}
                    initialLikeCount={lk.count}
                    initialIsLiked={lk.isLiked}
                    initialIsSaved={true}
                    isAuthenticated={true}
                  />
                )
              })}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  )
}
