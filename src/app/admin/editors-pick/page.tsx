import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { getSessionUser } from '@/lib/auth/guards'
import { EditorsPickRow } from '@/components/admin/EditorsPickRow'

export const metadata = { title: "Editor's Pick — ShowVibe Admin" }
export const dynamic = 'force-dynamic'

interface SiteRow {
  id: string
  name: string
  url: string
  is_editors_pick: boolean
  editors_note: string | null
  status: string
  visibility: string
  site_media: { image_url: string; is_primary: boolean }[] | null
  site_analysis: { ai_summary: string | null; vibe_score: number | null; category: string | null }[] | null
}

export default async function AdminEditorsPickPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const sp = await searchParams
  const filter = sp.filter ?? 'all'
  const q = sp.q?.trim() ?? ''

  const sessionUser = await getSessionUser()
  const adminUserId = sessionUser?.id ?? null

  const supabase = createServiceClient()

  // admin이 책갈피한 site_id 목록 (Saved 필터 + 카운트용)
  let savedSiteIds: string[] = []
  if (adminUserId) {
    const { data: savedRows } = await supabase
      .from('site_saves')
      .select('site_id')
      .eq('user_id', adminUserId)
    savedSiteIds = (savedRows ?? []).map((r) => r.site_id)
  }

  let query = supabase
    .from('sites')
    .select(
      'id, name, url, is_editors_pick, editors_note, status, visibility, site_media(image_url, is_primary), site_analysis(ai_summary, vibe_score, category)',
    )
    .eq('visibility', 'public')
    .neq('status', 'blocked')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (filter === 'picked') query = query.eq('is_editors_pick', true)
  if (filter === 'unpicked') query = query.eq('is_editors_pick', false)
  if (filter === 'saved') {
    if (savedSiteIds.length === 0) {
      // 책갈피 0건 — 빈 결과 강제
      query = query.eq('id', '00000000-0000-0000-0000-000000000000')
    } else {
      query = query.in('id', savedSiteIds)
    }
  }
  if (q) query = query.ilike('name', `%${q}%`)

  const { data: rows, error } = await query
  const sites = (rows ?? []) as unknown as SiteRow[]

  const { count: pickedCount } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .eq('is_editors_pick', true)

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-[var(--font-outfit)]">
            Editor&apos;s Pick 관리
          </h1>
          <p className="text-[12.5px] text-text-muted">
            홈 화면 Editor&apos;s Pick 섹션에 노출할 사이트를 선정하고 추천 멘트를 입력합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-coral-soft border border-coral-line px-3 py-1 text-[12px] font-medium text-coral">
            현재 선정: {pickedCount ?? 0}
          </span>
          <span className="rounded-full bg-bg-elevated border border-stroke px-3 py-1 text-[12px] font-medium text-text-medium">
            🔖 Saved: {savedSiteIds.length}
          </span>
        </div>
      </header>

      <form className="flex flex-wrap items-center gap-2 rounded-xl border border-stroke bg-bg-surface p-3">
        <FilterPill href="/admin/editors-pick" label="All" active={filter === 'all'} />
        <FilterPill
          href="/admin/editors-pick?filter=picked"
          label="✓ Picked"
          active={filter === 'picked'}
        />
        <FilterPill
          href="/admin/editors-pick?filter=unpicked"
          label="Unpicked"
          active={filter === 'unpicked'}
        />
        <FilterPill
          href="/admin/editors-pick?filter=saved"
          label="🔖 Saved"
          active={filter === 'saved'}
        />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="이름 검색..."
          className="ml-auto rounded-lg bg-bg-elevated border border-stroke px-3 py-1.5 text-[13px] text-text-high placeholder:text-text-muted outline-none focus:border-coral"
        />
      </form>

      {error && (
        <p className="rounded-lg border border-coral-line bg-coral-soft px-3 py-2 text-[12px] text-coral">
          {error.message}
        </p>
      )}

      {sites.length === 0 ? (
        <div className="rounded-xl border border-stroke bg-bg-surface px-6 py-12 text-center text-sm text-text-muted">
          조건에 맞는 사이트가 없습니다.
        </div>
      ) : (
        <ul className="space-y-2">
          {sites.map((s) => (
            <EditorsPickRow
              key={s.id}
              site={{
                id: s.id,
                name: s.name,
                url: s.url,
                isEditorsPick: s.is_editors_pick,
                editorsNote: s.editors_note,
                imageUrl:
                  s.site_media?.find((m) => m.is_primary)?.image_url ??
                  s.site_media?.[0]?.image_url ??
                  null,
                aiSummary: s.site_analysis?.[0]?.ai_summary ?? null,
                vibeScore: s.site_analysis?.[0]?.vibe_score ?? null,
                category: s.site_analysis?.[0]?.category ?? null,
              }}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function FilterPill({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
        active
          ? 'bg-coral text-coral-ink'
          : 'bg-bg-elevated border border-stroke text-text-medium hover:text-text-high'
      }`}
    >
      {label}
    </Link>
  )
}
