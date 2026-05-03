import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: string | null
}

export interface SessionUser extends User {
  profile: UserProfile | null
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, role')
      .eq('id', user.id)
      .maybeSingle()

    return { ...user, profile: (profile as UserProfile | null) ?? null }
  } catch (err) {
    // Supabase 미설정 / 네트워크 에러 시 비로그인 상태로 처리
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth] getSessionUser failed:', (err as Error).message)
    }
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/signin')
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || user.profile?.role !== 'admin') redirect('/')
  return user
}
