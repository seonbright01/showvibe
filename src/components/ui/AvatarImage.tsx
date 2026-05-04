import Image from 'next/image'
import { parseAvatarUrl } from '@/lib/avatars/presets'
import { AvatarSvg } from './AvatarSvg'

interface AvatarImageProps {
  avatarUrl: string | null | undefined
  name: string
  size?: number
  className?: string
  animated?: boolean
}

export function AvatarImage({
  avatarUrl,
  name,
  size = 64,
  className,
  animated = false,
}: AvatarImageProps) {
  const presetId = parseAvatarUrl(avatarUrl)

  if (presetId) {
    return (
      <div
        className={['relative overflow-hidden rounded-full', className]
          .filter(Boolean)
          .join(' ')}
        style={{ width: size, height: size }}
      >
        <AvatarSvg presetId={presetId} size={size} animated={animated} />
      </div>
    )
  }

  if (avatarUrl) {
    return (
      <div
        className={['relative overflow-hidden rounded-full bg-bg-elevated', className]
          .filter(Boolean)
          .join(' ')}
        style={{ width: size, height: size }}
      >
        <Image
          src={avatarUrl}
          alt={`${name} avatar`}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      </div>
    )
  }

  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div
      className={[
        'flex items-center justify-center rounded-full bg-bg-elevated text-text-medium border border-stroke',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={`${name} avatar`}
    >
      {initial}
    </div>
  )
}
