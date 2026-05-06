'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  isAvatarPresetId,
  presetIdToAvatarUrl,
  AVATAR_PRESET_PREFIX,
} from '@/lib/avatars/presets'

type ActionResult =
  | { error: string }
  | { success: true; message: string }

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

// open-redirect 방지: 상대 경로(/...)만 허용, 외부 URL 차단
function safeRedirectPath(input: string | null | undefined): string {
  if (!input) return '/'
  if (!input.startsWith('/') || input.startsWith('//')) return '/'
  return input
}

function buildCallbackUrl(next: string): string {
  const safe = safeRedirectPath(next)
  const params = safe === '/' ? '' : `?next=${encodeURIComponent(safe)}`
  return `${getSiteUrl()}/auth/callback${params}`
}

export async function signInWithGitHub(formData?: FormData): Promise<void> {
  const next = formData ? String(formData.get('next') ?? '/') : '/'
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: buildCallbackUrl(next) },
  })
  if (error) throw new Error(error.message)
  if (data.url) redirect(data.url)
}

export async function signInWithGoogle(formData?: FormData): Promise<void> {
  const next = formData ? String(formData.get('next') ?? '/') : '/'
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: buildCallbackUrl(next) },
  })
  if (error) throw new Error(error.message)
  if (data.url) redirect(data.url)
}

export async function signInWithEmail(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = safeRedirectPath(String(formData.get('next') ?? '/'))

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signUpWithEmail(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const name = String(formData.get('name') ?? '')
  const avatarRaw = String(formData.get('avatar') ?? '')

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' }
  }

  const avatarUrl = isAvatarPresetId(avatarRaw)
    ? presetIdToAvatarUrl(avatarRaw)
    : null

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      data: {
        full_name: name,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      },
    },
  })
  if (error) return { error: error.message }

  return {
    success: true,
    message: '확인 메일을 발송했습니다. 이메일을 확인해주세요.',
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export type UpdateProfileResult =
  | { error: string }
  | { success: true }

export async function updateProfileAction(
  _prevState: UpdateProfileResult | null,
  formData: FormData,
): Promise<UpdateProfileResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const name = String(formData.get('name') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const avatarRaw = String(formData.get('avatar') ?? '').trim()

  if (name.length < 2 || name.length > 60) {
    return { error: '이름은 2~60자여야 합니다.' }
  }
  if (bio.length > 500) {
    return { error: '소개는 500자 이내로 입력해주세요.' }
  }

  let avatarUrl: string | null = null
  if (avatarRaw.startsWith(AVATAR_PRESET_PREFIX)) {
    avatarUrl = avatarRaw
  } else if (isAvatarPresetId(avatarRaw)) {
    avatarUrl = presetIdToAvatarUrl(avatarRaw)
  } else if (avatarRaw === '__keep__' || avatarRaw === '') {
    // 기존 avatar 유지 (form에서 picker 미선택 또는 명시적 keep)
    avatarUrl = null
  } else if (/^https?:\/\//.test(avatarRaw)) {
    avatarUrl = avatarRaw
  }

  const updatePayload: {
    name: string
    bio: string | null
    avatar_url?: string
  } = {
    name,
    bio: bio || null,
  }
  if (avatarUrl !== null) {
    updatePayload.avatar_url = avatarUrl
  }

  const { error } = await supabase
    .from('users')
    .update(updatePayload)
    .eq('id', user.id)

  if (error) return { error: error.message }

  // 사용자 avatar/이름은 거의 모든 페이지(홈/explore/archive/posts/projects 카드 +
  // makers/[username]/projects/[id]/posts/[slug] 등 동적 라우트)에 노출되므로
  // layout 단위로 전체 무효화. /makers (목록) 단독 무효화로는 /makers/[username]
  // 동적 라우트가 stale 유지되어 변경분이 반영되지 않는다.
  revalidatePath('/', 'layout')
  return { success: true }
}
