import { createServiceClient } from '@/lib/supabase/service'
import type { UploadedScreenshot } from './types'

const BUCKET = 'site-screenshots'

export async function uploadScreenshot(
  siteId: string,
  buffer: Buffer,
  contentType: string,
): Promise<UploadedScreenshot> {
  const supabase = createServiceClient()
  const ext = inferExtension(contentType)
  const path = `${siteId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: '3600',
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return {
    publicUrl: data.publicUrl,
    storagePath: path,
    contentType,
  }
}

function inferExtension(contentType: string): string {
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg'
  return 'png'
}
