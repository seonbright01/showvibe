import { getAllMembers } from '@/lib/members/queries'
import { RoleSelect } from '@/components/admin/RoleSelect'
import { BanButton } from '@/components/admin/BanButton'
import { AvatarImage } from '@/components/ui/AvatarImage'
import { getSessionUser } from '@/lib/auth/guards'

export const dynamic = 'force-dynamic'

const KO_DT = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function fmt(iso: string): string {
  try {
    return KO_DT.format(new Date(iso))
  } catch {
    return '—'
  }
}

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-coral-soft text-coral border-coral-line',
  creator: 'bg-claimed/15 text-claimed border-claimed/30',
  user: 'bg-bg-elevated text-text-medium border-stroke',
}

export default async function AdminMembersPage() {
  const [sessionUser, members] = await Promise.all([
    getSessionUser(),
    getAllMembers(300),
  ])
  const myId = sessionUser?.id

  const counts = members.reduce<{
    user: number
    creator: number
    admin: number
    banned: number
  }>(
    (acc, m) => {
      acc[m.role] += 1
      if (m.isBanned) acc.banned += 1
      return acc
    },
    { user: 0, creator: 0, admin: 0, banned: 0 },
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-[var(--font-outfit)] text-xl font-bold text-text-high">
          Members
        </h2>
        <p className="text-[12px] text-text-muted mt-1">
          전체 가입 회원 · 역할 변경 · 이용정지 (admin 전용)
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Stat label="전체" value={members.length} />
        <Stat label="user" value={counts.user} />
        <Stat label="creator" value={counts.creator} />
        <Stat label="admin" value={counts.admin} />
        <Stat label="정지" value={counts.banned} accent={counts.banned > 0} />
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-stroke bg-bg-surface px-6 py-16 text-center text-sm text-text-medium">
          가입한 회원이 없습니다. (Supabase service_role 키 미설정 가능성도 확인하세요.)
        </div>
      ) : (
        <div className="rounded-xl border border-stroke bg-bg-surface overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="border-b border-stroke bg-bg-elevated/50 text-text-muted">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">사용자</th>
                <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-4 py-2.5 font-medium">Role</th>
                <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">
                  Claims
                </th>
                <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">
                  가입일
                </th>
                <th className="text-left px-4 py-2.5 font-medium">Role 변경</th>
                <th className="text-left px-4 py-2.5 font-medium">정지</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {members.map((m) => (
                <tr
                  key={m.id}
                  className={`hover:bg-bg-elevated/30 ${
                    m.isBanned ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarImage
                        avatarUrl={m.avatarUrl}
                        name={m.name}
                        size={32}
                      />
                      <div className="min-w-0">
                        <p className="text-text-high font-medium truncate flex items-center gap-1.5">
                          {m.name || '(no name)'}
                          {m.isBanned && (
                            <span
                              className="inline-flex items-center rounded-full border border-coral-line bg-coral-soft px-1.5 py-0 text-[10px] font-medium text-coral"
                              title={m.bannedReason ?? '사유 없음'}
                            >
                              BAN
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-text-muted font-mono truncate md:hidden">
                          {m.email}
                        </p>
                        {m.isBanned && m.bannedReason && (
                          <p className="text-[10.5px] text-coral truncate">
                            사유: {m.bannedReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-medium hidden md:table-cell font-mono text-[12px]">
                    {m.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        ROLE_BADGE[m.role] ?? ROLE_BADGE.user
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-medium hidden lg:table-cell">
                    {m.claimedCount}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-[12px] hidden lg:table-cell">
                    {fmt(m.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelect userId={m.id} initialRole={m.role} />
                  </td>
                  <td className="px-4 py-3">
                    <BanButton
                      userId={m.id}
                      userName={m.name || m.email}
                      isBanned={m.isBanned}
                      isSelf={myId === m.id}
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
