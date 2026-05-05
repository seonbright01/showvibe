import Link from 'next/link'
import { getAllClaims } from '@/lib/claims/queries'
import { ClaimActions } from '@/components/admin/ClaimActions'
import { AvatarImage } from '@/components/ui/AvatarImage'

export const dynamic = 'force-dynamic'

const KO_DT = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

function fmt(iso: string | null): string {
  if (!iso) return '—'
  try {
    return KO_DT.format(new Date(iso))
  } catch {
    return '—'
  }
}

const METHOD_LABEL: Record<string, string> = {
  github: 'GitHub',
  meta_tag: 'Meta Tag',
  dns: 'DNS',
  manual: 'Manual',
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-bg-elevated text-text-medium border border-stroke',
  verified: 'bg-active/15 text-active border border-active/30',
  rejected: 'bg-coral-soft text-coral border border-coral-line',
}

export default async function AdminClaimsPage() {
  const claims = await getAllClaims(200)

  const counts = claims.reduce<{ pending: number; verified: number; rejected: number }>(
    (acc, c) => {
      acc[c.status] += 1
      return acc
    },
    { pending: 0, verified: 0, rejected: 0 },
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-[var(--font-outfit)] text-xl font-bold text-text-high">
          Claims
        </h2>
        <p className="text-[12px] text-text-muted mt-1">
          제작자 사이트 소유권 인증 요청. meta_tag/DNS는 자동 검증되지만, manual 방식이거나
          자동 검증 실패 후 사용자가 별도 요청한 건은 admin 승인 필요.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        <Stat label="전체" value={claims.length} />
        <Stat label="대기" value={counts.pending} accent={counts.pending > 0} />
        <Stat label="승인" value={counts.verified} />
        <Stat label="거절" value={counts.rejected} />
      </div>

      {claims.length === 0 ? (
        <div className="rounded-xl border border-stroke bg-bg-surface px-6 py-16 text-center text-sm text-text-medium">
          아직 클레임 요청이 없습니다.
        </div>
      ) : (
        <div className="rounded-xl border border-stroke bg-bg-surface overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="border-b border-stroke bg-bg-elevated/50 text-text-muted">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">사이트</th>
                <th className="text-left px-4 py-2.5 font-medium">신청자</th>
                <th className="text-left px-4 py-2.5 font-medium">방식</th>
                <th className="text-left px-4 py-2.5 font-medium">상태</th>
                <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">
                  신청일
                </th>
                <th className="text-left px-4 py-2.5 font-medium">검수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-bg-elevated/30 align-top">
                  <td className="px-4 py-3">
                    {c.site ? (
                      <div>
                        <Link
                          href={`/projects/${c.site.id}`}
                          className="text-text-high font-medium hover:text-coral line-clamp-1"
                        >
                          {c.site.name}
                        </Link>
                        <a
                          href={c.site.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-text-muted font-mono truncate block hover:text-text-medium"
                        >
                          {c.site.url}
                        </a>
                        {c.site.isClaimed && (
                          <span className="text-[10.5px] text-claimed">
                            • 이미 claimed
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-muted">(deleted)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.requester ? (
                      <div className="flex items-center gap-2">
                        <AvatarImage
                          avatarUrl={c.requester.avatarUrl}
                          name={c.requester.name}
                          size={28}
                        />
                        <div className="min-w-0">
                          <p className="text-text-high font-medium truncate text-[12.5px]">
                            {c.requester.name}
                          </p>
                          <p className="text-[11px] text-text-muted font-mono truncate">
                            {c.requester.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-medium text-[12px]">
                    {METHOD_LABEL[c.claimMethod] ?? c.claimMethod}
                    {c.verificationToken && (
                      <p className="text-[10.5px] text-text-muted font-mono mt-0.5 truncate max-w-[180px]">
                        {c.verificationToken}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        STATUS_BADGE[c.status] ?? STATUS_BADGE.pending
                      }`}
                    >
                      {c.status}
                    </span>
                    {c.rejectedReason && (
                      <p className="text-[10.5px] text-coral mt-1 line-clamp-2">
                        사유: {c.rejectedReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-[11.5px] hidden lg:table-cell">
                    {fmt(c.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ClaimActions
                      claimId={c.id}
                      siteName={c.site?.name ?? '(unknown)'}
                      status={c.status}
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

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        accent
          ? 'border-coral-line bg-coral-soft'
          : 'border-stroke bg-bg-surface'
      }`}
    >
      <p className="text-[10.5px] uppercase tracking-wider text-text-muted font-mono">
        {label}
      </p>
      <p
        className={`text-xl font-bold font-[var(--font-outfit)] ${
          accent ? 'text-coral' : 'text-text-high'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
