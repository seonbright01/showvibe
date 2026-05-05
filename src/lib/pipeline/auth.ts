import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'

const HEADER_NAME = 'x-cron-secret'

export interface CronAuthResult {
  ok: boolean
  response?: NextResponse
}

// 보안: 길이 다른 입력에서도 timing leak 없도록 동일 길이 버퍼로 비교.
function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  if (aBuf.length !== bBuf.length) {
    // 길이 mismatch 도 timingSafeEqual 한번 호출해 시간 차이 최소화.
    const dummy = Buffer.alloc(aBuf.length)
    timingSafeEqual(aBuf, dummy)
    return false
  }
  return timingSafeEqual(aBuf, bBuf)
}

export function verifyCronRequest(request: Request): CronAuthResult {
  const cronSecret = process.env.CRON_SECRET

  // 보안 (P3.2): 명시적 opt-in (ALLOW_CRON_INSECURE=1) 일 때만 secret 없는 요청 허용.
  // 이전엔 NODE_ENV !== 'production' 이면 fail-open 이라 staging/preview 환경이
  // 무방비였음.
  if (!cronSecret) {
    if (process.env.ALLOW_CRON_INSECURE === '1') {
      return { ok: true }
    }
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 },
      ),
    }
  }

  const provided =
    request.headers.get(HEADER_NAME) ?? request.headers.get('authorization')
  if (!provided) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // 보안 (P0.5): timing-safe 비교
  if (
    safeEqual(provided, cronSecret) ||
    safeEqual(provided, `Bearer ${cronSecret}`)
  ) {
    return { ok: true }
  }

  return {
    ok: false,
    response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  }
}
