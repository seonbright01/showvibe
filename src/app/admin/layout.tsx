import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessionUser } from '@/lib/auth/guards'
import AppShell from '@/components/layout/AppShell'

const ADMIN_NAV = [
  { href: '/admin/review', label: 'Review Queue', icon: '⌨' },
  { href: '/admin/editors-pick', label: "Editor's Pick", icon: '★' },
  { href: '/admin/posts', label: 'Posts', icon: '📰' },
  { href: '/admin/members', label: 'Members', icon: '👥' },
  { href: '/admin/takedowns', label: 'Takedowns', icon: '⚠' },
  { href: '/admin/comments', label: 'Comments', icon: '💬' },
  { href: '/admin/health', label: 'Site Health', icon: '◉' },
  { href: '/account/edit', label: '내 프로필', icon: '👤' },
] as const

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user || user.profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-[var(--font-outfit)] text-2xl font-bold">Admin Console</h1>
          <span className="font-mono text-[11px] text-text-muted">
            {user.profile?.name ?? user.email} · admin
          </span>
        </div>
        <nav className="mb-6 flex flex-wrap gap-1 border-b border-stroke">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 border-b-2 border-transparent px-3 py-2 text-[13px] font-medium text-text-medium transition-colors hover:border-coral hover:text-text-high"
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </AppShell>
  )
}
