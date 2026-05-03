'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/events/track'

interface Props {
  siteId: string
}

export function ViewTracker({ siteId }: Props) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    trackEvent(siteId, 'view').catch(() => {})
  }, [siteId])

  return null
}
