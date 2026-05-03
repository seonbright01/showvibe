"use client";

import Link from "next/link";
import { useState } from "react";
import { MainNav, NAV_ITEMS } from "./MainNav";
import { ShowVibeSymbol } from "@/components/ui/Logo";
import { UserMenu } from "@/components/auth/UserMenu";

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center shrink-0"
      aria-label="ShowVibe — Home"
    >
      <ShowVibeSymbol size={40} priority />
    </Link>
  );
}

function SearchBar() {
  return (
    <div className="relative hidden md:block flex-1 max-w-md mx-6">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        placeholder="Search projects, makers, tools, tags..."
        className="w-full rounded-full bg-bg-elevated py-2 pl-10 pr-4 text-sm text-text-high placeholder:text-text-muted outline-none border border-transparent focus:border-stroke transition-colors"
      />
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg-surface border-b border-stroke">
      {/* Top row: Logo + Search + Submit/Login */}
      <div className="mx-auto flex h-14 max-w-[1200px] items-center px-4 gap-4">
        <Logo />
        <SearchBar />

        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <Link
            href="/submit"
            className="rounded-lg bg-coral px-4 py-1.5 text-sm font-medium text-white hover:bg-coral-hover transition-colors"
          >
            Submit Project
          </Link>
          <UserMenu />
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="ml-auto lg:hidden text-text-medium hover:text-text-high transition-colors"
          aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Bottom row: Main navigation (Bugs Music style) */}
      <div className="hidden lg:block border-t border-stroke">
        <div className="mx-auto max-w-[1200px] px-4 py-1">
          <MainNav />
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stroke bg-bg-surface">
          <div className="px-4 py-3">
            <div className="relative mb-3">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search projects, makers, tools, tags..."
                className="w-full rounded-full bg-bg-elevated py-2 pl-10 pr-4 text-sm text-text-high placeholder:text-text-muted outline-none border border-transparent focus:border-stroke transition-colors"
              />
            </div>

            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-text-medium rounded-md hover:text-text-high hover:bg-bg-elevated transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-3 flex flex-col gap-2 border-t border-stroke pt-3">
              <Link
                href="/submit"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg bg-coral px-4 py-2 text-center text-sm font-medium text-white hover:bg-coral-hover transition-colors"
              >
                Submit Project
              </Link>
              <div
                className="flex justify-center px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
