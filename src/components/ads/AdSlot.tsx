'use client'

import { useEffect, useRef } from 'react'

export type AdSlotName =
  | 'leaderboard'
  | 'sidebar'
  | 'in_article'
  | 'sticky_bottom'

interface AdSlotSize {
  width: number
  height: number
  label: string
}

interface AdSlotConfig {
  desktop: AdSlotSize
  responsive?: boolean
  envSlotKey: string
  hideOnDesktop?: boolean
}

const SLOT_CONFIG: Record<AdSlotName, AdSlotConfig> = {
  leaderboard: {
    desktop: { width: 728, height: 90, label: '728×90' },
    envSlotKey: 'NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD',
  },
  sidebar: {
    desktop: { width: 300, height: 250, label: '300×250' },
    envSlotKey: 'NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR',
  },
  in_article: {
    desktop: { width: 0, height: 0, label: 'Responsive' },
    responsive: true,
    envSlotKey: 'NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE',
  },
  sticky_bottom: {
    desktop: { width: 320, height: 50, label: '320×50' },
    envSlotKey: 'NEXT_PUBLIC_ADSENSE_SLOT_STICKY_BOTTOM',
    hideOnDesktop: true,
  },
}

interface AdSlotProps {
  slot: AdSlotName
  className?: string
  size?: { width: number; height: number }
}

interface AdsByGoogleWindow {
  adsbygoogle?: unknown[]
}

export function AdSlot({ slot, className, size }: AdSlotProps) {
  const config = SLOT_CONFIG[slot]
  const insRef = useRef<HTMLModElement | null>(null)
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID
  const slotId = process.env[config.envSlotKey]
  const isReady = Boolean(pubId && slotId)
  // master toggle — 광고 부착 전(베타) 단계에서는 슬롯 자체를 렌더하지 않는다.
  // 미래에 광고 도입 시 NEXT_PUBLIC_ADS_ENABLED=true 만 설정하면 호출처 코드 변경
  // 없이 슬롯이 다시 활성화된다.
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true'
  if (!adsEnabled) return null

  useEffect(() => {
    if (!isReady) return
    if (typeof window === 'undefined') return
    try {
      const w = window as unknown as AdsByGoogleWindow
      ;(w.adsbygoogle = w.adsbygoogle ?? []).push({})
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[AdSlot] adsbygoogle push failed', error)
    }
  }, [isReady, slot])

  const wrapperClass = [
    config.hideOnDesktop ? 'lg:hidden' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  if (!isReady) {
    return (
      <PlaceholderSlot
        slot={slot}
        config={config}
        sizeOverride={size}
        wrapperClass={wrapperClass}
      />
    )
  }

  const desktop = size ?? config.desktop
  const styleProps = config.responsive
    ? { display: 'block' as const }
    : {
        display: 'inline-block' as const,
        width: `${desktop.width}px`,
        height: `${desktop.height}px`,
      }

  return (
    <div className={wrapperClass} aria-label="Sponsored">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={styleProps}
        data-ad-client={pubId}
        data-ad-slot={slotId}
        {...(config.responsive
          ? { 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' }
          : {})}
      />
    </div>
  )
}

interface PlaceholderProps {
  slot: AdSlotName
  config: AdSlotConfig
  sizeOverride?: { width: number; height: number }
  wrapperClass: string
}

function PlaceholderSlot({
  slot,
  config,
  sizeOverride,
  wrapperClass,
}: PlaceholderProps) {
  const size = sizeOverride ?? config.desktop
  const label = sizeOverride
    ? `${sizeOverride.width}×${sizeOverride.height}`
    : config.desktop.label

  if (config.responsive) {
    return (
      <div
        className={`rounded-lg border border-stroke bg-bg-elevated p-4 flex items-center justify-between gap-4 ${wrapperClass}`}
        aria-label="Sponsored placeholder"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10.5px] font-mono uppercase text-text-muted px-2 py-0.5 rounded bg-bg-base border border-stroke">
            Sponsored
          </span>
          <p className="text-[12px] text-text-medium">[광고 영역] · {slot}</p>
        </div>
        <span className="text-[11px] text-text-muted">{label}</span>
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg border border-stroke bg-bg-elevated overflow-hidden ${wrapperClass}`}
      aria-label="Sponsored placeholder"
    >
      <div className="px-3 py-1.5 border-b border-stroke flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
          Sponsored
        </span>
        <span className="text-[10px] text-text-muted">{label}</span>
      </div>
      <div
        className="flex items-center justify-center mx-auto"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          maxWidth: '100%',
        }}
      >
        <p className="text-xs text-text-muted">[광고 영역]</p>
      </div>
    </div>
  )
}
