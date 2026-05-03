import { captureWithOgFallback } from './og-fallback'
import { captureWithPlaywright } from './playwright'
import { captureWithScreenshotOne } from './screenshot-one'
import { uploadScreenshot } from './storage'
import type { ScreenshotOptions, ScreenshotResult, UploadedScreenshot } from './types'
import { createServiceClient } from '@/lib/supabase/service'

export interface CaptureAndStoreInput {
  siteId: string
  url: string
  options?: ScreenshotOptions
}

export interface CaptureAndStoreResult {
  ok: boolean
  upload?: UploadedScreenshot
  provider: ScreenshotResult['provider']
  errors: string[]
}

export async function captureAndStoreScreenshot(
  input: CaptureAndStoreInput,
): Promise<CaptureAndStoreResult> {
  const errors: string[] = []
  const providers: Array<() => Promise<ScreenshotResult>> = [
    () => captureWithScreenshotOne(input.url, input.options),
    () => captureWithPlaywright(input.url, input.options),
    () => captureWithOgFallback(input.url),
  ]

  for (const factory of providers) {
    const result = await factory()
    if (result.ok && result.buffer && result.contentType) {
      try {
        const upload = await uploadScreenshot(input.siteId, result.buffer, result.contentType)
        await recordSiteMedia(input.siteId, upload, result)
        return { ok: true, upload, provider: result.provider, errors }
      } catch (error) {
        errors.push(
          `Upload after ${result.provider}: ${error instanceof Error ? error.message : 'unknown'}`,
        )
      }
    } else if (result.errorMessage) {
      errors.push(`${result.provider}: ${result.errorMessage}`)
    }
  }

  return { ok: false, provider: null, errors }
}

async function recordSiteMedia(
  siteId: string,
  upload: UploadedScreenshot,
  source: ScreenshotResult,
): Promise<void> {
  const supabase = createServiceClient()
  const mediaSource =
    source.provider === 'og_image' ? 'og_image' : 'system_captured'
  const mediaType = source.provider === 'og_image' ? 'og_image' : 'screenshot'

  await supabase.from('site_media').insert({
    site_id: siteId,
    media_type: mediaType,
    media_source: mediaSource,
    image_url: upload.publicUrl,
    image_resolution: 'low',
    is_primary: true,
  })
}
