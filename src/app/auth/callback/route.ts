import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// open-redirect 방지: 상대 경로(/...)만 허용, // 또는 외부 URL 차단
function safeRedirectPath(input: string | null): string {
  if (!input) return '/'
  if (!input.startsWith('/') || input.startsWith('//')) return '/'
  return input
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeRedirectPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth_callback_failed`)
}
