'use client'

export const TOPBAR_HEIGHT = 56

interface TopBarProps {
  onOpenMobileNav?: () => void
}

function HamburgerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

export function TopBar({ onOpenMobileNav }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 border-b border-stroke bg-bg-base/85 px-4 backdrop-blur-md md:gap-4 md:px-6"
      style={{ height: TOPBAR_HEIGHT }}
    >
      {onOpenMobileNav && (
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="메뉴 열기"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-text-high hover:bg-bg-elevated transition-colors lg:hidden"
        >
          <HamburgerIcon />
        </button>
      )}
      <div className="flex-1" aria-hidden />
    </header>
  )
}
