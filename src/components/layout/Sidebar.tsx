'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserMenu } from '@/components/auth/UserMenu'

interface NavLink {
  href: string
  label: string
  icon: string
}

const PRIMARY_LINKS: readonly NavLink[] = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/chart', label: 'Vibe Chart', icon: '▤' },
  { href: '/explore', label: 'Explore', icon: '⌕' },
  { href: '/makers', label: 'Makers', icon: '◉' },
  { href: '/posts', label: 'Posts', icon: '☰' },
  { href: '/archive', label: 'Archive', icon: '⚫' },
  { href: '/library', label: 'Library', icon: '🔖' },
] as const

function NavItem({ link, active }: { link: NavLink; active: boolean }) {
  return (
    <Link
      href={link.href}
      className={[
        'flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors',
        active
          ? 'bg-bg-elevated text-text-high'
          : 'text-text-medium hover:text-text-high hover:bg-bg-elevated/60',
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'inline-flex w-5 justify-center text-base leading-none',
          active ? 'text-coral' : 'text-text-muted',
        ].join(' ')}
      >
        {link.icon}
      </span>
      <span className="truncate">{link.label}</span>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-3.5 bg-bg-sidebar p-3.5">
      <div className="rounded-xl border border-stroke bg-bg-surface p-3">
        <UserMenu variant="card" />
      </div>

      <Link
        href="/submit"
        className="flex items-center justify-center gap-1.5 rounded-xl bg-coral px-4 py-2.5 text-sm font-semibold text-coral-ink transition-colors hover:bg-coral-hover"
      >
        <span aria-hidden>+</span>
        <span>Submit Project</span>
      </Link>

      <nav
        aria-label="Primary"
        className="flex flex-col gap-0.5 rounded-xl border border-stroke bg-bg-surface p-2.5"
      >
        {PRIMARY_LINKS.map((link) => {
          const active =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href)
          return <NavItem key={link.href} link={link} active={active} />
        })}
      </nav>
    </div>
  )
}
