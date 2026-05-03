import Link from 'next/link'
import { ShowVibeLogo } from '@/components/ui/Logo'
import { GitHubButton } from '@/components/auth/GitHubButton'
import { SignInForm } from '@/components/auth/SignInForm'

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: 'OAuth 인증에 실패했습니다. 다시 시도해주세요.',
}

interface SignInPageProps {
  searchParams: Promise<{ error?: string; next?: string }>
}

function safeNext(input: string | undefined): string | undefined {
  if (!input) return undefined
  if (!input.startsWith('/') || input.startsWith('//')) return undefined
  return input
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams
  const errorMessage = params.error
    ? (ERROR_MESSAGES[params.error] ?? '로그인 중 오류가 발생했습니다.')
    : null
  const next = safeNext(params.next)

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" aria-label="ShowVibe — Home" className="mb-6">
              <ShowVibeLogo width={160} variant="white" priority />
            </Link>
            <h1 className="text-2xl font-semibold text-text-high">Welcome back</h1>
            <p className="text-sm text-text-muted mt-1">계정에 로그인하여 계속하세요</p>
          </div>

          <div className="bg-bg-surface border border-stroke rounded-2xl p-8">
            {errorMessage && (
              <p
                role="alert"
                className="mb-4 text-sm text-coral bg-coral/10 border border-coral/30 rounded-lg px-3 py-2"
              >
                {errorMessage}
              </p>
            )}

            <GitHubButton label="GitHub로 로그인" next={next} />

            <div className="flex items-center gap-3 my-6" aria-hidden>
              <div className="flex-1 h-px bg-stroke" />
              <span className="text-xs text-text-muted">또는</span>
              <div className="flex-1 h-px bg-stroke" />
            </div>

            <SignInForm next={next} />
          </div>

          <p className="text-center text-sm text-text-muted mt-6">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-coral hover:text-coral-hover transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
