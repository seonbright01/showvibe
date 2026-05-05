import { NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/pipeline/auth'
import { runScreenshotStep } from '@/lib/pipeline/runners'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  const auth = verifyCronRequest(request)
  if (!auth.ok) return auth.response!

  const url = new URL(request.url)
  const limit = Math.max(1, Math.min(20, Number(url.searchParams.get('limit') ?? '10')))
  const summary = await runScreenshotStep(limit)
  return NextResponse.json({ ok: true, step: 'screenshot', summary })
}

export async function POST(request: Request) {
  return GET(request)
}
