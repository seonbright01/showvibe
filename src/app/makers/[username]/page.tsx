// TODO: users.username 컬럼 도입 시 username slug 기반 lookup으로 교체.
// 현재는 user.id (UUID)를 username 위치에 그대로 사용합니다.

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { ProjectCard } from '@/components/project/ProjectCard'
import { getMakerById } from '@/lib/makers/queries'

interface PageProps {
  params: Promise<{ username: string }>
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params
  const result = await getMakerById(username)
  if (!result) {
    return { title: 'Maker not found — ShowVibe' }
  }
  return {
    title: `${result.maker.user.name} — ShowVibe`,
    description: `${result.maker.user.name}의 바이브코딩 프로젝트와 이야기.`,
  }
}

export default async function MakerProfilePage({ params }: PageProps) {
  const { username } = await params
  const result = await getMakerById(username)

  if (!result) {
    notFound()
  }

  const { maker, sites } = result
  const bio = maker.bio ?? '바이브코딩으로 무언가를 만들고 있는 메이커'

  return (
    <AppShell>
      <main className="flex-1">
        <section className="border-b border-stroke">
          <div className="mx-auto max-w-[1200px] px-6 py-12 lg:py-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-bg-elevated border border-stroke shrink-0">
                {maker.user.avatarUrl && (
                  <Image
                    src={maker.user.avatarUrl}
                    alt={`${maker.user.name} avatar`}
                    fill
                    sizes="128px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl font-black tracking-tight font-[var(--font-outfit)]">
                    {maker.user.name}
                  </h1>
                  {maker.claimedCount > 0 && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        color: '#3B82F6',
                        backgroundColor: 'rgba(59,130,246,0.15)',
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-text-medium mb-4 max-w-2xl">{bio}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    type="button"
                    disabled
                    className="px-5 py-2 rounded-lg bg-bg-elevated border border-stroke text-text-muted text-sm font-medium cursor-not-allowed"
                  >
                    Follow · Coming soon
                  </button>
                  <span className="text-sm text-text-muted">
                    <span className="font-medium text-text-high">
                      {maker.claimedCount}
                    </span>{' '}
                    claimed projects
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-10">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold font-[var(--font-outfit)]">
              Projects by this maker
            </h2>
          </div>

          {sites.length === 0 ? (
            <div className="rounded-lg border border-stroke bg-bg-surface px-5 py-8 text-center text-sm text-text-muted">
              아직 등록된 claim 프로젝트가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sites.map((s) => (
                <ProjectCard
                  key={s.site.id}
                  site={s.site}
                  analysis={s.analysis}
                  media={s.media}
                  maker={s.maker}
                />
              ))}
            </div>
          )}
        </section>

      </main>
    </AppShell>
  )
}
