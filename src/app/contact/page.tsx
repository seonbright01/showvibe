import type { Metadata } from 'next'
import AppShell from '@/components/layout/AppShell'
import { ContactForm } from '@/components/contact/ContactForm'
import { getSessionUser } from '@/lib/auth/guards'

export const metadata: Metadata = {
  title: 'Contact — ShowVibe',
  description:
    '서비스 관련 문의, 사이트 등록 요청, 제휴 제안 등 무엇이든 보내주세요.',
}

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const sessionUser = await getSessionUser()
  const defaultName =
    sessionUser?.profile?.name ??
    (sessionUser?.user_metadata?.full_name as string | undefined) ??
    undefined
  const defaultEmail =
    sessionUser?.profile?.email ?? sessionUser?.email ?? undefined

  return (
    <AppShell>
      <main className="flex-1">
        <section className="border-b border-stroke">
          <div className="mx-auto max-w-[800px] px-6 py-10 lg:py-12">
            <p className="text-[12px] font-medium text-coral mb-2 tracking-wide font-[var(--font-outfit)]">
              Contact
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2 font-[var(--font-outfit)]">
              문의하기
            </h1>
            <p className="text-[13px] text-text-muted max-w-xl leading-relaxed">
              서비스 관련 문의, 사이트 등록 요청, 제휴 제안 등 무엇이든 보내주세요.
              빠른 시일 내 답변드립니다.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[800px] px-6 py-8">
          <div className="rounded-2xl border border-stroke bg-bg-surface p-6 lg:p-8">
            <ContactForm
              defaultName={defaultName}
              defaultEmail={defaultEmail}
            />
          </div>
        </section>
      </main>
    </AppShell>
  )
}
