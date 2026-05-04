import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import { requireAuth } from '@/lib/auth/guards'
import { ProfileEditForm } from '@/components/auth/ProfileEditForm'
import { createClient } from '@/lib/supabase/server'
import { parseAvatarUrl } from '@/lib/avatars/presets'

export const dynamic = 'force-dynamic'

interface UserProfileRow {
  name: string | null
  bio: string | null
  avatar_url: string | null
}

export default async function ProfileEditPage() {
  const sessionUser = await requireAuth()
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('name, bio, avatar_url')
    .eq('id', sessionUser.id)
    .maybeSingle()

  const profile = (data as UserProfileRow | null) ?? null
  const initialName =
    profile?.name ??
    sessionUser.profile?.name ??
    (sessionUser.user_metadata?.full_name as string | undefined) ??
    ''
  const initialBio = profile?.bio ?? ''
  const initialAvatarUrl = profile?.avatar_url ?? sessionUser.profile?.avatar_url ?? null
  const initialPresetId = parseAvatarUrl(initialAvatarUrl)

  return (
    <AppShell>
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/account"
              className="text-[12px] text-text-muted hover:text-text-high"
            >
              ← 내 계정
            </Link>
            <span className="text-text-muted">/</span>
            <h1 className="text-2xl font-semibold text-text-high">
              프로필 수정
            </h1>
          </div>
          <p className="text-sm text-text-muted mb-8">
            아바타·이름·소개를 변경할 수 있습니다.
          </p>

          <div className="bg-bg-surface border border-stroke rounded-2xl p-8">
            <ProfileEditForm
              initialName={initialName}
              initialBio={initialBio}
              initialAvatarUrl={initialAvatarUrl}
              initialPresetId={initialPresetId}
            />
          </div>
        </div>
      </main>
    </AppShell>
  )
}
