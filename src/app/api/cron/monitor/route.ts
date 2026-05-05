import { NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/pipeline/auth'
import { runMonitorStep } from '@/lib/pipeline/runners'
import type { MonitorBucket } from '@/lib/monitor/run'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const ALLOWED_BUCKETS: MonitorBucket[] = ['active', 'slow', 'degraded', 'all']

export async function GET(request: Request) {
  const auth = verifyCronRequest(request)
  if (!auth.ok) return auth.response!

  const url = new URL(request.url)
  const raw = url.searchParams.get('bucket') ?? 'active'
  const bucket: MonitorBucket = ALLOWED_BUCKETS.includes(raw as MonitorBucket)
    ? (raw as MonitorBucket)
    : 'active'

  const summary = await runMonitorStep(bucket)
  return NextResponse.json({ ok: true, step: 'monitor', summary })
}

export async function POST(request: Request) {
  return GET(request)
}
