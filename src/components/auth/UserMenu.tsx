'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient, hasSupabaseEnv } from '@/lib/supabase/client'
import { signOut } from '@/lib/auth/actions'
import { parseAvatarUrl } from '@/lib/avatars/presets'
import { AvatarSvg } from '@/components/ui/AvatarSvg'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: string | null
}

function getInitial(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name && name.trim()) || (email && email.trim()) || '?'
  return source.charAt(0).toUpperCase()
}

function Avatar({ url, initial, size = 32 }: { url: string | null; initial: string; size?: number }) {
  const presetId = parseAvatarUrl(url)
  if (presetId) {
    return (
      <div
        className="rounded-full overflow-hidden border border-stroke"
        style={{ width: size, height: size }}
      >
        <AvatarSvg presetId={presetId} size={size} />
      </div>
    )
  }
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover border border-stroke"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-coral text-white font-medium flex items-center justify-center border border-stroke"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
      aria-hidden
    >
      {initial}
    </div>
  )
}

interface UserMenuProps {
  variant?: 'icon' | 'card'
}

export function UserMenu({ variant = 'icon' }: UserMenuProps = {}) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  // env 없을 땐 처음부터 loading=false (cascading render 방지)
  const [loading, setLoading] = useState(() => hasSupabaseEnv())
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      return
    }
    const supabase = createClient()
    let isMounted = true

    async function loadProfile(currentUser: User) {
      const { data } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, role')
        .eq('id', currentUser.id)
        .maybeSingle()
      if (isMounted) setProfile((data as UserProfile | null) ?? null)
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return
      setUser(data.user)
      setLoading(false)
      if (data.user) loadProfile(data.user)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (nextUser) {
        loadProfile(nextUser)
      } else {
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (loading) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-bg-elevated animate-pulse" aria-hidden />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 rounded bg-bg-elevated animate-pulse" aria-hidden />
            <div className="h-2.5 w-32 rounded bg-bg-elevated animate-pulse" aria-hidden />
          </div>
        </div>
      )
    }
    return <div className="h-8 w-8 rounded-full bg-bg-elevated animate-pulse" aria-hidden />
  }

  if (!user) {
    if (variant === 'card') {
      return (
        <div className="flex flex-col gap-2">
          <Link
            href="/signin"
            className="block w-full rounded-lg bg-coral px-3 py-2.5 text-center text-[15px] font-semibold text-coral-ink hover:bg-coral-hover transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="block w-full rounded-lg border border-stroke px-3 py-2.5 text-center text-[15px] font-medium text-text-medium hover:text-text-high hover:bg-bg-elevated transition-colors"
          >
            Sign up
          </Link>
        </div>
      )
    }
    return (
      <Link
        href="/signin"
        className="text-sm text-text-medium hover:text-text-high transition-colors"
      >
        Sign in
      </Link>
    )
  }

  const displayName = profile?.name ?? (user.user_metadata?.full_name as string | undefined) ?? null
  const displayEmail = profile?.email ?? user.email ?? null
  const avatarUrl = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined) ?? null
  const initial = getInitial(displayName, displayEmail)
  const isAdmin = profile?.role === 'admin'

  return (
    <div ref={menuRef} className="relative">
      {variant === 'card' ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-coral"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="사용자 메뉴 열기"
        >
          <Avatar url={avatarUrl} initial={initial} size={42} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-text-high">
              {displayName ?? '이름 없음'}
            </p>
            {displayEmail && (
              <p className="truncate text-[12px] text-text-muted">{displayEmail}</p>
            )}
          </div>
          <span aria-hidden className="text-text-muted text-sm">▾</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-coral"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="사용자 메뉴 열기"
        >
          <Avatar url={avatarUrl} initial={initial} size={32} />
        </button>
      )}

      {open && (
        <div
          role="menu"
          className={
            variant === 'card'
              ? 'absolute left-0 right-0 mt-2 rounded-xl bg-bg-surface border border-stroke shadow-lg overflow-hidden z-50'
              : 'absolute right-0 mt-2 w-64 rounded-xl bg-bg-surface border border-stroke shadow-lg overflow-hidden z-50'
          }
        >
          {variant !== 'card' && (
            <div className="px-4 py-3 border-b border-stroke">
              <p className="text-sm font-medium text-text-high truncate">
                {displayName ?? '이름 없음'}
              </p>
              {displayEmail && (
                <p className="text-xs text-text-muted truncate mt-0.5">{displayEmail}</p>
              )}
            </div>
          )}

          <nav className="py-1">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text-medium hover:text-text-high hover:bg-bg-elevated transition-colors"
            >
              내 계정
            </Link>
            <Link
              href="/library"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text-medium hover:text-text-high hover:bg-bg-elevated transition-colors"
            >
              저장한 프로젝트
            </Link>
            <Link
              href="/account/submissions"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text-medium hover:text-text-high hover:bg-bg-elevated transition-colors"
            >
              내가 제출한 프로젝트
            </Link>
            {isAdmin && (
              <Link
                href="/admin/review"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-coral hover:bg-bg-elevated transition-colors"
              >
                관리자
              </Link>
            )}
          </nav>

          <div className="border-t border-stroke">
            <form action={signOut}>
              <button
                type="submit"
                role="menuitem"
                className="w-full text-left px-4 py-2 text-sm font-medium text-coral hover:bg-coral/10 transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
