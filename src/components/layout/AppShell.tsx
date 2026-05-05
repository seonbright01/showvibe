import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { MobileNavTrigger } from './MobileNavTrigger'
import Footer from './Footer'

interface AppShellProps {
  children: ReactNode
}

/**
 * Server component shell. Layout-only — no client state.
 *
 * The mobile drawer's open/close state is isolated in <MobileNavTrigger />,
 * so the rest of the tree (sidebar, page content) renders on the server
 * and can be cached / streamed without forcing a client boundary.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-shell">
      {/* TopBar + drawer (client island) — only mounts on mobile/tablet */}
      <MobileNavTrigger />

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

        {/* 우측 메인 패널 — 본문 + Footer 한 컬럼. Footer는 패널 스크롤 끝에서만 보임 */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-bg-base">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default AppShell
