'use server'

import { createClient } from '@/lib/supabase/server'

export type EventType = 'view' | 'click' | 'save' | 'share' | 'like'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function trackEvent(
  siteId: string,
  eventType: EventType,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  if (!UUID_REGEX.test(siteId)) return

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('site_events').insert({
      site_id: siteId,
      user_id: user?.id ?? null,
      event_type: eventType,
      metadata: metadata as never,
    })

    if (error && process.env.NODE_ENV !== 'production') {
      console.warn('[events] insert failed:', error.message)
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[events] trackEvent failed:', (err as Error).message)
    }
  }
}
