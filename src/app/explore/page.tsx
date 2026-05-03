import AppShell from '@/components/layout/AppShell'
import { ProjectCard } from '@/components/project/ProjectCard'
import {
  ExploreFilters,
  ExploreSearch,
  ExploreSortControl,
} from '@/components/explore/ExploreFilters'
import { searchSites, type SortKey } from '@/lib/sites/queries'
import { getSessionUser } from '@/lib/auth/guards'

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string
    tool?: string
    category?: string
    status?: string
    source?: string
    sort?: string
  }>
}

const ALLOWED_SORTS: readonly SortKey[] = ['trending', 'newest', 'most_saved']

function normalizeSort(value: string | undefined): SortKey {
  if (!value) return 'trending'
  return (ALLOWED_SORTS as readonly string[]).includes(value)
    ? (value as SortKey)
    : 'trending'
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams
  const sort = normalizeSort(params.sort)

  const [sessionUser, sites] = await Promise.all([
    getSessionUser(),
    searchSites({
      q: params.q,
      tool: params.tool,
      category: params.category,
      status: params.status,
      source: params.source,
      sort,
      limit: 60,
    }),
  ])
  const isAuthenticated = Boolean(sessionUser)

  return (
    <AppShell>
      <main className="flex-1">
        <section className="border-b border-stroke">
          <div className="mx-auto max-w-[1200px] px-6 py-8 lg:py-12">
            <h1 className="text-3xl font-bold mb-1.5 font-[var(--font-outfit)]">
              Explore Projects
            </h1>
            <p className="text-[13px] text-text-muted mb-5">
              바이브코딩으로 만들어진 프로젝트를 검색하고 필터링하세요.
            </p>
            <ExploreSearch />
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-6">
          <div className="mb-4">
            <ExploreFilters />
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-text-muted">
              <span className="text-text-high font-medium">{sites.length}</span> results
            </p>
            <ExploreSortControl />
          </div>

          {sites.length === 0 ? (
            <div className="bg-bg-surface border border-stroke rounded-xl p-12 text-center">
              <p className="text-text-medium mb-2">No projects found.</p>
              <p className="text-sm text-text-muted">
                필터를 조정하거나 검색어를 변경해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sites.map((enriched) => (
                <ProjectCard key={enriched.site.id} {...enriched} isAuthenticated={isAuthenticated} />
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  )
}
