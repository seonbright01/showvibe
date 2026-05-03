import { TakedownItem, type TakedownRow } from '@/components/admin/TakedownItem'
import { getTakedownQueue } from '@/lib/admin/queries'

export const metadata = { title: 'Takedowns — ShowVibe Admin' }

export default async function AdminTakedownsPage() {
  const queue = (await getTakedownQueue()) as unknown as TakedownRow[]

  if (queue.length === 0) {
    return (
      <div className="rounded-xl border border-stroke bg-bg-surface p-12 text-center">
        <p className="text-text-medium">처리 대기 중인 takedown 요청이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] text-text-muted">
        Pending: {queue.length}
      </p>
      {queue.map((row) => (
        <TakedownItem key={row.id} row={row} />
      ))}
    </div>
  )
}
