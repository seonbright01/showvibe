import {
  AVATAR_PRESETS,
  getAvatarPreset,
  humanAvatarUrl,
  type AvatarPreset,
  type AvatarPresetId,
} from '@/lib/avatars/presets'

interface AvatarSvgProps {
  presetId: AvatarPresetId
  size?: number
  className?: string
  animated?: boolean
}

const PET_BG = '#F0E3D3'
const STROKE = '#1F2937'

export function AvatarSvg({
  presetId,
  size = 64,
  className,
  animated = false,
}: AvatarSvgProps) {
  const preset = getAvatarPreset(presetId)
  const animClass = animated ? 'sv-anim-float' : ''
  const cls = [className, animClass].filter(Boolean).join(' ')

  if (preset.category === 'pet') {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        aria-label={`${preset.label} avatar`}
        className={cls}
      >
        <circle cx="50" cy="50" r="50" fill={PET_BG} />
        {preset.id === 'dog' ? <DogLine /> : <CatLine />}
      </svg>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={humanAvatarUrl(preset.seed)}
      alt={`${preset.label} avatar`}
      width={size}
      height={size}
      className={['rounded-full', cls].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
    />
  )
}

function DogLine() {
  return (
    <g
      fill="none"
      stroke={STROKE}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ears */}
      <path d="M28 36 Q22 50 30 60 L40 50 Z" fill="#C68B4A" />
      <path d="M72 36 Q78 50 70 60 L60 50 Z" fill="#C68B4A" />
      {/* head outline */}
      <path d="M30 56 Q30 80 50 82 Q70 80 70 56 Q70 38 50 38 Q30 38 30 56 Z" fill="#FFF7ED" />
      {/* muzzle */}
      <ellipse cx="50" cy="66" rx="12" ry="9" fill="#FFFFFF" />
      {/* eyes */}
      <circle cx="42" cy="55" r="2" fill={STROKE} stroke="none" />
      <circle cx="58" cy="55" r="2" fill={STROKE} stroke="none" />
      {/* nose */}
      <ellipse cx="50" cy="63" rx="3" ry="2" fill={STROKE} stroke="none" />
      {/* mouth */}
      <path d="M50 65 L50 70" />
      <path d="M50 70 Q46 73 43 71" />
      <path d="M50 70 Q54 73 57 71" />
    </g>
  )
}

function CatLine() {
  return (
    <g
      fill="none"
      stroke={STROKE}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ears */}
      <path d="M30 32 L40 50 L24 48 Z" fill="#A8A29E" />
      <path d="M70 32 L60 50 L76 48 Z" fill="#A8A29E" />
      <path d="M33 38 L37 47 L29 47 Z" fill="#FECACA" stroke="none" />
      <path d="M67 38 L63 47 L71 47 Z" fill="#FECACA" stroke="none" />
      {/* head */}
      <path d="M28 56 Q28 80 50 82 Q72 80 72 56 Q72 42 50 42 Q28 42 28 56 Z" fill="#F5F5F4" />
      {/* eyes */}
      <ellipse cx="42" cy="56" rx="2.5" ry="3.5" fill={STROKE} stroke="none" />
      <ellipse cx="58" cy="56" rx="2.5" ry="3.5" fill={STROKE} stroke="none" />
      {/* nose */}
      <path d="M48 64 L52 64 L50 67 Z" fill="#F472B6" stroke="none" />
      {/* mouth */}
      <path d="M50 67 L50 70" />
      <path d="M50 70 Q46 72 44 71" />
      <path d="M50 70 Q54 72 56 71" />
      {/* whiskers */}
      <path d="M30 62 L40 62" strokeWidth="1.2" />
      <path d="M30 66 L40 65" strokeWidth="1.2" />
      <path d="M60 62 L70 62" strokeWidth="1.2" />
      <path d="M60 65 L70 66" strokeWidth="1.2" />
    </g>
  )
}

