'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      data: { full_name: name },
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
