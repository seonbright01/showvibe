import { NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/pipeline/auth'
import { runCollectStep } from '@/lib/pipeline/runners'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  const auth = verifyCronRequest(request)
  if (!auth.ok) return auth.response!

  const summary = await runCollectStep()
  return NextResponse.json({ ok: true, step: 'collect', summary })
}

export async function POST(request: Request) {
  return GET(request)
}
