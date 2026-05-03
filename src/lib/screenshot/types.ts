export type ScreenshotProvider = 'playwright' | 'screenshot_one' | 'og_image'

export interface ScreenshotResult {
  ok: boolean
  provider: ScreenshotProvider | null
  buffer: Buffer | null
  contentType: 'image/webp' | 'image/png' | 'image/jpeg' | null
  width: number | null
  height: number | null
  errorMessage?: string
}

export interface ScreenshotOptions {
  viewportWidth?: number
  viewportHeight?: number
  timeoutMs?: number
}

export interface UploadedScreenshot {
  publicUrl: string
  storagePath: string
  contentType: string
}
