import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import { requireAuth } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { AvatarImage } from '@/components/ui/AvatarImage'

export const dynamic = 'force-dynamic'

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

interface UserDetailRow {
  name: string | null
  bio: string | null
  avatar_url: string | null
}

export default async function AccountPage() {
  const sessionUser = await requireAuth()

  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('name, bio, avatar_url')
    .eq('id', sessionUser.id)
    .maybeSingle()
  const detail = (data as UserDetailRow | null) ?? null

  const fullName = (sessionUser.user_metadata?.full_name as string | undefined) ?? null
  const displayName = detail?.name ?? sessionUser.profile?.name ?? fullName ?? '이름 없음'
  const displayEmail = sessionUser.profile?.email ?? sessionUser.email ?? '—'
  const avatarUrl = detail?.avatar_url ?? sessionUser.profile?.avatar_url ?? null
  const bio = detail?.bio ?? null
  const role = sessionUser.profile?.role ?? 'user'
  const roleLabel = ROLE_LABELS[role] ?? role
  const joinedAt = formatDate(sessionUser.created_at)

  return (
    <AppShell>
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-3xl font-semibold text-text-high mb-2">내 계정</h1>
          <p className="text-sm text-text-muted mb-8">계정 정보를 확인하세요.</p>

          <div className="bg-bg-surface border border-stroke rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stroke">
              <AvatarImage avatarUrl={avatarUrl} name={displayName} size={72} />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-text-high truncate">
                  {displayName}
                </p>
                <p className="text-[13px] text-text-muted truncate">
                  {displayEmail}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6">
              <dt className="text-sm text-text-muted">소개</dt>
              <dd className="sm:col-span-2 text-sm text-text-high whitespace-pre-wrap">
                {bio || <span className="text-text-muted">—</span>}
              </dd>

              <dt className="text-sm text-text-muted">가입일</dt>
              <dd className="sm:col-span-2 text-sm text-text-high">{joinedAt}</dd>

              <dt className="text-sm text-text-muted">역할</dt>
              <dd className="sm:col-span-2 text-sm text-text-high">{roleLabel}</dd>
            </dl>

            <div className="mt-8 pt-6 border-t border-stroke">
              <Link
                href="/account/edit"
                className="inline-flex items-center rounded-lg bg-coral hover:bg-coral-hover text-coral-ink font-medium px-6 py-2.5 transition-colors"
              >
                프로필 수정
              </Link>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
