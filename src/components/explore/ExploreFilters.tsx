'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { TOOL_LABELS } from '@/lib/tools'

const TOOL_OPTIONS = TOOL_LABELS
const CATEGORY_OPTIONS = [
  'SaaS',
  'LegalTech',
  'EdTech',
  'FinTech',
  'HealthTech',
  'Design Tool',
  'AI Tool',
  'PetTech',
  'Travel',
] as const

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
] as const

const SOURCE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'auto_collected', label: 'Auto-collected' },
  { value: 'creator_submitted', label: 'Creator-submitted' },
  { value: 'admin_curated', label: 'Admin-curated' },
] as const

function useUrlParam() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    })
  }

  function resetAll() {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }

  return { params, setParam, resetAll }
}

export function ExploreSearch() {
  const { params, setParam } = useUrlParam()
  const initial = params.get('q') ?? ''
  const [value, setValue] = useState(initial)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setParam('q', value.trim() || null)
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search projects, makers, tools, tags..."
        className="w-full px-5 py-3 pl-12 rounded-xl bg-bg-elevated border border-stroke text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral text-[14px]"
      />
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
    </form>
  )
}

export function ExploreFilters() {
  const { params, setParam, resetAll } = useUrlParam()
  const currentTool = params.get('tool') ?? ''
  const currentCategory = params.get('category') ?? ''
  const currentStatus = params.get('status') ?? ''
  const currentSource = params.get('source') ?? ''

  const hasAny = Boolean(currentTool || currentCategory || currentStatus || currentSource)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-stroke bg-bg-surface p-3">
      <SelectFilter
        label="Tool"
        value={currentTool}
        onChange={(v) => setParam('tool', v || null)}
        options={[{ value: '', label: 'All Tools' }, ...TOOL_OPTIONS.map((t) => ({ value: t, label: t }))]}
      />
      <SelectFilter
        label="Category"
        value={currentCategory}
        onChange={(v) => setParam('category', v || null)}
        options={[{ value: '', label: 'All Categories' }, ...CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))]}
      />
      <SelectFilter
        label="Status"
        value={currentStatus}
        onChange={(v) => setParam('status', v || null)}
        options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
      />
      <SelectFilter
        label="Source"
        value={currentSource}
        onChange={(v) => setParam('source', v || null)}
        options={SOURCE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
      />
      {hasAny && (
        <button
          type="button"
          onClick={resetAll}
          className="ml-auto text-xs text-coral hover:text-coral-hover px-3 py-1.5"
        >
          Reset all
        </button>
      )}
    </div>
  )
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg bg-bg-elevated border border-stroke px-3 py-1.5">
      <span className="text-[11px] font-mono uppercase text-text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[13px] text-text-high outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value || 'all'} value={o.value} className="bg-bg-surface text-text-high">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

interface FilterGroupProps {
  label: string
  last?: boolean
  children: React.ReactNode
}

function FilterGroup({ label, last, children }: FilterGroupProps) {
  return (
    <div className={last ? '' : 'mb-6'}>
      <h3 className="text-sm font-medium text-text-high mb-3">{label}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

interface RadioOptionProps {
  name: string
  label: string
  checked: boolean
  onChange: () => void
}

function RadioOption({ name, label, checked, onChange }: RadioOptionProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="accent-coral"
      />
      <span className="text-sm text-text-medium">{label}</span>
    </label>
  )
}

export function ExploreSortControl() {
  const { params, setParam } = useUrlParam()
  const current = params.get('sort') ?? 'trending'

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-text-muted">Sort by:</label>
      <select
        value={current}
        onChange={(e) =>
          setParam('sort', e.target.value === 'trending' ? null : e.target.value)
        }
        className="px-3 py-2 rounded-lg bg-bg-elevated border border-stroke text-sm text-text-high focus:outline-none focus:border-coral"
      >
        <option value="trending">Trending</option>
        <option value="newest">Newest</option>
        <option value="most_saved">Most Saved</option>
      </select>
    </div>
  )
}
