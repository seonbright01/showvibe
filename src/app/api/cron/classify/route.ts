import { NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/pipeline/auth'
import { runClassifyStep } from '@/lib/pipeline/runners'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: Request) {
  const auth = verifyCronRequest(request)
  if (!auth.ok) return auth.response!

  const url = new URL(request.url)
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit') ?? '20')))
  const summary = await runClassifyStep(limit)
  return NextResponse.json({ ok: true, step: 'classify', summary })
}

export async function POST(request: Request) {
  return GET(request)
}
