'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { UserMenu } from '@/components/auth/UserMenu'
import { ShowVibeLogo } from '@/components/ui/Logo'

interface NavLink {
  href: string
  label: string
  icon: ReactNode
}

// All icons: Lucide-style inline SVG, 20×20, stroke-width 2, unified visual weight
const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const HomeIcon = () => (
  <svg {...iconProps}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const ChartIcon = () => (
  <svg {...iconProps}>
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
)

const ExploreIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
)

const MakersIcon = () => (
  <svg {...iconProps}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const PostsIcon = () => (
  <svg {...iconProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const ArchiveIcon = () => (
  <svg {...iconProps}>
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
)

const LibraryIcon = () => (
  <svg {...iconProps}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

const ContactIcon = () => (
  <svg {...iconProps}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const PlusIcon = () => (
  <svg
    {...iconProps}
    width={18}
    height={18}
  >
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </svg>
)

const PRIMARY_LINKS: readonly NavLink[] = [
  { href: '/', label: 'Home', icon: <HomeIcon /> },
  { href: '/chart', label: 'Vibe Chart', icon: <ChartIcon /> },
  { href: '/explore', label: 'Explore', icon: <ExploreIcon /> },
  { href: '/makers', label: 'Makers', icon: <MakersIcon /> },
  { href: '/posts', label: 'Posts', icon: <PostsIcon /> },
  { href: '/archive', label: 'Archive', icon: <ArchiveIcon /> },
  { href: '/library', label: 'Library', icon: <LibraryIcon /> },
  { href: '/contact', label: 'Contact', icon: <ContactIcon /> },
] as const

function NavItem({ link, active }: { link: NavLink; active: boolean }) {
  // 모든 메뉴 같은 baseline. hover와 active(현재 페이지)는 동일한 시각 효과 (음영 + 코랄 텍스트/아이콘).
  return (
    <Link
      href={link.href}
      aria-current={active ? 'page' : undefined}
      className={[
        'group flex items-center gap-3.5 rounded-md px-3.5 py-2.5 text-[15px] font-semibold transition-colors',
        active
          ? 'bg-bg-elevated text-coral'
          : 'text-text-medium hover:bg-bg-elevated hover:text-coral',
      ].join(' ')}
    >
      <span
        className={[
          'inline-flex h-5 w-5 shrink-0 items-center justify-center transition-colors',
          active ? 'text-coral' : 'text-text-muted group-hover:text-coral',
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
      <Link
        href="/"
        aria-label="ShowVibe — Home"
        className="inline-flex items-center justify-start px-1 py-2"
      >
        <ShowVibeLogo width={150} variant="white" priority />
      </Link>

      <div className="rounded-xl border border-stroke bg-bg-surface p-3.5">
        <UserMenu variant="card" />
      </div>

      <Link
        href="/submit"
        className="group relative flex flex-col items-center justify-center gap-0.5 rounded-xl bg-coral px-5 py-4 font-semibold text-coral-ink shadow-pop ring-1 ring-coral-line/40 transition-all hover:bg-coral-hover hover:scale-[1.02] hover:shadow-[0_8px_28px_rgba(233,79,61,0.45)]"
      >
        <span className="flex items-center gap-2 text-[16px] leading-none">
          <PlusIcon />
          Submit Project
        </span>
        <span className="text-[11.5px] font-medium opacity-90">
          프로젝트 등록
        </span>
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
