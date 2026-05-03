import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/guards'

export default async function ClaimLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user) {
    redirect('/signin?next=/claim')
  }
  return <>{children}</>
}
