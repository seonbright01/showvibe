import { createClient } from '@/lib/supabase/server'
import { getSiteHealthStats } from '@/lib/admin/queries'

export const metadata = { title: 'Site Health — ShowVibe Admin' }

const STATUS_ORDER = ['active', 'slow', 'degraded', 'archived', 'blocked'] as const

const STATUS_COLOR: Record<string, string> = {
  active: '#10B981',
  slow: '#F59E0B',
  degraded: '#F97316',
  archived: '#6B7280',
  blocked: '#EF4444',
}

async function getRecentlyDiscoveredCount(): Promise<number> {
  const supabase = await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .gte('first_discovered_at', sevenDaysAgo)
  return count ?? 0
}

interface BigStatProps {
  label: string
  value: number
  highlight?: boolean
}

function BigStat({ label, value, highlight }: BigStatProps) {
  return (
    <div className="rounded-xl border border-stroke bg-bg-surface p-5">
      <p className="font-mono text-[10.5px] uppercase text-text-muted">{label}</p>
      <p
        className={`mt-1 font-[var(--font-outfit)] text-4xl font-bold ${
          highlight && value > 0 ? 'text-coral' : 'text-text-high'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export default async function AdminHealthPage() {
  const [stats, recent7d] = await Promise.all([
    getSiteHealthStats(),
    getRecentlyDiscoveredCount(),
  ])

  const totalPublic = STATUS_ORDER.reduce(
    (sum, k) => sum + (stats.statusCounts[k] ?? 0),
    0,
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <BigStat label="Total sites" value={stats.totalSites} />
        <BigStat label="Pending review" value={stats.pendingReview} highlight />
        <BigStat label="Pending takedowns" value={stats.pendingTakedowns} highlight />
        <BigStat label="Pending claims" value={stats.pendingClaims} highlight />
      </div>

      <section className="rounded-xl border border-stroke bg-bg-surface p-5">
        <h2 className="mb-3 text-[14px] font-semibold text-text-high">
          Public sites by status
        </h2>
        <p className="mb-4 font-mono text-[11px] text-text-muted">
          Total public: {totalPublic}
        </p>
        <div className="space-y-2.5">
          {STATUS_ORDER.map((status) => {
            const count = stats.statusCounts[status] ?? 0
            const pct = totalPublic > 0 ? (count / totalPublic) * 100 : 0
            const color = STATUS_COLOR[status]
            return (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span style={{ color }}>{status}</span>
                  <span className="text-text-muted">
                    {count} ({pct.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-bg-base">
                  <div
                    className="h-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-stroke bg-bg-surface p-5">
        <h2 className="mb-2 text-[14px] font-semibold text-text-high">
          Recent activity
        </h2>
        <p className="font-mono text-[12px] text-text-medium">
          Newly discovered (last 7 days):{' '}
          <span className="font-[var(--font-outfit)] text-lg font-bold text-coral">
            {recent7d}
          </span>
        </p>
      </section>
    </div>
  )
}
