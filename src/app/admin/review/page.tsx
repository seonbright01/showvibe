import { ReviewConsole } from '@/components/admin/ReviewConsole'
import { getReviewQueue } from '@/lib/admin/queries'

export const metadata = { title: 'Review Queue — ShowVibe Admin' }

export default async function AdminReviewPage() {
  const queue = await getReviewQueue(100)
  return <ReviewConsole initialQueue={queue} />
}
