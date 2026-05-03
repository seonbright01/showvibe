import { NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/pipeline/auth'
import { runRecheckStep } from '@/lib/pipeline/runners'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: Request) {
  const auth = verifyCronRequest(request)
  if (!auth.ok) return auth.response!

  const url = new URL(request.url)
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit') ?? '20')))
  const summary = await runRecheckStep(limit)
  return NextResponse.json({ ok: true, step: 'recheck', summary })
}

export async function POST(request: Request) {
  return GET(request)
}
