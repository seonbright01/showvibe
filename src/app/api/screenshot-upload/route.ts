import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const BUCKET = 'site-screenshots'
const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

function inferExt(contentType: string): string {
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg'
  return 'png'
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

  // 업로드 (service client — RLS 우회, admin 자격으로 storage 쓰기)
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = inferExt(file.type)
  const path = `pending/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const service = createServiceClient()
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
