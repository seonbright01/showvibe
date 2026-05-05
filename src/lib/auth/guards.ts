import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: string | null
  is_banned: boolean
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
      .select('id, name, email, avatar_url, role, is_banned')
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

// 보안 (P3.1): is_banned 사용자는 mutation 차단. 단순 페이지 접근(requireAuth)
// 과 달리 댓글/제출/신고 같은 쓰기 액션에서 이 가드를 사용해야 함.
// throw 한 Error 메세지는 클라이언트로 노출되어 사용자에게 표시됨.
export async function requireActiveAuth(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.profile?.is_banned) {
    throw new Error('이용이 정지된 계정입니다')
  }
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || user.profile?.role !== 'admin') redirect('/')
  return user
}
