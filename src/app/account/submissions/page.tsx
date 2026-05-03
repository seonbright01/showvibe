import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import { requireAuth } from '@/lib/auth/guards'

export default async function SubmissionsPage() {
  await requireAuth()

  return (
    <AppShell>
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-3xl font-semibold text-text-high mb-2">내가 제출한 프로젝트</h1>
          <p className="text-sm text-text-muted mb-8">제출한 프로젝트의 상태를 확인하세요.</p>

          <div className="bg-bg-surface border border-stroke rounded-2xl p-12 text-center">
            <p className="text-text-medium mb-2">Coming soon</p>
            <p className="text-sm text-text-muted mb-6">제출 내역 조회는 준비 중입니다.</p>
            <Link
              href="/"
              className="inline-block bg-coral hover:bg-coral-hover text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
