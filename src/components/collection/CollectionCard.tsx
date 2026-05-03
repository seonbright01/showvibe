import type { Collection } from '@/types'

interface CollectionCardProps {
  collection: Collection
}

function CoverGrid({ sites }: { sites: Collection['coverSites'] }) {
  const slots = Array.from({ length: 4 }, (_, i) => sites[i] ?? null)

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-t-lg aspect-[4/3]">
      {slots.map((site, i) => {
        if (!site) {
          return (
            <div
              key={`empty-${i}`}
              className="bg-bg-elevated"
            />
          )
        }

        const hash = site.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const hue = hash % 360

        return (
          <div
            key={site.id}
            className="relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, hsl(${hue}, 60%, 20%) 0%, hsl(${(hue + 60) % 360}, 50%, 15%) 100%)`,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white/20 font-[family-name:var(--font-outfit)]">
              {site.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-stroke bg-bg-surface transition-shadow hover:shadow-lg">
      <CoverGrid sites={collection.coverSites} />

      <div className="p-3">
        <h3 className="mb-1 truncate text-[14px] font-semibold text-text-high">
          {collection.title}
        </h3>

        <p className="mb-1.5 text-[11px] font-mono text-text-muted">
          by {collection.curatorName}
        </p>

        <p className="line-clamp-2 text-xs text-text-medium">
          {collection.description}
        </p>
      </div>
    </div>
  )
}
