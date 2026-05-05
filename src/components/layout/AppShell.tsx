'use client'

import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar, TOPBAR_HEIGHT } from './TopBar'
import { MobileNav } from './MobileNav'
import Footer from './Footer'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-bg-shell">
      {/* TopBar: lg 이상에선 사이드바 상단에 로고가 있으므로 모바일/태블릿에서만 표시 */}
      <div className="lg:hidden">
        <TopBar onOpenMobileNav={() => setMobileOpen(true)} />
      </div>

      <div className="flex flex-1 gap-2 px-2 pb-2 lg:pt-2">
        <aside
          aria-label="Primary sidebar"
          className="hidden w-[280px] shrink-0 lg:block"
        >
          <div
            className="sticky rounded-lg"
            style={{
              top: `0.5rem`,
              maxHeight: `calc(100vh - 1rem)`,
              overflowY: 'auto',
            }}
          >
            <Sidebar />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col rounded-lg bg-bg-base">
          <main className="flex-1">{children}</main>
        </div>
      </div>

      <Footer />

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  )
}

export default AppShell
