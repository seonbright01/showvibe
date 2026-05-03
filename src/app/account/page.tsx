import AppShell from '@/components/layout/AppShell'
import { requireAuth } from '@/lib/auth/guards'

const ROLE_LABELS: Record<string, string> = {
  admin: '관리자',
  creator: '크리에이터',
  user: '사용자',
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function AccountPage() {
  const sessionUser = await requireAuth()
  const profile = sessionUser.profile

  const fullName = (sessionUser.user_metadata?.full_name as string | undefined) ?? null
  const displayName = profile?.name ?? fullName ?? '이름 없음'
  const displayEmail = profile?.email ?? sessionUser.email ?? '—'
  const role = profile?.role ?? 'user'
  const roleLabel = ROLE_LABELS[role] ?? role
  const joinedAt = formatDate(sessionUser.created_at)

  return (
    <AppShell>
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-3xl font-semibold text-text-high mb-2">내 계정</h1>
          <p className="text-sm text-text-muted mb-8">계정 정보를 확인하세요.</p>

          <div className="bg-bg-surface border border-stroke rounded-2xl p-8">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6">
              <dt className="text-sm text-text-muted">이름</dt>
              <dd className="sm:col-span-2 text-sm text-text-high">{displayName}</dd>

              <dt className="text-sm text-text-muted">이메일</dt>
              <dd className="sm:col-span-2 text-sm text-text-high">{displayEmail}</dd>

              <dt className="text-sm text-text-muted">가입일</dt>
              <dd className="sm:col-span-2 text-sm text-text-high">{joinedAt}</dd>

              <dt className="text-sm text-text-muted">역할</dt>
              <dd className="sm:col-span-2 text-sm text-text-high">{roleLabel}</dd>
            </dl>

            <div className="mt-8 pt-6 border-t border-stroke">
              <button
                type="button"
                disabled
                className="bg-bg-elevated text-text-muted border border-stroke font-medium px-6 py-2.5 rounded-lg cursor-not-allowed"
                title="Coming soon"
              >
                프로필 수정 (Coming soon)
              </button>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
