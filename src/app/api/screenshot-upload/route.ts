import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const BUCKET = 'site-screenshots'
const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const DAILY_QUOTA = 10
const DAY_MS = 24 * 60 * 60 * 1000

function inferExt(contentType: string): string {
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg'
  return 'png'
}

// 보안 (P3.6): magic byte 검증 — content-type 헤더는 클라이언트 자유 변경 가능.
// 실제 파일 시작 12바이트로 PNG/JPEG/WEBP 확인.
//   PNG : 89 50 4E 47 0D 0A 1A 0A
//   JPEG: FF D8 FF
//   WEBP: 52 49 46 46 .. .. .. .. 57 45 42 50  ("RIFF" + 4byte size + "WEBP")
function sniffImageType(buf: Buffer): 'png' | 'jpeg' | 'webp' | null {
  if (buf.length < 12) return null
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'png'
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg'
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return 'webp'
  }
  return null
}

function mimeMatches(
  declared: string,
  sniffed: 'png' | 'jpeg' | 'webp',
): boolean {
  if (sniffed === 'png') return declared === 'image/png'
  if (sniffed === 'jpeg') return declared === 'image/jpeg'
  return declared === 'image/webp'
}

export async function POST(request: Request): Promise<NextResponse> {
  // 인증
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  // 파일 추출
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file 필드가 필요합니다.' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'PNG, JPEG, WebP 이미지만 업로드할 수 있습니다.' },
      { status: 400 },
    )
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: '파일 크기는 1B ~ 5MB 사이여야 합니다.' },
      { status: 400 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // 보안 (P3.6a): magic byte sniff — declared MIME 가 위조여도 실제 파일 컨텐츠가
  // 이미지가 아니면 reject (svg payload 우회 차단).
  const sniffed = sniffImageType(buffer)
  if (!sniffed || !mimeMatches(file.type, sniffed)) {
    return NextResponse.json(
      { error: '이미지 파일 형식이 올바르지 않습니다.' },
      { status: 400 },
    )
  }

  const service = createServiceClient()

  // 보안 (P3.6b): 24h 내 같은 user 의 pending/ 업로드 ≤ 10 quota.
  // storage list 는 prefix 매칭. created_at 으로 24h 윈도우 필터.
  const userPrefix = `pending/${user.id}`
  const { data: recentList } = await service.storage
    .from(BUCKET)
    .list(userPrefix, { limit: 100 })
  if (recentList) {
    const cutoff = Date.now() - DAY_MS
    const recentCount = recentList.filter((obj) => {
      const createdAtIso = obj.created_at
      if (!createdAtIso) return false
      const ts = Date.parse(createdAtIso)
      return Number.isFinite(ts) && ts >= cutoff
    }).length
    if (recentCount >= DAILY_QUOTA) {
      return NextResponse.json(
        {
          error: `24시간 내 업로드 한도(${DAILY_QUOTA})를 초과했습니다. 잠시 후 다시 시도해주세요.`,
        },
        { status: 429 },
      )
    }
  }

  // 업로드 (service client — RLS 우회, admin 자격으로 storage 쓰기)
  const ext = inferExt(file.type)
  const path = `pending/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600',
    })

  if (uploadError) {
    return NextResponse.json(
      { error: `업로드 실패: ${uploadError.message}` },
      { status: 500 },
    )
  }

  const { data } = service.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl, path })
}
