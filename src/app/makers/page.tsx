import type { Metadata } from 'next'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/AvatarImage'
import AppShell from '@/components/layout/AppShell'
import { getMakers, type MakerWithStats } from '@/lib/makers/queries'

export const metadata: Metadata = {
  title: 'Makers — ShowVibe',
  description:
    '바이브코딩 프로젝트를 만든 메이커들. 검증된 크리에이터의 작품을 디깅하세요.',
}

// ISR: 공개 메이커 목록만 표시, 세션 의존 없음.
export const revalidate = 300

function MakerCard({ entry }: { entry: MakerWithStats }) {
  // TODO: users.username 컬럼 도입 시 user.id → username으로 교체
  const href = `/makers/${entry.user.id}`
  const bio = entry.bio ?? '바이브코딩으로 무언가를 만들고 있는 메이커'
  return (
    <Link
      href={href}
      className="group rounded-xl border border-stroke bg-bg-surface p-4 transition-shadow hover:shadow-lg hover:border-coral/30"
    >
      <div className="flex flex-col items-center text-center">
        <AvatarImage
          avatarUrl={entry.user.avatarUrl}
          name={entry.user.name}
          size={80}
          className="border border-stroke mb-3"
        />
        <h3 className="text-[14px] font-semibold text-text-high mb-1">
          {entry.user.name}
        </h3>
        {entry.claimedCount > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium mb-2"
            style={{
              color: '#3B82F6',
              backgroundColor: 'rgba(59,130,246,0.15)',
            }}
          >
            <svg
              width="10"
              height="10"
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
        <p className="text-[11.5px] text-text-medium line-clamp-2 leading-relaxed mb-2">
          {bio}
        </p>
        <div className="text-[11px] text-text-muted">
          <span className="font-medium text-text-high">
            {entry.claimedCount}
          </span>{' '}
          claimed projects
        </div>
      </div>
    </Link>
  )
}

function EmptyMakers() {
  return (
    <div className="rounded-xl border border-stroke bg-bg-surface px-6 py-16 text-center">
      <p className="text-base font-medium text-text-high mb-2 font-[var(--font-outfit)]">
        아직 등록된 메이커가 없습니다
      </p>
      <p className="text-sm text-text-medium max-w-md mx-auto leading-relaxed">
        Claim 절차를 거친 메이커가 이곳에 표시됩니다. 자신의 프로젝트를 보유한
        메이커는{' '}
        <Link href="/claim" className="text-coral hover:text-coral-hover">
          클레임 신청
        </Link>
        을 통해 검증받을 수 있습니다.
      </p>
    </div>
  )
}

export default async function MakersPage() {
  const makers = await getMakers(60)

  return (
    <AppShell>
      <main className="flex-1">
        <section className="border-b border-stroke">
          <div className="mx-auto max-w-[1200px] px-6 py-10 lg:py-12">
            <p className="text-[12px] font-medium text-coral mb-2 tracking-wide font-[var(--font-outfit)]">
              Makers
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2 font-[var(--font-outfit)]">
              Meet the Makers
            </h1>
            <p className="text-[13px] text-text-muted max-w-2xl mb-6">
              바이브코딩으로 직접 만든 사람들. 검증된 메이커의 프로젝트와
              이야기를 한 곳에서.
            </p>

            <form
              action="/makers"
              method="GET"
              className="relative max-w-md"
              role="search"
            >
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Search makers by name..."
                aria-label="메이커 이름으로 검색"
                className="w-full rounded-full bg-bg-surface border border-stroke py-2.5 pl-10 pr-4 text-sm text-text-high placeholder:text-text-muted outline-none focus:border-coral transition-colors"
              />
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-8">
          {makers.length === 0 ? (
            <EmptyMakers />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {makers.map((entry) => (
                <MakerCard key={entry.user.id} entry={entry} />
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  )
}
