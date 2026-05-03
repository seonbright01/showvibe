'use client'

interface TagCloudProps {
  tags: string[]
  onTagClick?: (tag: string) => void
}

export function TagCloud({ tags, onTagClick }: TagCloudProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onTagClick?.(tag)}
          className="rounded-full bg-bg-elevated px-2.5 py-1 text-[11.5px] text-text-medium transition-colors hover:bg-coral-alpha hover:text-text-high"
        >
          <span className="text-text-muted">#</span>
          {tag}
        </button>
      ))}
    </div>
  )
}
