import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { ArchiveToggleButton } from '@/components/admin/ArchiveToggleButton'

export const dynamic = 'force-dynamic'

const KO_DT = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function fmt(iso: string | null): string {
  if (!iso) return '—'
  try {
    return KO_DT.format(new Date(iso))
  } catch {
    return '—'
  }
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-active/15 text-active border-active/30',
  slow: 'bg-warning/15 text-warning border-warning/30',
  degraded: 'bg-warning/15 text-warning border-warning/30',
  archived: 'bg-bg-elevated text-text-muted border-stroke',
  blocked: 'bg-coral-soft text-coral border-coral-line',
  unknown: 'bg-bg-elevated text-text-muted border-stroke',
}

interface SiteRow {
  id: string
  name: string
  url: string
  status: string
  visibility: string
  is_claimed: boolean
  last_active_at: string | null
  block_reason: string | null
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>
}

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'slow', label: 'Slow' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'archived', label: 'Archived' },
  { value: 'blocked', label: 'Blocked' },
] as const

export default async function AdminSitesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const statusFilter = (sp.status ?? '').trim()

  const supabase = createServiceClient()
  let query = supabase
    .from('sites')
    .select('id, name, url, status, visibility, is_claimed, last_active_at, block_reason')
    .order('last_active_at', { ascending: false, nullsFirst: false })
    .limit(100)

  if (statusFilter) query = query.eq('status', statusFilter)
  if (q) {
    query = query.or(`name.ilike.%${q}%,url.ilike.%${q}%`)
  }

  const { data, error } = await query
  const sites: SiteRow[] = (data as SiteRow[] | null) ?? []
  const errMsg = error?.message ?? null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-[var(--font-outfit)] text-xl font-bold text-text-high">
          Sites
        </h2>
        <p className="text-[12px] text-text-muted mt-1">
          전체 사이트 검색 · 수동 archive / 복구 (최근 활성순 100개)
        </p>
      </div>

      <form action="/admin/sites" method="GET" className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="이름 또는 URL 검색"
          className="flex-1 min-w-[200px] rounded-lg bg-bg-elevated border border-stroke px-3 py-2 text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-lg bg-bg-elevated border border-stroke px-3 py-2 text-[13px] text-text-high focus:outline-none focus:border-coral"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-coral hover:bg-coral-hover text-coral-ink text-[13px] font-medium px-4 py-2 transition-colors"
        >
          검색
        </button>
      </form>

      {errMsg && (
        <p className="rounded-lg border border-coral-line bg-coral-soft px-3 py-2 text-[13px] text-coral">
          {errMsg}
        </p>
      )}

      {sites.length === 0 ? (
        <div className="rounded-xl border border-stroke bg-bg-surface px-6 py-16 text-center text-sm text-text-medium">
          {q || statusFilter ? '검색 결과가 없습니다.' : '사이트가 없습니다.'}
        </div>
      ) : (
        <div className="rounded-xl border border-stroke bg-bg-surface overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="border-b border-stroke bg-bg-elevated/50 text-text-muted">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">사이트</th>
                <th className="text-left px-4 py-2.5 font-medium">상태</th>
                <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">
                  마지막 활성
                </th>
                <th className="text-left px-4 py-2.5 font-medium">조치</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {sites.map((s) => (
                <tr key={s.id} className="hover:bg-bg-elevated/30 align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${s.id}`}
                      className="text-text-high font-medium hover:text-coral line-clamp-1"
                    >
                      {s.name}
                    </Link>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-text-muted font-mono truncate block hover:text-text-medium"
                    >
                      {s.url}
                    </a>
                    {s.block_reason && (
                      <p className="text-[10.5px] text-text-muted mt-0.5 italic">
                        {s.block_reason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        STATUS_BADGE[s.status] ?? STATUS_BADGE.unknown
                      }`}
                    >
                      {s.status}
                    </span>
                    {s.visibility !== 'public' && (
                      <p className="text-[10.5px] text-text-muted mt-0.5">
                        {s.visibility}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-[12px] hidden lg:table-cell">
                    {fmt(s.last_active_at)}
                  </td>
                  <td className="px-4 py-3">
                    <ArchiveToggleButton
                      siteId={s.id}
                      siteName={s.name}
                      isArchived={s.status === 'archived'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
