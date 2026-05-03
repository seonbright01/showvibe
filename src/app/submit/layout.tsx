import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/guards'

export default async function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user) {
    redirect('/signin?next=/submit')
  }
  return <>{children}</>
}
