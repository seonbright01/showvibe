'use client'

import { useEffect, useState } from 'react'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'

/**
 * Client island: holds mobile drawer open/close state.
 * AppShell stays as a server component — only this trigger needs client JS.
 *
 * No PII flows through here. Auth state (UserMenu) is fetched independently
 * inside the drawer via the supabase client.
 */
export function MobileNavTrigger() {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Defensive: if viewport widens past lg while drawer is open, close it.
  useEffect(() => {
    if (!mobileOpen) return
    const mql = window.matchMedia('(min-width: 1024px)')
    function handle(e: MediaQueryListEvent) {
      if (e.matches) setMobileOpen(false)
    }
    mql.addEventListener('change', handle)
    return () => mql.removeEventListener('change', handle)
  }, [mobileOpen])

  return (
    <>
      <div className="lg:hidden">
        <TopBar onOpenMobileNav={() => setMobileOpen(true)} />
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}

export default MobileNavTrigger
