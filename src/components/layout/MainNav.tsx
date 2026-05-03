"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/chart", label: "Chart" },
  { href: "/explore", label: "Explore" },
  { href: "/makers", label: "Makers" },
  { href: "/posts", label: "Posts" },
  { href: "/archive", label: "Archive" },
  { href: "/library", label: "Library" },
] as const;

export function MainNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={`flex items-center gap-1 ${className}`}>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
              active
                ? "bg-coral-alpha text-coral"
                : "text-text-medium hover:text-text-high hover:bg-bg-elevated",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
