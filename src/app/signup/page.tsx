import Link from 'next/link'
import { ShowVibeLogo } from '@/components/ui/Logo'
import { GitHubButton } from '@/components/auth/GitHubButton'
import { SignUpForm } from '@/components/auth/SignUpForm'

interface SignUpPageProps {
  searchParams: Promise<{ next?: string }>
}

function safeNext(input: string | undefined): string | undefined {
  if (!input) return undefined
  if (!input.startsWith('/') || input.startsWith('//')) return undefined
  return input
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams
  const next = safeNext(params.next)

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" aria-label="ShowVibe — Home" className="mb-6">
              <ShowVibeLogo width={160} variant="white" priority />
            </Link>
            <h1 className="text-2xl font-semibold text-text-high">Create your account</h1>
            <p className="text-sm text-text-muted mt-1">ShowVibe에 가입하고 프로젝트를 공유하세요</p>
          </div>

          <div className="bg-bg-surface border border-stroke rounded-2xl p-8">
            <GitHubButton label="GitHub로 가입하기" next={next} />

            <div className="flex items-center gap-3 my-6" aria-hidden>
              <div className="flex-1 h-px bg-stroke" />
              <span className="text-xs text-text-muted">또는</span>
              <div className="flex-1 h-px bg-stroke" />
            </div>

            <SignUpForm />
          </div>

          <p className="text-center text-sm text-text-muted mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/signin" className="text-coral hover:text-coral-hover transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
