import { NextResponse } from 'next/server'

const HEADER_NAME = 'x-cron-secret'

export interface CronAuthResult {
  ok: boolean
  response?: NextResponse
}

export function verifyCronRequest(request: Request): CronAuthResult {
  const cronSecret = process.env.CRON_SECRET

  if (process.env.NODE_ENV !== 'production' && !cronSecret) {
    return { ok: true }
  }

  if (!cronSecret) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 },
      ),
    }
  }

  const provided = request.headers.get(HEADER_NAME) ?? request.headers.get('authorization')
  if (provided === cronSecret || provided === `Bearer ${cronSecret}`) {
    return { ok: true }
  }

  return {
    ok: false,
    response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  }
}
