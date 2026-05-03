import {
  ReportedCommentItem,
  type ReportedCommentRow,
} from '@/components/admin/ReportedCommentItem'
import { getReportedComments } from '@/lib/admin/queries'

export const metadata = { title: 'Reported Comments — ShowVibe Admin' }

export default async function AdminCommentsPage() {
  const rows = (await getReportedComments()) as unknown as ReportedCommentRow[]

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-stroke bg-bg-surface p-12 text-center">
        <p className="text-text-medium">신고된 댓글이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] text-text-muted">Reports: {rows.length}</p>
      {rows.map((row) => (
        <ReportedCommentItem key={row.id} row={row} />
      ))}
    </div>
  )
}
