/**
 * Root loading fallback — used by Next.js App Router when any segment without
 * its own loading.tsx is suspended.
 *
 * Magazine card skeleton (4 grey blocks) per task spec. Visually neutral
 * enough that brief flashes on admin/library/account routes are acceptable
 * during navigation transitions; none of those routes have their own
 * loading.tsx today, and the spec forbids creating one inside them.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-shell">
      <div className="flex flex-1 gap-2 px-2 pb-2 lg:pt-2">
        <div
          aria-hidden
          className="hidden w-[280px] shrink-0 lg:block"
        >
          <div
            className="sticky rounded-lg bg-bg-sidebar p-3.5"
            style={{ top: '0.5rem', maxHeight: 'calc(100vh - 1rem)' }}
          >
            <div className="h-9 w-32 rounded bg-bg-elevated/60" />
            <div className="mt-3.5 h-24 rounded-xl bg-bg-elevated/60" />
            <div className="mt-3.5 h-12 rounded-xl bg-bg-elevated/60" />
            <div className="mt-3.5 space-y-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 rounded-md bg-bg-elevated/40" />
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-bg-base">
          <div
            role="status"
            aria-busy="true"
            aria-label="콘텐츠 로딩 중"
            className="mx-auto w-full max-w-[1200px] px-6 py-10"
          >
            <div className="mb-2 h-3 w-24 rounded bg-bg-elevated/60" />
            <div className="mb-2 h-9 w-72 max-w-full rounded bg-bg-elevated/60" />
            <div className="mb-8 h-3 w-48 rounded bg-bg-elevated/40" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-stroke bg-bg-surface"
                >
                  <div className="aspect-[16/9] bg-bg-elevated/60" />
                  <div className="space-y-2 p-4">
                    <div className="h-3 w-16 rounded bg-bg-elevated/60" />
                    <div className="h-4 w-3/4 rounded bg-bg-elevated/60" />
                    <div className="h-3 w-1/2 rounded bg-bg-elevated/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
